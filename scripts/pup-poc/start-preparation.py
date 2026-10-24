#!/usr/bin/env python3
"""Start one bounded preparation service, passing credentials via a private file."""
import fcntl
import json
import os
from pathlib import Path
import subprocess

root=Path('/root/pup-recovery')
with open(root/'preparation.lock','w') as lock:
    fcntl.flock(lock,fcntl.LOCK_EX)
    loaded=subprocess.check_output(['systemctl','show','pup-preparation.service','--property=LoadState','--value'],text=True).strip()
    if loaded!='not-found':
        subprocess.run(['systemctl','is-active','--quiet','pup-preparation.service'],check=True)
        raise SystemExit(0)
    path=root/'preparation.env'
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600);os.fchmod(fd,0o600)
    with os.fdopen(fd,'w') as stream:
        for name in ('DD_API_KEY','DD_APP_KEY','DD_APPLICATION_KEY','DD_ENV','DD_SITE','PATH','PUP_SCENARIO_MODE','PUP_CATALOG_PRODUCTS','PUP_RATE'):
            if name in os.environ:
                value=os.environ[name]
                if '\n' in value or '\r' in value:raise ValueError('Invalid environment value: '+name)
                stream.write(name+'='+json.dumps(value)+'\n')
    subprocess.run(['python3',str(root/'preparation-status.py'),'--stage','starting preparation'],check=True)
    subprocess.run(['systemd-run','--unit=pup-preparation','--property=RemainAfterExit=yes',
        '--property=RuntimeMaxSec=900','--property=TimeoutStopSec=180',
        '--property=KillMode=control-group','--property=ExecStopPost=/bin/bash /root/pup-recovery/preparation-stopped.sh','--property=EnvironmentFile='+str(path),
        '--property=StandardOutput=append:/root/pup-poc/evidence/preparation.log',
        '--property=StandardError=append:/root/pup-poc/evidence/preparation.log',
        '/bin/bash',str(root/'prepare-background.sh')],check=True)
    subprocess.run(['systemctl','is-active','--quiet','pup-preparation.service'],check=True)
