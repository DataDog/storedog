# Postgres service README

The Postgres service is a Postgres database that stores the product catalog and order data, as well as the discount data for the discounts service.

The Postgres service also has logging set up to write to a JSON file and a fairly quick log rotation, which get saved in a Docker volume. 

## Database rebuild

To create a new `.sql` restore file, run the following command while the application is running.

```sh
sh ./scripts/backup-db.sh
```

This will create a new `restore.sql` file in the `services/postgres/db/` directory and get it set up with all of necessary SQL statements to prepare the database for Datadog monitoring. When done running, you'll want to rebuild the Postgres database image with the new restore point.
