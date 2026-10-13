from __future__ import annotations

import json
from pathlib import Path
import numpy as np


def load_npy(path: str | Path) -> tuple[np.ndarray, dict[str, object]]:
    p = Path(path)
    data = np.load(p)
    if not np.iscomplexobj(data):
        raise ValueError("Expected complex IQ samples")
    return data.astype(np.complex64), {"format": "NPY", "path": str(p), "truth_class": "RECORDED_AUTHENTIC"}


def load_sigmf(meta_path: str | Path) -> tuple[np.ndarray, dict[str, object]]:
    meta_p = Path(meta_path)
    metadata = json.loads(meta_p.read_text(encoding="utf-8"))
    datatype = metadata.get("global", {}).get("core:datatype")
    if datatype not in {"cf32_le", "cf32"}:
        raise ValueError("Reference adapter currently supports SigMF cf32_le only")
    data_path = meta_p.with_name(meta_p.name[: -len(".sigmf-meta")] + ".sigmf-data") if meta_p.name.endswith(".sigmf-meta") else meta_p.with_name(meta_p.name + ".sigmf-data")
    data = np.fromfile(data_path, dtype=np.complex64)
    return data, {"format": "SigMF", "metadata": metadata, "path": str(data_path), "truth_class": "RECORDED_AUTHENTIC"}


def load_breakthrough(path: str | Path):
    try:
        from blimpy import Waterfall
    except ImportError as exc:
        raise RuntimeError("Install cosmic-listener[authentic] for HDF5/Filterbank/GUPPI support") from exc
    waterfall = Waterfall(str(path), load_data=True)
    data = np.asarray(waterfall.data).squeeze()
    return data, {"format": Path(path).suffix.lower(), "header": dict(waterfall.header), "truth_class": "RECORDED_AUTHENTIC"}
