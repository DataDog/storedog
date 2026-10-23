#!/bin/bash
# Course setup entry point after the existing Kubernetes/OpenCode setup.
set -euo pipefail
cd /root/pup-recovery
: "${DD_ENV:?Unique sandbox environment is required}"
mode=${PUP_SCENARIO_MODE:-learner}
[[ $mode == learner || $mode == validation ]] || { echo 'Unknown scenario mode'; exit 1; }
if [[ $mode == learner ]]; then
  python3 - <<'PY'
import json
assert json.load(open('frozen-profile.json'))['status']=='accepted', 'Scenario has not passed acceptance'
PY
fi
mkdir -p /root/pup-poc/evidence
bash prepare-workload.sh
python3 ensure-monitors.py
if [[ $mode == learner ]]; then
  python3 learner-gate.py frozen-profile.json
else
  # Healthy setup; the detached validation controller owns subsequent fault injection.
  for attempt in 1 2 3 4 5; do
    kubectl -n storedog exec pup-traffic -- python3 /probe/fixed-traffic.py --workload /tmp/workload.json --duration 180 > "/root/pup-poc/evidence/setup-warmup-$attempt.jsonl"
    if python3 window-gates.py "/root/pup-poc/evidence/setup-warmup-$attempt.jsonl" --rate "${PUP_RATE:-5}" --mode healthy; then
      touch /root/pup-poc/validation-ready
      exit 0
    fi
  done
  echo 'Healthy setup never qualified' >&2
  exit 1
fi
