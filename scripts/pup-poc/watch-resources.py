import subprocess,json,time,datetime,concurrent.futures,pathlib
k=['kubectl','--request-timeout=12s','-n','storedog']
read='cat /sys/fs/cgroup/cpu.stat; echo memory_current $(cat /sys/fs/cgroup/memory.current); cat /sys/fs/cgroup/memory.events; cat /sys/fs/cgroup/memory.stat'
def sample(target):
 try:
  raw=subprocess.check_output(k+['exec',target,'--','sh','-c',read],text=True,stderr=subprocess.DEVNULL,timeout=15)
  return {'target':target,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stats':{r.split()[0]:int(r.split()[1]) for r in raw.splitlines()}}
 except Exception as e:return {'target':target,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'error':type(e).__name__}
with open('/root/pup-poc/evidence/recovery-resources.jsonl','a') as f,concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 deadline=time.monotonic()+3600
 while time.monotonic()<deadline and not pathlib.Path('/root/pup-poc/evidence/completed.json').exists():
  for row in pool.map(sample,['postgres-0','deployment/backend','pup-traffic']): f.write(json.dumps(row)+'\n')
  f.flush();time.sleep(15)
