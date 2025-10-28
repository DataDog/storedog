FROM ghcr.io/puppeteer/puppeteer:24.23.0

# Set default environment variables
ENV STOREDOG_URL=http://service-proxy:80 \
  PUPPETEER_TIMEOUT=30000 \
  PUPPETEER_ENABLE_CACHE=false \
  PUPPETEER_MAX_CONCURRENT=16 \
  PUPPETEER_SYSTEM_MEMORY=8GB \
  PUPPETEER_STARTUP_DELAY=10000 \
  PUPPETEER_RAMP_INTERVAL=30000 \
  PUPPETEER_DEBUG=false \
  PUPPETEER_DEBUG_SESSIONS=false \
  PUPPETEER_LOOP=single \
  PUPPETEER_SESSION_TYPES=BrowsingSession,TaxonomySession,FrustrationSession,HomePageSession

USER pptruser
WORKDIR /home/pptruser

COPY ./scripts/ ./

CMD ["node", "puppeteer-modular.js", "$STOREDOG_URL"]