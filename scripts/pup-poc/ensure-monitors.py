#!/usr/bin/env python3
"""Reuse only exact-name task-137 monitors in the lab org; freeze definitions."""
import json,pathlib,subprocess,os
out=pathlib.Path('/root/pup-poc/evidence/monitors');out.mkdir(parents=True,exist_ok=True)
def pup(*args):return json.loads(subprocess.check_output(['pup','--no-agent',*args],text=True,timeout=30))
existing=pup('monitors','list','--tags','project:pup-course,task:137')
if not isinstance(existing,list):raise RuntimeError('Unexpected monitor list response')
for name in ('latency','errors'):
 path=pathlib.Path('monitors')/(name+'.json');definition=json.loads(path.read_text().replace('monitor-investigation-with-pup',os.environ['DD_ENV']))
 definition['name'] += ' ['+os.environ['DD_ENV']+']'
 path=out/(name+'-definition.json');path.write_text(json.dumps(definition,indent=2)+'\n')
 pup('api','-X','POST','v1/monitor/validate','--input',str(path))
 matches=[m for m in existing if m.get('name')==definition['name'] and {'project:pup-course','task:137','env:'+os.environ['DD_ENV'],'service:store-backend'}.issubset(set(m.get('tags',[])))]
 if len(matches)>1:raise RuntimeError('Ambiguous owned monitor name: '+definition['name'])
 if matches:d=pup('monitors','update',str(matches[0]['id']),'--file',str(path))
 else:d=pup('monitors','create','--file',str(path))
 (out/(name+'-created.json')).write_text(json.dumps({k:d.get(k) for k in ('id','name','query','options','tags')},indent=2)+'\n')
 print(json.dumps({'monitor':name,'id':d['id'],'reused':bool(matches)}),flush=True)
