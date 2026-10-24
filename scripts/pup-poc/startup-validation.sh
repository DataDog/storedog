#!/bin/bash
# Development-only observation after the real learner readiness path.
set -euo pipefail
[[ ${PUP_DEV_INTEGRATION:-0} == 1 ]]
cd /root/pup-recovery
out=/root/pup-poc/evidence
finish() {
  result=$?
  trap - EXIT
  set +e
  systemctl stop pup-course-traffic pup-course-monitors pup-course-resources pup-course-telemetry
  timeout 25 kubectl -n storedog patch statefulset postgres --type strategic --patch-file postgres-healthy-patch.json > "$out/startup-restoration.log" 2>&1
  restored=$?
  if [[ $restored == 0 ]]; then
    timeout 120 kubectl -n storedog rollout status statefulset/postgres --timeout=110s >> "$out/startup-restoration.log" 2>&1
    restored=$?
  fi
  printf '{"stage":"startup","process_exit":%s,"restore_exit":%s}\n' "$result" "$restored" > "$out/completed.json"
  for attempt in $(seq 1 30); do
    [[ -f /root/pup-recovery/export-complete ]] && break
    sleep 2
  done
  touch /root/pup-poc/integration-complete
  exit "$result"
}
trap finish EXIT
trap 'exit 124' TERM INT
# Let the fresh Alert/trace deadlines elapse without delaying learner readiness.
sleep 185
