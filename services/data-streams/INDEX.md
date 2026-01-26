# Data Streams Documentation Index

Welcome to the Storedog Data Streams project! This index helps you find the right documentation.

## 🚀 Getting Started

**New to the project?** Start here:

1. **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
2. **[README.md](./README.md)** - Project overview
3. **[PIPELINE_DIAGRAM.md](./PIPELINE_DIAGRAM.md)** - Visual pipeline flows

## 📖 Core Documentation

### For Understanding the System

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** ⭐  
  Complete system design, service interactions, and data flows

- **[PIPELINE_DIAGRAM.md](./PIPELINE_DIAGRAM.md)** 📊  
  Visual diagrams of message flows and timing

- **[SERVICE_DEFINITIONS.md](./SERVICE_DEFINITIONS.md)** 📋  
  Reference for all service configurations

### For Developers

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** 📝  
  Complete overview of what's been built and next steps

- **[PHASE1_COMPLETE.md](./PHASE1_COMPLETE.md)** ✅  
  Java implementation details

- **[HYBRID_IMPLEMENTATION.md](./HYBRID_IMPLEMENTATION.md)** 🔗  
  Storedog integration design and implementation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** 🧪  
  Complete testing procedures

- **[K8S_SUMMARY.md](./K8S_SUMMARY.md)** ☸️  
  Kubernetes deployment summary and manifest overview

- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** 🔄  
  What changed from the original codebase

### For Operations

- **[QUICKSTART.md](./QUICKSTART.md)** ⚡  
  Quick deployment and troubleshooting (Kubernetes)

- **[DOCKER_COMPOSE.md](./DOCKER_COMPOSE.md)** 🐳  
  Docker Compose alternative for local development

- **[../../k8s-manifests/README.md#data-streams-monitoring](../../k8s-manifests/README.md#data-streams-monitoring)** ☸️  
  Kubernetes manifests documentation

## 📂 Directory Structure

```
data-streams/
├── README.md                    ← Start here
├── QUICKSTART.md               ← 5-minute setup
├── ARCHITECTURE.md             ← System design
├── SERVICE_DEFINITIONS.md      ← Config reference
├── PIPELINE_DIAGRAM.md         ← Visual diagrams
├── PROJECT_SUMMARY.md          ← Complete overview
├── REFACTORING_SUMMARY.md      ← Change log
├── docker-compose.yml          ← Docker config
│
├── service-definitions/        ← Service configs (YAML)
│   ├── order-producer.yml
│   ├── order-validator.yml
│   ├── inventory-service.yml
│   ├── payment-processor.yml
│   ├── fraud-detector.yml
│   ├── fulfillment-service.yml
│   ├── notification-service.yml
│   └── analytics-aggregator.yml
│
├── kafka-producer/             ← Generic producer
│   └── files/
│       ├── Dockerfile
│       └── app/
│           ├── build.gradle
│           └── src/main/
│               ├── java/
│               └── proto/      ← Protobuf schemas
│
└── kafka-consumer/             ← Generic consumer
    └── files/
        ├── Dockerfile
        └── app/
            ├── build.gradle
            └── src/main/
                ├── java/
                └── proto/      ← Protobuf schemas
```

## 🎯 Quick Navigation

### I want to...

**...understand the architecture**  
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md)

**...get it running quickly**  
→ Follow [QUICKSTART.md](./QUICKSTART.md) (K8s) or [DOCKER_COMPOSE.md](./DOCKER_COMPOSE.md) (local)

**...see the pipeline visually**  
→ Check [PIPELINE_DIAGRAM.md](./PIPELINE_DIAGRAM.md)

**...configure a service**  
→ Reference [SERVICE_DEFINITIONS.md](./SERVICE_DEFINITIONS.md)

**...understand what changed**  
→ Review [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)

**...know what's been built**  
→ Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

