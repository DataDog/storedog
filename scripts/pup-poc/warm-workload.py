#!/usr/bin/env python3
"""Prewarm every selected manifest page with bounded concurrency; this is not a rate gate.

Normal application cache settings remain unchanged. Follow with three measured
one-minute windows at the frozen offered rate before any database fault.
"""
import argparse
import concurrent.futures
import json
import math
import secrets
import time
import urllib.request
from workload import Workload

def targets(workload):
    expected=len(workload.pages(workload.products, 'catalog'))+sum(len(workload.pages(p, 'category')) for p in workload.by_category.values())
    seen={}
    for index in range(expected*10):
        target=workload.request(index)
        seen.setdefault(target['url'],target)
        if len(seen)==expected:return list(seen.values())
    raise ValueError('Request sequence did not cover the full catalog')

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--workload',required=True);p.add_argument('--concurrency',type=int,default=2)
    a=p.parse_args()
    if not 1<=a.concurrency<=2:p.error('prewarm concurrency must be 1 or 2')
    workload=Workload(a.workload);requests=targets(workload);started=time.monotonic()
    def fetch(target):
        trace=str(secrets.randbits(63) or 1);before=time.monotonic()
        row={'type':'prewarm-request','request_class':target['request_class'],'url':target['url'],'trace_id':trace}
        try:
            request=urllib.request.Request(target['url'],headers={'x-datadog-trace-id':trace,
                'x-datadog-parent-id':str(secrets.randbits(63) or 1),'x-datadog-sampling-priority':'2'})
            with urllib.request.urlopen(request,timeout=10) as response:
                body=json.load(response);row.update(status=response.status,valid=workload.validate(target,body),products=len(body.get('data',[])))
        except Exception as exc:row.update(status=getattr(exc,'code',0),valid=False,error=type(exc).__name__)
        row['latency_s']=time.monotonic()-before
        return row
    passed=0
    with concurrent.futures.ThreadPoolExecutor(max_workers=a.concurrency) as pool:
        for row in pool.map(fetch,requests):
            print(json.dumps(row),flush=True)
            passed+=row.get('status')==200 and row.get('valid') is True
    print(json.dumps({'type':'prewarm-summary','requests':len(requests),'valid':passed,'elapsed_s':time.monotonic()-started,'rate_gate':False}),flush=True)
    return 0 if passed==len(requests) else 1
if __name__=='__main__':raise SystemExit(main())
