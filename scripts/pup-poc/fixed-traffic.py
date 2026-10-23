#!/usr/bin/env python3
"""Bounded open-loop HTTP probe; emits per-request evidence and a summary."""
import argparse
import concurrent.futures
import datetime
import json
import math
import secrets
import threading
import time
import urllib.request


def run(url, rate, duration, concurrency, timeout, stream=False, workload=None):
    slots = threading.BoundedSemaphore(concurrency)
    output_lock = threading.Lock()
    rows = []
    start = time.monotonic()
    started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    offered = int(rate * duration)

    def emit(row):
        with output_lock:
            print(json.dumps({'type': 'request', **row}), flush=True)

    def request(index, scheduled):
        actual = time.monotonic()
        trace = secrets.randbits(63) or 1
        target = workload.request(index) if workload else {'url': url, 'request_class': 'single'}
        row = {'index': index, 'trace_id': str(trace), 'request_class': target['request_class'],
               'url': target['url'],
               'start_offset_s': actual - start, 'dispatch_lag_s': actual - scheduled}
        try:
            req = urllib.request.Request(target['url'], headers={
                'x-datadog-trace-id': str(trace),
                'x-datadog-parent-id': str(secrets.randbits(63) or 1),
                'x-datadog-sampling-priority': '2',
                'User-Agent': 'pup-poc-fixed-traffic/1'})
            with urllib.request.urlopen(req, timeout=timeout) as response:
                body = json.load(response)
                row.update(status=response.status, products=len(body.get('data', [])),
                           valid=workload.validate(target, body) if workload else True)
        except Exception as exc:
            row.update(status=getattr(exc, 'code', 0), error=type(exc).__name__)
        finally:
            row['latency_s'] = time.monotonic() - actual
            slots.release()
        if stream:
            emit(row)
        return row

    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as pool:
        futures = []
        for index in range(offered):
            scheduled = start + index / rate
            time.sleep(max(0, scheduled - time.monotonic()))
            # Do not queue or catch up a delayed arrival: report missed load.
            if time.monotonic() - scheduled > 1 / rate or not slots.acquire(False):
                row = {'index': index, 'dropped': True, 'dispatch_lag_s': time.monotonic()-scheduled,
                       'request_class': workload.request(index)['request_class'] if workload else 'single'}
                rows.append(row)
                if stream:
                    emit(row)
                continue
            futures.append(pool.submit(request, index, scheduled))
        rows.extend(f.result() for f in futures)
    rows.sort(key=lambda r: r['index'])
    if not stream:
        for row in rows:
            emit(row)
    sent = [r for r in rows if not r.get('dropped')]
    latencies = sorted(r['latency_s'] for r in sent)
    percentile = lambda p: latencies[max(0, math.ceil(len(latencies) * p) - 1)] if latencies else None
    print(json.dumps({'type': 'summary', 'started_at': started_at, 'url': url,
                      'rate': rate, 'duration_s': duration, 'elapsed_s': time.monotonic()-start,
                      'offered': offered, 'sent': len(sent), 'dropped': offered-len(sent),
                      'http_200': sum(r['status'] == 200 for r in sent),
                      'valid': sum(r.get('status') == 200 and r.get('valid', False) for r in sent),
                      'product_counts': sorted({r['products'] for r in sent if 'products' in r}),
                      'median_s': percentile(.5), 'p95_s': percentile(.95), 'p99_s': percentile(.99),
                      'max_dispatch_lag_s': max((r['dispatch_lag_s'] for r in sent), default=0)}), flush=True)


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url', default='http://service-proxy/services/backend/api/v2/storefront/products?per_page=25&include=images')
    p.add_argument('--rate', type=float)
    p.add_argument('--workload', help='Versioned workload manifest with relative catalog path')
    p.add_argument('--duration', type=float, default=60)
    p.add_argument('--concurrency', type=int, default=64)
    p.add_argument('--timeout', type=float, default=10)
    p.add_argument('--stream', action='store_true', help='Emit requests as they complete')
    a = p.parse_args()
    workload = None
    if a.workload:
        from workload import Workload
        workload = Workload(a.workload)
    a.rate = a.rate if a.rate is not None else workload.profile['rate'] if workload else 5
    if min(a.rate, a.duration, a.concurrency, a.timeout) <= 0:
        p.error('rate, duration, concurrency and timeout must be positive')
    run(a.url, a.rate, a.duration, a.concurrency, a.timeout, a.stream, workload)
