#!/usr/bin/env python3
"""Open learner mode after fault readiness; fresh monitor telemetry may follow."""
import argparse
import importlib.util
import json
from pathlib import Path
import subprocess
import time
p=argparse.ArgumentParser(description=__doc__);p.add_argument('frozen_profile');a=p.parse_args()
frozen=json.loads(Path(a.frozen_profile).read_text())
if frozen.get('status')!='accepted':raise SystemExit('Learner mode requires accepted scenario evidence')
cpu=frozen['fault_cpu'];rate=frozen['rate']
for command in (['pup','version'], ['opencode','--version']):
    subprocess.run(command,check=True,timeout=10)
k=['kubectl','--request-timeout=20s','-n','storedog']
deployment=json.loads(subprocess.check_output(k+['get','deployment','backend','-o','json'],text=True))
backend=next(c for c in deployment['spec']['template']['spec']['containers'] if c['name']=='backend')
if backend['image']!='ghcr.io/datadog/storedog/backend@'+frozen['candidate']['digest']:raise SystemExit('Deployed backend differs from accepted image')
environment={e['name']:e.get('value') for e in backend['env']}
if any(environment.get(name)!=value for name,value in frozen['timeouts'].items()):raise SystemExit('Deployed database safeguards differ from accepted profile')
patch={'spec':{'template':{'spec':{'containers':[{'name':'postgres','resources':{'requests':{'cpu':cpu},'limits':{'cpu':cpu}}}]}}}}
subprocess.run(k+['patch','statefulset','postgres','--type=strategic','-p',json.dumps(patch)],check=True)
subprocess.run(k+['rollout','status','statefulset/postgres','--timeout=180s'],check=True)
subprocess.run(['python3','startup-event.py','fault-ready'],check=True)
Path('/root/pup-poc/evidence/learner-traffic.jsonl').write_text('')
# Continue offered traffic for the entire learner hour, independently of setup.
subprocess.run(['systemd-run','--unit=pup-course-traffic','--property=RuntimeMaxSec=3660',
                '--setenv=KUBECONFIG=/root/.kube/config',
                '--property=StandardOutput=append:/root/pup-poc/evidence/learner-traffic.jsonl',
                *k,'exec','pup-traffic','--','python3','/probe/fixed-traffic.py',
                '--workload','/tmp/workload.json','--rate',str(rate),'--duration','3600','--stream'],check=True)
# Observe the real offered traffic rather than adding a second readiness load.
from readiness import consecutive_valid
traffic = Path('/root/pup-poc/evidence/learner-traffic.jsonl')
deadline = time.monotonic() + 45
while time.monotonic() < deadline:
    subprocess.run(['systemctl','is-active','--quiet','pup-course-traffic'],check=True)
    if traffic.exists() and consecutive_valid(traffic.read_text()):
        import datetime
        ready = {'requests_ready_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                 'fault_cpu': cpu, 'monitor_alert_required': False}
        Path('/root/pup-poc/evidence/learner-ready.json').write_text(json.dumps(ready)+'\n')
        subprocess.run(['python3','startup-event.py','requests-ready'],check=True)
        Path('/root/pup-poc/requests-ready').touch()
        break
    time.sleep(1)
else:
    raise SystemExit('No ten consecutive valid product responses within 45 seconds')
