#!/usr/bin/env python3
"""Calibrate one catalog/rate combination in a fresh sandbox; never promote it automatically."""
import argparse
import importlib.util
import json
from pathlib import Path
import subprocess
import time
import signal
import hashlib
spec=importlib.util.spec_from_file_location('gates',Path(__file__).with_name('window-gates.py'))
gates=importlib.util.module_from_spec(spec);spec.loader.exec_module(gates)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rate',type=float,default=5)
    p.add_argument('--resume', help='Exported calibration-state.json from a matching prior sandbox')
    p.add_argument('--output',default='/root/pup-poc/evidence')
    a=p.parse_args();out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
    k=['kubectl','--request-timeout=20s','-n','storedog']
    profile={'rate':a.rate,'catalog_checksum':json.loads(Path('catalog-v1.json').read_text())['content_sha256'],
             'candidate':json.loads(Path('candidate.json').read_text())['digest'],
             'inputs':{name:hashlib.sha256(Path(name).read_bytes()).hexdigest() for name in ('fixed-traffic.py','workload.py','course-profile.json','window-gates.py','calibrate.py')}}
    results=[]
    if a.resume:
        saved=json.loads(Path(a.resume).read_text())
        if saved['profile']!=profile:raise RuntimeError('Resume profile mismatch')
        results=saved['results']
    cached={r['name']:r['pass'] for r in results if r['name'].startswith(('candidate-','refined-'))}
    signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(SystemExit(124)))
    def resize(cpu):
        patch={'spec':{'template':{'spec':{'containers':[{'name':'postgres','resources':{'requests':{'cpu':cpu},'limits':{'cpu':cpu}}}]}}}}
        subprocess.run(k+['patch','statefulset','postgres','--type=strategic','-p',json.dumps(patch)],check=True)
        subprocess.run(k+['rollout','status','statefulset/postgres','--timeout=180s'],check=True)
    def phase(name,seconds,mode,skip=0):
        started=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
        subprocess.run(['python3','run-phase.py',name,'--rate',str(a.rate),'--duration',str(seconds),
                        '--workload','/tmp/workload.json','--output',str(out)],check=True)
        rows=[json.loads(x) for x in (out/(name+'.traffic.jsonl')).read_text().splitlines()]
        result=gates.assess(rows,a.rate,mode,skip=skip)
        logs=subprocess.check_output(k+['logs','deployment/backend','--since-time='+started],text=True)
        errors=[term for term in ('ConnectionTimeoutError','RequestTimeoutException','RequestTimeoutError') if term in logs]
        result.update(name=name,errors=errors)
        result['pass']=result['pass'] and not errors
        results.append(result)
        (out/'calibration.json').write_text(json.dumps(results,indent=2)+'\n')
        (out/'calibration-state.json').write_text(json.dumps({'profile':profile,'results':results},indent=2)+'\n')
        return result['pass']
    def healthy(name):
        resize('1')
        for attempt in range(5):
            if phase(name+'-'+str(attempt),180,'healthy'):return
        raise RuntimeError('healthy warmup did not qualify within 15 minutes')
    selected=None
    try:
        healthy('initial-warmup')
        previous=250
        for cpu in (250,125,60,30,20,10):
            name='candidate-'+str(cpu)
            if name in cached:
                qualifies=cached[name]
            else:
                resize(str(cpu)+'m')
                qualifies=phase(name,240,'fault',skip=1)
            if qualifies:
                selected=cpu
                # Check every integer above the first qualifying boundary, highest first.
                for refined in range(previous-1,cpu,-1):
                    name='refined-'+str(refined)
                    if name in cached:
                        qualifies=cached[name]
                    else:
                        healthy('refine-warmup-'+str(refined))
                        resize(str(refined)+'m')
                        qualifies=phase(name,240,'fault',skip=1)
                    if qualifies:
                        selected=refined;break
                break
            previous=cpu
            if 'candidate-'+str(cpu) not in cached:healthy('warmup-'+str(cpu))
        (out/'calibration-result.json').write_text(json.dumps({'cpu_m':selected,'rate':a.rate,
            'http_candidate':selected is not None,'scenario_accepted':False,
            'requires':'resource, monitor, span evidence; three fresh sandboxes and 40-minute soak'},indent=2)+'\n')
        if selected is None:raise RuntimeError('No qualifying CPU; try next ordered catalog/rate combination in a fresh sandbox')
    finally:
        resize('1')
if __name__=='__main__':main()
