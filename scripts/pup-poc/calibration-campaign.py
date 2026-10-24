#!/usr/bin/env python3
"""Run ordered workload combinations sequentially; stop on evidence failure."""
import argparse
import json
from pathlib import Path
import subprocess

HERE=Path(__file__).resolve().parent

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--key',required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--track',default='datadog/course-getting-started-pup-dev')
    args=parser.parse_args()
    args.output.mkdir(parents=True,exist_ok=False)
    results=[]
    combinations=json.loads((HERE/'course-profile.json').read_text())['combinations']
    for products,rate in combinations:
        resume=None;previous=-1
        for attempt in range(10):
            directory=args.output/f'{products}-{rate}-{attempt}'
            command=['python3',str(HERE/'sandbox-run.py'),'--key',args.key,'--output',str(directory),
                     '--track',args.track,'--mode','calibrate','--products',str(products),'--rate',str(rate)]
            if resume:command+=['--resume',str(resume)]
            subprocess.run(command,check=True)
            completed=json.loads((directory/'completed.json').read_text())
            exported=json.loads((directory/'export-status.json').read_text())
            if completed.get('restore_exit')!=0 or not exported.get('complete') or 'Track test succeeded' not in (directory/'lifecycle.log').read_text():
                raise RuntimeError('Missing restoration/export/lifecycle evidence: '+str(directory))
            result_path=directory/'calibration-result.json'
            if result_path.exists():
                result=json.loads(result_path.read_text())
                results.append({'products':products,'rate':rate,'directory':str(directory),'calibration':result})
                (args.output/'campaign.json').write_text(json.dumps({'accepted':False,'results':results},indent=2)+'\n')
                if result.get('http_candidate'):
                    print('Candidate requires freezing and full acceptance: '+str(directory),flush=True)
                    return 0
                break
            if completed.get('process_exit')!=124:
                raise RuntimeError('Calibration failed without a resumable deadline checkpoint')
            resume=directory/'calibration-state.json'
            state=json.loads(resume.read_text())
            count=sum(r['name'].startswith('candidate-') for r in state['results'])
            if count<=previous:raise RuntimeError('Calibration checkpoint made no progress')
            previous=count
        else:raise RuntimeError('Calibration exceeded its bounded resume count')
    print('Calibration failed: no ordered workload combination qualified.',flush=True)
    return 1

if __name__=='__main__':raise SystemExit(main())
