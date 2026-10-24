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
# Audited prior controllers used the same traffic, durations and safeguards,
# but lacked the explicit expiry-error gate. Never reuse a positive candidate.
LEGACY_SEARCH_SHA256='a3a741c337d7979aad3b842e674ed2f2435e57be41c140347a3c70296f72ca3f'
LEGACY_ERROR_GATE_SHA256='ac8bf966fd092b2a3202b408bfe9efeaf16b49325b6f547fe1af38872efbd68a'
spec=importlib.util.spec_from_file_location('gates',Path(__file__).with_name('window-gates.py'))
gates=importlib.util.module_from_spec(spec);spec.loader.exec_module(gates)

def search(test):
    """Refine the fast/slow boundary, including when coarse steps skip the band.

    CPU-vs-latency monotonicity is only a calibration search heuristic; acceptance
    and the soak must independently validate the chosen integer limit.
    """
    upper = 1000  # Proven healthy by the initial warmup.
    resolved_failed_boundary = False
    for cpu in (250, 125, 60, 30, 20, 10):
        result = test(cpu)
        if resolved_failed_boundary:
            if result['fast'] or result['pass']:
                raise RuntimeError('Non-monotonic coarse result after a failed boundary; repeat calibration before selecting a CPU')
            continue
        if result['fast']:
            upper = cpu
            continue
        low, high = cpu, upper
        while high - low > 1:
            middle = (high + low) // 2
            if test(middle)['fast']:
                high = middle
            else:
                low = middle
        if test(low)['pass']:
            return low
        resolved_failed_boundary = True
    return None

def resume(saved, profile):
    """Retain exact measurement provenance for narrowly audited controller updates."""
    previous=saved['profile']
    provenance=list(saved.get('resume_provenance',[]))
    if previous!=profile:
        comparable=json.loads(json.dumps(previous))
        old=comparable.get('inputs',{}).get('calibrate.py')
        comparable.setdefault('inputs',{})['calibrate.py']=profile['inputs']['calibrate.py']
        if old not in (LEGACY_SEARCH_SHA256,LEGACY_ERROR_GATE_SHA256) or comparable!=profile:
            raise RuntimeError('Resume profile mismatch')
        if any(r['name'].startswith('candidate-') and r.get('pass') for r in saved['results']):
            raise RuntimeError('Older error gate cannot supply a qualifying candidate')
        provenance.append({'reason':'Audited search/error-gate update; only nonqualifying candidates reused, request workload unchanged',
                           'previous_profile':previous,'current_profile':profile})
    results=[dict(row,source_profile=row.get('source_profile',previous)) for row in saved['results']]
    return results,provenance

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rate',type=float,default=5)
    p.add_argument('--resume', help='Exported calibration-state.json from a matching prior sandbox')
    p.add_argument('--output',default='/root/pup-poc/evidence')
    a=p.parse_args();out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
    k=['kubectl','--request-timeout=20s','-n','storedog']
    profile={'rate':a.rate,'catalog_checksum':json.loads(Path('catalog-v1.json').read_text())['content_sha256'],
             'candidate':json.loads(Path('candidate.json').read_text())['digest'],
             'inputs':{name:hashlib.sha256(Path(name).read_bytes()).hexdigest() for name in ('fixed-traffic.py','workload.py','warm-workload.py','course-profile.json','window-gates.py','calibrate.py')}}
    results=[];provenance=[]
    if a.resume:
        saved=json.loads(Path(a.resume).read_text())
        results,provenance=resume(saved,profile)
    cached={int(r['name'].split('-')[-1]):r for r in results if r['name'].startswith('candidate-')}
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
        errors=[term for term in ('ConnectionTimeoutError','RequestTimeoutException','RequestTimeoutError','RequestExpiryError') if term in logs]
        result.update(name=name,errors=errors,source_profile=profile)
        result['fast']=not errors and all(w['complete'] and w['dropped']==0 and
            w['valid']==w['expected'] and w['p95_s'] is not None and w['p95_s']<1 and
            w['max_dispatch_lag_s']<1/a.rate for w in result['windows'])
        result['pass']=result['pass'] and not errors
        results.append(result)
        (out/'calibration.json').write_text(json.dumps(results,indent=2)+'\n')
        (out/'calibration-state.json').write_text(json.dumps({'profile':profile,'results':results,'resume_provenance':provenance},indent=2)+'\n')
        return result
    def healthy(name):
        resize('1')
        for attempt in range(5):
            if phase(name+'-'+str(attempt),180,'healthy')['pass']:return
        raise RuntimeError('healthy warmup did not qualify within 15 minutes')
    selected=None
    try:
        healthy('initial-warmup')
        dirty=False
        def test(cpu):
            nonlocal dirty
            if cpu in cached:return cached[cpu]
            if dirty:healthy('warmup-'+str(cpu))
            resize(str(cpu)+'m')
            dirty=True
            result=phase('candidate-'+str(cpu),240,'fault',skip=1)
            cached[cpu]=result
            return result
        selected=search(test)
        (out/'calibration-result.json').write_text(json.dumps({'cpu_m':selected,'rate':a.rate,
            'profile':profile,
            'resume_provenance':provenance,
            'selected_source_profile':cached[selected]['source_profile'] if selected is not None else None,
            'http_candidate':selected is not None,'scenario_accepted':False,
            'requires':'resource, monitor, span evidence; three fresh sandboxes and 40-minute soak'},indent=2)+'\n')
        if selected is None:raise RuntimeError('No qualifying CPU; try next ordered catalog/rate combination in a fresh sandbox')
    finally:
        resize('1')
if __name__=='__main__':main()
