# Task 137 preflight

Status: live Instruqt setup passed on 2026-10-22; DB failure/recovery POC remains unvalidated.
Read backlog 137 and mem 286 before changing the scenario.

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

This passed lifecycle setup only: challenge checks are unimplemented.
Bedrock inference, OpenCode invoking Pup, Pup API access, HTTP routing and
actual APM ingestion still need verification. No DB fault has been injected,
and no failure/recovery cycles have been tested. Next establish fixed-rate
traffic and searchable DB spans, then calibrate CPU pressure and run three
fault/fix/reset cycles without changing offered traffic or deleting PVCs.

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
