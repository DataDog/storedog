FROM ghcr.io/puppeteer/puppeteer:20.0.0

# Set default environment variables
ENV STOREDOG_URL=http://nginx:80 \
  PUPPETEER_TIMEOUT=30000

USER pptruser
WORKDIR /home/pptruser

COPY ./scripts/puppeteer.sh .
COPY ./scripts/puppeteer.js .

CMD ["bash", "puppeteer.sh"]