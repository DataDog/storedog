---
description: Validate and sync Kubernetes manifests with Docker Compose
---

Validate and help sync Kubernetes manifests with Docker Compose configuration.

Arguments: $ARGUMENTS (optional: service name to focus on, or "all" for full sync check)

Tasks to perform:

1. **Compare Services:**
   * List services defined in docker-compose.yml and docker-compose.dev.yml
   * List deployments in k8s-manifests/storedog-app/deployments/
   * Identify any missing services in Kubernetes manifests

1. **Environment Variable Sync:**
   * Extract environment variables from docker-compose files
   * Check corresponding Kubernetes deployments and ConfigMaps
   * Identify missing or mismatched environment variables
   * Check k8s-manifests/storedog-app/configmaps/ for shared config
   * Verify secrets in k8s-manifests/storedog-app/secrets/

1. **Port Mapping Validation:**
   * Compare exposed ports between Docker Compose and Kubernetes Services
   * Check ingress rules in k8s-manifests/storedog-app/ingress/
   * Validate service port configurations

1. **Volume Configuration:**
   * Compare volume mounts and persistent volume claims
   * Check StatefulSets for PostgreSQL and Redis

1. **Envsubst Variables:**
   * Search for `${VAR}` patterns in Kubernetes manifests
   * List all variables that need to be set before deployment
   * Cross-reference with .env.template
   * Document any undocumented envsubst variables

1. **Image References:**
   * Check if image tags match between Docker Compose and K8s
   * Verify GHCR image references
   * Note any hard-coded version tags

1. **Datadog Integration:**
   * Compare Datadog environment variables
   * Check agent configuration in k8s-manifests/datadog/
   * Validate service annotations for autodiscovery

1. **Suggest Updates:**
   * Provide specific manifest updates needed
   * Generate example YAML snippets for missing configurations
   * Recommend which files need to be modified
