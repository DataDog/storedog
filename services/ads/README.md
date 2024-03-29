# Advertisements Service

## Description

This service is responsible for managing the banner advertisements served to the frontend service of the application. There are two variations of this service, one uses Python and the other uses Java.

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


