import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('calibration',Path(__file__).resolve().parents[1]/'calibrate.py')
calibration=importlib.util.module_from_spec(spec);spec.loader.exec_module(calibration)
class Calibration(unittest.TestCase):
    def test_coarse_steps_skip_narrow_qualifying_band(self):
        calls=[]
        def trial(cpu):
            calls.append(cpu)
            return {'fast':cpu>173,'pass':170<=cpu<=173}
        self.assertEqual(173,calibration.search(trial))
        self.assertIn(174,calls)
    def test_all_fast_is_failure(self):
        self.assertIsNone(calibration.search(lambda cpu:{'fast':True,'pass':False}))
    def test_integer_gap_has_no_solution(self):
        self.assertIsNone(calibration.search(lambda cpu:{'fast':cpu>173,'pass':False}))
    def test_refine_above_highest_coarse_candidate(self):
        self.assertEqual(400,calibration.search(lambda cpu:{'fast':cpu>400,'pass':200<=cpu<=400}))
