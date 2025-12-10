# service-proxy (nginx) service README

The nginx service is a reverse proxy that handles requests for both the frontend and backend API services. It is accessible at `http://localhost`.

When viewing information about the application in Datadog, you'll see it referenced as `service-proxy`.

## RUM Credential Routing

This branch includes special nginx configuration for the retention filters lab that routes different traffic sources to different RUM applications.

### How It Works

1. **Puppeteer sessions** set custom HTTP headers:
   - `X-RUM-App-ID` - Specifies which RUM application to use
   - `X-RUM-Client-Token` - Provides the client token

2. **Learner sessions** don't set custom headers, so nginx uses defaults from environment variables:
   - `DEFAULT_RUM_APP_ID` 
   - `DEFAULT_RUM_CLIENT_TOKEN`

3. Nginx forwards these credentials to Next.js as proxy headers using `proxy_set_header`

4. Next.js middleware reads the headers and sets cookies in the response

### Configuration

See `default.conf.template` lines 72-89 for the RUM routing logic:
- Reads incoming `X-RUM-App-ID` and `X-RUM-Client-Token` headers
- Falls back to `DEFAULT_RUM_APP_ID` and `DEFAULT_RUM_CLIENT_TOKEN` if headers are empty
- Forwards final values to Next.js as proxy headers