**...add a new service**  
→ See [SERVICE_DEFINITIONS.md](./SERVICE_DEFINITIONS.md#adding-a-new-service)

**...deploy to Kubernetes**  
→ Follow [QUICKSTART.md](./QUICKSTART.md) or see [k8s-manifests README](../../k8s-manifests/README.md#data-streams-monitoring)

**...run locally with Docker Compose**  
→ See [DOCKER_COMPOSE.md](./DOCKER_COMPOSE.md)

**...integrate with Storedog**  
→ See [HYBRID_IMPLEMENTATION.md](./HYBRID_IMPLEMENTATION.md) and [TESTING_GUIDE.md](./TESTING_GUIDE.md)

## 📋 By Role

### Platform Engineer
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
2. [K8S_SUMMARY.md](./K8S_SUMMARY.md) - K8s infrastructure
3. [QUICKSTART.md](./QUICKSTART.md) - Deployment guide

### Software Developer
1. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - What's built
2. [SERVICE_DEFINITIONS.md](./SERVICE_DEFINITIONS.md) - Service configs
3. [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Technical changes

### Lab Instructor
1. [QUICKSTART.md](./QUICKSTART.md) - Setup instructions
2. [PIPELINE_DIAGRAM.md](./PIPELINE_DIAGRAM.md) - Visual teaching aids
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed explanations

### SRE / Operations
1. [QUICKSTART.md](./QUICKSTART.md) - Troubleshooting
2. [K8S_SUMMARY.md](./K8S_SUMMARY.md) - K8s resources
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Service dependencies

## 🔍 By Topic

### Kafka
- [ARCHITECTURE.md](./ARCHITECTURE.md#message-flow-examples)
- [SERVICE_DEFINITIONS.md](./SERVICE_DEFINITIONS.md#kafka)
- [docker-compose.yml](./docker-compose.yml) - Kafka configuration

### Protobuf
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md#protobuf-schemas)
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md#protobuf-schema-updates)
- `kafka-producer/files/app/src/main/proto/` - Schema files

### Datadog DSM
- [ARCHITECTURE.md](./ARCHITECTURE.md#data-streams-monitoring-metrics)
- [QUICKSTART.md](./QUICKSTART.md#step-5-view-in-datadog)
- [PIPELINE_DIAGRAM.md](./PIPELINE_DIAGRAM.md#data-streams-monitoring-view)

### E-commerce Flow
- [PIPELINE_DIAGRAM.md](./PIPELINE_DIAGRAM.md#complete-pipeline-flow)
- [ARCHITECTURE.md](./ARCHITECTURE.md#service-definitions)
- [SERVICE_DEFINITIONS.md](./SERVICE_DEFINITIONS.md#current-service-definitions)

### Kubernetes
- [QUICKSTART.md](./QUICKSTART.md)
- [K8S_SUMMARY.md](./K8S_SUMMARY.md)
- [../../k8s-manifests/README.md#data-streams-monitoring](../../k8s-manifests/README.md#data-streams-monitoring)

### Docker Compose
- [DOCKER_COMPOSE.md](./DOCKER_COMPOSE.md)
- [docker-compose.yml](./docker-compose.yml)

### Docker Images
- `kafka-producer/files/Dockerfile`
- `kafka-consumer/files/Dockerfile`

### Java / Spring Boot
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md#technology-stack-updates)
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md#technology-stack-updates)
- `*/files/app/build.gradle`

## 📊 Documentation Stats

| Document | Lines | Read Time | Audience |
|----------|-------|-----------|----------|
| QUICKSTART.md | ~400 | 10 min | K8s deployment |
| DOCKER_COMPOSE.md | ~50 | 3 min | Local dev |
| README.md | ~150 | 3 min | Everyone |
| ARCHITECTURE.md | ~350 | 15 min | Engineers |
| SERVICE_DEFINITIONS.md | ~400 | 10 min | Developers |
| PIPELINE_DIAGRAM.md | ~400 | 10 min | Visual learners |
| PROJECT_SUMMARY.md | ~300 | 10 min | Project overview |
| K8S_SUMMARY.md | ~400 | 10 min | K8s deployment |
| REFACTORING_SUMMARY.md | ~250 | 5 min | Migrating users |
| K8s README section | ~200 | 5 min | K8s operators |

**Total: 3,000+ lines of documentation**

## 🎓 Learning Path

### Beginner (New to Project)
1. Read [README.md](./README.md) (3 min)
2. Follow [QUICKSTART.md](./QUICKSTART.md) (5 min)
3. View [PIPELINE_DIAGRAM.md](./PIPELINE_DIAGRAM.md) (10 min)

### Intermediate (Want to Understand)
1. Complete Beginner path
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) (15 min)
3. Review [SERVICE_DEFINITIONS.md](./SERVICE_DEFINITIONS.md) (10 min)

### Advanced (Want to Develop)
1. Complete Intermediate path
2. Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) (10 min)
3. Review [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) (5 min)
4. Study code in `kafka-producer/` and `kafka-consumer/`

## 🔗 External Resources

### Datadog Documentation
- [Data Streams Monitoring](https://docs.datadoghq.com/data_streams/)
- [Kafka Monitoring](https://docs.datadoghq.com/integrations/kafka/)
- [APM with Kafka](https://docs.datadoghq.com/tracing/setup_overview/setup/java/)

### Kafka Documentation
- [Apache Kafka](https://kafka.apache.org/documentation/)
- [Confluent Platform](https://docs.confluent.io/platform/current/overview.html)
- [Spring Kafka](https://spring.io/projects/spring-kafka)
- [Confluent Kafka Docker](https://hub.docker.com/r/confluentinc/cp-kafka)

### Protobuf Documentation
- [Protocol Buffers](https://protobuf.dev/)
- [Confluent Protobuf Serializer](https://docs.confluent.io/platform/current/schema-registry/serdes-develop/serdes-protobuf.html)

## 🆘 Need Help?

### Common Issues
See [QUICKSTART.md](./QUICKSTART.md#troubleshooting)

### Understanding Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md)

### Service Configuration
See [SERVICE_DEFINITIONS.md](./SERVICE_DEFINITIONS.md)

### What's Next
See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md#recommended-next-steps)

## 📅 Version History

- **v1.0** (Current) - Complete refactoring to definition-driven architecture
  - Renamed directories
  - Created service definitions
  - Updated to latest dependencies
  - Created comprehensive documentation

- **v0.x** (Original) - streams-poc with trading simulation
  - Basic Kafka producer/consumer
  - Protobuf support
  - Datadog integration

## 🎉 Ready to Start?

Choose your path:

1. **Quick Start** → [QUICKSTART.md](./QUICKSTART.md)
2. **Deep Dive** → [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Visual Overview** → [PIPELINE_DIAGRAM.md](./PIPELINE_DIAGRAM.md)
4. **Implementation Details** → [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

*Last updated: January 2026*
