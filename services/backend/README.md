# Backend service (product management) README

This service manages the products in the store. It is a Ruby on Rails application built using the Spree framework. The service is packaged as a Docker image and typically used in a Docker Compose file (see the root of this repo).

It's accessible at `http://localhost:4000`, but there's nothing at that path since we run the service as a headless API. The admin interface is available at `http://localhost:4000/admin`. Login with the following credentials to access the admin interface if you would like to add products or manage orders:

```
Username: admin@storedog.com
Password: password
```

If you make any changes to the backend service, you will need to rebuild the Docker image to ensure new images uploaded are saved. You'll also need to create a restore point to ensure the new images are available in the database.

## Worker

The Spree application has a worker process that runs in the background. There is a specific Datadog tracer configuration for it in the `services/worker/` directory and is mounted into the worker container.
