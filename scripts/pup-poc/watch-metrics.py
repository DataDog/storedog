#!/usr/bin/env python3
"""Capture scoped Pup CPU metrics and node capacity without altering traffic."""
import datetime,json,pathlib,subprocess,time,os
out=pathlib.Path('/root/pup-poc/evidence')
with open(out/'pup-metrics.jsonl','a') as metrics,open(out/'nodes.jsonl','a') as nodes:
 while not (out/'completed.json').exists():
  if (out/'completed.json').exists():break
  for metric,aggregation in [('kubernetes.cpu.usage.total','avg'),('kubernetes.cpu.cfs.throttled.periods','sum')]:
   query=aggregation+':'+metric+'{env:'+os.environ['DD_ENV']+',pod_name:postgres-0}'
   at=datetime.datetime.now(datetime.timezone.utc).isoformat()
   try:
    d=json.loads(subprocess.check_output(['pup','--no-agent','metrics','query','--query',query,'--from','2m'],text=True,stderr=subprocess.DEVNULL,timeout=20))
    metrics.write(json.dumps({'at':at,'query':query,'response':d})+'\n')
   except Exception as e:metrics.write(json.dumps({'at':at,'query':query,'error':type(e).__name__})+'\n')
   metrics.flush()
  for node in ('worker','kubernetes'):
   try:
    d=json.loads(subprocess.check_output(['kubectl','--request-timeout=15s','get','--raw','/api/v1/nodes/'+node+'/proxy/stats/summary'],text=True,stderr=subprocess.DEVNULL,timeout=20))['node']
    nodes.write(json.dumps({'node':node,'at':d['cpu']['time'],'cpu_nanocore_seconds':d['cpu']['usageCoreNanoSeconds'],'working_set_bytes':d['memory']['workingSetBytes']})+'\n')
   except Exception as e:nodes.write(json.dumps({'node':node,'error':type(e).__name__})+'\n')
   nodes.flush()
  time.sleep(30)
