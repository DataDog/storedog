#!/bin/bash
set -euo pipefail
export PUP_BACKGROUND_PREPARATION=1
export KUBECONFIG=/root/.kube/config
cd /root/pup-recovery
out=/root/pup-poc/evidence
finish() {
  result=$?
  trap - EXIT TERM INT
  if [[ $result != 0 ]]; then
    set +e
    python3 preparation-status.py --stage preparation --state failed --reason 'Preparation did not complete; diagnostic evidence was saved'
    systemctl stop pup-course-traffic pup-course-monitors pup-course-resources pup-course-telemetry 2>/dev/null
    restored=1
    if [[ -s $KUBECONFIG ]]; then
      timeout 25 kubectl -n storedog patch statefulset postgres --type strategic --patch-file postgres-healthy-patch.json > "$out/preparation-restoration.log" 2>&1
      restored=$?
      if [[ $restored == 0 ]]; then
        timeout 120 kubectl -n storedog rollout status statefulset/postgres --timeout=110s >> "$out/preparation-restoration.log" 2>&1
        restored=$?
      fi
    fi
    printf '{"stage":"preparation","process_exit":%s,"restore_exit":%s}\n' "$result" "$restored" > "$out/completed.json"
  fi
  rm -f /root/pup-recovery/preparation.env
  exit "$result"
}
trap finish EXIT
trap 'exit 124' TERM INT
python3 preparation-status.py --stage 'starting Kubernetes and the application'
python3 startup-event.py cluster-deploy-start
bash /root/pup-poc/connect-cluster.sh
python3 startup-event.py cluster-api-ready
bash setup-course.sh
# Full application readiness is still required for investigation, not opening.
timeout 180 kubectl -n storedog rollout status deployment --timeout=170s
if [[ ${PUP_SCENARIO_MODE:-learner} == learner ]]; then
  python3 incident-ready.py
  python3 preparation-status.py --stage investigation --state ready
else
  python3 preparation-status.py --stage 'development validation ready'
  touch /root/pup-poc/validation-ready
fi
