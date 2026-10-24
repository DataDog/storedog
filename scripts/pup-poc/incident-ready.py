#!/usr/bin/env python3
"""Require fresh product-correlated SQL and an Alert before investigation."""
import datetime
import json
from pathlib import Path
import subprocess
import time
from readiness import consecutive_valid


def rows(path):
    if not path.exists():return []
    result=[]
    for line in path.read_text().splitlines():
        try:result.append(json.loads(line))
        except json.JSONDecodeError:continue
    return result

def epoch(value):return datetime.datetime.fromisoformat(value.replace('Z','+00:00')).timestamp()

def evidence_ready(root, now):
    traffic_path=root/'learner-traffic.jsonl'
    if not traffic_path.exists() or not consecutive_valid(traffic_path.read_text()):return False
    traffic=rows(traffic_path)
    traces={r.get('trace_id') for r in traffic if r.get('status')==200 and r.get('valid') is True}
    fault=[r for r in rows(root/'startup.jsonl') if r.get('event')=='fault-ready']
    if not fault:return False
    since=epoch(fault[-1]['at'])
    monitor=json.loads((root/'monitors/latency-created.json').read_text())['id']
    states=[r for r in rows(root/'monitors/states.jsonl') if r.get('id')==monitor]
    if not states or states[-1].get('overall_state')!='Alert' or not since<=epoch(states[-1]['at'])<=now or now-epoch(states[-1]['at'])>45:return False
    return any(batch.get('at') and 0<=now-epoch(batch['at'])<=60 and
        any(s.get('trace_id') in traces and s.get('start_timestamp') and since<=epoch(s['start_timestamp'])<=now and
            (s.get('operation_name') or '').startswith('pg.') and
            any(table in (s.get('resource_name') or '') for table in ('spree_products','spree_variants','spree_taxons','spree_prices'))
            for s in batch.get('spans',[])) for batch in rows(root/'db-spans.jsonl'))

def main():
    root=Path('/root/pup-poc/evidence');deadline=time.monotonic()+180
    subprocess.run(['python3','preparation-status.py','--stage','waiting for incident telemetry'],check=True)
    while time.monotonic()<deadline:
        subprocess.run(['systemctl','is-active','--quiet','pup-course-traffic'],check=True)
        if evidence_ready(root,time.time()):
            value={'ready_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'monitor_alert_required':True}
            temp=root/'incident-ready.json.partial';temp.write_text(json.dumps(value)+'\n');temp.replace(root/'incident-ready.json')
            subprocess.run(['python3','startup-event.py','incident-ready'],check=True)
            (root.parent/'incident-ready').touch()
            return
        time.sleep(2)
    raise SystemExit('Fresh product SQL spans and latency Alert were not established')

if __name__=='__main__':main()
