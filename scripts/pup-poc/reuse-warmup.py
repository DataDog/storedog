#!/usr/bin/env python3
"""Reuse a recent complete setup gate only with identical workload inputs.

The caller must additionally verify that its healthy resource patches changed
neither deployment. Otherwise run a new three-minute healthy gate.
"""
import argparse
import datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import time

spec=importlib.util.spec_from_file_location('gates',Path(__file__).with_name('window-gates.py'))
gates=importlib.util.module_from_spec(spec);spec.loader.exec_module(gates)
NAMES={'fixed-traffic.py','workload.py','warm-workload.py','workload.json','catalog-v1.json','candidate.json'}

def assess(root,evidence,rate,now):
    completed=json.loads((evidence/'setup-completed.json').read_text())
    assert completed['process_exit']==0, 'Setup did not pass'
    stamp=datetime.datetime.fromisoformat(completed['completed_at'].replace('Z','+00:00')).timestamp()
    age=now-stamp
    assert 0<=age<=120, 'Setup gate is stale'
    hashes={name:digest for digest,name in (line.split(maxsplit=1) for line in (evidence/'setup-inputs.sha256').read_text().splitlines())}
    assert set(hashes)==NAMES, 'Setup input hashes are incomplete'
    assert all(hashlib.sha256((root/name).read_bytes()).hexdigest()==digest for name,digest in hashes.items()), 'Workload inputs changed'
    files=list(evidence.glob('setup-warmup-*.jsonl'))
    assert files, 'No measured setup traffic'
    latest=max(files,key=lambda p:int(p.stem.split('-')[-1]))
    rows=[json.loads(line) for line in latest.read_text().splitlines()]
    gate=gates.assess(rows,rate,'healthy')
    assert gate['pass'], 'Setup traffic did not qualify'
    return {'pass':True,'source':latest.name,'traffic_sha256':hashlib.sha256(latest.read_bytes()).hexdigest(),'age_s':age,'gate':gate}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rate',type=float,required=True)
    parser.add_argument('--output',default='/root/pup-poc/evidence')
    args=parser.parse_args();out=Path(args.output)
    try:result=assess(Path.cwd(),out,args.rate,time.time())
    except (OSError,ValueError,KeyError,AssertionError) as exc:result={'pass':False,'reason':str(exc)}
    (out/'warmup-reused.json').write_text(json.dumps(result,indent=2)+'\n')
    return 0 if result['pass'] else 1
if __name__=='__main__':raise SystemExit(main())
