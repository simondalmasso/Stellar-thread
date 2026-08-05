from __future__ import annotations

from dataclasses import dataclass
import math
import numpy as np
from scipy import signal

from .models import Candidate
from .provenance import provenance_for_array

@dataclass(frozen=True)
class PipelineConfig:
    sample_rate_hz: float
    target_id: str
    station_id: str
    center_frequency_hz: float = 1_420_405_751.0
    nperseg: int = 1024
    overlap: int = 768
    narrowband_threshold_db: float = 8.0
    truth_class: str = "SYNTHETIC"
    source: str = "deterministic synthetic generator"
    observed_at: str | None = None

@dataclass(frozen=True)
class SpectrumResult:
    frequencies_hz: np.ndarray
    times_seconds: np.ndarray
    power_db: np.ndarray


def channelize(iq: np.ndarray, config: PipelineConfig) -> SpectrumResult:
    if iq.ndim != 1 or len(iq) < config.nperseg:
        raise ValueError("IQ must be one-dimensional and at least nperseg samples")
    f, t, z = signal.stft(
        iq, fs=config.sample_rate_hz, window="hann", nperseg=config.nperseg,
        noverlap=config.overlap, return_onesided=False, boundary=None, padded=False,
    )
    order = np.argsort(f)
    power = 10 * np.log10(np.abs(z[order]) ** 2 + 1e-12)
    return SpectrumResult(f[order], t, power)


def robust_noise_floor(power_db: np.ndarray) -> tuple[float, float]:
    median = float(np.median(power_db))
    mad = float(np.median(np.abs(power_db - median)))
    sigma = max(1e-6, 1.4826 * mad)
    return median, sigma


def estimate_drift(spectrum: SpectrumResult) -> tuple[float, float, float]:
    peak_bins = np.argmax(spectrum.power_db, axis=0)
    peak_freqs = spectrum.frequencies_hz[peak_bins]
    if len(spectrum.times_seconds) < 2:
        return float(np.median(peak_freqs)), 0.0, 0.0
    slope, intercept = np.polyfit(spectrum.times_seconds, peak_freqs, 1)
    model = intercept + slope * spectrum.times_seconds
    residual = float(np.sqrt(np.mean((peak_freqs - model) ** 2)))
    return float(intercept), float(slope), residual


def dechirp_search(iq: np.ndarray, sample_rate_hz: float, max_abs_drift_hz_s: float = 5.0, step_hz_s: float = 0.05) -> tuple[float, float, float]:
    """Estimate a narrowband carrier and linear drift by maximizing coherent FFT power."""
    if step_hz_s <= 0 or max_abs_drift_hz_s <= 0:
        raise ValueError("Invalid drift search range")
    t = np.arange(len(iq), dtype=np.float64) / sample_rate_hz
    frequencies = np.fft.fftfreq(len(iq), d=1.0 / sample_rate_hz)
    best_score = -1.0
    best_drift = 0.0
    best_frequency = 0.0
    for drift in np.arange(-max_abs_drift_hz_s, max_abs_drift_hz_s + step_hz_s / 2, step_hz_s):
        corrected = iq * np.exp(-1j * np.pi * drift * t * t)
        coherent = np.abs(np.fft.fft(corrected))
        index = int(np.argmax(coherent))
        score = float(coherent[index])
        if score > best_score:
            best_score = score
            best_drift = float(drift)
            best_frequency = float(frequencies[index])
    normalized = best_score / (float(np.sqrt(np.sum(np.abs(iq) ** 2))) + 1e-12)
    return best_frequency, best_drift, normalized


def detect_periodicity(iq: np.ndarray, sample_rate_hz: float, min_period: float = 0.1, max_period: float = 4.0) -> tuple[float | None, float]:
    envelope = np.abs(iq).astype(np.float64)
    block = max(1, int(sample_rate_hz / 200.0))
    usable = len(envelope) // block * block
    series = envelope[:usable].reshape(-1, block).mean(axis=1)
    rate = sample_rate_hz / block
    series -= np.mean(series)
    if np.allclose(series, 0):
        return None, 0.0
    frequencies, power = signal.periodogram(series, fs=rate)
    valid = (frequencies >= 1.0 / max_period) & (frequencies <= 1.0 / min_period)
    if not np.any(valid):
        return None, 0.0
    local = power[valid]
    idx = int(np.argmax(local))
    freq = float(frequencies[valid][idx])
    score = float(local[idx] / (np.median(local) + 1e-12))
    return (1.0 / freq if freq > 0 else None), score


