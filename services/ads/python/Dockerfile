# syntax = docker/dockerfile:1
FROM python:2.7-slim-buster

# Change repository used by Apt
RUN sed -i s/deb.debian.org/archive.debian.org/g /etc/apt/sources.list && \
    sed -i 's|security.debian.org|archive.debian.org|g' /etc/apt/sources.list && \
    sed -i '/buster-updates/d' /etc/apt/sources.list

# Update, upgrade, and cleanup debian packages
RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get upgrade --yes && \
    apt-get install --yes build-essential libpq-dev wait-for-it && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy over app
WORKDIR /app
COPY . .

# Install dependencies via pip and avoid caching build artifacts
RUN pip install --no-cache-dir -r requirements.txt

# Set default Flask app and development environment
ENV FLASK_APP=ads.py \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_USER=postgres \
    POSTGRES_HOST=postgres

CMD ["flask", "run", "--port=3030", "--host=0.0.0.0"]
