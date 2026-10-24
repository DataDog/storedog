#!/usr/bin/env python3
"""Atomic learner-facing preparation status; no credentials or raw error output."""
import argparse
import datetime
import json
import os
from pathlib import Path
import tempfile

ROOT=Path('/root/pup-poc/evidence')

def write(root, stage, state='preparing', reason=None):
    root.mkdir(parents=True,exist_ok=True)
    value={'stage':stage,'state':state,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'environment':os.environ.get('DD_ENV'),'reason':reason}
    fd,name=tempfile.mkstemp(dir=root,prefix='.preparation-')
    with os.fdopen(fd,'w') as stream:json.dump(value,stream);stream.write('\n')
    os.replace(name,root/'preparation.json')
    return value

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--root',type=Path,default=ROOT)
    p.add_argument('--stage');p.add_argument('--state',choices=['preparing','ready','failed'],default='preparing')
    p.add_argument('--reason');a=p.parse_args()
    if a.stage:write(a.root,a.stage,a.state,a.reason);return 0
    try:value=json.loads((a.root/'preparation.json').read_text())
    except (OSError,ValueError):
        print('Preparation status is unavailable. Use the Help tab if this persists.');return 1
    state=value.get('state')
    if state=='ready':print('The incident is ready. Continue with the investigation.');return 0
    if state=='failed':
        print('Lab preparation failed: '+str(value.get('reason') or value.get('stage'))+'. Use the Help tab.');return 1
    print('Preparing the lab: '+str(value.get('stage'))+'. You can continue reading and check again.');return 2

if __name__=='__main__':raise SystemExit(main())
