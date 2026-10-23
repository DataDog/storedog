import json,subprocess,time,datetime,pathlib
out=pathlib.Path('/root/pup-poc/evidence/monitors')
ids=[json.load(open(p))['id'] for p in out.glob('*-created.json')]
with open(out/'states.jsonl','a') as f:
 while not (out.parent/'completed.json').exists():
  for id in ids:
   try:
    d=json.loads(subprocess.check_output(['pup','--no-agent','api','v1/monitor/'+str(id),'-F','group_states=all'],timeout=20))
    row={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),**{k:d.get(k) for k in ['id','name','overall_state','overall_state_modified','state']}}
   except Exception as e: row={'id':id,'error':type(e).__name__}
   f.write(json.dumps(row)+'\n');f.flush()
  time.sleep(30)
