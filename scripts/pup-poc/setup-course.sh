#!/bin/bash
# Course setup entry point after the existing Kubernetes/OpenCode setup.
set -euo pipefail
cd /root/pup-recovery
: "${DD_ENV:?Unique sandbox environment is required}"
mode=${PUP_SCENARIO_MODE:-learner}
[[ $mode == learner || $mode == validation ]] || { echo 'Unknown scenario mode'; exit 1; }
if [[ $mode == learner ]]; then
  rm -f /root/pup-poc/requests-ready /root/pup-poc/incident-ready /root/pup-poc/evidence/requests-ready.json /root/pup-poc/evidence/incident-ready.json
  settings=$(python3 - <<'PY'
import hashlib,json,pathlib
profile=json.load(open('frozen-profile.json'))
assert profile['status']=='accepted', 'Scenario has not passed acceptance'
assert profile['inputs'], 'Frozen input hashes are missing'
for name,digest in profile['inputs'].items():
    assert hashlib.sha256(pathlib.Path(name).read_bytes()).hexdigest()==digest, 'Frozen input changed: '+name
assert profile['candidate']==json.load(open('candidate.json')), 'Candidate changed'
assert profile['catalog_products'] in (5000,10000) and profile['rate'] in (5,10)
print(profile['catalog_products'],profile['rate'])
PY
  )
  read -r PUP_CATALOG_PRODUCTS PUP_RATE <<< "$settings"
  export PUP_CATALOG_PRODUCTS PUP_RATE
fi
mkdir -p /root/pup-poc/evidence
watchers=()
finish_setup() {
  result=$?
  trap - EXIT
  set +e
  restore_result=0
  restoration_attempted=false
  if [[ $result != 0 && $mode == learner ]]; then
    systemctl stop pup-course-traffic pup-course-monitors pup-course-resources pup-course-telemetry 2>/dev/null
    restoration_attempted=true
    timeout 25 kubectl -n storedog patch statefulset postgres --type strategic --patch-file postgres-healthy-patch.json > /root/pup-poc/evidence/setup-restoration.log 2>&1
    restore_result=$?
    if [[ $restore_result == 0 ]]; then
      timeout 120 kubectl -n storedog rollout status statefulset/postgres --timeout=110s >> /root/pup-poc/evidence/setup-restoration.log 2>&1
      restore_result=$?
    fi
  fi
  for pid in "${watchers[@]}"; do kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null; done
  printf '{"stage":"setup","process_exit":%s,"restore_exit":%s,"restoration_attempted":%s,"completed_at":"%s"}\n' "$result" "$restore_result" "$restoration_attempted" "$(date -u +%FT%TZ)" > /root/pup-poc/evidence/setup-completed.json
  if [[ $result != 0 && ${PUP_BACKGROUND_PREPARATION:-0} != 1 ]]; then
    cp /root/pup-poc/evidence/setup-completed.json /root/pup-poc/evidence/completed.json
    for attempt in $(seq 1 12); do
      [[ -f /root/pup-recovery/export-complete ]] && break
      sleep 5
    done
  fi
  exit "$result"
}
trap finish_setup EXIT
python3 ensure-monitors.py &
monitor_pid=$!
watchers+=("$monitor_pid")
python3 preparation-status.py --stage "preparing the catalog"
python3 startup-event.py catalog-start
bash prepare-workload.sh
python3 startup-event.py catalog-ready
if [[ $mode == learner ]]; then
  python3 - <<'PY'
import json
profile=json.load(open('frozen-profile.json'));catalog=json.load(open('catalog-v1.json'))
assert catalog['content_sha256']==profile['catalog_checksum'], 'Seeded catalog differs from accepted profile'
assert json.load(open('workload.json'))['rate']==profile['rate'], 'Workload rate changed'
PY
fi
kubectl get nodes -o json > /root/pup-poc/evidence/node-capacity.json
kubectl -n storedog get deployment backend -o jsonpath='{.spec.template.spec.containers[0].resources}' > /root/pup-poc/evidence/setup-backend-resources.json
kubectl -n storedog get statefulset postgres -o jsonpath='{.spec.template.spec.containers[0].resources}' > /root/pup-poc/evidence/setup-postgres-resources.json
cp catalog-v1.json workload.json candidate.json /root/pup-poc/evidence/
python3 watch-resources.py &
watchers+=("$!")
python3 watch-telemetry.py &
watchers+=("$!")
python3 preparation-status.py --stage "warming product requests"
python3 startup-event.py warmup-start
warm_timeout=2400
[[ $mode == learner ]] && warm_timeout=60
timeout "$warm_timeout" kubectl -n storedog exec pup-traffic -- python3 /probe/warm-workload.py --workload /tmp/workload.json > /root/pup-poc/evidence/prewarm.jsonl
python3 startup-event.py warmup-ready
# Prewarming is separate from the required fixed-arrival healthy gate.
if [[ $mode == validation ]]; then
healthy=0
for attempt in 1 2 3 4 5; do
  kubectl -n storedog exec pup-traffic -- python3 /probe/fixed-traffic.py --workload /tmp/workload.json --duration 180 --stream > "/root/pup-poc/evidence/setup-warmup-$attempt.jsonl"
  if python3 window-gates.py "/root/pup-poc/evidence/setup-warmup-$attempt.jsonl" --rate "${PUP_RATE:-5}" --mode healthy; then
    healthy=1
    break
  fi
done
[[ $healthy == 1 ]] || { echo 'Healthy setup never qualified' >&2; exit 1; }
fi
sha256sum fixed-traffic.py workload.py warm-workload.py workload.json catalog-v1.json candidate.json > /root/pup-poc/evidence/setup-inputs.sha256
wait "$monitor_pid"
if [[ $mode == learner ]]; then
  # Hand off observers before the setup process exits.
  for pid in "${watchers[@]}"; do kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true; done
  watchers=()
  python3 start-learner-observers.py
  python3 learner-gate.py frozen-profile.json
fi
