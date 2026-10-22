#!/usr/bin/env bash
# Read-only prerequisites; run on the OpenCode host after lab deployment.
set -euo pipefail

: "${POC_KUBE_CONTEXT:?Set the explicit development/lab Kubernetes context}"
: "${DD_ENV:?Set the lab Datadog environment tag}"
: "${DD_API_KEY:?Set the test org API key}"
: "${DD_APP_KEY:?Set the test org application key}"
: "${DD_SITE:?Set the test org site}"

for tool in kubectl aws pup opencode; do
  command -v "$tool" >/dev/null || { echo "Missing tool: $tool" >&2; exit 1; }
done

date -u '+Preflight started: %Y-%m-%dT%H:%M:%SZ'
pup version
opencode --version
aws --version
kubectl version --client
kube=(kubectl --context "$POC_KUBE_CONTEXT" --request-timeout=20s)
"${kube[@]}" get nodes -o wide
"${kube[@]}" wait --for=condition=Ready nodes --all --timeout=120s
"${kube[@]}" -n storedog get pods,services,pvc
"${kube[@]}" -n storedog rollout status statefulset/postgres --timeout=120s
"${kube[@]}" -n storedog rollout status deployment/backend --timeout=120s
"${kube[@]}" -n storedog rollout status deployment/service-proxy --timeout=120s
"${kube[@]}" auth can-i patch statefulsets.apps -n storedog

# Suppress identity and monitor contents; do not emit credentials into evidence.
AWS_PAGER='' aws sts get-caller-identity --cli-connect-timeout 10 --cli-read-timeout 20 >/dev/null
echo 'AWS caller identity request succeeded; Bedrock invocation is still untested.'
pup --no-agent monitors list --tags="env:${DD_ENV}" >/dev/null
echo 'Scoped Pup monitor request succeeded; monitor state and telemetry are still untested.'
echo 'Next: verify effective MCP disablement and actual OpenCode tool calls (see README).'
