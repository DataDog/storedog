"""Short startup check against completion records from the continuous generator."""
import json


def consecutive_valid(text, required=10):
    rows = []
    for line in text.splitlines():
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue  # The generator may still be writing the last record.
        if row.get('type') == 'request':
            rows.append(row)
    # Require consecutive arrival indices: an unfinished request is not success.
    streak = 0
    previous = None
    for row in sorted(rows, key=lambda r: r['index']):
        if previous is None or row['index'] != previous + 1:
            streak = 0
        if row.get('status') == 200 and row.get('valid') is True and not row.get('dropped'):
            streak += 1
        else:
            streak = 0
        previous = row['index']
    return streak >= required
