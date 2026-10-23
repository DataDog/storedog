#!/usr/bin/env python3
"""Assess frozen repeat evidence; missing/incomplete evidence fails closed."""
import argparse,datetime,json,math,importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('gates',Path(__file__).with_name('window-gates.py'));gates=importlib.util.module_from_spec(spec);spec.loader.exec_module(gates)
spec_backlog=importlib.util.spec_from_file_location('backlog_gate',Path(__file__).with_name('backlog-gate.py'));backlog_gate=importlib.util.module_from_spec(spec_backlog);spec_backlog.loader.exec_module(backlog_gate)
p=argparse.ArgumentParser(description=__doc__);p.add_argument('directory');a=p.parse_args();root=Path(a.directory)
def read(name):return json.loads((root/name).read_text())
def lines(name):return [json.loads(x) for x in (root/name).read_text().splitlines() if x]
def epoch(s):return datetime.datetime.fromisoformat(s.replace('Z','+00:00')).timestamp()
try:
 completed=read('completed.json');summary=read('frozen-repeat.summary.json');events=lines('frozen-repeat.events.jsonl');traffic=lines('frozen-repeat.traffic.jsonl');states=lines('monitors/states.jsonl');spans=lines('db-spans.jsonl')
 checks={'process_completed':completed['process_exit']==completed['restore_exit']==0,'pvcs_preserved':summary['pvcs_unchanged'],'backend_not_restarted':summary['backend_unchanged'],'no_dropped_arrivals':summary['traffic']['dropped']==0,'all_requests_saved':len([x for x in traffic if x.get('type')=='request'])==summary['traffic']['offered']}
 start=next(x for x in events if x['kind']=='start');base=epoch(summary['traffic']['started_at']);ids={x['id'] for x in states if 'id' in x};cycles=[]
 checks['two_monitors_observed']=len(ids)==2
 rate=start['rate']; expected=int(rate*(60+start['cycles']*(start['fault_seconds']+start['recovery_seconds'])))
 checks['fixed_workload']=rate in (5,10) and start['fault_seconds'] in (180,2400) and start['recovery_seconds']==360 and summary['traffic']['offered']==expected
 checks['unique_request_indices']=sorted(x['index'] for x in traffic if x.get('type')=='request')==list(range(expected))
 for c in range(1,start['cycles']+1):
  fault=next(x for x in events if x['kind']=='fault-start' and x['cycle']==c);restore=next(x for x in events if x['kind']=='restore-submitted' and x['cycle']==c)
  recovery_end=60+c*(start['fault_seconds']+start['recovery_seconds']);lo=recovery_end-120
  rows=[x for x in traffic if x.get('type')=='request' and lo<=x['index']/rate<recovery_end]
  lat=sorted(x['latency_s'] for x in rows if 'latency_s' in x)
  result={'cycle':c,'recovery_requests':len(rows),'recovery_ok':sum(x.get('status')==200 and x.get('valid') is True for x in rows),'p95_s':lat[math.ceil(len(lat)*.95)-1] if lat else None}
  result['http_pass']=len(rows)==120*rate and result['recovery_ok']==120*rate and result['p95_s']<.2
  ready=next(x for x in events if x['kind']=='fault-ready' and x['cycle']==c)
  fault_lo=math.ceil((epoch(ready['at'])-base+60)*rate)/rate
  fault_end=epoch(next(x for x in events if x['kind']=='restore-start' and x['cycle']==c)['at'])-base
  result['backlog']=backlog_gate.assess(traffic,rate,fault_lo,fault_end)
  fault_minutes=max(0,int((fault_end-fault_lo)//60))
  fault_rows=[x for x in traffic if x.get('type')=='request' and fault_lo<=x['index']/rate<fault_lo+fault_minutes*60]
  fault_lat=sorted(x['latency_s'] for x in fault_rows if 'latency_s' in x)
  result['steady_fault_requests']=len(fault_rows)
  result['steady_fault_ok']=sum(x.get('status')==200 and x.get('valid') is True for x in fault_rows)
  result['steady_fault_p95_s']=fault_lat[math.ceil(len(fault_lat)*.95)-1] if fault_lat else None
  result['fault_symptom_pass']=len(fault_rows)==fault_minutes*60*rate and result['steady_fault_ok']>=.95*len(fault_rows) and 1<=(result['steady_fault_p95_s'] or 0)<=3
  fault_normalized=[dict(x,index=x['index']-round(fault_lo*rate)) for x in fault_rows]
  result['fault_windows']=gates.assess(fault_normalized,rate,'fault',windows=fault_minutes)
  # Cover the trailing partial minute as well as the aligned whole windows.
  tail_start=math.ceil((fault_end-60)*rate);tail_end=math.ceil(fault_end*rate)
  tail_rows=[dict(x,index=x['index']-tail_start) for x in traffic if x.get('type')=='request' and tail_start<=x['index']<tail_end]
  result['fault_tail_window']=gates.assess(tail_rows,rate,'fault',windows=1)
  result['fault_symptom_pass']=fault_minutes>=1 and result['fault_symptom_pass'] and result['fault_windows']['pass'] and result['fault_tail_window']['pass']
  per_monitor=[]
  for id in ids:
   alerted=any(x.get('overall_state')=='Alert' and epoch(fault['at'])<=epoch(x['at'])<=epoch(restore['at'])+180 for x in states if x.get('id')==id and 'at' in x)
   window=[x for x in states if x.get('id')==id and 'at' in x and base+lo<=epoch(x['at'])<base+recovery_end]
   healthy=[]
   for observation in reversed(window):
    if observation.get('overall_state')!='OK':break
    healthy.insert(0,observation)
   sustained=len(healthy)>=2 and epoch(healthy[-1]['at'])-epoch(healthy[0]['at'])>=60 and base+recovery_end-epoch(healthy[-1]['at'])<=45 and all(epoch(y['at'])-epoch(x['at'])<=45 for x,y in zip(healthy,healthy[1:]))
   per_monitor.append({'id':id,'alert_observed':alerted, 'alert_required':id==read('monitors/latency-created.json')['id'],'sustained_recovery_ok':sustained})
  result['monitors']=per_monitor
  product_traces={x.get('trace_id') for x in traffic if x.get('type')=='request' and x.get('status')==200 and x.get('valid') is True}
  result['fresh_product_sql']=any(s.get('start_timestamp') and epoch(restore['at'])+60<=epoch(s['start_timestamp'])<base+recovery_end and s.get('trace_id') in product_traces and (s.get('operation_name') or '').startswith('pg.') and any(table in (s.get('resource_name') or '') for table in ('spree_products','spree_variants','spree_taxons','spree_prices')) for batch in spans for s in batch.get('spans',[]))
  result['fresh_fault_product_sql']=any(s.get('start_timestamp') and base+fault_lo<=epoch(s['start_timestamp'])<base+fault_end and s.get('trace_id') in product_traces and (s.get('operation_name') or '').startswith('pg.') and any(table in (s.get('resource_name') or '') for table in ('spree_products','spree_variants','spree_taxons','spree_prices')) for batch in spans for s in batch.get('spans',[]))
  cycles.append(result)
 checks['required_cycles']=len(cycles)==(1 if start['fault_seconds']==2400 else 3)
 error_rows=lines('backend-errors.jsonl')
 checks['error_polling_present']=any(x.get('polled') for x in error_rows)
 poll_times=sorted(epoch(x['at']) for x in error_rows if x.get('polled'))
 checks['error_polling_complete']=bool(poll_times) and poll_times[0]<=base+90 and poll_times[-1]>=base+summary['traffic']['duration_s']-90 and all(y-x<=90 for x,y in zip(poll_times,poll_times[1:]))
 checks['no_pool_or_app_timeout']=not any('error' in x or any(c in ('ActiveRecord::ConnectionTimeoutError','Rack::Timeout::RequestTimeoutException','Rack::Timeout::RequestTimeoutError') for c in x.get('classes',[])) for x in error_rows)
 result={'checks':checks,'cycles':cycles,'http_monitor_trace_pass':all(checks.values()) and all(c['fault_symptom_pass'] and c['backlog']['pass'] and c['http_pass'] and c['fresh_product_sql'] and c['fresh_fault_product_sql'] and len(c['monitors'])==2 and all((m['alert_observed'] or not m['alert_required']) and m['sustained_recovery_ok'] for m in c['monitors']) for c in cycles),'scope':'HTTP, monitor and fresh trace gates only; resource headroom and error evidence require review.'}
except (OSError,KeyError,ValueError,StopIteration) as e:
 result={'http_monitor_trace_pass':False,'error':type(e).__name__,'detail':str(e)}
(root/'assessment.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
