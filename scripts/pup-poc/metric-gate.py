"""Require fresh, environment-scoped CPU and throttling evidence from Pup."""
import datetime
import math


def assess(rows, environment, lo, hi, fault=False):
    result = {}
    for metric, aggregation in [('kubernetes.cpu.usage.total', 'avg'),
                                ('kubernetes.cpu.cfs.throttled.periods', 'sum')]:
        query = aggregation + ':' + metric + '{env:' + environment + ',pod_name:postgres-0}'
        points = {}
        for row in rows:
            response = row.get('response', {})
            if row.get('query') != query or response.get('query') != query or response.get('status') != 'ok':
                continue
            captured = datetime.datetime.fromisoformat(row['at'].replace('Z', '+00:00')).timestamp()
            for series in response.get('series', []):
                if series.get('metric') != metric or series.get('expression') != query:
                    continue
                for timestamp, value in series.get('pointlist', []):
                    at = timestamp / 1000
                    if (lo <= at < hi and 0 <= captured-at <= 180 and
                            isinstance(value, (float, int)) and math.isfinite(value) and value >= 0):
                        points[at] = value
        times = sorted(points)
        complete = (len(times) >= 2 and times[0] <= lo+60 and times[-1] >= hi-60 and
                    all(b-a <= 60 for a, b in zip(times, times[1:])))
        positive = any(value > 0 for value in points.values())
        result[metric] = {'samples': len(points), 'coverage_complete': complete,
                          'positive': positive, 'pass': bool(complete and (positive or not fault))}
    return result
