#!/bin/bash
# Run as a detached systemd service on disposable lab-host.
set -euo pipefail
# GNU timeout signals the whole controller process group, including an active
# calibration subprocess, then allows four minutes for restoration and export.
if [[ ${PUP_CONTROLLER_CHILD:-0} != 1 ]]; then
  seconds=3300
  if [[ ${PUP_RUN_MODE:-cycles} == calibrate ]]; then
    seconds=$(python3 - <<'PY'
import json,pathlib,time
path=pathlib.Path('/root/pup-poc/evidence/prewarm.jsonl')
seconds=2700
age=None
if path.exists():
    summary=json.loads(path.read_text().splitlines()[-1])
    assert summary['type']=='prewarm-summary' and summary['requests']==summary['valid']
    age=time.time()-path.stat().st_mtime+summary['elapsed_s']
    seconds=min(seconds,int(3600-age-180))
assert seconds>=300, 'Insufficient normal cache lifetime: resume calibration in a fresh sandbox'
path.parent.mkdir(parents=True,exist_ok=True)
(path.parent/'calibration-budget.json').write_text(json.dumps({'seconds':seconds,'cache_age_s':age,'cache_ttl_s':3600,'margin_s':180})+'\n')
print(seconds)
PY
    )
  fi
  exec timeout --signal=TERM --kill-after=240s "$seconds" env PUP_CONTROLLER_CHILD=1 bash "$0"
