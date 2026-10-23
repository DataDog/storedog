#!/usr/bin/env python3
"""Repeat CPU-only fault/reset cycles without pausing offered traffic.

Run on lab-host after establishing API health. Monitor polling and resource
sampling must run alongside this script; its HTTP result is not full acceptance.
"""
import argparse
import datetime
import json
import math
from pathlib import Path
import subprocess
import time

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--name', required=True)
p.add_argument('--cpu', required=True)
p.add_argument('--rate', type=float, default=5)
p.add_argument('--workload', required=True)
p.add_argument('--cycles', type=int, default=3)
p.add_argument('--fault-seconds', type=int, default=180)
p.add_argument('--recovery-seconds', type=int, default=360)
p.add_argument('--output', default='/root/pup-poc/evidence')
a = p.parse_args()
if not a.name.replace('-', '').isalnum() or min(a.cycles,a.fault_seconds,a.recovery_seconds)<=0:
    p.error('use an alphanumeric/hyphen name and positive durations/cycle count')
out = Path(a.output)
out.mkdir(parents=True,exist_ok=True)
k = ['kubectl','--request-timeout=15s','-n','storedog']

def run(args):
    return subprocess.check_output(k+args,text=True,stderr=subprocess.PIPE,timeout=20)

def resize(cpu):
    patch = {'spec':{'template':{'spec':{'containers':[{'name':'postgres','resources':{
        'requests':{'cpu':'500m' if cpu=='1' else cpu},'limits':{'cpu':cpu}}}]}}}}
    run(['patch','statefulset','postgres','--type=strategic','-p',json.dumps(patch)])

def pvcs():
    return {x['metadata']['name']:x['metadata']['uid'] for x in json.loads(run(['get','pvc','-o','json']))['items']}

def backend():
    pods=json.loads(run(['get','pods','-l','app=store-backend','-o','json']))['items']
    return [{'uid':x['metadata']['uid'], 'name':x['metadata']['name'],
             'restarts':sum(c['restartCount'] for c in x['status'].get('containerStatuses',[]))}
            for x in pods]

before = pvcs()
backend_before = backend()
duration = 60+a.cycles*(a.fault_seconds+a.recovery_seconds)
events = open(out/(a.name+'.events.jsonl'),'w')
started = time.monotonic()

def event(kind,**values):
    row = {'kind':kind,'offset_s':time.monotonic()-started,
           'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),**values}
    events.write(json.dumps(row)+'\n');events.flush()
    print(json.dumps(row),flush=True)

actions=[]
for cycle in range(a.cycles):
    fault=60+cycle*(a.fault_seconds+a.recovery_seconds)
    actions.extend([(fault,'fault',cycle+1,a.cpu),(fault+a.fault_seconds,'restore',cycle+1,'1')])
with open(out/(a.name+'.traffic.jsonl'),'w') as f:
    process=subprocess.Popen(k+['exec','pup-traffic','--','python3','/probe/fixed-traffic.py',
        '--rate',str(a.rate),'--workload',a.workload,'--duration',str(duration),'--stream'],stdout=f)
    event('start',rate=a.rate,cpu=a.cpu,cycles=a.cycles,fault_seconds=a.fault_seconds,
          recovery_seconds=a.recovery_seconds,pvcs=before,backend=backend_before)
    try:
        while process.poll() is None:
            if actions and time.monotonic()-started>=actions[0][0]:
                _,kind,cycle,cpu=actions.pop(0)
                event(kind+'-start',cycle=cycle,cpu=cpu)
                resize(cpu)
                event(kind+'-submitted',cycle=cycle,cpu=cpu)
                subprocess.run(k+['rollout','status','statefulset/postgres','--timeout=150s'],check=True,timeout=160)
                event(kind+'-ready',cycle=cycle,cpu=cpu)
            time.sleep(.5)
        if process.returncode:
            raise RuntimeError('traffic command failed')
    finally:
        resize('1')
        event('restored',pvcs=pvcs(),backend=backend())
        events.close()
        if process.poll() is None: process.terminate()

rows=[json.loads(x) for x in (out/(a.name+'.traffic.jsonl')).read_text().splitlines()]
windows=[]
for lo in range(0,duration,30):
    selected=[x for x in rows if x.get('type')=='request' and lo*a.rate<=x['index']<min(lo+30,duration)*a.rate]
    lat=sorted(x['latency_s'] for x in selected if 'latency_s' in x)
    windows.append({'start_s':lo,'offered':len(selected),
        'ok':sum(x.get('status')==200 and x.get('valid') is True for x in selected),
        'dropped':sum(bool(x.get('dropped')) for x in selected),
        'p95_s':lat[math.ceil(len(lat)*.95)-1] if lat else None})
result={'traffic':next(x for x in rows if x['type']=='summary'),
        'pvcs_unchanged':before==pvcs(),'backend_unchanged':backend_before==backend(),'windows':windows}
(out/(a.name+'.summary.json')).write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result),flush=True)
