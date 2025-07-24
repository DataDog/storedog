# Discounts service

## Description

This service is responsible for managing discounts written in Python using the Flask framework. It uses a PostgreSQL database to store the discounts.

## Datadog configuration

### Logs

Logging is configured in the `docker-compose.yml` file along with the Datadog Agent.

### APM

The `ddtrace` library is used to instrument the Python service. The `ddtrace` library is installed in the `requirements.txt` file. The `ddtrace-run` command is used to run the service in the `Dockerfile`.

Log injection is enabled in the `docker-compose.yml` file, but the logs are formatted in the `ads.py` file.

## Endpoints

Use the following endpoints to interact with the service.

### GET / (health check)

Returns a message indicating that the service is up and running.

#### Request

```text
GET /
```

#### Response

```text
Hello from Discounts!
```

### GET /discount

Returns a list of all discounts. 

#### Request

```text
GET /discount
```

#### Response

```json
[
  {
    "id": 1, 
    "name": "10% off", 
    "description": "10% off all items", 
    "active": true
  }, 
  {
    "id": 2, 
    "name": "20% off", 
    "description": "20% off all items", 
    "active": true
  }, 
  {
    "id": 3, 
    "name": "30% off", 
    "description": "30% off all items", 
    "active": true
  },
  ...
]
```

### POST /discount

Creates a new discount at random. It doesn't accept a request body.

#### Request

```text
POST /discount
```

#### Response

Returns all discounts with new one appended.

```json
[
  {
    "id": 1, 
    "name": "10% off", 
    "description": "10% off all items", 
    "active": true
  }, 
  {
    "id": 2, 
    "name": "20% off", 
    "description": "20% off all items", 
    "active": true
  }, 
  {
    "id": 3, 
    "name": "30% off", 
    "description": "30% off all items", 
    "active": true
  },
  ...
  {
    "id": 99,
    "name": "100% off",
    "description": "New Discount",
    "active": true
  }
]
```

## Database

The service uses a PostgreSQL database to store the discounts. The database is configured in the `docker-compose.yml` file.

The application uses the SQLAlchemy ORM to interact with the database. The `Discount` and `Influencer` model are defined in the `models.py` file and the `discounts` table is created in the `bootstrap.py` file.

### Schema

The `discounts` table has the following schema:

| Column | Type | Description |
| --- | --- | --- |
| id | integer | Unique identifier for the discount (Primary Key) |
| name | string | Name of the discount |
| code | string | Discount code |
| value | integer | Discount value |
| discount_type_id | integer | Foreign key to the discount type |

> **Note**: We use these values the most. The other two tables seem serve a legacy purpose.

The `discount_types` table has the following schema:

| Column | Type | Description |
| --- | --- | --- |
| id | integer | Unique identifier for the discount type (Primary Key) |
| name | string | Name of the discount type |
| influencer_id | integer | Foreign key to the influencer |
| discount_query | string | Query to get the discount |

The `influencers` table has the following schema:

| Column | Type | Description |
| --- | --- | --- |
| id | integer | Unique identifier for the influencer (Primary Key) |
| name | string | Name of the influencer |
| discount_types | string | Discount types associated with the influencer |