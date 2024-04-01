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