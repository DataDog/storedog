# DBM service

## Description

This service is used for our database monitoring courses, built with Python that uses the SQLAlchemy ORM to connect to a Postgres database. When the service is started, the library Faker is used to generate fake data for the database and in our labs we run a few queries in the background to simulate a load on the database.

> TODO: Add queries from labs to this repo

There is also a user-facing component to this service, which can be seen in the `frontend` service with a specific flag thrown in the `featureFlags.config.json` file. Turning it on will result in a product ticker being displayed in the navbar of the application.

## Database schema

The database schema can be found in the `models.py` file with these models:

### items

| Column | Type | Description |
| --- | --- | --- |
| id | Integer | Primary key |
| description | String | Description of the item |
| order_count | String | Number of times the item has been ordered |
| last_hour_order_count | String | Number of times the item has been ordered in the last hour |
| image_url | String | URL to an image of the item |

### preorder_items

| Column | Type | Description |
| --- | --- | --- |
| id | Integer | Primary key |
| description | String | Description of the item |
| order_count | String | Number of times the item has been ordered |
| last_hour | String | Number of times the item has been ordered in the last hour |
| image_url | String | URL to an image of the item |
| is_preorder | Boolean | Whether or not the item is a preorder item |

## Adding DBM to your project

### Docker Compose

To add this service to your project, add this definition to your docker-compose file:

```yaml
dbm:
  build:
    context: ./services/dbm
  command: gunicorn --bind dbm:7595 dbm:app # If using any other port besides the default 8282, overriding the CMD is required
  depends_on:
    - postgres
    - dd-agent
  environment:
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    - POSTGRES_USER=${POSTGRES_USER}
    - POSTGRES_HOST=postgres
    - DD_SERVICE=storedog-dbm
    - DD_AGENT_HOST=dd-agent
    - DD_LOGS_INJECTION=true
    - DD_PROFILING_ENABLED=true
    - DD_APPSEC_ENABLED=true
    - DD_DBM_PROPAGATION_MODE=full
  volumes:
    - './services/dbm:/app'
  networks:
    - storedog-network
```

And update your Postgres service definition to look like the following:

```yaml
postgres:
  build:
    context: ./services/postgres
  restart: always
  depends_on:
    - dd-agent
  volumes:
    - postgres_logs:/var/log/pg_log:rw
  networks:
    - storedog-network
  environment:
    - POSTGRES_HOST_AUTH_METHOD=trust
    - POSTGRES_USER
    - POSTGRES_PASSWORD
  labels:
    com.datadoghq.tags.env: '${DD_ENV-dev}'
    com.datadoghq.tags.service: 'postgres'
    com.datadoghq.tags.version: '${DD_VERSION_POSTGRES-15}'
    com.datadoghq.ad.check_names: '["postgres", "postgres"]'
    com.datadoghq.ad.init_configs: '[{}, {}]'
    com.datadoghq.ad.instances: '[
      {
      "dbm":true,
      "host":"%%host%%",
      "port":5432,
      "username":"datadog",
      "password":"datadog",
      "relations": [{
      "relation_name": "advertisement",
      "relation_name": "discount",
      "relation_name": "items",
      "relation_name": "preorder_items",
      "relation_name": "influencer"
      }],
      "query_samples": {
      "enabled": true,
      "explain_parameterized_queries": true
      },
      "max_relations": 400,
      "collect_function_metrics": true,
      "collection_interval": 1,
      "collect_schemas": {
      "enabled": true
      }
      },
      {
      "dbm":true,
      "host":"%%host%%",
      "port":5432,
      "username":"datadog",
      "password":"datadog",
      "dbname": "storedog_db",
      "relations": [{
      "relation_regex": "spree_.*"
      }],
      "query_samples": {
      "enabled": true,
      "explain_parameterized_queries": true
      },
      "max_relations": 400,
      "collect_function_metrics": true,
      "collection_interval": 1,
      "collect_schemas": {
      "enabled": true
      }
      }]'
    com.datadoghq.ad.logs: '[{"source": "postgresql", "service": "postgres", "auto_multi_line_detection":true, "path": "/var/log/pg_log/postgresql*.json", "type": "file"}]'
```

Also update the Datadog agent service definition to include the following environment variable:

```yaml
DD_DBM_PROPAGATION_MODE=full
```

#### Script files

There are two shell script files in the `./scripts` directory. This need to be added to the lab files. Ensure they are executable `chmod +x <filename>`.

These scripts use `psql` to query the database. They can be added as a cron job to continually run on the host. Use the following command to install the required programs.

```bash
apt update
apt install -y postgresql-client cron
```

Add the script to cron:

