#!/usr/bin/env python3
"""Run an installed in-cluster generator and capture cgroup-v2 resource evidence."""
import argparse
import concurrent.futures
import datetime
import json
from pathlib import Path
import subprocess
import time

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('phase')
p.add_argument('--workload', help='Manifest path inside generator pod')
p.add_argument('--rate', type=float, default=5)
p.add_argument('--duration', type=int, default=120)
p.add_argument('--output', default='/root/pup-poc/evidence')
a = p.parse_args()
if not a.phase.replace('-', '').isalnum():
    p.error('phase must be alphanumeric with optional hyphens')
out = Path(a.output)
out.mkdir(parents=True, exist_ok=True)
k = ['kubectl', '--request-timeout=20s', '-n', 'storedog']
targets = ['postgres-0', 'deployment/backend', 'pup-traffic', 'node/worker', 'node/kubernetes']
read = 'cat /sys/fs/cgroup/cpu.stat; echo memory_current $(cat /sys/fs/cgroup/memory.current); cat /sys/fs/cgroup/memory.events; cat /sys/fs/cgroup/memory.stat'

def sample(target):
    try:
        if target.startswith('node/'):
            node = target.split('/')[1]
            raw = subprocess.check_output(k+['get', '--raw', '/api/v1/nodes/'+node+'/proxy/stats/summary'], timeout=25, text=True)
            data = json.loads(raw)['node']
            return {'target': target, 'at': data['cpu']['time'],
                    'stats': {'usage_usec': data['cpu']['usageCoreNanoSeconds']//1000,
                              'memory_current': data['memory']['workingSetBytes']}}
        data = subprocess.check_output(k+['exec', target, '--', 'sh', '-c', read], timeout=25, text=True)
        return {'target': target, 'at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'stats': {line.split()[0]: int(line.split()[1]) for line in data.splitlines()}}
    except Exception as exc:
        return {'target': target, 'error': type(exc).__name__}

with open(out / (a.phase+'.traffic.jsonl'), 'w') as traffic, open(out / (a.phase+'.resources.jsonl'), 'w') as resources:
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for row in pool.map(sample, targets):
            resources.write(json.dumps(row)+'\n')
        process = subprocess.Popen(k+['exec', 'pup-traffic', '--', 'python3', '/probe/fixed-traffic.py',
                                    '--rate', str(a.rate), '--duration', str(a.duration)] +
                                   (['--workload', a.workload] if a.workload else []), stdout=traffic)
        while process.poll() is None:
            time.sleep(10)
            for row in pool.map(sample, targets):
                resources.write(json.dumps(row)+'\n')
            resources.flush()
        if process.returncode:
            raise SystemExit(process.returncode)
summary = json.loads((out / (a.phase+'.traffic.jsonl')).read_text().splitlines()[-1])
print(json.dumps({'phase': a.phase, **summary}))
