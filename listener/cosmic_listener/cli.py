from __future__ import annotations

import argparse
from dataclasses import asdict
import json
import platform
import sys
import time
from pathlib import Path
import numpy as np
import scipy

from . import __version__
from .formats import load_npy, load_sigmf
from .pipeline import PipelineConfig, analyze
from .provenance import write_manifest
from .synthetic import SyntheticConfig, generate_iq


def emit(payload: object) -> None:
    print(json.dumps(payload, sort_keys=True, default=str))


def doctor(_: argparse.Namespace) -> int:
    emit({"status": "ok", "version": __version__, "python": sys.version.split()[0], "platform": platform.platform(),
          "numpy": np.__version__, "scipy": scipy.__version__, "physical_transmitter": "NOT_IMPLEMENTED",
          "truth": "No hardware capability is inferred from this diagnostic"})
    return 0


def calibrate(args: argparse.Namespace) -> int:
    emit({"station_id": args.station, "status": "CALIBRATION_PLAN_READY", "clock_source": args.clock,
          "noise_diode": args.noise_diode, "limitations": ["No calibration is valid until measured against real hardware"]})
    return 0


def _load(args: argparse.Namespace):
    if args.synthetic:
        cfg = SyntheticConfig(sample_rate_hz=args.sample_rate, duration_seconds=args.duration, tone_hz=args.tone,
                              drift_hz_per_second=args.drift, snr_db=args.snr, seed=args.seed)
        return generate_iq(cfg, terrestrial_rfi_hz=args.rfi), {"truth_class": "SYNTHETIC", "source": "CLI deterministic generator"}
    if not args.input:
        raise ValueError("Provide --synthetic or --input")
    path = Path(args.input)
    if path.suffix == ".npy": return load_npy(path)
    if path.name.endswith(".sigmf-meta"): return load_sigmf(path)
    raise ValueError("Supported direct inputs: .npy and .sigmf-meta; use authentic extra for BL formats")


def observe(args: argparse.Namespace) -> int:
    iq, meta = _load(args)
    cfg = PipelineConfig(sample_rate_hz=args.sample_rate, target_id=args.target, station_id=args.station,
                         center_frequency_hz=args.center_frequency, truth_class=str(meta.get("truth_class", "UNAVAILABLE")),
                         source=str(meta.get("source", meta.get("path", "input"))))
    candidate = analyze(iq, cfg)
    payload = candidate.to_dict()
    if args.output: write_manifest(args.output, payload)
    emit(payload)
    return 0


def stream(args: argparse.Namespace) -> int:
    for index in range(args.count):
        cfg = SyntheticConfig(sample_rate_hz=args.sample_rate, duration_seconds=args.duration, tone_hz=args.tone,
                              drift_hz_per_second=args.drift, snr_db=args.snr, seed=args.seed + index)
        iq = generate_iq(cfg)
        candidate = analyze(iq, PipelineConfig(sample_rate_hz=args.sample_rate, target_id=args.target,
                                               station_id=args.station, truth_class="SYNTHETIC",
                                               source="cosmic-listener stream deterministic test"))
        emit({"event": "candidate", "sequence": index, "truth_class": "SYNTHETIC", "candidate": candidate.to_dict()})
        if index + 1 < args.count: time.sleep(args.interval)
    return 0


def replay(args: argparse.Namespace) -> int:
    payload = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    emit({"event": "replay", "reproducible": "provenance" in payload and bool(payload["provenance"].get("sha256")),
          "manifest": payload})
    return 0


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="cosmic-listener")
    sub = p.add_subparsers(dest="command", required=True)
    d = sub.add_parser("doctor"); d.set_defaults(func=doctor)
    c = sub.add_parser("calibrate"); c.add_argument("--station", default="community-node"); c.add_argument("--clock", default="SYSTEM_UNVERIFIED"); c.add_argument("--noise-diode", action="store_true"); c.set_defaults(func=calibrate)
    for name, fn in (("observe", observe), ("stream", stream)):
        q = sub.add_parser(name); q.add_argument("--station", default="synthetic-node-a"); q.add_argument("--target", default="proxima-b"); q.add_argument("--sample-rate", type=float, default=4096); q.add_argument("--duration", type=float, default=4); q.add_argument("--tone", type=float, default=733); q.add_argument("--drift", type=float, default=.7); q.add_argument("--snr", type=float, default=12); q.add_argument("--seed", type=int, default=7); q.add_argument("--center-frequency", type=float, default=1_420_405_751.0); q.add_argument("--synthetic", action="store_true"); q.add_argument("--input"); q.add_argument("--rfi", type=float); q.add_argument("--output"); q.set_defaults(func=fn)
        if name == "stream": q.add_argument("--count", type=int, default=3); q.add_argument("--interval", type=float, default=.05)
    r = sub.add_parser("replay"); r.add_argument("manifest"); r.set_defaults(func=replay)
    return p


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try: return int(args.func(args))
    except Exception as exc:
        emit({"status": "error", "error": str(exc), "type": type(exc).__name__})
        return 2

if __name__ == "__main__": raise SystemExit(main())
