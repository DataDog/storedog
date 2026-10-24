#!/usr/bin/env python3
"""Bound a development-only hold across two short Instruqt lifecycle stages."""
import argparse
import json
import os
from pathlib import Path
import time


def initialize(root, seconds, now=time.time):
    if not 60 <= seconds <= 3600:
        raise ValueError('Integration hold must be 60..3600 seconds')
    path=root/'integration-hold.json'
    if not path.exists():
        root.mkdir(parents=True,exist_ok=True)
        path.write_text(json.dumps({'seconds':seconds,'deadline':now()+seconds})+'\n')
    return json.loads(path.read_text())


def wait_segment(root, final=False, now=time.time, sleep=time.sleep):
    hold=json.loads((root/'integration-hold.json').read_text())
    deadline=hold['deadline']
    until=min(deadline,now()+1800)
    while True:
        if (root/'integration-complete').exists():return 0
        remaining=until-now()
        if remaining<=0:
            return 1 if final or now()>=deadline else 0
        sleep(min(5,remaining))


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--initialize',action='store_true')
    p.add_argument('--final',action='store_true')
    p.add_argument('--root',type=Path,default=Path('/root/pup-poc'))
    a=p.parse_args()
    if a.initialize:
        if os.environ.get('PUP_DEV_INTEGRATION')!='1':return 0
        print(json.dumps(initialize(a.root,int(os.environ.get('PUP_DEV_HOLD_SECONDS','3600')))),flush=True)
        return 0
    # Only explicit development setup creates this marker; do not depend on
    # runtime parameters being reinjected into later lifecycle scripts.
    if not (a.root/'integration-hold.json').exists():return 0
    return wait_segment(a.root,a.final)


if __name__=='__main__':raise SystemExit(main())
