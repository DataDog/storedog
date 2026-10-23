import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('backlog_gate',Path(__file__).resolve().parents[1]/'backlog-gate.py')
gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate)

class Backlog(unittest.TestCase):
    def test_slow_but_stable_requests_pass(self):
        rows=[{'type':'request','index':i,'latency_s':2} for i in range(1200)]
        self.assertTrue(gate.assess(rows,5,60,240)['pass'])
    def test_latency_band_can_hide_growing_queue(self):
        rows=[{'type':'request','index':i,'latency_s':1+2*i/1200} for i in range(1200)]
        self.assertFalse(gate.assess(rows,5,60,240)['pass'])
    def test_short_steady_interval_is_inconclusive(self):
        self.assertFalse(gate.assess([],5,0,59)['pass'])

    def test_missing_requests_fail(self):
        self.assertFalse(gate.assess([],5,60,240)['pass'])
