FROM ghcr.io/puppeteer/puppeteer:20.0.0

USER pptruser
WORKDIR /home/pptruser

COPY ./scripts/puppeteer.sh .
COPY ./scripts/puppeteer.js .

CMD ["bash", "puppeteer.sh"]