```bash
echo "* * * * * /root/dbm_query_one.sh > /dev/null 2>&1" |crontab -
(crontab -l;echo "*/2 * * * * /root/dbm_query_two.sh > /dev/null 2>&1") |crontab -
```

### Kubernetes

The `dbm/k8s-manifest` directory is additive to the version at the root of the repo. These files will add the `store-dbm` service and the configurations needed to collect DBM data.

In this scenario, Storedog and the Datadog Agent are expected to be in the same namespace. The steps below assume that Storedog will run in the `default` namespace. This simplifies Postgres log collection.

The manifest YAML files use environment variables such as ${DD_ENV} and ${REGISTRY_URL}. These are substituted using envsubst during deployment. If you prefer, you can edit the YAMLs directly to hardcode these values.

#### A note on log collection

PostgreSQL default logging is to `stderr`, and logs do not include detailed information. Information on collecting more detailed logs are in the [DBM Postgres configuration](https://docs.datadoghq.com/database_monitoring/setup_postgres/selfhosted/?tab=postgres15#collecting-logs-optional) documentation. These more detailed logs are written to a file which is then collected by the Datadog Agent. Running the agent and Postgres in the same namespace allows for a volume to be shared between the two pods. Running Storedog in a different namespace would require a more complex configuration for shared volumes using NFS or cloud storage. This is beyond the scope of running the store-dbm service for our lab environments.

#### Deploy the Datadog Operator

1. Install the Datadog Operator with Helm:

```bash
helm repo add datadog https://helm.datadoghq.com
helm repo update
helm install my-datadog-operator datadog/datadog-operator
```

2. Create a Kubernetes secret with your Datadog API and app keys:

```bash
kubectl create secret generic datadog-secret \
 --from-literal api-key=$DD_API_KEY \
 --from-literal app-key=$DD_APP_KEY \
 --from-literal=dd_application_id=${DD_APPLICATION_ID} \
 --from-literal=dd_client_token=${DD_CLIENT_TOKEN}
```

#### Deploy Storedog with store-dbm

These steps ensure that dependencies are applied first. For example the storage volumes are created before the pods that will use them.

1. Begin by merging the files from `dbm/k8s-manifest` into the main manifests directory. Run the following command at the root of the registry:

```bash
cp -a services/dbm/k8s-manifests/. k8s-manifests/
```

2. In addition to the usual environment variables used with Storedog, set `DD_VERSION_DBM=1.0.0`:

```bash
export DD_VERSION_DBM=1.0.0
```

3. Create the `fake-traffic` namespace:

```bash
kubectl create namespace fake-traffic
```

4. Apply secrets for each namespace:

```bash
kubectl apply -n default -f k8s-manifests/storedog-app/secrets/shared-secrets.yaml
kubectl apply -n fake-traffic -f k8s-manifests/storedog-app/secrets/shared-secrets.yaml
```

5. Apply the storage provisioner and the ingress controller.

```bash
kubectl apply -R -f k8s-manifests/cluster-setup/
```

6. Apply the Datadog Agent manifest:

> [!IMPORTANT]
> This assumes you've already installed the Datadog Operator and set the API key.

```bash
envsubst '${DD_ENV}' < k8s-manifests/datadog/datadog-agent.yaml | kubectl apply -f -
```

> [!NOTE]
> Use `kubectl get pods` and wait till the agent is running before continuing. This will ensure that traces are collected from all services.

7. Deploy Storedog application components based on dependency.

> [!NOTE]
> Applying all manifests at once can cause delays in service start. This command will apply all Storedog manifests in the default namespace.
> 
> ```bash
> for file in k8s-manifests/storedog-app/**/*.yaml; do envsubst < "$file" | kubectl apply -f -; done
> ```

8. Apply ConfigMaps:

```bash
kubectl apply -R -f k8s-manifests/storedog-app/configmaps/
```

9. Apply StatefulSets (Redis and Postgres):

```bash
for file in k8s-manifests/storedog-app/statefulsets/*.yaml; do envsubst < "$file" | kubectl apply -f -; done
```

10. Apply Storedog services:

```bash
for file in k8s-manifests/storedog-app/deployments/*.yaml; do envsubst < "$file" | kubectl apply -f -; done
```

11. Apply Ingress for external traffic:

```bash
for file in k8s-manifests/storedog-app/ingress/*.yaml; do envsubst < "$file" | kubectl apply -f -; done
```

12. Apply the ConfigMap and services to generate fake traffic.

```bash
kubectl apply -f k8s-manifests/storedog-app/configmaps/shared-config.yaml -n fake-traffic
for file in k8s-manifests/fake-traffic/*.yaml; do envsubst '${REGISTRY_URL} ${SD_TAG}' < "$file" | kubectl apply -n fake-traffic -f -; done
```
