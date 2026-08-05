from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from .models import Provenance, utc_now


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_array(array: Any) -> str:
    return sha256_bytes(memoryview(array).cast("B").tobytes())


def provenance_for_array(array: Any, *, truth_class: str, source: str, observed_at: str | None,
                         transformation: str, version: str, limitations: tuple[str, ...] = ()) -> Provenance:
    return Provenance(
        truth_class=truth_class, source=source, observed_at=observed_at,
        processed_at=utc_now(), transformation=transformation, version=version,
        sha256=sha256_array(array), limitations=limitations,
    )


def write_manifest(path: str | Path, payload: dict[str, Any]) -> None:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
