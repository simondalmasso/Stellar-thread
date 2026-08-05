import json
import tempfile
import unittest
from pathlib import Path
import numpy as np

from cosmic_listener.formats import load_npy, load_sigmf

class FormatTests(unittest.TestCase):
    def test_npy_round_trip(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "iq.npy"
            expected = np.array([1+2j, 3+4j], dtype=np.complex64)
            np.save(path, expected)
            actual, meta = load_npy(path)
            self.assertTrue(np.array_equal(actual, expected))
            self.assertEqual(meta["truth_class"], "RECORDED_AUTHENTIC")

    def test_sigmf_cf32(self):
        with tempfile.TemporaryDirectory() as d:
            meta = Path(d) / "capture.sigmf-meta"
            data = Path(d) / "capture.sigmf-data"
            expected = np.array([1+1j, 2+2j], dtype=np.complex64)
            expected.tofile(data)
            meta.write_text(json.dumps({"global": {"core:datatype": "cf32_le"}}))
            actual, _ = load_sigmf(meta)
            self.assertTrue(np.array_equal(actual, expected))

if __name__ == "__main__": unittest.main()
