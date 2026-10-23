#!/usr/bin/env python3
"""Assess three fresh cycle sandboxes plus a soak. Missing evidence is failure."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

HERE=Path(__file__).resolve().parent

def assess(root, soak=False):
    def read(name):return json.loads((root/name).read_text())
    subprocess.run(['python3',str(HERE/'assess-run.py'),str(root)],check=True,stdout=subprocess.DEVNULL)
    subprocess.run(['python3',str(HERE/'assess-resources.py'),str(root)],check=True,stdout=subprocess.DEVNULL)
    http=read('assessment.json');resources=read('resource-assessment.json')
    events=[json.loads(x) for x in (root/'frozen-repeat.events.jsonl').read_text().splitlines()]
    start=events[0]
    checks={'http_monitors_traces':http['http_monitor_trace_pass'],
            'export_complete':read('export-status.json')['complete'],
            'duration':start['fault_seconds']==(2400 if soak else 180) and start['recovery_seconds']==360,
            'cycles':start['cycles']==(1 if soak else 3)}
    nodes=read('node-capacity.json')['items']
    def cpu(v):return float(v[:-1])/1000 if v.endswith('m') else float(v)
    def memory(v):
        for suffix,multiplier in [('Ki',1024),('Mi',1024**2),('Gi',1024**3)]:
            if v.endswith(suffix):return float(v[:-len(suffix)])*multiplier
        return float(v)
    capacity={n['metadata']['name']:(cpu(n['status']['allocatable']['cpu']),memory(n['status']['allocatable']['memory'])) for n in nodes}
    checks['resources_present']=len(resources)==2*start['cycles']
    for row in resources:
        label=str(row['cycle'])+'-'+row['phase']
        for target in ('postgres-0','deployment/backend','pup-traffic'):
            stats=row['containers'][target]
            passed=not stats.get('incomplete',False) and not stats.get('counter_reset',True) and stats.get('oom_kill_counter_max',1)==0
            if passed:
                passed=stats['max_memory_bytes'] < (.8*512*1024**2 if target=='pup-traffic' else .8*2*1024**3)
                if target=='postgres-0' and row['phase']=='fault-steady':
                    passed=passed and stats['throttled_period_fraction'] is not None and stats['throttled_period_fraction']>0
                else:
                    passed=passed and stats['average_cpu']<.8 and (stats['throttled_period_fraction'] or 0)<.1
            checks[label+'-'+target]=passed
        checks[label+'-nodes']=set(row['nodes'])=={'worker','kubernetes'} and all(
            n['average_cpu']<.8*capacity[name][0] and n['max_memory_bytes']<.8*capacity[name][1]
            for name,n in row['nodes'].items())
    hashes=(root/'frozen-inputs.sha256').read_text().splitlines()
    checks['frozen_files']=bool(hashes)
    for line in hashes:
        digest,name=line.split(maxsplit=1)
        path=root/name
        checks['frozen_files']=checks['frozen_files'] and path.exists() and hashlib.sha256(path.read_bytes()).hexdigest()==digest
    definition=read('monitors/latency-created.json')
    env=next(t[4:] for t in definition['tags'] if t.startswith('env:'))
    return {'directory':str(root),'environment':env,'checks':checks,'pass':all(checks.values()),
            'catalog_checksum':read('catalog-v1.json')['content_sha256'],
            'rate':start['rate'],'cpu':start['cpu']}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('cycles',nargs=3);p.add_argument('--soak',required=True);p.add_argument('--output',required=True)
    a=p.parse_args();results=[]
    for path,soak in [(x,False) for x in a.cycles]+[(a.soak,True)]:
        try:results.append(assess(Path(path),soak))
        except (OSError,ValueError,KeyError,StopIteration,subprocess.CalledProcessError) as exc:
            results.append({'directory':path,'pass':False,'error':str(exc)})
    passed=all(r['pass'] for r in results)
    if passed:
        passed=(len({r['environment'] for r in results[:3]})==3 and
                len({(r['catalog_checksum'],r['rate'],r['cpu']) for r in results})==1)
    result={'accepted':passed,'runs':results}
    Path(a.output).write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2));return 0 if passed else 1
if __name__=='__main__':raise SystemExit(main())
