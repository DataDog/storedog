#!/usr/bin/env python3
"""Summarize cgroup and node headroom in steady fault and final recovery windows."""
import argparse,datetime,json
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);p.add_argument('directory');a=p.parse_args();root=Path(a.directory)
def epoch(s):return datetime.datetime.fromisoformat(s.replace('Z','+00:00')).timestamp()
def readlines(name):
 rows=[]
 for line in (root/name).read_text().splitlines():
  rows.append(json.loads(line))
 return rows
traffic=readlines('frozen-repeat.traffic.jsonl')
events=readlines('frozen-repeat.events.jsonl');start=events[0];base=epoch(start['at']);resources=readlines('recovery-resources.jsonl');nodes=readlines('nodes.jsonl')
result=[]
for cycle in range(start['cycles']):
 fault=60+cycle*(start['fault_seconds']+start['recovery_seconds']);end=fault+start['fault_seconds']+start['recovery_seconds']
 ready=next(x for x in events if x['kind']=='fault-ready' and x['cycle']==cycle+1)
 fault_lo=epoch(ready['at'])-base+60
 for label,lo,hi in [('fault-steady',fault_lo,fault+start['fault_seconds']),('recovery',end-120,end)]:
  row={'cycle':cycle+1,'phase':label,'containers':{},'nodes':{}}
  for target in ('postgres-0','deployment/backend','pup-traffic'):
   samples=[x for x in resources if x.get('target')==target and 'stats'in x and lo<=epoch(x['at'])-base<hi]
   times=[epoch(x['at'])-base for x in samples]
   complete=len(times)>=2 and times[0]<=lo+45 and times[-1]>=hi-45 and all(0<y-x<=45 for x,y in zip(times,times[1:]))
   if not complete or any('inactive_file' not in x['stats'] for x in samples):row['containers'][target]={'incomplete':True};continue
   first,last=samples[0],samples[-1];dt=epoch(last['at'])-epoch(first['at']);s,e=first['stats'],last['stats'];periods=e['nr_periods']-s['nr_periods']
   reset=any(y['stats']['usage_usec']<x['stats']['usage_usec'] for x,y in zip(samples,samples[1:]))
   row['containers'][target]={'samples':len(samples),'counter_reset':reset,'average_cpu':None if reset else (e['usage_usec']-s['usage_usec'])/dt/1e6,'throttled_period_fraction':(e['nr_throttled']-s['nr_throttled'])/periods if periods>0 and not reset else None,'max_memory_bytes':max(x['stats']['memory_current'] for x in samples),'max_working_set_bytes':max(max(0,x['stats']['memory_current']-x['stats']['inactive_file']) for x in samples),'oom_kill_counter_max':max(x['stats']['oom_kill'] for x in samples)}
  for target in ('worker','kubernetes'):
   samples=[x for x in nodes if x.get('node')==target and 'at'in x and lo<=epoch(x['at'])-base<hi]
   times=[epoch(x['at'])-base for x in samples]
   if len(times)>=2 and times[0]<=lo+90 and times[-1]>=hi-90 and all(0<y-x<=90 for x,y in zip(times,times[1:])):
    first,last=samples[0],samples[-1];row['nodes'][target]={'average_cpu':(last['cpu_nanocore_seconds']-first['cpu_nanocore_seconds'])/(epoch(last['at'])-epoch(first['at']))/1e9,'max_memory_bytes':max(x['working_set_bytes'] for x in samples)}
  result.append(row)
(root/'resource-assessment.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
