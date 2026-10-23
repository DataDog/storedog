#!/usr/bin/env python3
"""Open learner mode only after frozen CPU symptoms and latency Alert are verified."""
import argparse
import json
from pathlib import Path
import subprocess
import time
p=argparse.ArgumentParser(description=__doc__);p.add_argument('frozen_profile');a=p.parse_args()
frozen=json.loads(Path(a.frozen_profile).read_text())
if frozen.get('status')!='accepted':raise SystemExit('Learner mode requires accepted scenario evidence')
cpu=frozen['fault_cpu'];rate=frozen['rate']
k=['kubectl','--request-timeout=20s','-n','storedog']
patch={'spec':{'template':{'spec':{'containers':[{'name':'postgres','resources':{'requests':{'cpu':cpu},'limits':{'cpu':cpu}}}]}}}}
subprocess.run(k+['patch','statefulset','postgres','--type=strategic','-p',json.dumps(patch)],check=True)
subprocess.run(k+['rollout','status','statefulset/postgres','--timeout=180s'],check=True)
subprocess.run(['python3','run-phase.py','learner-gate','--rate',str(rate),'--duration','240','--workload','/tmp/workload.json'],check=True)
subprocess.run(['python3','window-gates.py','/root/pup-poc/evidence/learner-gate.traffic.jsonl','--rate',str(rate),'--mode','fault','--skip','1'],check=True)
monitor=json.loads(Path('/root/pup-poc/evidence/monitors/latency-created.json').read_text())['id']
# Continue offered traffic for the entire learner hour, independently of setup.
subprocess.run(['systemd-run','--unit=pup-course-traffic','--property=RuntimeMaxSec=3660',
                '--setenv=KUBECONFIG=/root/.kube/config',
                '--property=StandardOutput=append:/root/pup-poc/evidence/learner-traffic.jsonl',
                *k,'exec','pup-traffic','--','python3','/probe/fixed-traffic.py',
                '--workload','/tmp/workload.json','--rate',str(rate),'--duration','3600','--stream'],check=True)
for _ in range(6):
    subprocess.run(['systemctl','is-active','--quiet','pup-course-traffic'],check=True)
    state=json.loads(subprocess.check_output(['pup','--no-agent','api','v1/monitor/'+str(monitor)],text=True))
    if state.get('overall_state')=='Alert':
        Path('/root/pup-poc/learner-ready').touch();break
    time.sleep(30)
else:raise SystemExit('Latency monitor did not reach Alert')
