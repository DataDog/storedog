# Storedog - RUM Retention Filters Lab Version

This is a specialized branch of Storedog configured for the RUM retention filters lab. It features a custom RUM configuration system that routes traffic to multiple RUM applications based on the source (puppeteer automated sessions vs. learner browser sessions).

## RUM Configuration Architecture

This branch implements dynamic RUM application routing that allows different traffic sources to send data to different RUM applications. This is essential for the retention filters lab, where learners investigate specific patterns in dedicated RUM applications.

### Learner Sessions

Learner browser sessions (real users accessing Storedog through their browser) don't send custom headers. Nginx uses default RUM credentials from environment variables and forwards them to Next.js, where middleware sets cookies in the response.

```mermaid
sequenceDiagram
    participant Browser as Learner Browser
    participant Nginx as Nginx (service-proxy)
    participant NextJS as Next.js Frontend
    participant Middleware as Next.js Middleware

    Note over Nginx: Environment variables:<br/>DEFAULT_RUM_APP_ID<br/>DEFAULT_RUM_CLIENT_TOKEN
    
    Browser->>Nginx: HTTP Request (no custom headers)
    
    Note over Nginx: No X-RUM-* headers present,<br/>use default values,<br/>forward to Next.js
    
    Nginx->>NextJS: Proxy headers:<br/>X-RUM-App-ID (default)<br/>X-RUM-Client-Token (default)
    NextJS->>Middleware: Request passes through middleware
    
    Note over Middleware: Read proxy headers,<br/>set cookies in response
    
    Middleware->>Browser: HTML + Set-Cookie headers
    
    Note over Browser: Cookies stored, RUM SDK<br/>initializes with credentials
```

**Key Differences:**

| Aspect                 | Puppeteer Sessions                   | Learner Sessions              |
|------------------------|--------------------------------------|-------------------------------|
| RUM Credentials Source | Custom HTTP headers per request      | Default environment variables |
| Session Debug Panel    | Hidden                               | Visible                       |
| User Type              | Random fake users (various personas) | "Learning Center User"        |

## Service changes

### Backend

Has an extra endpoint for the about-us page. This is to illustrate poor Largest Contentful Paint performance on the frontend. This must be used in conjunction with Puppeteer sessions that visit the /about-us page on Storedog's frontend.

### Nginx

Reads custom headers from puppeteer (or uses defaults for learners) and forwards them as proxy headers to Next.js. The headers are as follows:

- `X-RUM-App-ID` - RUM application ID
- `X-RUM-Client-Token` - RUM client token

Configuration is in [`services/nginx/default.conf.template`](services/nginx/default.conf.template).

### Frontend

RUM configuration is handled at runtime via Next.js middleware ([`middleware.ts`](services/frontend/middleware.ts)):

1. Reads `X-RUM-App-ID` and `X-RUM-Client-Token` headers forwarded by nginx
2. Sets `rum_app_id` and `rum_client_token` cookies in the response
3. Browser JavaScript reads these cookies to initialize the RUM SDK

There is a [RUM Debug popover](services/frontend/components/SessionDebugPanel.tsx) in Storedog that displays when a learner visits Storedog. The popover displays live RUM Events and updates to help illustrate how often new RUM Events/updates are generated and indicate how often they will be evaluated against the RUM Application's Retention filters.

### Puppeteer

The Puppeteer service was significantly refactored for this branch. See [`services/puppeteer/README.md`](services/puppeteer/README.md) for full documentation.