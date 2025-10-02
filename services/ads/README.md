# Advertisements Service

## Description

This service is responsible for managing the banner advertisements served to the frontend service of the application. There are two variations of this service, one uses Python and the other uses Java.

## Java service

The Java service is the default used with Storedog. It uses the Spring framework. It uses the PostgreSQL JDBC driver to connect to a PostgreSQL database. It uses an H2 in-memory database when running build tests.

## Python service

The Python service is a Flask application that uses SQLAlchemy to connect to a PostgreSQL database. The service is packaged as a Docker image and typically used in a Docker Compose file (see the root of this repo).

## A/B Testing Ads services (Optional)

The Python service can be used to run two ads services and split traffic between them. The amount of traffic sent to each service is set with a percent value. For more information, see the [README.md](../README.md#a/b-testing-ads-services-optional) file in the root of this repo.

### Datadog configuration

#### Logs

Logging is configured in the `docker-compose.yml` file along with the Datadog Agent.

#### APM

The `ddtrace` library is used to instrument the Python service. The `ddtrace` library is installed in the `requirements.txt` file. The `ddtrace-run` command is used to run the service in the `Dockerfile`.

Log injection is enabled by default in the trace library, but the logs are formatted in the `ads.py` file.

### Endpoints (Python)

Use the following endpoints to interact with the service.

#### GET /

Returns a message indicating that the service is running.

##### Request

```text
GET /
```

##### Response

```text
Hello from Advertisements!
```

#### GET /ads

Returns a list of all advertisements. There are only three advertisements in the database.

##### Request

```text
GET /ads
```

##### Response

```json
[
  {
    "id": 1, 
    "name": "Discount Clothing", 
    "path": "1.jpg", 
    "url": "/t/clothing", 
    "weight": 15.1
  }, 
  {
    "id": 2, 
    "name": "Cool Hats", 
    "path": "2.jpg", 
    "url": "/products/datadog-ringer-t-shirt", 
    "weight": 300.1
  }, 
  {
    "id": 3, 
    "name": "Nice Bags", 
    "path": "3.jpg", 
    "url": "/t/bags", 
    "weight": 5242.1
  }
]
```

#### GET /banners/<path:banner>

Returns the banner image specified by the path parameter. Use this to display images on the frontend.

##### Request

```text
GET /banners/1.jpg
```

##### Response Type

```text
image/jpg
```

#### POST /ads

Creates a new advertisement with a random name and value. Currently doesn't work as intended (I believe).

##### Request

```text
POST /ads
```

##### Response

```json
{
  "id": 4, 
  "name": "New Ad", 
  "path": "4.jpg", 
  "url": "/t/new", 
  "weight": 0.0
}
```

### Database

The Python service uses a PostgreSQL database. The database is configured in the `docker-compose.yml` file. 

The application uses SQLAlchemy to connect to the database. The `models.py` file contains the SQLAlchemy model and the `bootstrap.py` file contains database connection and setup code.

#### Database schema

The `ads` table has the following schema:

| Column | Type | Description |
| --- | --- | --- |
| id | integer | Unique identifier for the advertisement (Primary Key) |
| name | string | Name of the advertisement |
| url | string | URL to redirect to when the advertisement is clicked |
| weight | float | Weight of the advertisement (used for A/B testing) |
| path | string | Path to the advertisement image |

### Using the Python ads service

#### Docker Compose

To use the Python ads service, replace the `ads` definition with the following in your `docker-compose.yml` file:

```yaml
  # OPTIONAL: Advertisement service (Python)
  ads-python:
    image: ghcr.io/datadog/storedog/ads-python:${STOREDOG_IMAGE_VERSION:-latest}
    build: # Only used if building from source in development
      context: ./services/ads/python
    depends_on:
      - postgres
      - dd-agent
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_HOST=postgres
      - DD_AGENT_HOST=dd-agent
      - DD_ENV=${DD_ENV:-production}
      - DD_SERVICE=store-ads-python
      - DD_VERSION=${DD_VERSION_ADS_PYTHON:-1.0.0}
      - DD_PROFILING_ENABLED=true
      - DD_PROFILING_TIMELINE_ENABLED=true
      - DD_PROFILING_ALLOCATION_ENABLED=true
    volumes: # Only used in development
      - ./services/ads/python:/app
    networks:
      - storedog-network
    labels:
      com.datadoghq.ad.logs: '[{"source": "python"}]'
```

#### Kubernetes

To use the Python ads service, replace your entire `k8s-manifests/storedog-app/deployments/ads.yaml` file with the following:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ads
spec:
  ports:
    - port: 3030
      targetPort: 3030
      name: http
  selector:
    app: store-ads
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ads
  labels:
    app: store-ads
    team: advertisements
spec:
  replicas: 1
  selector:
    matchLabels:
      app: store-ads
  template:
    metadata:
      labels:
        app: store-ads
        team: advertisements
      annotations:
        ad.datadoghq.com/ads.logs: '[{"source": "python"}]'
    spec:
      volumes:
        - name: apmsocketpath
          hostPath:
            path: /var/run/datadog/
      containers:
        - name: ads
          image: ${REGISTRY_URL}/ads-python:${SD_TAG}
          ports:
            - containerPort: 3030
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: storedog-secrets
                  key: POSTGRES_PASSWORD
            - name: POSTGRES_USER
              valueFrom:
                configMapKeyRef:
                  name: storedog-config
                  key: POSTGRES_USER
            - name: POSTGRES_HOST
              valueFrom:
                configMapKeyRef:
                  name: storedog-config
                  key: DB_HOST
            - name: DD_ENV
              valueFrom:
                configMapKeyRef:
                  name: storedog-config
                  key: DD_ENV
            - name: DD_SERVICE
              value: store-ads
            - name: DD_VERSION
              value: ${DD_VERSION_ADS}
            - name: DD_RUNTIME_METRICS_ENABLED
              value: "true"
            - name: DD_PROFILING_ENABLED
              value: "true"
            - name: DD_PROFILING_ALLOCATION_ENABLED
              value: "true"
            - name: DD_PROFILING_TIMELINE_ENABLED
              value: "true"
          resources:
            requests:
              memory: "256Mi"
              cpu: "200m"
            limits:
              memory: "512Mi"
              cpu: "400m"
          volumeMounts:
            - name: apmsocketpath
              mountPath: /var/run/datadog
```