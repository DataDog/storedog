#!/usr/bin/env python3
"""Save allowlisted Pup span fields and backend error classes during a run."""
import datetime,json,pathlib,subprocess,time,os,argparse
p=argparse.ArgumentParser(description=__doc__)
p.add_argument("--once",action="store_true");p.add_argument("--errors-only",action="store_true");a=p.parse_args()
out=pathlib.Path('/root/pup-poc/evidence')
with open(out/'db-spans.jsonl','a') as spans,open(out/'backend-errors.jsonl','a') as errors:
 while True:
  started=time.monotonic()
  now=datetime.datetime.now(datetime.timezone.utc).isoformat()
  if not a.errors_only:
   try:
    d=json.loads(subprocess.check_output(['pup','--no-agent','traces','search','--query','env:'+os.environ['DD_ENV']+' service:store-backend @component:pg','--from','1m','--limit','1000'],text=True,timeout=25))
    rows=[]
    for x in d.get('data',[]):
     a=x['attributes']; row={k:a.get(k) for k in ['service','operation_name','resource_name','trace_id','span_id','start_timestamp','end_timestamp','duration']}
     row['custom_duration']=a.get('custom',{}).get('duration');rows.append(row)
    spans.write(json.dumps({'at':now,'spans':rows})+'\n')
   except Exception as e:spans.write(json.dumps({'at':now,'error':type(e).__name__})+'\n')
   spans.flush()

  try:
   raw=subprocess.check_output(['kubectl','--request-timeout=15s','-n','storedog','logs','deployment/backend','--since=90s','--timestamps=true'],text=True,stderr=subprocess.DEVNULL,timeout=20)
   errors.write(json.dumps({'at':now,'polled':True})+'\n')
   for line in raw.splitlines():
    classes=[c for c in ['ActiveRecord::ConnectionTimeoutError','Rack::Timeout::RequestTimeoutException','Rack::Timeout::RequestTimeoutError','Rack::Timeout::RequestExpiryError','PG::ConnectionBad','PG::QueryCanceled'] if c in line]
    if classes:errors.write(json.dumps({'timestamp':line.split(' ',1)[0],'classes':classes})+'\n')
  except Exception as e:errors.write(json.dumps({'at':now,'error':type(e).__name__})+'\n')
  errors.flush()
  if a.once:break
  time.sleep(max(0,45-(time.monotonic()-started)))
