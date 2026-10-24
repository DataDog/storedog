#!/usr/bin/env python3
"""Keep evidence collection alive after setup exits, with private credentials."""
import json
import os
from pathlib import Path
import subprocess

path=Path('/root/pup-recovery/learner-observers.env')
fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
with os.fdopen(fd,'w') as stream:
    for name in ('DD_API_KEY','DD_APP_KEY','DD_APPLICATION_KEY','DD_SITE','DD_ENV','PATH'):
        if name in os.environ:
            value=os.environ[name]
            if '\n' in value or '\r' in value:
                raise ValueError('Invalid environment value: '+name)
            stream.write(name+'='+json.dumps(value)+'\n')
    stream.write('KUBECONFIG=/root/.kube/config\n')
for name in ('monitors','resources','telemetry'):
    subprocess.run(['systemd-run','--unit=pup-course-'+name,
        '--property=RuntimeMaxSec=3660','--property=WorkingDirectory=/root/pup-recovery',
        '--property=EnvironmentFile='+str(path),
        '/usr/bin/python3','/root/pup-recovery/watch-'+name+'.py'],check=True)
