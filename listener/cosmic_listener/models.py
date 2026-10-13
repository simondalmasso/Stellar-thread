from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from typing import Literal

TruthClass = Literal[
    "OFFICIAL_CATALOG", "DERIVED", "LIVE_OBSERVATORY", "RECORDED_AUTHENTIC",
    "SYNTHETIC", "HUMAN_REVIEW", "STALE", "UNAVAILABLE"
]

@dataclass(frozen=True)
class Provenance:
    truth_class: TruthClass
    source: str
    observed_at: str | None
    processed_at: str
    transformation: str
    version: str
    sha256: str
    freshness: str = "CURRENT"
    limitations: tuple[str, ...] = ()

@dataclass(frozen=True)
class Candidate:
    signal_id: str
    station_id: str
    target_id: str
    frequency_hz: float
    bandwidth_hz: float
    drift_hz_per_second: float
    snr_db: float
    periodicity_seconds: float | None
    burst_score: float
    state: str
    rfi_tests: dict[str, bool]
    provenance: Provenance
    metadata: dict[str, object] = field(default_factory=dict)

    def to_dict(self) -> dict[str, object]:
        return asdict(self)

def utc_now() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")
