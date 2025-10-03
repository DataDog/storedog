FROM ghcr.io/puppeteer/puppeteer:24.23.0

# Set default environment variables
ENV STOREDOG_URL=http://service-proxy:80 \
  PUPPETEER_TIMEOUT=30000

USER pptruser
WORKDIR /home/pptruser

# Install Firefox for Puppeteer
RUN npx puppeteer browsers install firefox

COPY ./scripts/ ./

# Wait for Storedog to be ready, then start continuous traffic generation
CMD ["bash", "-c", "until wget --quiet -O - $STOREDOG_URL | grep -qi storedog; do echo -n .; sleep 2; done && echo -e '\\nBrowser replay starting.\\n' && node puppeteer-modular.js $STOREDOG_URL"]