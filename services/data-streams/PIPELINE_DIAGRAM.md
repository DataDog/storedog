# Data Streams Pipeline Visualization

## Complete Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ORDER CREATION                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  order-producer  │  Simulates order creation from Storedog
    │  (port: 8080)    │  Rate: ~60 msg/min
    └────────┬─────────┘
             │
             │ order-events
             │ (protobuf: OrderEvent)
             │
             ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                    VALIDATION & FRAUD DETECTION                              │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ order-validator  │──────────┐
    │  (port: 8081)    │          │ invalid-orders
    └────────┬─────────┘          │ (rejected orders)
             │                     ▼
             │ validated-orders   [dead letter / retry]
             │
             ├──────────────────────────────────────────┐
             │                                          │
             ▼                                          ▼
    ┌──────────────────┐                      ┌──────────────────┐
    │inventory-service │                      │ fraud-detector   │ (parallel)
    │  (port: 8082)    │                      │  (port: 8084)    │
    └────────┬─────────┘                      │ Also consumes:   │
             │                                 │ - order-events   │
             │ inventory-reserved              │ - payment-conf   │
             │                                 └──────────────────┘
             │                                          │
             │                                          │ fraud-alerts
             │                                          ▼
             │                                 ┌──────────────────┐
             ▼                                 │   [Security      │
                                               │    Team Notif]   │
┌─────────────────────────────────────────────└──────────────────┘─────────────┐
│                       PAYMENT PROCESSING                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │payment-processor │──────────┐
    │  (port: 8083)    │          │ payment-failed
    └────────┬─────────┘          │ (declined/error)
             │                     ▼
             │ payment-confirmed  [retry / notify customer]
             │
             ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                    FULFILLMENT & SHIPPING                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │fulfillment-svc   │──────┬─────────┬──────────┐
    │  (port: 8085)    │      │         │          │
    └──────────────────┘      │         │          │
             │                 │         │          │
             │                 │         │          │
    order-fulfilled    shipment-  warehouse-    (other events)
             │         created    assigned
             ▼            ▼          ▼
    ┌────────────────────────────────────┐
    │                                    │
    │  [Warehouse System Integration]    │
    │                                    │
    └────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER COMMUNICATION                                    │
└─────────────────────────────────────────────────────────────────────────────┘

         ┌───────────────────────────────────────────┐
         │          notification-service             │
         │            (port: 8086)                   │
         │                                           │
         │  Consumes from 5 topics:                  │
         │  • order-fulfilled                        │
         │  • shipment-created                       │
         │  • payment-failed                         │
         │  • inventory-unavailable                  │
         │  • fraud-alerts                           │
         └───────────────┬───────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────────────┐
         │  Sends via:                               │
         │  • Email (SendGrid, SES, etc.)            │
         │  • SMS (Twilio, SNS, etc.)                │
         │  • Push Notifications                     │
         └───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    ANALYTICS & REPORTING                                     │
└─────────────────────────────────────────────────────────────────────────────┘

         ┌───────────────────────────────────────────┐
         │         analytics-aggregator              │
         │            (port: 8087)                   │
         │                                           │
         │  Consumes from 4 topics:                  │
         │  • order-events                           │
         │  • order-fulfilled                        │
         │  • payment-confirmed                      │
         │  • fraud-alerts                           │
         └───────────────┬───────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────────────┐
         │  Aggregations:                            │
         │  • Order volume by hour                   │
         │  • Revenue by product                     │
         │  • Customer purchase patterns             │
         │  • Fraud rate by region                   │
         │  • Fulfillment time metrics               │
         │                                           │
         │  Destinations:                            │
         │  • Data Warehouse                         │
         │  • Real-time Dashboard                    │
         │  • ML Training Pipeline                   │
         └───────────────────────────────────────────┘
```

## Message Flow Timing

```
Time (ms)  Service                 Topic
─────────────────────────────────────────────────────────────────
0          order-producer          → order-events
75         order-validator         → validated-orders
225        inventory-service       → inventory-reserved
575        payment-processor       → payment-confirmed
800        fulfillment-service     → order-fulfilled
1400       notification-service    ✓ (terminal)
─────────────────────────────────────────────────────────────────
           Total: ~1400ms end-to-end
```

## Parallel Processing

```
                    order-events
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
  order-validator  fraud-detector  analytics-agg
         │               │
         │               │
    (sequential)    (parallel)
```

Fraud detection runs in parallel with main flow, doesn't block order processing.

## Error Paths

```
order-validator ──[invalid]──► invalid-orders
                                     │
                                     ▼
                              [Manual Review]
                                     │
                                     ▼
                              [Retry or Cancel]

inventory-service ──[unavailable]──► inventory-unavailable
                                            │
                                            ▼
                                     notification-service
                                            │
                                            ▼
                                     [Email: "Out of Stock"]

payment-processor ──[failed]──► payment-failed
                                      │
                                      ▼
                               notification-service
                                      │
                                      ▼
                               [Email: "Payment Failed"]
```

## Consumer Groups

Each service has its own consumer group, allowing parallel consumption:

```
Topic: order-events
├─ order-validator-group       (reads all messages)
├─ fraud-detector-group        (reads all messages, parallel)
└─ analytics-aggregator-group  (reads all messages, parallel)

Topic: payment-confirmed
├─ fulfillment-service-group   (reads all messages)
├─ fraud-detector-group        (reads all messages, parallel)
└─ analytics-aggregator-group  (reads all messages, parallel)
```

## Data Streams Monitoring View

What you'll see in Datadog DSM:

```
┌─────────────────────────────────────────────────────────────┐
│ Datadog Data Streams Monitoring                             │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Service Map:                                               │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐        │
│  │Producer├──►│Validatr├──►│Inventr├──►│Payment│         │
│  └────────┘   └────────┘   └────────┘   └───┬────┘        │
│                                              │             │
│                                              ▼             │
│                                         ┌────────┐         │
│                                         │Fulfill │         │
│                                         └───┬────┘         │
│                                             │              │
│                                             ▼              │
│                                         ┌────────┐         │
│                                         │Notify  │         │
│                                         └────────┘         │
│                                                            │
│  Pathway Latencies:                                        │
│  • order-producer → notification: 1400ms                   │
│  • order-producer → analytics: 800ms                       │
│                                                            │
│  Consumer Lag:                                             │
│  • order-validator-group: 0ms                              │
│  • inventory-service-group: 12ms                           │
│  • payment-processor-group: 45ms                           │
│                                                            │
│  Throughput:                                               │
│  • order-events: 1.2 msg/s                                 │
│  • validated-orders: 0.98 msg/s (2% rejected)              │
│  • payment-confirmed: 0.93 msg/s (5% failed)               │
└─────────────────────────────────────────────────────────────┘
```

## Topic Partitioning

Default: 1 partition per topic (for simplicity in demo)

For production, would use multiple partitions:

```
Topic: order-events (3 partitions)
├─ Partition 0: customer_id % 3 == 0
├─ Partition 1: customer_id % 3 == 1
└─ Partition 2: customer_id % 3 == 2

Benefit: Parallel processing within consumer group
```

## Message Retention

Default Kafka retention: 7 days

```
order-events ───┬─ [Day 1-7] Available for consumption
                └─ [Day 8+]  Auto-deleted
```

For long-term storage, analytics-aggregator sends to:
- Data warehouse (S3, Snowflake, etc.)
- Long-term object storage
