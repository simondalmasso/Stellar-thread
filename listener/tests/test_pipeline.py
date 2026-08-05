import unittest

from cosmic_listener.pipeline import PipelineConfig, analyze, coincidence
from cosmic_listener.synthetic import SyntheticConfig, generate_iq, multi_station_pair

class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.synth = SyntheticConfig(duration_seconds=4, snr_db=18, drift_hz_per_second=.5)
        self.config = PipelineConfig(sample_rate_hz=self.synth.sample_rate_hz, target_id="proxima-b", station_id="a")

    def test_narrowband_detected(self):
        candidate = analyze(generate_iq(self.synth), self.config)
        self.assertEqual(candidate.state, "TECHNOSIGNATURE_CANDIDATE")
        self.assertGreater(candidate.snr_db, 8)
        self.assertAlmostEqual(candidate.drift_hz_per_second, .5, delta=.5)
        self.assertEqual(candidate.provenance.truth_class, "SYNTHETIC")

    def test_no_signal_not_promoted(self):
        candidate = analyze(generate_iq(self.synth, include_signal=False), self.config)
        self.assertNotEqual(candidate.state, "TECHNOSIGNATURE_CANDIDATE")

    def test_on_off_rfi_rejected(self):
        on = generate_iq(self.synth, terrestrial_rfi_hz=300)
        off = generate_iq(self.synth, include_signal=False, terrestrial_rfi_hz=300)
        candidate = analyze(on, self.config, off)
        self.assertEqual(candidate.state, "RFI_LIKELY")
        self.assertFalse(candidate.rfi_tests["absent_off_source"])

    def test_on_source_only_conserved(self):
        on = generate_iq(self.synth)
        off = generate_iq(self.synth, include_signal=False)
        candidate = analyze(on, self.config, off)
        self.assertNotEqual(candidate.state, "RFI_LIKELY")
        self.assertTrue(candidate.rfi_tests["absent_off_source"])

    def test_two_station_coincidence(self):
        a, b = multi_station_pair(self.synth)
        ca = analyze(a, self.config)
        cb = analyze(b, PipelineConfig(sample_rate_hz=self.synth.sample_rate_hz, target_id="proxima-b", station_id="b"))
        result = coincidence([ca, cb], drift_tolerance_hz_s=1.0)
        self.assertTrue(result["coincident"])
        self.assertGreater(result["confidence"], .5)

    def test_single_station_not_coincident(self):
        c = analyze(generate_iq(self.synth), self.config)
        self.assertFalse(coincidence([c])["coincident"])

if __name__ == "__main__": unittest.main()
