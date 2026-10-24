#!/usr/bin/env python3
"""Restart healthy PostgreSQL under uninterrupted traffic, then requalify health."""
import argparse
import datetime
import importlib.util
import json
from pathlib import Path
import subprocess
import time

spec=importlib.util.spec_from_file_location('gates',Path(__file__).with_name('window-gates.py'))
gates=importlib.util.module_from_spec(spec);spec.loader.exec_module(gates)
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--rate',type=float,required=True)
p.add_argument('--output',default='/root/pup-poc/evidence')
a=p.parse_args();out=Path(a.output)
k=['kubectl','--request-timeout=20s','-n','storedog']
def read(*args):return json.loads(subprocess.check_output(k+list(args),text=True,timeout=25))
def identities():
    pods=read('get','pods','-l','app=store-backend','-o','json')['items']
    return {'pvcs':{x['metadata']['name']:x['metadata']['uid'] for x in read('get','pvc','-o','json')['items']},
            'backend':{x['metadata']['uid']:sum(c['restartCount'] for c in x['status']['containerStatuses']) for x in pods}}
postgres=read('get','statefulset','postgres','-o','json')
container=next(c for c in postgres['spec']['template']['spec']['containers'] if c['name']=='postgres')
assert container['resources']['limits']=={'cpu':'1','memory':'2Gi'}, 'Restart test requires healthy database limits'
before=identities()
pod_before=read('get','pod','postgres-0','-o','json')['metadata']['uid']
events=[]
def event(kind):
    events.append({'kind':kind,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
    (out/'healthy-restart.events.json').write_text(json.dumps(events,indent=2)+'\n')
with open(out/'healthy-restart.traffic.jsonl','w') as stream:
    process=subprocess.Popen(k+['exec','pup-traffic','--','python3','/probe/fixed-traffic.py',
        '--workload','/tmp/workload.json','--rate',str(a.rate),'--duration','300','--stream'],stdout=stream)
    try:
        event('traffic-start')
        time.sleep(30)
        assert process.poll() is None, 'Traffic stopped before restart'
        event('restart-start')
        subprocess.run(k+['rollout','restart','statefulset/postgres'],check=True,timeout=25)
        subprocess.run(k+['rollout','status','statefulset/postgres','--timeout=150s'],check=True,timeout=160)
        event('restart-ready')
        process.wait(timeout=330)
        assert process.returncode==0, 'Traffic process failed'
    finally:
        if process.poll() is None:process.terminate();process.wait(timeout=25)
rows=[json.loads(line) for line in (out/'healthy-restart.traffic.jsonl').read_text().splitlines()]
summary=next(r for r in rows if r['type']=='summary')
requests=[r for r in rows if r.get('type')=='request']
health=gates.assess(rows,a.rate,'healthy',skip=2)
after=identities()
pod_after=read('get','pod','postgres-0','-o','json')['metadata']['uid']
base=datetime.datetime.fromisoformat(summary['started_at']).timestamp()
ready=datetime.datetime.fromisoformat(next(e['at'] for e in events if e['kind']=='restart-ready')).timestamp()
checks={'continuous_complete_traffic':sorted(r['index'] for r in requests)==list(range(int(300*a.rate))),
        'no_dropped_arrivals':summary['dropped']==0,
        'database_restarted':pod_before!=pod_after,
        'restarted_before_healthy_windows':ready<=base+120,
        'pvcs_and_backend_preserved':before==after,
        'three_healthy_minutes':health['pass']}
result={'checks':checks,'health':health,'pass':all(checks.values()),'before':before,'after':after,
        'postgres_pod_before':pod_before,'postgres_pod_after':pod_after,
        'scope':'Continuous healthy restart; application/pool errors assessed across the complete run.'}
(out/'healthy-restart.assessment.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result),flush=True)
raise SystemExit(0 if result['pass'] else 1)