def detect_bursts(iq: np.ndarray) -> float:
    power = np.abs(iq) ** 2
    median = float(np.median(power))
    mad = float(np.median(np.abs(power - median))) + 1e-12
    return float((np.percentile(power, 99.9) - median) / (1.4826 * mad))


def rfi_rejection(on_spectrum: SpectrumResult, off_spectrum: SpectrumResult | None, tolerance_hz: float = 8.0) -> dict[str, bool]:
    if off_spectrum is None:
        return {"off_source_available": False, "absent_off_source": False, "geographic_coincidence_clear": False}
    on_peak = float(on_spectrum.frequencies_hz[np.argmax(np.mean(on_spectrum.power_db, axis=1))])
    off_peak = float(off_spectrum.frequencies_hz[np.argmax(np.mean(off_spectrum.power_db, axis=1))])
    absent = abs(on_peak - off_peak) > tolerance_hz
    return {"off_source_available": True, "absent_off_source": absent, "geographic_coincidence_clear": absent}


def analyze(iq: np.ndarray, config: PipelineConfig, off_source_iq: np.ndarray | None = None) -> Candidate:
    spectrum = channelize(iq, config)
    floor, sigma = robust_noise_floor(spectrum.power_db)
    peak = float(np.max(spectrum.power_db))
    snr_db = peak - floor
    ridge_intercept, ridge_drift, residual = estimate_drift(spectrum)
    intercept, drift, coherent_score = dechirp_search(iq, config.sample_rate_hz)
    period, periodicity_score = detect_periodicity(iq, config.sample_rate_hz)
    burst_score = detect_bursts(iq)
    off_spectrum = channelize(off_source_iq, config) if off_source_iq is not None else None
    rfi_tests = rfi_rejection(spectrum, off_spectrum)
    narrow = snr_db >= config.narrowband_threshold_db and residual < max(10.0, config.sample_rate_hz / config.nperseg * 3)
    if rfi_tests["off_source_available"] and not rfi_tests["absent_off_source"]:
        state = "RFI_LIKELY"
    elif narrow:
        state = "TECHNOSIGNATURE_CANDIDATE"
    else:
        state = "UNCLASSIFIED_EVENT"
    provenance = provenance_for_array(
        iq, truth_class=config.truth_class, source=config.source, observed_at=config.observed_at,
        transformation=f"STFT nperseg={config.nperseg}; robust noise; linear drift; periodicity; burst; RFI",
        version="cosmic-listener-0.1.0",
        limitations=("Single-node detections are not confirmations", "Synthetic truth class is never astronomical"),
    )
    bin_width = config.sample_rate_hz / config.nperseg
    return Candidate(
        signal_id=f"{config.truth_class[:3]}-{provenance.sha256[:12]}", station_id=config.station_id,
        target_id=config.target_id, frequency_hz=config.center_frequency_hz + intercept,
        bandwidth_hz=bin_width, drift_hz_per_second=drift, snr_db=snr_db,
        periodicity_seconds=period if periodicity_score > 5 else None, burst_score=burst_score,
        state=state, rfi_tests=rfi_tests, provenance=provenance,
        metadata={"noise_floor_db": floor, "noise_sigma_db": sigma, "drift_residual_hz": residual,
                  "ridge_frequency_hz": ridge_intercept, "ridge_drift_hz_s": ridge_drift,
                  "coherent_score": coherent_score, "periodicity_score": periodicity_score, "narrowband": narrow},
    )


def coincidence(candidates: list[Candidate], frequency_tolerance_hz: float = 12.0,
                drift_tolerance_hz_s: float = 0.2) -> dict[str, object]:
    if len({c.station_id for c in candidates}) < 2:
        return {"coincident": False, "reason": "fewer than two independent stations", "confidence": 0.0}
    freqs = np.array([c.frequency_hz for c in candidates])
    drifts = np.array([c.drift_hz_per_second for c in candidates])
    coincident = float(np.ptp(freqs)) <= frequency_tolerance_hz and float(np.ptp(drifts)) <= drift_tolerance_hz_s
    confidence = min(0.99, 0.55 + 0.12 * len(candidates)) if coincident else 0.0
    return {"coincident": coincident, "stations": sorted({c.station_id for c in candidates}),
            "frequency_span_hz": float(np.ptp(freqs)), "drift_span_hz_s": float(np.ptp(drifts)),
            "confidence": confidence}
