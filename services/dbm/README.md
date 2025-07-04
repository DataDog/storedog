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
    - FLASK_APP=dbm.py
    - FLASK_DEBUG=0
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

There are two shell script files in the `./scripts` directory. This need to be added to the lab files. Ensure they are executable (`chmod +x <filename>).

These scripts use `psql` to query the database. They can be added as a cron job to continually run on the host. Use the following command to install the required programs.

```bash
apt update
apt install -y postgresql-client cron
```

Add the script to cron:

```bash
echo "* * * * * /root/dbm_query_one.sh > /dev/null 2>&1" |crontab -
(crontab -l;echo "*/2 * * * * /root/dmb_query_two.sh > /dev/null 2>&1") |crontab -
```

### Kubernetes

To add this service to your project, use the following manifest files in the `dbm/k8s-manifest` directory.

Change the `env` tag in `datadog-agent.yaml`

Change feature flag json in frontend (how can this file be mounted?)

Set `DD_VERSION_DBM=1.0.0`

Start order is important. Postgres needs to be running for the agent to set up integration.

Create namespaces:

```bash
kubectl create namespace storedog
kubectl create namespace fake-traffic
```

Apply secrets for each namespace:

> [!IMPORTANT]
> This assumes you're running Storedog in the `storedog` namespace.

```bash
kubectl apply -n default -f k8s-manifests/storedog-app/secrets/shared-secrets.yaml
kubectl apply -n storedog -f k8s-manifests/storedog-app/secrets/shared-secrets.yaml
kubectl apply -n fake-traffic -f k8s-manifests/storedog-app/secrets/shared-secrets.yaml
```

Apply the Datadog Agent manifest:

> [!IMPORTANT]
> This assumes you've already installed the Datadog Operator and set the API key.

```bash
kubectl apply -f k8s-manifests/datadog/datadog-agent.yaml
```

Install the storage provisioner and the ingress controller.

```bash
kubectl apply -R -f k8s-manifests/cluster-setup/
```

Deploy all Storedog application components.

```bash
for file in k8s-manifests/storedog-app/**/*.yaml; do envsubst < "$file" | kubectl apply -n storedog -f -; done
```

Deploy services to generate fake traffic.

```bash
for file in k8s-manifests/fake-traffic/*.yaml; do envsubst '${REGISTRY_URL} ${SD_TAG}' < "$file" | kubectl apply -f -; done
```
