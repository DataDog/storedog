import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location('gates', Path(__file__).resolve().parents[1]/'window-gates.py')
gates = importlib.util.module_from_spec(spec); spec.loader.exec_module(gates)

class Gates(unittest.TestCase):
    def rows(self, latency=1.5):
        return [{'type':'request','index':i,'status':200,'valid':True,'latency_s':latency,'dispatch_lag_s':.001} for i in range(900)]
    def test_steady_fault(self):
        self.assertTrue(gates.assess(self.rows(),5,'fault')['pass'])
        self.assertFalse(gates.assess(self.rows(.1),5,'fault')['pass'])
        self.assertFalse(gates.assess(self.rows(4),5,'fault')['pass'])
    def test_missing_duplicate_dropped_invalid(self):
        rows=self.rows(.1)
        self.assertTrue(gates.assess(rows,5,'healthy')['pass'])
        for changed in (rows[:-1], rows+[rows[0]], [dict(r, valid=False) for r in rows], [dict(r,dropped=True) for r in rows]):
            self.assertFalse(gates.assess(changed,5,'healthy')['pass'])
    def test_error_budget_per_window(self):
        rows=self.rows()
        for r in rows[:15]: r['status']=500
        self.assertTrue(gates.assess(rows,5,'fault')['pass'])
        rows[15]['status']=500
        self.assertFalse(gates.assess(rows,5,'fault')['pass'])
