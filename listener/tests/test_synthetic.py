import unittest
import numpy as np

from cosmic_listener.synthetic import SyntheticConfig, generate_iq, multi_station_pair

class SyntheticTests(unittest.TestCase):
    def test_deterministic(self):
        cfg = SyntheticConfig(seed=42, duration_seconds=1)
        self.assertTrue(np.array_equal(generate_iq(cfg), generate_iq(cfg)))

    def test_signal_and_noise_differ(self):
        cfg = SyntheticConfig(seed=5, duration_seconds=1)
        self.assertGreater(np.mean(np.abs(generate_iq(cfg))), np.mean(np.abs(generate_iq(cfg, include_signal=False))))

    def test_multi_station_independent_noise(self):
        a, b = multi_station_pair(SyntheticConfig(duration_seconds=1))
        self.assertFalse(np.array_equal(a, b))

if __name__ == "__main__": unittest.main()
