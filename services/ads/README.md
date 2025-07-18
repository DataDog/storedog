# Advertisements Service

## Description

This service is responsible for managing the banner advertisements served to the frontend service of the application. There are two variations of this service, one uses Python and the other uses Java.

## Java service

The Java service is the default used with Storedog. It uses the Spring framework. It uses the PostgreSQL JDBC driver to connect to a PostgreSQL database. It uses an H2 in-memory database when running build tests.

### OpenTelemetry Configuration

The Java service is instrumented with OpenTelemetry auto-instrumentation for comprehensive observability:

#### Auto-Instrumentation

The service uses the OpenTelemetry Java agent for automatic instrumentation, which provides:
- **Traces**: Automatic tracing of HTTP requests, database queries, and method calls
- **Metrics**: JVM metrics, HTTP server metrics, and custom application metrics  
- **Logs**: Structured logging with trace correlation

#### Configuration

OpenTelemetry is configured through environment variables in the docker-compose files:

```yaml
environment:
  - OTEL_SERVICE_NAME=store-ads
  - OTEL_SERVICE_VERSION=1.0.0
  - OTEL_EXPORTER_OTLP_ENDPOINT=http://otelcol:4317
  - OTEL_EXPORTER_OTLP_PROTOCOL=grpc
  - OTEL_RESOURCE_ATTRIBUTES=service.name=store-ads,service.version=1.0.0,deployment.environment=production
  - OTEL_TRACES_EXPORTER=otlp
  - OTEL_METRICS_EXPORTER=otlp
  - OTEL_LOGS_EXPORTER=otlp
  - OTEL_LOG_LEVEL=info
```

#### Log Correlation

Logs include trace and span IDs for correlation with distributed traces:
- Console logs: `[trace_id,span_id]` format
- JSON logs: Structured with trace context in MDC

#### Testing OpenTelemetry

1. **Start the application**:
   ```bash
   docker-compose up -d
   ```

2. **Generate some traffic**:
   ```bash
   # Get advertisements
   curl http://localhost/services/ads/ads
   
   # Get banner image
   curl http://localhost/services/ads/banners/1
   
   # Trigger error (optional)
   curl -H "x-throw-error: true" -H "x-error-rate: 0.5" http://localhost/services/ads/ads
   ```

3. **Check OpenTelemetry Collector logs**:
   ```bash
   docker-compose logs otelcol
   ```

4. **Verify telemetry data**:
   Look for traces, metrics, and logs in the collector output showing:
   - HTTP server spans with status codes and durations
   - Database query spans to PostgreSQL
   - JVM metrics (memory, CPU, GC)
   - Structured log entries with trace correlation

#### Instrumented Components

The auto-instrumentation automatically captures:
- **Spring Web**: HTTP requests/responses
- **Spring Data JPA**: Database operations
- **PostgreSQL JDBC**: Database queries
- **Logback**: Log entries with trace context
- **JVM**: Runtime metrics

## Python service

The Python service is a Flask application that uses SQLAlchemy to connect to a PostgreSQL database. The service is packaged as a Docker image and typically used in a Docker Compose file (see the root of this repo).

### Datadog configuration

#### Logs

Logging is configured in the `docker-compose.yml` file along with the Datadog Agent.

#### APM

The `ddtrace` library is used to instrument the Python service. The `ddtrace` library is installed in the `requirements.txt` file. The `ddtrace-run` command is used to run the service in the `Dockerfile`.

Log injection is enabled in the `docker-compose.yml` file, but the logs are formatted in the `ads.py` file.

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

To use the Python ads service, replace the `ads` definition with the following in your `docker-compose.yml` file:

```yaml
ads:
    build:
      context: ./services/ads/python
    command: wait-for-it postgres:5432 -- flask run --port=3030 --host=0.0.0.0 # If using any other port besides the default 9292, overriding the CMD is required
    depends_on:
      - postgres
      - dd-agent
    environment:
      - FLASK_APP=ads.py
      - FLASK_DEBUG=0
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_HOST=postgres
      - DD_AGENT_HOST=dd-agent
      - DD_LOGS_INJECTION=true
      - DD_TRACE_ANALYTICS_ENABLED=true
      - DD_PROFILING_ENABLED=true
      - DD_APPSEC_ENABLED=true
      - DD_VERSION=${DD_VERSION_ADS-1.0.0}
      - DD_SERVICE=store-ads
      - DD_ENV=${DD_ENV-dev}
    volumes:
      - ./services/ads/python:/app
    labels:
      com.datadoghq.ad.logs: '[{"source": "python"}]'
```
