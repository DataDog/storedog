#!/usr/bin/env python3
"""Strict one-minute HTTP gates; rollout windows must be excluded by the caller."""
import argparse
import json
import math
from pathlib import Path

def assess(rows, rate, mode, windows=3, skip=0):
    if windows < 1 or rate <= 0 or skip < 0:
        return {'pass': False, 'windows': [], 'error': 'invalid window configuration'}
    requests = [r for r in rows if r.get('type') == 'request']
    results = []
    for minute in range(skip, skip + windows):
        lo, hi = int(minute * 60 * rate), int((minute + 1) * 60 * rate)
        selected = [r for r in requests if lo <= r['index'] < hi]
        latencies = sorted(r['latency_s'] for r in selected if not r.get('dropped'))
        ok = sum(r.get('status') == 200 and r.get('valid') is True for r in selected)
        p95 = latencies[math.ceil(len(latencies)*.95)-1] if latencies else None
        lag = max((r.get('dispatch_lag_s', float('inf')) for r in selected), default=float('inf'))
        complete = sorted(r['index'] for r in selected) == list(range(lo, hi))
        passed = (complete and not any(r.get('dropped') for r in selected) and
                  lag < 1/rate and p95 is not None)
        passed = passed and (ok == hi-lo and p95 < .2 if mode == 'healthy' else
                             ok >= .95*(hi-lo) and 1 <= p95 <= 3)
        results.append({'minute': minute, 'expected': hi-lo, 'valid': ok, 'p95_s': p95,
                        'max_dispatch_lag_s': lag, 'complete': complete,
                        'dropped': sum(bool(r.get('dropped')) for r in selected), 'pass': bool(passed)})
    return {'pass': all(w['pass'] for w in results), 'windows': results}

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('traffic'); p.add_argument('--rate', type=float, required=True)
    p.add_argument('--mode', choices=['healthy', 'fault'], required=True)
    p.add_argument('--skip', type=int, default=0); p.add_argument('--windows', type=int, default=3)
    a = p.parse_args()
    if a.rate <= 0 or a.windows <= 0 or a.skip < 0: p.error('invalid window or rate')
    result = assess([json.loads(x) for x in Path(a.traffic).read_text().splitlines()], a.rate, a.mode, a.windows, a.skip)
    print(json.dumps(result, indent=2)); raise SystemExit(0 if result['pass'] else 1)
