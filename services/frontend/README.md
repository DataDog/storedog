# Frontend service

## Description

The frontend services is a JavaScript application that uses the Next.js React framework. It includes it's own set of API routes, which are used to fetch data from the backend services.

## The Dockerfiles

The `Dockerfiles/dev.Dockerfile` creates a development image. This image doesn't leverage Docker layers and is meant for local development. Builds are slower, but you can easily see changes with hot reloads.

The `Dockerfiles/prod.Dockerfile` creates an optimized production image. This is best used in prod when buildtime changes are frequently needed (ex: updating the RUM SDK version number, which must be present at build time). Subsequent builds (after the initial build) are faster, because Docker can leverage cached build layers that haven't changed.
