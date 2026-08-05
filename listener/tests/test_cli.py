import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

from cosmic_listener.cli import main

class CliTests(unittest.TestCase):
    def call(self, args):
        out = io.StringIO()
        with redirect_stdout(out):
            code = main(args)
        lines = [json.loads(line) for line in out.getvalue().splitlines()]
        return code, lines

    def test_doctor(self):
        code, lines = self.call(["doctor"])
        self.assertEqual(code, 0)
        self.assertEqual(lines[0]["physical_transmitter"], "NOT_IMPLEMENTED")

    def test_observe_and_replay(self):
        with tempfile.TemporaryDirectory() as d:
            manifest = Path(d) / "candidate.json"
            code, lines = self.call(["observe", "--synthetic", "--duration", "2", "--output", str(manifest)])
            self.assertEqual(code, 0)
            self.assertEqual(lines[0]["provenance"]["truth_class"], "SYNTHETIC")
            code, lines = self.call(["replay", str(manifest)])
            self.assertEqual(code, 0)
            self.assertTrue(lines[0]["reproducible"])

if __name__ == "__main__": unittest.main()
