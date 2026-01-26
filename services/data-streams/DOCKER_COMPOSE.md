# Docker Compose - Data Streams (Alternative Deployment)

This Docker Compose configuration is provided as an alternative to the primary Kubernetes deployment. It's useful for:
- Local development and testing
- Backporting to non-K8s Storedog deployments
- Quick demos without K8s infrastructure

**⚠️ Note**: The lab uses Kubernetes. This is provided as an optional alternative.

## Prerequisites

- Docker and Docker Compose installed
- 8GB RAM minimum
- Ports 8080-8087, 9092, 9999 available

## Quick Start

```bash
cd services/data-streams

# Set Datadog API key (optional, for monitoring)
export DD_API_KEY=your_api_key
export DD_SITE=datadoghq.com

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

## Configuration

Edit environment variables in the `docker-compose.yml` file or use a `.env` file.

## Services

- **kafka** - Kafka 3.9.0 in KRaft mode (port 9092)
- **datadog** - Datadog Agent (optional)
- **order-producer** - Generates order events (port 8080)
- **order-validator** - Validates orders (port 8081)
- **inventory-service** - Reserves inventory (port 8082)
- **payment-processor** - Processes payments (port 8083)
- **fraud-detector** - Detects fraud (port 8084)
- **fulfillment-service** - Creates shipments (port 8085)
- **notification-service** - Sends notifications (port 8086)
- **analytics-aggregator** - Aggregates analytics (port 8087)

## Viewing Data in Datadog

Once running with DD_API_KEY set, view the pipeline in:
https://app.datadoghq.com/data-streams

## Stopping

```bash
# Stop services (keeps data)
docker compose down

# Stop and remove data
docker compose down -v
```

## For Production Use

Use the Kubernetes deployment instead. See:
- `../../k8s-manifests/storedog-app/` for K8s manifests
- `QUICKSTART.md` for K8s deployment guide
