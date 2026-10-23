#!/usr/bin/env python3
"""Create a course-only image lock from the workflow provenance artifact."""
import argparse
import json
from pathlib import Path
import re
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('candidate');p.add_argument('output');p.add_argument('--locks',default=str(Path(__file__).with_name('images.lock.json')))
a=p.parse_args()
candidate=json.loads(Path(a.candidate).read_text());locks=json.loads(Path(a.locks).read_text())
if not re.fullmatch(r'[0-9a-f]{40}',candidate['revision']):p.error('expected full revision')
if not re.fullmatch(r'sha256:[0-9a-f]{64}',candidate['digest']):p.error('expected immutable digest')
if candidate['image']!='ghcr.io/datadog/storedog/backend:pup-course-'+candidate['revision']:p.error('unexpected candidate image')
backend=[x for x in locks['images'] if x['reference']=='ghcr.io/datadog/storedog/backend:1.5.0']
if len(backend)!=1:p.error('expected exactly one backend')
backend[0]['digest']=candidate['digest']
locks['candidate']=candidate
locks['status']='Candidate only; scenario acceptance pending'
Path(a.output).write_text(json.dumps(locks,indent=2)+'\n')
