#!/usr/bin/env python3
"""Continuous-load restart control followed by a CPU fault and recovery.

Run on lab-host after installing the generator and applying healthy resources.
This is a diagnostic experiment, not monitor acceptance. PVCs are untouched.
"""
import argparse
import datetime
import json
from pathlib import Path
import subprocess
import time

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--name', default='recovery-control')
p.add_argument('--cpu', default='30m')
p.add_argument('--output', default='/root/pup-poc/evidence')
a = p.parse_args()
if not a.name.replace('-', '').isalnum():
    p.error('name must be alphanumeric with optional hyphens')
out = Path(a.output)
out.mkdir(parents=True, exist_ok=True)
k = ['kubectl', '--request-timeout=15s', '-n', 'storedog']

def command(args, timeout=25):
    return subprocess.check_output(k + args, text=True, timeout=timeout,
                                   stderr=subprocess.PIPE)

def state():
    result = {}
    try:
        pods = json.loads(command(['get', 'pods', '-o', 'json']))
        result['pods'] = [{'name': x['metadata']['name'], 'uid': x['metadata']['uid'],
                           'containers': [{'name': c['name'], 'ready': c['ready'],
                                           'restarts': c['restartCount']}
                                          for c in x['status'].get('containerStatuses', [])]}
                          for x in pods['items']]
        result['db_activity'] = command(['exec', 'postgres-0', '--', 'psql', '-U', 'postgres',
            '-d', 'storedog_db', '-At', '-c',
            "SELECT json_build_object('state',state,'wait_type',wait_event_type,"
            "'wait',wait_event,'count',count(*),'max_query_age_s',"
            "max(extract(epoch FROM clock_timestamp()-query_start))) "
            "FROM pg_stat_activity WHERE datname=current_database() AND pid<>pg_backend_pid() "
            "GROUP BY state,wait_event_type,wait_event;"])
    except Exception as exc:
        result['error'] = type(exc).__name__
    return result

events = open(out / (a.name + '.events.jsonl'), 'w')
start = time.monotonic()

def event(kind, **values):
    row = dict(kind=kind, at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
               offset_s=time.monotonic()-start, **values)
    events.write(json.dumps(row)+'\n')
    events.flush()
    if kind != 'snapshot':
        print(json.dumps(row), flush=True)

def resize(cpu):
    patch = {'spec': {'template': {'spec': {'containers': [{'name': 'postgres',
             'resources': {'requests': {'cpu': '500m' if cpu == '1' else cpu},
                           'limits': {'cpu': cpu}}}]}}}}
    command(['patch', 'statefulset', 'postgres', '--type=strategic', '-p', json.dumps(patch)])

with open(out / (a.name + '.traffic.jsonl'), 'w') as traffic:
    process = subprocess.Popen(k + ['exec', 'pup-traffic', '--', 'python3',
        '/probe/fixed-traffic.py', '--rate', '5', '--duration', '720', '--stream'], stdout=traffic)
    event('traffic-start', rate=5, duration_s=720)
    actions = [(60, 'healthy-restart'), (300, 'cpu-fault'), (420, 'cpu-restore')]
    next_sample = 0
    try:
        while process.poll() is None:
            elapsed = time.monotonic()-start
            if actions and elapsed >= actions[0][0]:
                _, action = actions.pop(0)
                event(action+'-start')
                if action == 'healthy-restart':
                    command(['rollout', 'restart', 'statefulset/postgres'])
                else:
                    resize(a.cpu if action == 'cpu-fault' else '1')
                event(action+'-submitted')
            if elapsed >= next_sample:
                event('snapshot', **state())
                next_sample = time.monotonic()-start+15
            time.sleep(1)
        if process.returncode:
            raise RuntimeError('traffic process failed: '+str(process.returncode))
    finally:
        resize('1')
        event('healthy-resources-restored')
        if process.poll() is None:
            process.terminate()
        events.close()

rows = [json.loads(x) for x in (out / (a.name+'.traffic.jsonl')).read_text().splitlines()]
summary = next(x for x in rows if x['type'] == 'summary')
windows = []
for lo, hi, label in [(0,60,'baseline'), (60,120,'restart-transition'),
                       (120,300,'restart-recovery'), (300,360,'fault-transition'),
                       (360,420,'fault-steady'), (420,480,'restore-transition'),
                       (480,720,'restore-recovery')]:
    selected = [x for x in rows if x['type']=='request' and lo <= x['index']/5 < hi]
    lat = sorted(x['latency_s'] for x in selected if 'latency_s' in x)
    windows.append(dict(window=label, offered=len(selected),
        ok=sum(x.get('status')==200 for x in selected),
        dropped=sum(bool(x.get('dropped')) for x in selected),
        p95_s=lat[max(0, __import__('math').ceil(len(lat)*.95)-1)] if lat else None))
result = dict(summary=summary, windows=windows)
(out / (a.name+'.summary.json')).write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result), flush=True)
