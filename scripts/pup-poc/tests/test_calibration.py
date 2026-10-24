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
    def test_failed_boundary_is_not_refined_again(self):
        calls=[]
        def trial(cpu):
            calls.append(cpu)
            return {'fast':cpu>189,'pass':False}
        self.assertIsNone(calibration.search(trial))
        self.assertEqual([60,30,20,10],calls[calls.index(60):])
    def test_only_audited_search_update_can_reuse_measurements(self):
        old={'rate':5,'inputs':{'calibrate.py':calibration.LEGACY_SEARCH_SHA256,'fixed-traffic.py':'traffic'}}
        current={'rate':5,'inputs':{'calibrate.py':'new','fixed-traffic.py':'traffic'}}
        rows,provenance=calibration.resume({'profile':old,'results':[{'name':'candidate-190'}]},current)
        self.assertEqual(old,rows[0]['source_profile'])
        self.assertEqual(old,provenance[0]['previous_profile'])
        current['inputs']['fixed-traffic.py']='changed'
        with self.assertRaises(RuntimeError):calibration.resume({'profile':old,'results':[]},current)
        current['inputs']['fixed-traffic.py']='traffic';old['inputs']['calibrate.py']='unknown'
        with self.assertRaises(RuntimeError):calibration.resume({'profile':old,'results':[]},current)
