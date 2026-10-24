import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
spec=importlib.util.spec_from_file_location('startup',Path(__file__).resolve().parents[1]/'assess-startup.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

class StartupTests(unittest.TestCase):
    def test_cold_time_and_fresh_telemetry(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'monitors').mkdir()
            (root/'event-1').write_text('Test fixture for an observed platform opening event')
            def write(name,data): (root/name).write_text(json.dumps(data)+'\n')
            write('launch.json',{'cold':True,'launched_at':'2026-10-24T00:00:00Z'})
            write('platform-open.json',{'source':'platform-event','evidence':'event-1','opened_at':'2026-10-24T00:02:00Z'})
            write('incident-ready.json',{'ready_at':'2026-10-24T00:03:00Z'})
            write('preparation.json',{'state':'ready'})
            write('monitors/latency-created.json',{'id':1})
            write('monitors/states.jsonl',{'id':1,'overall_state':'Alert','at':'2026-10-24T00:02:50Z'})
            write('db-spans.jsonl',{'at':'2026-10-24T00:03:00Z','spans':[{'start_timestamp':'2026-10-24T00:02:30Z'}]})
            self.assertTrue(module.assess(root)['pass'])
            write('launch.json',{'cold':False,'launched_at':'2026-10-24T00:00:00Z'})
            self.assertFalse(module.assess(root)['pass'])
            write('launch.json',{'cold':True,'launched_at':'2026-10-24T00:00:00Z'})
            write('platform-open.json',{'source':'platform-event','evidence':'event-1','opened_at':'2026-10-24T00:02:01Z'})
            self.assertFalse(module.assess(root)['pass'])
            write('platform-open.json',{'source':'platform-event','evidence':'event-1','opened_at':'2026-10-24T00:02:00Z'})
            write('db-spans.jsonl',{'at':'2026-10-24T00:03:00Z','spans':[{'start_timestamp':'2026-10-23T23:59:59Z'}]})
            self.assertFalse(module.assess(root)['pass'])
