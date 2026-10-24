#!/usr/bin/env python3
"""Assess genuine cold startup separately from scenario/lifecycle acceptance."""
import argparse
import datetime
import json
from pathlib import Path

def timestamp(value):
    return datetime.datetime.fromisoformat(value.replace('Z','+00:00')).timestamp()

def assess(root):
    launch=json.loads((root/'launch.json').read_text())
    ready=json.loads((root/'learner-ready.json').read_text())
    opened=timestamp(ready['opened_at']); launched=timestamp(launch['launched_at'])
    latency_id=json.loads((root/'monitors/latency-created.json').read_text())['id']
    states=[json.loads(line) for line in (root/'monitors/states.jsonl').read_text().splitlines()]
    alerts=[timestamp(row['at']) for row in states if row.get('id')==latency_id and row.get('overall_state')=='Alert' and timestamp(row['at'])>=launched]
    span_rows=[json.loads(line) for line in (root/'db-spans.jsonl').read_text().splitlines()]
    fresh=[timestamp(row['at']) for row in span_rows if any(timestamp(span['start_timestamp'])>=launched for span in row.get('spans',[]) if span.get('start_timestamp'))]
    elapsed=opened-launched
    checks={'cold':launch.get('cold') is True, 'startup':0<=elapsed<=120,
            'alert':bool(alerts) and min(alerts)<=opened+180,
            'fresh_trace':bool(fresh) and min(fresh)<=opened+180}
    return {'pass':all(checks.values()),'checks':checks,'startup_seconds':elapsed,
            'first_alert_at':min(alerts) if alerts else None,'first_fresh_trace_at':min(fresh) if fresh else None}

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('evidence',type=Path);a=p.parse_args()
    try: result=assess(a.evidence)
    except (OSError,ValueError,KeyError,TypeError) as error: result={'pass':False,'error':str(error)}
    print(json.dumps(result,indent=2));raise SystemExit(0 if result['pass'] else 1)
