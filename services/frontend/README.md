# Frontend service README

The frontend services is a JavaScript application that uses the Next.js React framework. It includes it's own set of API routes, which are used to fetch data from the backend services.

## Environment variables



Variables that Next.js uses are prefixed with `NEXT_PUBLIC_`. These variables must be set a build time.



RUM SDK configuration:

`NEXT_PUBLIC_DD_SERVICE_FRONTEND`: The `service` tag value for RUM data
`NEXT_PUBLIC_DD_APPLICATION_ID`: The RUM Application ID
`NEXT_PUBLIC_DD_CLIENT_TOKEN`: The Client Token for the RUM SDK
`NEXT_PUBLIC_DD_SITE`: The Datadog site
`NEXT_PUBLIC_DD_ENV`: The `env` tag value for RUM data
`NEXT_PUBLIC_DD_VERSION_FRONTEND`: The `version` tag value for RUM data

URLs used by the Next.js server:

- `NEXT_PUBLIC_FRONTEND_API_ROUTE`=http://service-proxy:80 # base url for next.js API routes (default: 'http://service-proxy:80')
- `NEXT_PUBLIC_SPREE_API_HOST`=http://service-proxy/services/backend # base url for backend service (default: 'http://service-proxy/services/backend')

URLs used by client components:

- `NEXT_PUBLIC_SPREE_CLIENT_HOST`: base url for backend service
- `NEXT_PUBLIC_SPREE_IMAGE_HOST`: base url for backend service
- `NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN`: allowed image domain
- `NEXT_PUBLIC_ADS_ROUTE`: base url for ads service
- `NEXT_PUBLIC_DISCOUNTS_ROUTE`: base url for discounts service
- `NEXT_PUBLIC_DBM_ROUTE`base url for dbm service

You probably don't need to change any of these values:

`FRONTEND_COMMAND`: Command to run the frontend service


>
> The ones without the `http://service-proxy` prefix are used in the frontend service's `fetch` calls, which are made from the browser and are caught by the nginx service, because it intercepts calls to Next.js API routes and routes them to the appropriate service. -->