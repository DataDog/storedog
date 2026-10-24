import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
spec=importlib.util.spec_from_file_location('incident',Path(__file__).resolve().parents[1]/'incident-ready.py')
incident=importlib.util.module_from_spec(spec);spec.loader.exec_module(incident)

class IncidentTests(unittest.TestCase):
    def test_correlated_fresh_span_and_latest_alert_required(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'monitors').mkdir()
            def write(name,rows):(root/name).write_text(''.join(json.dumps(r)+'\n' for r in rows))
            now=incident.epoch('2026-10-24T00:02:00Z')
            write('learner-traffic.jsonl',[dict(type='request',index=i,status=200,valid=True,trace_id=str(i)) for i in range(10)])
            write('startup.jsonl',[dict(event='fault-ready',at='2026-10-24T00:01:00Z')])
            write('monitors/latency-created.json',[{'id':1}])
            write('monitors/states.jsonl',[dict(id=1,overall_state='Alert',at='2026-10-24T00:01:50Z')])
            span=dict(trace_id='2',start_timestamp='2026-10-24T00:01:40Z',operation_name='pg.query',resource_name='SELECT spree_products')
            batch=dict(at='2026-10-24T00:01:55Z',spans=[span])
            write('db-spans.jsonl',[batch]);self.assertTrue(incident.evidence_ready(root,now))
            span['trace_id']='unrelated';write('db-spans.jsonl',[batch]);self.assertFalse(incident.evidence_ready(root,now))
            span['trace_id']='2';span['start_timestamp']='2026-10-24T00:00:40Z'
            write('db-spans.jsonl',[batch]);self.assertFalse(incident.evidence_ready(root,now))
            span['start_timestamp']='2026-10-24T00:01:40Z';write('db-spans.jsonl',[batch])
            write('monitors/states.jsonl',[dict(id=1,overall_state='Alert',at='2026-10-24T00:01:50Z'),dict(id=1,overall_state='OK',at='2026-10-24T00:01:59Z')])
            self.assertFalse(incident.evidence_ready(root,now))
