import json
import unittest
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from readiness import consecutive_valid

class ReadinessTests(unittest.TestCase):
    def test_incomplete_errors_and_dropped_arrivals(self):
        rows=[dict(type='request', index=i, status=200, valid=True) for i in range(10)]
        encode=lambda rs: '\n'.join(json.dumps(r) for r in rs)
        self.assertTrue(consecutive_valid(encode(list(reversed(rows)))))
        self.assertFalse(consecutive_valid(encode(rows[:-1])))
        self.assertFalse(consecutive_valid(encode(rows[:5]+rows[6:])))
        self.assertTrue(consecutive_valid(encode(rows)+'\n{"type":'))
        for change in ({'status':500}, {'valid':False}, {'dropped':True}):
            changed=[dict(r) for r in rows];changed[5].update(change)
            self.assertFalse(consecutive_valid(encode(changed)))
