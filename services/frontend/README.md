# Frontend service

## Description

The frontend service is a JavaScript application that uses the Next.js React framework. It includes its own set of API routes, which are used to fetch data from the backend services.

## RUM Configuration

This branch includes special RUM credential routing for the retention filters lab:

### Middleware (`middleware.ts`)

Next.js middleware intercepts all requests and:
1. Reads `X-RUM-App-ID` and `X-RUM-Client-Token` headers (forwarded by nginx)
2. Sets `rum_app_id` and `rum_client_token` cookies in the response

These cookies are read by the browser to initialize the Datadog RUM SDK with the correct application credentials.

### RUM SDK Initialization (`pages/_app.tsx`)

The RUM SDK is initialized on the client side by:
1. Reading `rum_app_id` and `rum_client_token` cookies
2. Calling `datadogRum.init()` with the credentials from cookies
3. Setting up event handlers and the debug panel (for learner sessions)

### Session Debug Panel

Learner browser sessions (identified by `learning-center-user@example.com`) display a debug panel showing live RUM events. This helps learners understand how often RUM events are generated and when they're evaluated against retention filters.

