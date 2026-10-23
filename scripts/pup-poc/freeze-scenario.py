#!/usr/bin/env python3
"""Freeze measured inputs before repeats; promote only after complete acceptance."""
import argparse
import hashlib
import json
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('calibration');p.add_argument('catalog');p.add_argument('output')
p.add_argument('--acceptance');a=p.parse_args()
cal=json.loads(Path(a.calibration).read_text());catalog=json.loads(Path(a.catalog).read_text())
if not cal.get('http_candidate') or not isinstance(cal.get('cpu_m'),int):p.error('No qualifying calibration candidate')
root=Path(__file__).resolve().parent
profile=json.loads((root/'course-profile.json').read_text())
candidate=json.loads((root/'candidate.json').read_text())
measured=cal.get('profile',{})
if (measured.get('candidate')!=candidate['digest'] or
    measured.get('catalog_checksum')!=catalog['content_sha256'] or
    measured.get('rate')!=cal['rate']):p.error('Calibration provenance does not match current candidate/catalog/rate')
for name,digest in measured.get('inputs',{}).items():
    if hashlib.sha256((root/name).read_bytes()).hexdigest()!=digest:p.error('Calibration input changed: '+name)
if set(measured.get('inputs',{})) != {'fixed-traffic.py','workload.py','warm-workload.py','course-profile.json','window-gates.py','calibrate.py'}:p.error('Complete calibration input hashes are required')
result={'version':1,'status':'frozen','catalog_products':catalog['counts']['products'],
        'catalog_checksum':catalog['content_sha256'],'rate':cal['rate'],'fault_cpu':str(cal['cpu_m'])+'m',
        'healthy_cpu':'1','memory':'2Gi','timeouts':profile['timeouts'],
        'candidate':candidate,
        'inputs':{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in
                  ('fixed-traffic.py','workload.py','warm-workload.py','repeat-cycles.py','run-live.sh','backend-healthy-patch.json','postgres-healthy-patch.json','monitors/latency.json','monitors/errors.json','course-profile.json')}}
if a.acceptance:
    accepted=json.loads(Path(a.acceptance).read_text())
    if accepted.get('accepted') is not True or len(accepted.get('runs',[]))!=4:p.error('Complete acceptance is required')
    if not all(r.get('pass') and r.get('catalog_checksum')==result['catalog_checksum'] and
               r.get('rate')==result['rate'] and r.get('cpu')==result['fault_cpu'] and
               r.get('candidate')==candidate['digest'] and
               all(r.get('inputs',{}).get(name)==digest for name,digest in result['inputs'].items())
               for r in accepted['runs']):p.error('Acceptance does not match these frozen inputs')
    result['status']='accepted'
    result['acceptance_sha256']=hashlib.sha256(Path(a.acceptance).read_bytes()).hexdigest()
Path(a.output).write_text(json.dumps(result,indent=2)+'\n')
