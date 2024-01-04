# Advertisements Service

## Description

This service is responsible for managing the banner advertisements served to the frontend service of the application. There are two variations of this service, one uses Python and the other uses Java.

## Python service

The Python service is a Flask application that uses SQLAlchemy to connect to a PostgreSQL database. The service is packaged as a Docker image and typically used in a Docker Compose file (see the root of this repo).

### Endpoints (Python)

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

### Datadog configuration

#### Logs

Logging is configured in the `docker-compose.yml` file along with the Datadog Agent.

#### APM

The `ddtrace` library is used to instrument the Python service. The `ddtrace` library is installed in the `requirements.txt` file. The `ddtrace-run` command is used to run the service in the `Dockerfile`.

Log injection is enabled in the `docker-compose.yml` file, but the logs are formatted in the `ads.py` file.


