#!/usr/bin/env python3
"""Capture scoped Pup CPU metrics and node capacity without altering traffic."""
import concurrent.futures
import datetime
import json
import os
import pathlib
import subprocess
import time

out = pathlib.Path('/root/pup-poc/evidence')


def metric_sample(metric, aggregation):
    query = aggregation+':'+metric+'{env:'+os.environ['DD_ENV']+',pod_name:postgres-0}'
    row = {'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'query': query}
    try:
        row['response'] = json.loads(subprocess.check_output(
            ['pup','--no-agent','metrics','query','--query',query,'--from','2m'],
            text=True, stderr=subprocess.DEVNULL, timeout=20))
    except Exception as exc:
        row['error'] = type(exc).__name__
    return row


def node_sample(node):
    row = {'node': node}
    try:
        data = json.loads(subprocess.check_output(
            ['kubectl','--request-timeout=15s','get','--raw','/api/v1/nodes/'+node+'/proxy/stats/summary'],
            text=True, stderr=subprocess.DEVNULL, timeout=20))['node']
        row.update(at=data['cpu']['time'], cpu_nanocore_seconds=data['cpu']['usageCoreNanoSeconds'],
                   working_set_bytes=data['memory']['workingSetBytes'])
    except Exception as exc:
        row['error'] = type(exc).__name__
    return row


with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool, \
        open(out/'pup-metrics.jsonl','a') as metrics, open(out/'nodes.jsonl','a') as nodes:
    while not (out/'completed.json').exists():
        started = time.monotonic()
        pending = [(metrics, pool.submit(metric_sample, metric, aggregation))
                   for metric, aggregation in [('kubernetes.cpu.usage.total','avg'),
                                                ('kubernetes.cpu.cfs.throttled.periods','sum')]]
        pending += [(nodes, pool.submit(node_sample, node)) for node in ('worker','kubernetes')]
        for stream, future in pending:
            stream.write(json.dumps(future.result())+'\n')
            stream.flush()
        time.sleep(max(0, 30-(time.monotonic()-started)))
