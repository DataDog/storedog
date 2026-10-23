import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('metrics', Path(__file__).resolve().parents[1]/'metric-gate.py')
metrics = importlib.util.module_from_spec(spec)
spec.loader.exec_module(metrics)


class Metrics(unittest.TestCase):
    def rows(self, env='test', times=(20,40,60,80,100), value=1):
        rows = []
        for name, aggregation in [('kubernetes.cpu.usage.total','avg'), ('kubernetes.cpu.cfs.throttled.periods','sum')]:
            query = aggregation+':'+name+'{env:'+env+',pod_name:postgres-0}'
            rows.append({'at':'1970-01-01T00:02:00+00:00','query':query,
                         'response':{'status':'ok','query':query,'series':[
                             {'metric':name,'expression':query,'pointlist':[[t*1000,value] for t in times]}]}})
        return rows

    def test_fresh_scoped_throttling(self):
        self.assertTrue(all(r['pass'] for r in metrics.assess(self.rows(),'test',0,120,True).values()))

    def test_missing_stale_wrong_scope_or_sparse_is_failure(self):
        for rows in ([], self.rows('other'), self.rows(times=(20,100)), self.rows(times=(20,)), self.rows(value=None)):
            self.assertFalse(all(r['pass'] for r in metrics.assess(rows,'test',0,120,True).values()))
        rows = self.rows()
        for row in rows: row['at']='1970-01-01T01:00:00+00:00'
        self.assertFalse(all(r['pass'] for r in metrics.assess(rows,'test',0,120,True).values()))

    def test_zero_throttling_allowed_only_in_recovery(self):
        self.assertFalse(all(r['pass'] for r in metrics.assess(self.rows(value=0),'test',0,120,True).values()))
        self.assertTrue(all(r['pass'] for r in metrics.assess(self.rows(value=0),'test',0,120).values()))


if __name__ == '__main__': unittest.main()
