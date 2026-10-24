#!/usr/bin/env python3
"""Run one fresh development sandbox, export setup evidence, then validate detached.

Requires Instruqt authentication and a dedicated SSH key. Never copies credentials
out of the sandbox. Serial invocations keep sandbox acceptance independent.
"""
import argparse
import datetime
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import time

HERE=Path(__file__).resolve().parent

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--key',required=True);p.add_argument('--output',required=True)
    p.add_argument('--mode',choices=['calibrate','cycles','soak','startup'],default='calibrate')
    p.add_argument('--cpu');p.add_argument('--products',type=int,default=5000);p.add_argument('--rate',type=int,default=5)
    p.add_argument('--resume');p.add_argument('--track',default='datadog/course-getting-started-pup-dev')
    a=p.parse_args()
    if a.mode in ('cycles','soak') and not a.cpu:p.error('cycles/soak require a frozen CPU')
    out=Path(a.output).resolve();out.mkdir(parents=True,exist_ok=False)
    key=Path(a.key).resolve();public=Path(str(key)+'.pub').read_text().strip()
    parameters={'PUP_DEV_INTEGRATION':'1','PUP_DEV_HOLD_SECONDS':'3600','PUP_SCENARIO_MODE':'validation',
                'PUP_CATALOG_PRODUCTS':str(a.products),'PUP_RATE':str(a.rate),'PUP_DEV_SSH_PUBLIC_KEY':public}
    if a.mode=='startup':
        parameters['PUP_SCENARIO_MODE']='learner'
        parameters['PUP_DEV_STARTUP_TEST']='1'
    started_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
    (out/'launch.json').write_text(json.dumps({'launched_at':started_at,'cold':True,'track':a.track})+'\n')
    lifecycle=subprocess.Popen(['instruqt','track','test',a.track,'--skip-fail-check',
        '--runtime-parameters='+','.join(k+'='+v for k,v in parameters.items())],
        stdout=open(out/'lifecycle.log','w'),stderr=subprocess.STDOUT)
    deadline=time.monotonic()+4500
    participant=None;log_process=None;collector=None;remote=None;started=False
    try:
        while time.monotonic()<deadline:
            if lifecycle.poll() is not None:raise RuntimeError('Lifecycle stopped during provisioning')
            match=re.search(r'Participant ID: ([a-z0-9]+)',(out/'lifecycle.log').read_text())
            if match:participant=match[1];break
            time.sleep(2)
        if not participant:raise RuntimeError('No participant ID')
        (out/'sandbox.json').write_text(json.dumps({'participant':participant,'mode':a.mode,'products':a.products,'rate':a.rate})+'\n')
        log_process=subprocess.Popen(['instruqt','track','logs','--participant-id',participant,'--since=-15m'],
            stdout=open(out/'setup.log','w'),stderr=subprocess.STDOUT)
        host='lab-host.'+participant+'.instruqt.io'
        next_history=time.monotonic()+60
        # Verify the SSH fingerprint against authenticated platform logs.
        while time.monotonic()<deadline:
            if lifecycle.poll() is not None:raise RuntimeError('Lifecycle stopped before SSH')
            history=out/'setup-history.log'
            log_text=(out/'setup.log').read_text()+(history.read_text() if history.exists() else '')
            fingerprints=re.findall(r'SHA256:[A-Za-z0-9+/]+',log_text)
            if not fingerprints and time.monotonic()>=next_history:
                # Live platform streams can omit early bootstrap records. Requery
                # authenticated history without relaxing host-key verification.
                try:
                    result=subprocess.run(['instruqt','track','logs','--participant-id',participant,
                                           '--since='+started_at],capture_output=True,timeout=10)
                    snapshot=result.stdout
                except subprocess.TimeoutExpired as exc:
                    snapshot=exc.stdout or b''
                history.write_bytes(snapshot)
                next_history=time.monotonic()+60
                fingerprints=re.findall(r'SHA256:[A-Za-z0-9+/]+',snapshot.decode(errors='replace'))
            addresses=subprocess.check_output(['dig','+short',host,'@ns-cloud-e1.googledomains.com'],text=True).splitlines()
            if fingerprints and addresses:
                address=next((s for s in addresses if re.fullmatch(r'[0-9.]+',s)),None)
                if address:
                    scan=subprocess.run(['ssh-keyscan','-T','5','-p','443',address],capture_output=True,text=True)
                    (out/'known-hosts').write_text(scan.stdout)
                    verified=subprocess.run(['ssh-keygen','-lf',str(out/'known-hosts')],capture_output=True,text=True)
                    if any(f in verified.stdout for f in fingerprints):
                        remote=['ssh','-p','443','-i',str(key),'-o','IdentitiesOnly=yes','-o','BatchMode=yes',
                            '-o','ConnectTimeout=10','-o','ServerAliveInterval=15','-o','ServerAliveCountMax=2',
                            '-o','StrictHostKeyChecking=yes','-o','UserKnownHostsFile='+str(out/'known-hosts'),'root@'+address]
                        break
            time.sleep(10)
        if not remote:raise RuntimeError('Could not verify development SSH')
        helper=out/'ssh';helper.write_text('#!/bin/bash\nexec '+shlex.join(remote)+' "$@"\n');helper.chmod(0o700)
        collector=subprocess.Popen(['python3',str(HERE/'collect-live.py'),str(helper),str(out),'--seconds','7200'],
                                   stdout=open(out/'collector.log','w'),stderr=subprocess.STDOUT)
        while time.monotonic()<deadline:
            if (out/'completed.json').exists():
                collector.wait(timeout=90)
                raise RuntimeError('Setup failed; evidence exported')
            if lifecycle.poll() is not None:raise RuntimeError('Lifecycle stopped before healthy setup')
            check=subprocess.run(remote+['test -f /root/pup-poc/'+('incident-ready' if a.mode=='startup' else 'validation-ready')],capture_output=True,timeout=20)
            if check.returncode==0:break
            time.sleep(10)
        else:raise RuntimeError('Healthy setup deadline exceeded')
        if a.mode=='startup':
            # Keep launch time on the client: it precedes VM provisioning.
            subprocess.run(remote+['systemd-run --unit=pup-startup-validation --setenv=PUP_DEV_INTEGRATION=1 --setenv=KUBECONFIG=/root/.kube/config --property=RuntimeMaxSec=360 /bin/bash /root/pup-recovery/startup-validation.sh'],check=True,timeout=25)
            started=True
            collector.wait(timeout=450)
            if collector.returncode or not (out/'completed.json').exists():
                raise RuntimeError('Incomplete startup evidence export')
            completed=json.loads((out/'completed.json').read_text())
            if completed.get('process_exit')!=0 or completed.get('restore_exit')!=0:
                raise RuntimeError('Startup validation did not restore cleanly')
            lifecycle.wait(timeout=180)
            assessment=subprocess.run(['python3',str(HERE/'assess-startup.py'),str(out)],capture_output=True,text=True)
            (out/'startup-assessment.json').write_text(assessment.stdout)
            if assessment.returncode:raise RuntimeError('Cold startup acceptance failed')
            return
        # Upload exact locally frozen helpers after setup has created the directory.
        names=[str(p.relative_to(HERE)) for p in HERE.glob('*.py')]+['run-live.sh','course-profile.json','candidate.json','backend-healthy-patch.json','postgres-healthy-patch.json']
        archive=subprocess.check_output(['tar','-C',str(HERE),'-cf','-',*names])
        subprocess.run(remote+['tar -C /root/pup-recovery -xf -'],input=archive,check=True,timeout=60)
        if a.resume:
            subprocess.run(remote+['cat > /root/pup-recovery/resume.json'],input=Path(a.resume).read_bytes(),check=True,timeout=20)
        # Keep private environment values on the VM; only configuration is sent in.
        config={'PUP_RUN_MODE':a.mode,'PUP_RATE':str(a.rate)}
        if a.cpu:config['PUP_FAULT_CPU']=a.cpu
        if a.resume:config['PUP_CALIBRATION_RESUME']='/root/pup-recovery/resume.json'
        script="""set -euo pipefail
source /root/.bashrc >/dev/null
umask 077
python3 - <<'ENVIRONMENT'
import os,json
values={k:os.environ[k] for k in ('DD_API_KEY','DD_APP_KEY','DD_APPLICATION_KEY','DD_ENV','DD_SITE') if k in os.environ}
assert values.get('DD_API_KEY') and values.get('DD_ENV') and (values.get('DD_APP_KEY') or values.get('DD_APPLICATION_KEY'))
values.update(CONFIG)
with open('/root/pup-recovery/runtime.env','w') as f:
 for k,v in values.items():f.write(k+'='+json.dumps(v)+'\\n')
ENVIRONMENT
systemd-run --unit=pup-course-validation --property=EnvironmentFile=/root/pup-recovery/runtime.env --property=RuntimeMaxSec=3540 /bin/bash /root/pup-recovery/run-live.sh
""".replace('CONFIG',repr(config))
        subprocess.run(remote+['bash -s'],input=script.encode(),check=True,timeout=30)
        started=True
        print('Validation started: '+participant,flush=True)
        # Restart the export deadline after setup so long calibration keeps its full hold.
        collector.terminate();collector.wait(timeout=15)
        collector=subprocess.Popen(['python3',str(HERE/'collect-live.py'),str(helper),str(out),'--seconds','3600'],
                                   stdout=open(out/'collector.log','a'),stderr=subprocess.STDOUT)
        export_deadline=time.monotonic()+3660
        while collector.poll() is None:
            if lifecycle.poll() is not None and not (out/'completed.json').exists():
                collector.terminate();collector.wait(timeout=15)
                raise RuntimeError('Platform lifecycle ended before final export')
            if time.monotonic()>=export_deadline:
                raise RuntimeError('Final export deadline exceeded')
            time.sleep(5)
        code=collector.returncode
        if code!=0 or not (out/'completed.json').exists():raise RuntimeError('Incomplete final export')
        lifecycle.wait(timeout=180)
        print('Exported: '+str(out),flush=True)
    except Exception as exc:
        (out/'driver-error.json').write_text(json.dumps({'error':str(exc),'controller_started':started})+'\n')
        # A running controller owns restoration/release. Before fault injection,
        # release a development hold if setup reached one.
        if remote and not started:
            subprocess.run(remote+['touch /root/pup-poc/integration-complete'],capture_output=True,timeout=20)
        raise
    finally:
        if log_process:log_process.terminate()
        if collector and collector.poll() is None and not started:collector.terminate()

if __name__=='__main__':main()