fi
export KUBECONFIG=/root/.kube/config
cd /root/pup-recovery
evidence=/root/pup-poc/evidence
mkdir -p "$evidence/monitors"
# A watchdog bounds development validation even if the controller hangs.
: "${DD_ENV:?Set a unique environment for this sandbox}"
: "${PUP_RATE:=5}"
: "${PUP_RUN_MODE:=cycles}"
[[ $PUP_RUN_MODE == cycles || $PUP_RUN_MODE == soak || $PUP_RUN_MODE == calibrate ]] || exit 2
if [[ $PUP_RUN_MODE != calibrate ]]; then : "${PUP_FAULT_CPU:?Use the frozen calibrated CPU limit}"; fi
watchers=()
finish() {
  result=$?
  trap - EXIT TERM INT
  set +e
  timeout 25 kubectl -n storedog patch statefulset postgres --type strategic --patch-file postgres-healthy-patch.json >> "$evidence/run.log" 2>&1
  restore_result=$?
  if [[ $restore_result == 0 ]]; then
    timeout 120 kubectl -n storedog rollout status statefulset/postgres --timeout=110s >> "$evidence/run.log" 2>&1
    restore_result=$?
  fi
  for pid in "${watchers[@]}"; do kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null; done
  # Cover the final polling interval before declaring the evidence complete.
  timeout 25 python3 watch-telemetry.py --errors-only --once >> "$evidence/run.log" 2>&1
  if [[ $? != 0 ]]; then result=1; fi
  printf '{"process_exit":%s,"restore_exit":%s,"completed_at":"%s"}\n' "$result" "$restore_result" "$(date -u +%FT%TZ)" > "$evidence/completed.json"
  for attempt in $(seq 1 12); do
    [[ -f /root/pup-recovery/export-complete ]] && break
    sleep 5
  done
  rm -f /root/pup-recovery/runtime.env
  touch /root/pup-poc/integration-complete
  exit "$result"
}
trap finish EXIT
trap 'exit 124' TERM INT
exec >> "$evidence/run.log" 2>&1
postgres_change=$(kubectl -n storedog patch statefulset postgres --type strategic --patch-file postgres-healthy-patch.json)
echo "$postgres_change"
backend_change=$(kubectl -n storedog patch deployment backend --type strategic --patch-file backend-healthy-patch.json)
echo "$backend_change"
kubectl -n storedog rollout status statefulset/postgres --timeout=120s
kubectl -n storedog rollout status deployment/backend --timeout=120s
[[ -f catalog-v1.json ]] || bash prepare-workload.sh
cp -R monitors "$evidence/definitions"
cp monitors/*.json "$evidence/monitors/"
cp fixed-traffic.py workload.py reuse-warmup.py backlog-gate.py warm-workload.py healthy-restart.py repeat-cycles.py run-live.sh backend-healthy-patch.json postgres-healthy-patch.json "$evidence/"
cp catalog-v1.json workload.json course-profile.json candidate.json "$evidence/"
kubectl -n storedog get deployment backend -o jsonpath='{.spec.template.spec.containers[?(@.name=="backend")].image}' > "$evidence/backend-image.txt"
kubectl -n storedog get deployment backend -o json | python3 -c '
import json,sys
backend=next(c for c in json.load(sys.stdin)["spec"]["template"]["spec"]["containers"] if c["name"]=="backend")
print(json.dumps({"image":backend["image"],"resources":backend["resources"],
                  "timeouts":{e["name"]:e.get("value") for e in backend.get("env",[]) if e["name"].startswith("PUP_DB_")}},indent=2))
' > "$evidence/backend-config.json"
sha256sum prepare-background.sh preparation-stopped.sh start-preparation.py preparation-status.py incident-ready.py setup-course.sh prepare-workload.sh learner-gate.py readiness.py start-learner-observers.py startup-event.py watch-telemetry.py watch-monitors.py monitors/*.json fixed-traffic.py workload.py reuse-warmup.py backlog-gate.py warm-workload.py healthy-restart.py workload.json catalog-v1.json course-profile.json repeat-cycles.py run-live.sh backend-healthy-patch.json postgres-healthy-patch.json > "$evidence/frozen-inputs.sha256"
kubectl get nodes -o json > "$evidence/node-capacity.json"
pup version > "$evidence/pup-version.txt"
python3 ensure-monitors.py
python3 watch-monitors.py &
watchers+=("$!")
python3 watch-resources.py &
watchers+=("$!")
python3 watch-metrics.py &
watchers+=("$!")
python3 watch-telemetry.py &
watchers+=("$!")
if [[ $PUP_RUN_MODE == calibrate ]]; then
  args=(--rate "$PUP_RATE")
  if [[ -n ${PUP_CALIBRATION_RESUME:-} ]]; then args+=(--resume "$PUP_CALIBRATION_RESUME"); fi
  python3 calibrate.py "${args[@]}"
  exit $?
fi
healthy=0
if [[ $PUP_RUN_MODE == cycles ]]; then
  python3 healthy-restart.py --rate "$PUP_RATE" --output "$evidence"
  healthy=1
elif [[ $postgres_change == *"(no change)"* && $backend_change == *"(no change)"* ]]; then
  if python3 reuse-warmup.py --rate "$PUP_RATE" --output "$evidence"; then healthy=1; fi
fi
if [[ $healthy != 1 ]]; then
for attempt in 1 2 3 4 5; do
  kubectl -n storedog exec pup-traffic -- python3 /probe/fixed-traffic.py --workload /tmp/workload.json --rate "$PUP_RATE" --duration 180 > "$evidence/warmup-$attempt.jsonl"
  if python3 window-gates.py "$evidence/warmup-$attempt.jsonl" --rate "$PUP_RATE" --mode healthy > "$evidence/warmup-$attempt.gate.json"; then
    healthy=1
    break
  fi
done
fi
[[ $healthy == 1 ]] || { echo 'Healthy warmup failed'; exit 1; }
if [[ $PUP_RUN_MODE == soak ]]; then
  python3 repeat-cycles.py --name frozen-repeat --cpu "$PUP_FAULT_CPU" --rate "$PUP_RATE" --workload /tmp/workload.json --cycles 1 --fault-seconds 2400 --recovery-seconds 360
else
  python3 repeat-cycles.py --name frozen-repeat --cpu "$PUP_FAULT_CPU" --rate "$PUP_RATE" --workload /tmp/workload.json --cycles 3
fi
