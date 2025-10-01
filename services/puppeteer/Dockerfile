FROM ghcr.io/puppeteer/puppeteer:24.22.0

# Set default environment variables
ENV STOREDOG_URL=http://service-proxy:80 \
  PUPPETEER_TIMEOUT=30000

USER pptruser
WORKDIR /home/pptruser

COPY ./scripts/ ./

CMD ["bash", "puppeteer.sh"]