# Task 137 preflight

## Course candidate (task 137, 2026-10-23)

The new candidate is **not accepted**. The older 16-product experiments below
remain historical evidence; they do not validate this catalog or resolve the
connection-pool failure.

Backend source: `b8426ca64391474ac2416254fd82caf055f756fa`.
[Candidate workflow](https://github.com/DataDog/storedog/actions/runs/40027519105)
published `pup-course-b8426ca64391474ac2416254fd82caf055f756fa` with digest
`sha256:5f29264f192cd3ca4fb6a85809ed47ee88881cb6fa609c1d186411deb92d1aa2`.
`Dockerfile.pup-course` layers only the opt-in catalog and database configuration
onto the previously pinned backend digest. The candidate also pins the
upstream `pg` 1.4.6 driver (source gem SHA-256 verified) because 1.3.0 ignores
`connect_timeout` in asynchronous connect/reset; see
[upstream fix #459](https://github.com/ged/ruby-pg/pull/459). The overlay changes
only that lock entry. The general backend lockfile remains unchanged.
No general release or `latest` tag
is changed. `course-images.lock.json` differs from `images.lock.json` only in the
backend entry plus candidate metadata. The course renderer retains every other
service digest and the existing Kubernetes topology, OpenCode/Bedrock and disabled MCP.

The explicit `bundle exec rake pup_course:seed` task defaults to 5,000 products,
20 category children, two non-master variants, USD prices, stock and a shared
bundled image fixture. Its namespace is `pup-course-v1`; existing sample products
are preserved. Bounded 100-product transactions support interrupted seed recovery;
`ANALYZE` and atomic manifest publication happen after completion. Use
`PUP_CATALOG_PRODUCTS=10000` for the alternate profile. Use fresh databases when
moving to a smaller catalog. No seed runs during ordinary backend startup.

`prepare-workload.sh` runs once during healthy course setup and installs the
catalog and workload in the generator. Catalog manifests are transferred to
`/tmp` rather than ConfigMaps because 10,000-product manifests exceed the
ConfigMap size limit. Traffic rotates three catalog pages then two category
pages, using 25 products/page and `default_variant,images,primary_variant,taxons`.
Catalog browsing is scoped to the course taxonomy root so the manifest can
validate exact IDs without depending on the pre-existing sample inventory.

`PUP_DB_STATEMENT_TIMEOUT_MS=5000`, `PUP_DB_LOCK_TIMEOUT_MS=1000`, and
`PUP_DB_CONNECT_TIMEOUT=3` affect new database connections only. Unset variables
preserve default configuration. The 15-second Rack timeout, pool, indexes,
prepared statements and caching are unchanged.

### Native healthy baseline checkpoint

The current candidate passed the native healthy database restart in sandbox
`i37njmty7xcl`: 900/900 valid requests at 5 rps, no dropped arrivals, minute p95
112/96/92 ms, and no captured Rack timeout or pool checkout errors. Its initial
400-page prewarm took 465 seconds; the initial healthy gate was 900/900 with
minute p95 99/98/102 ms. This validates the measured reconnect safeguard, not
the earlier unresolved persistent pool failure.

Initial CPU trials with this candidate excluded the first minute after rollout:

| PostgreSQL CPU | Valid requests per minute | Minute p95 (seconds) | Outcome |
| --- | --- | --- | --- |
| 250m | 300 / 300 / 300 | .187 / .192 / .190 | Too fast |
| 125m | 2 / 2 / 1 | 10.012 / 10.012 / 10.012 | Too severe |
| 187m | 300 / 299 / 300 | 5.195 / 4.400 / 2.900 | Above target in first two windows |
| 218m | 300 / 300 / 300 | .148 / .148 / .161 | Too fast |
| 202m | 300 / 300 / 300 | .174 / .175 / .179 | Too fast |

Calibration stopped before normal cache expiry, restored healthy CPU, and
exported complete evidence. A fresh sandbox resumes the 187–202m boundary;
there is no frozen or accepted CPU yet. Evidence:
`evidence/2026-10-23-native-driver-calibration/`.

The preceding candidate's diagnostic baseline follows for comparison.

On 2026-10-23, sandbox `gkp8yscwzklg` passed three healthy one-minute
windows after prewarming all 400 unique pages: 900/900 valid responses at
5 rps, zero dropped arrivals, and p95 118/131/129 ms. Prewarming took 606 seconds.
Both backend and PostgreSQL limits were 1 CPU/2 GiB. Recent measured CPU was
approximately 0.33 cores for the backend and 0.16 for PostgreSQL.

Before prewarming, cold-page traffic saturated backend CPU and timed out,
including a diagnostic attempt at 2 backend CPUs. Isolated cached requests
were fast. This sandbox had deliberate backend rollouts and a paused traffic
process during diagnosis, so it cannot count toward fresh-sandbox acceptance.
The successful healthy gate is separate from the earlier failed attempts.
The first calibration baseline after a healthy database restart had four
initial request timeouts; stack frames pointed to `PG::Connection#reset` waiting
without a timeout in driver 1.3.0. Calibration was stopped, resources restored,
and complete evidence exported. Testing only the `connect_timeout` configuration
value had missed this bug; the regression now stalls actual connect and reset
sockets. This diagnosis does not establish the cause of the earlier persistent
pool failure. CPU calibration and all acceptance cycles remain pending. Evidence: `evidence/2026-10-23-native-baseline3-export/`.

### Development validation

The private development course runs `setup-course.sh` in validation mode when
`PUP_DEV_INTEGRATION=1`; this starts healthy and requires three clean one-minute
windows below 200 ms. Before this gate, `warm-workload.py` visits every unique
manifest page with at most two concurrent requests, without changing application
cache settings. Prewarm results are separate from offered-rate measurements;
setup fails if any prewarm response is invalid. Learner mode requires an accepted `frozen-profile.json`,
then sustained fault symptoms and latency Alert before publishing readiness.
No accepted profile exists yet. The learner traffic service lasts one hour.
Each cycle sandbox first tests a healthy PostgreSQL restart under five minutes
of uninterrupted offered traffic. The final three one-minute windows must meet
the healthy gate, the database pod UID must change, and backend/PVC identities
must remain unchanged. This is separate from the earlier post-readiness restart
measurements and remains pending native execution. The soak reuses the measured setup gate only within two minutes, with
matching workload hashes and unchanged healthy resource patches; otherwise they
measure a fresh three-minute gate. Calibration always requalifies after rollouts.

Run the detached `run-live.sh` controller with a private EnvironmentFile containing
`DD_ENV` (the unique sandbox environment), required Pup credentials and:

- `PUP_RUN_MODE=calibrate`, `PUP_RATE=5`: test one catalog/rate combination.
- `PUP_RUN_MODE=cycles`, `PUP_FAULT_CPU=<calibrated limit>`, `PUP_RATE=<frozen rate>`:
  three continuous 180-second fault / 360-second recovery cycles.
- `PUP_RUN_MODE=soak`: one continuous 2,400-second fault and 360-second recovery.

Use `collect-live.py SSH_HELPER OUTPUT --seconds 3600` independently of the
controller. The setup exporter can run for two hours to cover cold-cache setup;
validation restarts its export deadline at one hour. Cycles and soak have a
55-minute watchdog. Calibration uses at most 45 minutes, shortened further
when needed to stay three minutes inside the normal one-hour cache lifetime;
its checkpoint is resumed in a fresh sandbox. Cache expiry remains part of the
full acceptance soak. The controller restores PostgreSQL CPU,
exports lifecycle status and waits for export acknowledgement before releasing
the development hold. The course hold accepts 60–3,600 seconds, development only.
Missing evidence fails acceptance even when lifecycle cleanup succeeds.

Calibration tries 250m, 125m, 60m, 30m, 20m and 10m, excluding the first minute
after readiness. A resolved nonqualifying 1m boundary is not repeatedly refined
for every lower coarse trial; all remaining coarse limits are still tested.
Resume permits one audited search-only controller update, preserving each
measurement's original profile and both controller hashes in exported provenance;
any changed workload, candidate, catalog, rate or unknown controller is rejected.
Each trial excludes the first minute
**after rollout readiness**, then requires three consecutive minutes with p95
1–3 seconds, at least 95% valid responses, no drops or queued arrivals, and no
application/pool timeout errors. It bisects each promising fast-to-slow boundary to 1m resolution, including
when coarse steps skip the 1–3 second band. CPU monotonicity is a search heuristic;
the selected integer still requires independent acceptance and soak validation. This can exceed a single development
hold; an interrupted sweep is inconclusive and must not be promoted. Resume using `calibrate.py --resume EXPORTED/calibration-state.json` with the same catalog checksum and rate. The ordered
catalog/rate combinations are in `course-profile.json`; use a fresh sandbox for
each combination, stopping at the first qualifying combination. A calibration
HTTP candidate is not scenario acceptance. Before freezing, `freeze-scenario.py`
requires the selected `candidate-<cpu>.traffic.jsonl` alongside the calibration
result and rejects growing outstanding HTTP requests. Install the measured
`workload.json` in this directory before freezing; the script requires an exact
match and binds its endpoint and rate into the accepted input hashes. `backlog-gate.py` compares
the first and last steady windows, allowing at most one additional average
in-flight request for boundary jitter. The same criterion applies to each
continuous fault and the full soak; timeout/pool gates remain separate.

Before acceptance, freeze the candidate image, catalog checksum, rate, CPU,
timeouts, request code and monitor definitions. `acceptance.py DIR1 DIR2 DIR3
--soak SOAK_DIR --output acceptance.json` requires three distinct sandbox environments,
matching workload settings, complete exports, per-minute fault gates, final healthy
HTTP windows, latency Alert before fault removal, both monitors sustained OK, correlated product SQL,
container/node headroom (80% CPU and working-set memory limits, with total
cgroup memory and OOM counters retained), fresh environment-scoped Pup CPU and
throttling metrics throughout each measured window, local DB throttling,
unchanged PVC/backend identity and no pool
or application timeout errors. Do not create an accepted learner profile until all
checks pass. Reset with `postgres-healthy-patch.json`; never delete PVCs or restart
the backend as a recovery workaround.

Local functional evidence is in `evidence/2026-10-23-course-local/`: 40 products,
interruption after product 7, repeat seed/manifests/associations, database-native
statement and lock cancellation followed by connection reuse, unchanged default
configuration, 100 real API requests across all categories, and a healthy DB
restart under continuous 1 rps (final 60/60 valid, zero drops). This used AMD64
emulation and PostgreSQL 17, so it establishes no native PostgreSQL 15 CPU calibration. The revised bulk-seed
functional check subsequently passed at 5,000 products (25.23 seconds under
emulation), including repeat manifests, associations and the final API page.
The first native candidate was stopped after 513 products in 251 seconds;
that failed setup motivated bulk seeding and is saved in `evidence/2026-10-23-psfxjg5jxc5t/`. Run `tests/integration.sh` for disposable
seed/safeguard checks and `python3 -m unittest discover -s tests -v` for workload
and window-gate tests.

The current driver candidate also passed actual stalled socket connect/reset
checks at three seconds, interrupted bulk seeding at product 107 with 100
committed, completion to 140 without duplicates, and a full 5,000-product seed
and repeat (24.66 seconds for the initial seed under emulation). The Python
suite currently has 23 passing tests, including rejection of absent, stale,
wrong-environment and sparse Pup metrics.


Status: live integration and telemetry verified. Three continuous cycles completed
on 2026-10-23 with clean recovery, but the 30m CPU fault failed sustained-symptom
acceptance. Fault calibration and course acceptance remain open.
Read backlog 137 and mem 286 before changing the scenario.

## Latest repeat result: fault calibration failed

Sandbox `x1vujnl5hlqu`, 2026-10-23 13:46–14:08 UTC. All 6600 offered requests
were recorded at fixed 5 rps with zero dropped arrivals, through three unchanged
120-second PostgreSQL 30m CPU phases and 300-second 1-CPU recovery phases.
Memory stayed at 2 GiB. PVC identities and the backend pod/restart count stayed
unchanged. The API gate passed 150/150 requests before the continuous run.

| Cycle | Final fault minute | Fault p95 | Final recovery 2 minutes | Recovery p95 |
| --- | --- | --- | --- | --- |
| 1 | 300/300 HTTP 200 | 138 ms | 600/600 HTTP 200 | 38 ms |
| 2 | 300/300 HTTP 200 | 111 ms | 600/600 HTTP 200 | 36 ms |
| 3 | 300/300 HTTP 200 | 82 ms | 600/600 HTTP 200 | 37 ms |

Both frozen monitors alerted and returned to sustained OK, and fresh PostgreSQL
spans matched successful recorded product request trace IDs after every restore.
Prepared-statement spans can have resources such as `a4`; correlation uses the
trace ID and `pg.*` operation, rather than requiring literal SQL in the resource.
No connection-pool checkout errors were captured. The earlier pool failure has
not been diagnosed or fixed; this weaker fault is not evidence of resilience to
the earlier sustained overload.

The steady fault windows used approximately 0.016 CPU with only 11.6–13.8% of
PostgreSQL CPU periods throttled, versus approximately 98% in earlier sandboxes.
Backend/generator/node headroom remained available, with no sampled OOM kills.
The strongest errors were rollout interruptions. **Do not count these as three
passing scenario acceptance cycles:** 30m is not a dependable sustained fault
across the observed runs. Recalibrate using warmed steady windows separately from
rollout transitions before freezing the learner scenario.

The detached runner, 15-second collector, final export acknowledgment, healthy
resource restoration, and integration-hold release all completed automatically.
Lifecycle test success still does not imply scenario acceptance because challenge
checks are unimplemented. Evidence and assessments:
`evidence/2026-10-23-x1vujnl5hlqu/`. The failed startup attempts `beuoffpzfmzf`
and `yheiyyzgg3f9` also have exported failure evidence; their harness issues
(systemd kubeconfig and duplicate monitor creation) were corrected before this run.

## Detached validation and evidence collection

`run-live.sh` runs on lab-host as a bounded systemd service, with an explicit
`KUBECONFIG=/root/.kube/config`. Provision only the required Datadog environment
variables through a private mode-600 EnvironmentFile on that VM. Do not copy
credentials into this repository or the evidence directory.

The runner applies healthy resources, validates/reuses exact-name monitors tagged
for this project/task/environment/service, checks API health, then runs three
unchanged 5-rps cycles: 120 seconds at 30m PostgreSQL CPU followed by 300 seconds
at 1 CPU. `watch-monitors.py`, `watch-resources.py`, and `watch-telemetry.py` save
observations throughout. Monitor definitions and input hashes are saved before
traffic testing; definitions stay unchanged throughout the cycles. Existing
monitors survive sandbox teardown, so creation must be idempotent.

Run `collect-live.py SSH_HELPER OUTPUT_DIRECTORY` independently of the chat
session (on macOS, `nohup caffeinate -i python3 ...`). It snapshots the dedicated
evidence directory every 15 seconds, atomically replaces local files, and
acknowledges the final export. This survives chat interruption while the local
collector and network remain available; it cannot guarantee export if the
laptop shuts down or loses network access. The remote runner restores healthy
database resources and releases the integration hold even if export is unavailable.
Bound the runner with `timeout --signal=TERM --kill-after=90 1600` and allow
systemd at least 100 seconds for cleanup. Start promptly after lifecycle readiness
to stay inside the 30-minute integration hold.

`assess-run.py OUTPUT_DIRECTORY` rejects missing evidence, dropped arrivals,
changed PVCs/backend pods, unsuccessful final recovery windows, missing monitor
alerts/sustained OK, and absent fresh product SQL spans. Its result covers HTTP,
monitor and trace gates; resource headroom still needs review. A completed
lifecycle or zero runner exit code alone is not scenario acceptance.

## Recovery investigation checkpoint, 2026-10-23

Sandbox `kwz2bxq7u0qw` ran uninterrupted 5 rps through a healthy PostgreSQL
restart, a 120-second 30m CPU fault, and resource restoration. The deployed
backend uses Rails 6.1.4.4, Puma 5.6.2, pg 1.3.0 and Rack::Timeout 0.6.0,
with a 25-connection pool and five request threads per worker (two workers).

- Baseline: 300/300 successful, p95 58 ms.
- Healthy restart: 15 failures in the transition; subsequent 900/900 successful.
- CPU fault: 6/600 successful, p95 approximately 10 seconds.
- Restore: 51 failures in the transition; subsequent 1200/1200 successful,
  p95 62 ms, without restarting the backend.

This run did not reproduce the previous persistent pool failure. Rack timeout
exceptions occurred during the fault, but the precise cause of the earlier
pool exhaustion is **not established or fixed**. Do not increase pool size
based solely on the earlier error message.

Pup verified `trace.rack.request` latency distributions and `.hits`/`.errors`
counts. Both trial monitors alerted. Definitions in `monitors/` are candidates:
500 ms p95 and 1% error rate, with separate recovery thresholds. Missing-data
handling was revised during the experiment, so these are not frozen acceptance
results. The error ratio uses a 60-second evaluation delay; latency missing data
must remain distinguishable from healthy traffic. Relevant guidance:
[trace metrics](https://docs.datadoghq.com/tracing/metrics/metrics_namespace/),
[missing-data options](https://docs.datadoghq.com/monitors/guide/on_missing_data/),
[Rack::Timeout risks](https://github.com/zombocom/rack-timeout/blob/main/doc/risks.md).

The agent session was interrupted and the sandbox hold expired at approximately
04:59 UTC. The completed control summary survived in local SSH output, but only
3344/3600 raw request records had been exported. Two queued repeat cycles have
no recoverable outcome and must not count toward acceptance. See
`evidence/2026-10-23/evidence-status.json` for provenance and limitations.
Before the next live run, automate evidence export and hold release independently
of agent interaction; then repeat with unchanged monitor definitions and traffic.

## CPU calibration checkpoint

Sandbox `9nwkhutoskyr`, 2026-10-22. The generator runs on the control-plane
node using the locked discounts image's Python interpreter, targets the
`service-proxy` service, and offers 5 requests/second independently of response
latency. It records every arrival, timeout and dropped arrival. Requests use
explicit trace IDs and sampling priority 2. Every successful response contained
the same 16 products. Five recorded successful product requests matched ingested
PostgreSQL spans, including SQL against `spree_products`.

Healthy resource limits: PostgreSQL 1 CPU/2 GiB (requests 500m/512 MiB), backend
1 CPU/2 GiB (requests 250m/512 MiB), generator 1 CPU/512 MiB (requests 250m/128 MiB).
The initial backend 500m limit throttled during warmup and some steady-state
bursts, so the final baseline uses 1 CPU. Other app resources remain unchanged.
Fault phases change only PostgreSQL CPU request/limit; memory stays constant.

| Measured phase | HTTP 200 / offered | p95 | PostgreSQL throttled periods |
| --- | --- | --- | --- |
| Baseline, 1 CPU | 600 / 600 | 55 ms | 0% |
| Fault, 20m CPU | 83 / 600 | 10.01 s (timeout dominated) | 98.1% |
| Restored, 1 CPU | 600 / 600 | 56 ms | 0% |
| Fault, 50m CPU | 600 / 600 | 175 ms | 25.0% |
| Restored after 50m, 1 CPU | 600 / 600 | 57 ms | see resource evidence |
| Fault, 30m CPU | 424 / 600 | 10.01 s (timeout dominated) | 98.4% |
| Initial restore after 30m (60 s) | 285 / 300 | 117 ms | see resource evidence |
| Restore confirmation after 30m (90 s) | 416 / 450 | 5.03 s | see resource evidence |

No arrivals were dropped in these windows. During the 20m fault the backend used
0.178 CPU, generator 0.008 CPU, and neither had material CPU throttling; the DB
used 0.0195 CPU. No sampled container had an OOM kill. At 50m both Kubernetes
nodes averaged approximately 0.60 CPU, with working sets below 3.5 GiB.
Pup retrieved slow product SQL spans (up to 3.28 seconds), PostgreSQL CPU metrics,
and throttling metrics. The queried `trace.rack.request.duration` and
`trace.pg.exec.params.duration` metrics returned no series; monitor selection
must use a verified signal. Retrieved backend error logs were startup messages,
not proof of the database fault.

Evidence is in [evidence/2026-10-22](evidence/2026-10-22). Each phase has request
JSONL and resource JSONL; `summarize-phase.py DIRECTORY PHASE` recomputes latency,
CPU use, throttling and memory summaries. Warmup windows are separate because
rollout completion does not imply API readiness. These are calibration runs:
traffic pauses during rollouts, warmup is 45 seconds, and main measured windows are
120 seconds (the final recovery checks are 60 and 90 seconds as labeled). They do **not** satisfy the three continuous fault/fix/reset cycles
or sustained monitor-OK acceptance requirement. PostgreSQL PVC identities and
the product count were preserved.

The 30m candidate had a 6.50-second median and deteriorated during the run:
success counts per 30-second window were 150, 150, 116, then 8 (150 offered
each window). The 20m run's final 90 seconds had no successful requests. These
are sustained overload effects, not only initial restart failures. Neither
30m nor 20m is a steady low-error slow-query setting; 50m is much milder.
Keep this distinction when selecting the teaching scenario and monitor threshold.

**Recovery is not yet reliable.** After the 30m fault, restoring DB CPU left
intermittent HTTP 500s: 15/300 initially and 34/450 in the confirmation window.
Backend logs identify `ActiveRecord::ConnectionTimeoutError` (all pooled
connections in use; 5-second checkout timeout). Fresh DB spans were back to
roughly 1–4 ms, all pods were Ready, and the DB resources/PVC identities were
correct. Do not equate pod readiness or fast SQL with end-to-end recovery.
The pool failure's underlying cause remains to be diagnosed. Error rate must
be checked alongside latency: the first recovery window had a low p95 despite
5% HTTP 500s. The next gate is reliable application recovery, then monitor
thresholds and three continuous-traffic cycles. Evidence was exported and the
integration hold was released before expiry; CLI setup success is not scenario
acceptance.

### Reproduce calibration in a disposable lab

Copy `fixed-traffic.py`, `run-phase.py` and `traffic-pod.json` to lab-host. Create
the `pup-traffic` ConfigMap from the Python file and apply the pod manifest.
The manifest pins the generator image and isolates it on the control-plane.
Apply resource patches with `kubectl -n storedog patch ... --type strategic
--patch-file ...`; the healthy patch files intentionally omit PVC fields.
Wait for rollouts, warm the API, then run `python3 run-phase.py PHASE --rate 5
--duration 120`. Export evidence after each phase, restore healthy DB resources,
and release `/root/pup-poc/integration-complete` before the integration deadline.
Never reset by deleting namespaces or PVCs. CPU thresholds are still candidates;
do not treat these results as final course acceptance.

## Live setup checkpoint

Learning Center commit `d1c713bccba5b940bf5c6aa8e114a971a7c0b0ee` passed
[development deployment](https://github.com/ddoghq/learning-center/actions/runs/39857026696).
Instruqt participant `ox3ml3soqx1p` completed setup in 7m08s
(2026-10-22 21:27:23–21:34:31 UTC). Both Kubernetes nodes were Ready;
all eight Storedog pods and the Datadog agents, cluster agent and operator
were Ready. Lab-host kubectl access worked. Installed versions were Pup
1.10.2 and OpenCode 1.18.18.

The control-plane VM registers as node `kubernetes`; readiness selects its
role and retries while kubeadm initializes. Secret creation uses one JSON
`List`, avoiding invalid JSON streams separated by YAML document markers.

This first checkpoint passed lifecycle setup only: challenge checks are unimplemented.
Bedrock inference, OpenCode invoking Pup, Pup API access, HTTP routing and
actual APM ingestion were pending; see the integration results below. No DB fault has been injected,
and no failure/recovery cycles have been tested. Next establish fixed-rate
traffic and searchable DB spans, then calibrate CPU pressure and run three
fault/fix/reset cycles without changing offered traffic or deleting PVCs.

## Live integration checkpoint

Sandbox `p8odg1uivmyg`, 2026-10-22:

- AWS identity authentication and scoped Pup monitor query succeeded. The
  monitor result was empty, as expected before monitor creation.
- OpenCode 1.18.18 initially rejected the pinned Sonnet 4.5 profile as not found.
  Its catalog filters deprecated models. Explicit `status: active` for the same
  profile in both global and work-directory configurations restored selection.
  The course setup now includes that override; no model/IAM scope was changed.
- Bedrock returned a response and OpenCode completed `pup version`,
  `kubectl -n storedog get pods`, and the scoped read-only Pup monitor query,
  each with exit 0. Effective Datadog MCP was disabled. Session:
  `ses_e9a4e5512ffe2aPxwprhmxXVXH`.
- Agent and Pup API keys matched (compared in memory; no key saved here).
- From 22:18:39 to 22:19:09 UTC, 30 post-startup requests through
  `http://worker/services/backend/api/v2/storefront/products?per_page=25&include=images`
  returned 30 HTTP 200 responses and 16 products each. Median latency was
  67.9 ms; nearest-rank p95 was 335.8 ms. This sequential, paced smoke batch
  is not a fixed-arrival-rate capacity baseline.
- Pup retrieved ingested `store-backend` spans with `component=pg` and
  `db.system=postgresql`. Example: trace `6ada8a9a0000000022b01c72015d17ef`,
  span `1750605069761055204`, timestamp 22:13:46.041 UTC, duration 3.478 ms.
  This was a schema query; a targeted `spree_products` span search returned
  no results. Product-request-to-DB trace correlation remains open.

The integration hold expired at 22:44:35 UTC (exit 124), and Instruqt cleaned up
the sandbox. The overall CLI test therefore failed despite the checks above.
Raw evidence stayed on the disposable VM; this checkpoint records results
captured through SSH. Future sessions must export redacted evidence and release
the hold before its deadline. No DB fault, resource patch, or recovery cycle was
attempted. Next: fixed-rate in-cluster traffic, product DB trace correlation,
CPU/throttling measurements, then fault calibration and three recovery cycles.

## Source baseline

The following baseline and findings describe the initial source inspection;
the live checkpoint above records subsequent implementation and validation.

- Storedog: `e4cc63f5e7547f770c16c1a8e65bacd4a4873ddd`.
- Learning Center: `410b51d23ca08a5396c664030b790e0ac6a7248f`.
- Template: `templates/k8s-template-storedog`.
- Existing agent integration: `courses/getting-started-pup/labs/01-monitor-investigation`.
- Source snapshots above are inspection references, not a validated release combination.

## Initial source findings

| Area | Evidence and required follow-up |
| --- | --- |
| Ingress | Challenge setup applies `storedog-app/ingress/nginx-ingress.yaml`, absent from current Storedog. Current nginx uses host networking on port 80. Remove obsolete ingress setup and cache entries; verify nginx placement on the node used by the lab URL. |
| Manifest pin | Template clones shallow `main` despite using image tag 1.5.0. Select an immutable manifest commit and validate it with locked images. |
| Container availability | All seven Storedog 1.5.0 images resolve in GHCR; digests are in `images.lock.json`. Pull/run tests remain outstanding. |
| Storage cache | Template caches local-path-provisioner v0.0.26; current manifest requests v0.0.35. Align cache and manifest. |
| Operator | Public Helm chart 2.13.1 resolves to operator 1.18.0, matching the template cache. Agent/cluster-agent cached at 7.70.0 are not explicitly pinned in the DatadogAgent resource. |
| Readiness | Template swallows control-plane, CRD and application readiness failures with `|| true`. Migration must fail on timeout and verify rollout readiness. |
| APM | App manifests mount `/var/run/datadog`; nginx explicitly uses `apm.socket`. DatadogAgent has no explicit APM configuration. Enable/verify the receiver and require ingested, searchable backend PostgreSQL spans. A mounted socket directory alone is not evidence. |
| Database | PostgreSQL and Redis have no CPU/memory requests or limits. Define a healthy baseline before calibrating the CPU-only fault. |
| Reset | Storage reclaim policy is Delete. Do not follow the generic README's namespace-delete reset: retain PVCs and change only database resources for fault/fix/reset cycles. |
| Credentials | Pup setup provisions with lc-env; K8s template uses findorcreateuser/configrum. Use one lab Datadog org and distribute its credentials securely; do not provision independently on both hosts. |
| Old scenario | Agent setup still invokes Compose, create-monitors.sh and create-downtime.sh. Remove these startup calls in the migrated lab. Do not delete unrelated existing monitors. |
| OpenCode | Config selects amazon-bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0 in us-east-1; IAM/SCP source names match this profile/model. Runtime invocation, model access and tool execution remain untested. |
| MCP | Existing Datadog MCP is enabled. Set enabled=false and verify effective OpenCode configuration in the actual work directory. |
| Host tools | Local Pup is 1.26.0; OpenCode is absent and kubectl has no contexts. Shared Bedrock image build sources were not found in this checkout; inspect actual VM tool versions before pinning. |

## Development without Instruqt

Develop manifest rendering, fixed traffic, database fault/recovery and Pup evidence against a development Kubernetes cluster. OpenCode/Pup can run outside the cluster using an explicit kubeconfig. Bedrock requires development AWS credentials with access to the selected inference profile; Datadog requires a test org's credentials. Never substitute a different model silently.

Local inspection found ARM64 macOS and an existing ARM64 Colima Docker VM with 4 CPUs and 16,733,499,392 bytes RAM. The PostgreSQL 1.5.0 image config is linux/amd64 (single manifest). Check every image's architecture before choosing Minikube. Native AMD64 Linux is preferable for representative CPU calibration; ARM builds or emulation require separate qualification and recalibration on the final platform.

For Docker-driver Minikube on macOS, node IPs are not directly reachable. Use a port-forward to service-proxy for interactive access; put the eventual fixed-rate generator inside the cluster, targeting service-proxy, so a laptop tunnel is not part of measured load.

The six application deployments request 1 CPU and 1792 MiB combined, excluding PostgreSQL, Redis, agents, storage and Kubernetes. Puppeteer adds 250m CPU and 1 GiB, but is not the intended fixed-rate generator. These are manifest requests, not measured capacity. The Instruqt topology has three n2-standard-4 VMs; startup was measured above, but capacity under sustained load remains unmeasured.

Instruqt acceptance still requires image availability/boot, temporary-account provisioning, lab-host-to-API TLS/auth/network access, worker HTTP routing, shared Datadog identity, host capacity and measured startup time. Local results must not be reported as passing those checks.

## Runtime preflight

After deploying the migrated lab, run from the host where OpenCode will execute:

```bash
POC_KUBE_CONTEXT=your-context DD_ENV=your-lab-env bash scripts/pup-poc/runtime-preflight.sh
```

This performs read-only prerequisite checks. It does not deploy, invoke a paid model, or claim end-to-end success. Then run an OpenCode smoke prompt that asks it to execute `pup version` and `kubectl --context <context> -n storedog get pods`, followed by a scoped Pup monitor query. Record actual tool calls and successful Bedrock response, with credentials redacted. Verify effective MCP is disabled and that Pup and cluster agents use the same test org. An empty monitor list is connectivity evidence only.

Next gates: healthy fixed traffic with DB spans; CPU fault calibration; frozen thresholds; three unchanged-traffic fault/fix/reset cycles with fresh telemetry and sustained monitor OK.

## References checked

- https://opencode.ai/docs/providers/ — Bedrock credentials, region and model configuration.
- https://opencode.ai/docs/mcp-servers/ — explicit MCP disablement.
- https://docs.datadoghq.com/containers/kubernetes/apm/ — receiver and application transport configuration.
- https://minikube.sigs.k8s.io/docs/handbook/accessing/ — macOS Docker-driver networking.
