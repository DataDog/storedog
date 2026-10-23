#!/usr/bin/env python3
"""Export evidence every 15s via a preverified SSH helper, independently of chat.

Usage: nohup caffeinate -i python3 collect-live.py SSH_HELPER OUTPUT_DIRECTORY
Only the dedicated evidence directory is exported; never credentials/kubeconfig.
"""
import argparse
import datetime
import io
import json
from pathlib import Path
import subprocess
import tarfile
import time

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('ssh_helper')
p.add_argument('output')
p.add_argument('--seconds', type=int, default=3600)
a = p.parse_args()
if not 1 <= a.seconds <= 7200: p.error('seconds must be between 1 and 7200')
out = Path(a.output).resolve()
out.mkdir(parents=True, exist_ok=True)
deadline = time.monotonic()+a.seconds
while time.monotonic()<deadline:
    try:
        raw = subprocess.check_output([a.ssh_helper,
            'mkdir -p /root/pup-evidence-snapshot; cp -a /root/pup-poc/evidence/. /root/pup-evidence-snapshot/ && tar -C /root/pup-evidence-snapshot -czf - .'], timeout=45)
        with tarfile.open(fileobj=io.BytesIO(raw), mode='r:gz') as archive:
            for member in archive.getmembers():
                if member.isdir():
                    continue
                target = (out/member.name).resolve()
                if not member.isfile() or not target.is_relative_to(out):
                    raise ValueError('Unsafe evidence archive member')
                target.parent.mkdir(parents=True, exist_ok=True)
                temp = target.with_name(target.name+'.partial')
                temp.write_bytes(archive.extractfile(member).read())
                temp.replace(target)
        (out/'export-status.json').write_text(json.dumps({'last_export':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':(out/'completed.json').exists()})+'\n')
        if (out/'completed.json').exists():
            subprocess.run([a.ssh_helper,'touch /root/pup-recovery/export-complete'],check=True,timeout=20)
            print('Final evidence exported and acknowledged.',flush=True)
            break
    except Exception as exc:
        print(datetime.datetime.now(datetime.timezone.utc).isoformat(),type(exc).__name__,flush=True)
    time.sleep(15)
else:
    raise SystemExit('Evidence collection deadline exceeded; inspect last saved snapshot.')
