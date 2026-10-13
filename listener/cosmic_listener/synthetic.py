from __future__ import annotations

from dataclasses import dataclass
import numpy as np

@dataclass(frozen=True)
class SyntheticConfig:
    sample_rate_hz: float = 4096.0
    duration_seconds: float = 8.0
    tone_hz: float = 733.0
    drift_hz_per_second: float = 0.7
    snr_db: float = 12.0
    periodic_pulse_seconds: float | None = 0.8
    pulse_width_seconds: float = 0.03
    seed: int = 7
    clock_drift_ppm: float = 0.0


def generate_iq(config: SyntheticConfig, *, include_signal: bool = True, terrestrial_rfi_hz: float | None = None) -> np.ndarray:
    rng = np.random.default_rng(config.seed)
    count = int(config.sample_rate_hz * config.duration_seconds)
    t = np.arange(count, dtype=np.float64) / config.sample_rate_hz
    noise = (rng.normal(size=count) + 1j * rng.normal(size=count)) / np.sqrt(2.0)
    signal = np.zeros(count, dtype=np.complex128)
    if include_signal:
        phase = 2 * np.pi * (config.tone_hz * t + 0.5 * config.drift_hz_per_second * t * t)
        amplitude = 10 ** (config.snr_db / 20.0)
        signal += amplitude * np.exp(1j * phase)
        if config.periodic_pulse_seconds:
            phase_in_period = np.mod(t, config.periodic_pulse_seconds)
            gate = phase_in_period < config.pulse_width_seconds
            signal += amplitude * 0.7 * gate * np.exp(1j * 2 * np.pi * (config.tone_hz + 120) * t)
    if terrestrial_rfi_hz is not None:
        signal += 14.0 * np.exp(1j * 2 * np.pi * terrestrial_rfi_hz * t)
    return (noise + signal).astype(np.complex64)


def multi_station_pair(config: SyntheticConfig) -> tuple[np.ndarray, np.ndarray]:
    a = generate_iq(config)
    b = generate_iq(SyntheticConfig(**{**config.__dict__, "seed": config.seed + 1, "snr_db": config.snr_db - 1.0}))
    return a, b
