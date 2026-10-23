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
watchers=()
finish_setup() {
  result=$?
  trap - EXIT
  set +e
  for pid in "${watchers[@]}"; do kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null; done
  printf '{"stage":"setup","process_exit":%s,"restore_exit":0,"completed_at":"%s"}\n' "$result" "$(date -u +%FT%TZ)" > /root/pup-poc/evidence/setup-completed.json
  if [[ $result != 0 ]]; then
    cp /root/pup-poc/evidence/setup-completed.json /root/pup-poc/evidence/completed.json
    for attempt in $(seq 1 12); do
      [[ -f /root/pup-recovery/export-complete ]] && break
      sleep 5
    done
  fi
  exit "$result"
}
trap finish_setup EXIT
kubectl get nodes -o json > /root/pup-poc/evidence/node-capacity.json
kubectl -n storedog get deployment backend -o jsonpath='{.spec.template.spec.containers[0].resources}' > /root/pup-poc/evidence/setup-backend-resources.json
kubectl -n storedog get statefulset postgres -o jsonpath='{.spec.template.spec.containers[0].resources}' > /root/pup-poc/evidence/setup-postgres-resources.json
cp catalog-v1.json workload.json candidate.json /root/pup-poc/evidence/
python3 watch-resources.py &
watchers+=("$!")
python3 watch-telemetry.py &
watchers+=("$!")
timeout 2400 kubectl -n storedog exec pup-traffic -- python3 /probe/warm-workload.py --workload /tmp/workload.json > /root/pup-poc/evidence/prewarm.jsonl
# Prewarming is separate from the required fixed-arrival healthy gate.
healthy=0
for attempt in 1 2 3 4 5; do
  kubectl -n storedog exec pup-traffic -- python3 /probe/fixed-traffic.py --workload /tmp/workload.json --duration 180 --stream > "/root/pup-poc/evidence/setup-warmup-$attempt.jsonl"
  if python3 window-gates.py "/root/pup-poc/evidence/setup-warmup-$attempt.jsonl" --rate "${PUP_RATE:-5}" --mode healthy; then
    healthy=1
    break
  fi
done
[[ $healthy == 1 ]] || { echo 'Healthy setup never qualified' >&2; exit 1; }
if [[ $mode == learner ]]; then
  python3 learner-gate.py frozen-profile.json
else
  touch /root/pup-poc/validation-ready
fi
