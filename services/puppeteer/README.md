# Puppeteer service README

The Puppeteer service is a Node.js service that runs a headless browser to generate RUM data for the frontend.

It's a pre-built image that has sessions defined to run on the application, found in `services/puppeteer/scripts/puppeteer.js` but you can use Docker volume mounts to bring in your own customized sessions.

```sh
# add this to puppeteer service definition in a Docker Compose file
volumes:
  - ./services/puppeteer/scripts/puppeteer.js:/home/pptruser/puppeteer.js
```

## Environment variables

- `STOREDOG_URL`: The URL of the Storedog frontend. In development, this is `http://service-proxy:80`. In lab environments, this is the lab host's URL.
- `PUPPETEER_TIMEOUT`: [Maximum time in milliseconds to wait for the browser to start.](https://github.com/puppeteer/puppeteer/blob/puppeteer-v20.0.0/docs/api/puppeteer.launchoptions.md)
- `SKIP_SESSION_CLOSE`: The current puppeteer script doesn't make use of this environment variable but can easily be updated to do so.