#!/usr/bin/env python3
"""Detect sustained growth in outstanding HTTP requests from arrival/completion data."""

def assess(rows, rate, start, end):
    if end-start < 60:
        return {'pass':False,'reason':'At least one steady minute is required'}
    width=min(60, (end-start)/2)
    intervals=[]
    for row in rows:
        if row.get('type')!='request' or 'latency_s' not in row:
            continue
        arrival=row['index']/rate+row.get('dispatch_lag_s',0)
        intervals.append((arrival,arrival+row['latency_s']))
    if not intervals:
        return {'pass':False,'reason':'No observed request intervals'}
    def average_pending(lo,hi):
        return sum(max(0,min(b,hi)-max(a,lo)) for a,b in intervals)/(hi-lo)
    first=average_pending(start,start+width)
    last=average_pending(end-width,end)
    # A one-request allowance covers boundary jitter; the long soak must pass too.
    return {'pass':last-first<=1.0,'first_average_pending':first,'last_average_pending':last,
            'growth':last-first,'maximum_growth':1.0,'comparison_window_seconds':width,
            'start':start,'end':end,'scope':'Observed HTTP requests; timeout and pool gates remain separate'}
