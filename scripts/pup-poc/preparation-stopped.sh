#!/bin/bash
# systemd calls this even when preparation is killed before its EXIT trap runs.
set -uo pipefail
cd /root/pup-recovery
[[ ${SERVICE_RESULT:-} == success ]] && exit 0
out=/root/pup-poc/evidence
[[ -f $out/completed.json ]] && exit 0
python3 preparation-status.py --stage preparation --state failed --reason 'Preparation service stopped unexpectedly; diagnostic evidence was saved'
export KUBECONFIG=/root/.kube/config
systemctl stop pup-course-traffic pup-course-monitors pup-course-resources pup-course-telemetry 2>/dev/null || true
restored=1
if [[ -s $KUBECONFIG ]]; then
  timeout 25 kubectl -n storedog patch statefulset postgres --type strategic --patch-file postgres-healthy-patch.json > "$out/preparation-restoration.log" 2>&1
  restored=$?
  if [[ $restored == 0 ]]; then
    timeout 120 kubectl -n storedog rollout status statefulset/postgres --timeout=110s >> "$out/preparation-restoration.log" 2>&1
    restored=$?
  fi
fi
printf '{"stage":"preparation","process_exit":1,"restore_exit":%s}\n' "$restored" > "$out/completed.json"
rm -f /root/pup-recovery/preparation.env
