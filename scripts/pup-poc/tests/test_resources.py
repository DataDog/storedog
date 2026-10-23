import datetime
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ResourceEvidence(unittest.TestCase):
    def test_sparse_soak_samples_do_not_establish_headroom(self):
        base = datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc)
        stamp = lambda seconds: (base + datetime.timedelta(seconds=seconds)).isoformat()
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            def rows(name, data):
                (root/name).write_text(''.join(json.dumps(row)+'\n' for row in data))
            rows('frozen-repeat.events.jsonl', [
                {'kind':'start','at':stamp(0),'cycles':1,'fault_seconds':2400,'recovery_seconds':360},
                {'kind':'fault-ready','at':stamp(70),'cycle':1}])
            rows('frozen-repeat.traffic.jsonl', [])
            rows('nodes.jsonl', [])
            rows('pup-metrics.jsonl', [])
            (root/'monitors').mkdir()
            (root/'monitors/latency-created.json').write_text(json.dumps({'tags':['env:test']}))
            stats = {'usage_usec':10,'nr_periods':10,'nr_throttled':1,'memory_current':1024,'inactive_file':0,'oom_kill':0}
            rows('recovery-resources.jsonl', [
                {'target':target,'at':stamp(t),'stats':stats}
                for target in ('postgres-0','deployment/backend','pup-traffic') for t in (140,2440)])
            subprocess.run(['python3',str(ROOT/'assess-resources.py'),directory],check=True,capture_output=True)
            result = json.loads((root/'resource-assessment.json').read_text())
            self.assertTrue(all(s['incomplete'] for s in result[0]['containers'].values()))

if __name__ == '__main__': unittest.main()
