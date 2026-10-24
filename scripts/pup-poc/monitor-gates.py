"""Reject rollout-only alerts and gaps in steady incident monitor evidence."""
import datetime


def epoch(value):
    return datetime.datetime.fromisoformat(value.replace('Z','+00:00')).timestamp()


def assess(states, monitor_id, lo, hi):
    rows=sorted((row for row in states if row.get('id')==monitor_id and 'at' in row
                 and lo<=epoch(row['at'])<hi),key=lambda row:epoch(row['at']))
    times=[epoch(row['at']) for row in rows]
    complete=(len(times)>=2 and times[0]<=lo+45 and times[-1]>=hi-45
              and all(0<b-a<=45 for a,b in zip(times,times[1:]))
              and all(row.get('overall_state') in ('OK','Alert','Warn') for row in rows))
    return {'coverage_complete':bool(complete),
            'alert_observed':any(row.get('overall_state')=='Alert' for row in rows),
            'alert_at_end':bool(rows and rows[-1].get('overall_state')=='Alert' and hi-times[-1]<=45)}
