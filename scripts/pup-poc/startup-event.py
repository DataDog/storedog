#!/usr/bin/env python3
"""Append a timestamped startup milestone to the evidence directory."""
import datetime
import json
import os
from pathlib import Path
import sys
import time
out=Path(os.environ.get('PUP_EVIDENCE_DIR','/root/pup-poc/evidence'))
out.mkdir(parents=True,exist_ok=True)
with (out/'startup.jsonl').open('a') as stream:
    stream.write(json.dumps({'event':sys.argv[1], 'at':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'monotonic_s':time.monotonic()})+'\n')
