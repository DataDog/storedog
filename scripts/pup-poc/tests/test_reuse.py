import datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
spec=importlib.util.spec_from_file_location('reuse',Path(__file__).resolve().parents[1]/'reuse-warmup.py')
reuse=importlib.util.module_from_spec(spec);spec.loader.exec_module(reuse)

class WarmupReuse(unittest.TestCase):
    def test_stale_or_changed_workload_cannot_reuse_setup(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);out=root/'evidence';out.mkdir()
            for name in reuse.NAMES:(root/name).write_text(name)
            (out/'setup-inputs.sha256').write_text(''.join(hashlib.sha256((root/name).read_bytes()).hexdigest()+'  '+name+'\n' for name in sorted(reuse.NAMES)))
            now=1800000000
            (out/'setup-completed.json').write_text(json.dumps({'process_exit':0,'completed_at':datetime.datetime.fromtimestamp(now,datetime.timezone.utc).isoformat()}))
            (out/'setup-warmup-1.jsonl').write_text(''.join(json.dumps({'type':'request','index':i,'latency_s':.1,'dispatch_lag_s':0,'status':200,'valid':True})+'\n' for i in range(900)))
            self.assertTrue(reuse.assess(root,out,5,now+30)['pass'])
            with self.assertRaises(AssertionError):reuse.assess(root,out,5,now+121)
            (root/'workload.py').write_text('changed request sequence')
            with self.assertRaises(AssertionError):reuse.assess(root,out,5,now+30)
