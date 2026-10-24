import concurrent.futures
import datetime
import json
import pathlib
import subprocess
import time

out=pathlib.Path('/root/pup-poc/evidence/monitors')
ids=[json.load(open(path))['id'] for path in out.glob('*-created.json')]
assert len(set(ids))==2, 'Expected exactly two owned monitor IDs'

def sample(monitor_id):
    try:
        data=json.loads(subprocess.check_output(['pup','--no-agent','api','v1/monitor/'+str(monitor_id),'-F','group_states=all'],timeout=20))
        row={key:data.get(key) for key in ['id','name','overall_state','overall_state_modified','state']}
    except Exception as exc:
        row={'id':monitor_id,'error':type(exc).__name__}
    row['at']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    return row

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool, open(out/'states.jsonl','a') as stream:
    while not (out.parent/'completed.json').exists():
        started=time.monotonic()
        for row in pool.map(sample,ids):
            stream.write(json.dumps(row)+'\n');stream.flush()
        time.sleep(max(0,30-(time.monotonic()-started)))
