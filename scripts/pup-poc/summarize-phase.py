#!/usr/bin/env python3
"""Summarize a downloaded phase without exposing raw logs or credentials."""
import argparse
import datetime
import json
from pathlib import Path

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('directory', type=Path)
p.add_argument('phase')
a = p.parse_args()
traffic = [json.loads(line) for line in (a.directory / (a.phase+'.traffic.jsonl')).read_text().splitlines()]
resources = [json.loads(line) for line in (a.directory / (a.phase+'.resources.jsonl')).read_text().splitlines()]
result = {'phase': a.phase, 'traffic': traffic[-1], 'resources': {}}
for target in sorted({r['target'] for r in resources}):
    records = [r for r in resources if r['target'] == target]
    if any('error' in r for r in records) or len(records) < 2:
        result['resources'][target] = {'valid': False, 'reason': 'missing samples'}
        continue
    first, last = records[0], records[-1]
    elapsed = (datetime.datetime.fromisoformat(last['at']) - datetime.datetime.fromisoformat(first['at'])).total_seconds()
    delta = {k: last['stats'].get(k, 0) - first['stats'].get(k, 0)
             for k in ['usage_usec', 'nr_periods', 'nr_throttled', 'throttled_usec', 'oom_kill']}
    result['resources'][target] = {
        'valid': elapsed > 0 and all(v >= 0 for v in delta.values()),
        'sample_window_s': elapsed,
        'average_cpu_cores': delta['usage_usec']/1e6/elapsed if elapsed > 0 else None,
        'throttled_period_fraction': (delta['nr_throttled']/delta['nr_periods'] if delta['nr_periods'] else 0) if 'nr_periods' in first['stats'] else None,
        'throttled_seconds': delta['throttled_usec']/1e6 if 'throttled_usec' in first['stats'] else None,
        'max_memory_bytes': max(r['stats']['memory_current'] for r in records),
        'oom_kills': delta['oom_kill'] if 'oom_kill' in first['stats'] else None,
    }
print(json.dumps(result, indent=2))
