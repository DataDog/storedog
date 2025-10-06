# syntax = docker/dockerfile:1.2
# ^ This enables the new BuildKit stable syntax which can be
# run with the DOCKER_BUILDKIT=1 environment variable in your
# docker build command (see build.sh)
FROM python:3.9.23-slim-bookworm

# Update, upgrade, and cleanup debian packages
RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get upgrade --yes && \
    apt-get install --yes build-essential libpq-dev openssh-server sudo dumb-init rsyslog netcat-openbsd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Setup for attack scenario
RUN useradd -rm -g root -G sudo test 
RUN  echo 'test:test' | chpasswd
USER test

# Bring in app
WORKDIR /app
COPY . .

USER root

ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA

# Default environment variables
ENV FLASK_APP=discounts.py \
    POSTGRES_HOST=postgres \
    POSTGRES_PORT=5432 \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_USER=postgres \
    DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL} \
    DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

# Install dependencies via pip and avoid caching build artifacts
RUN pip install --no-cache-dir -r requirements.txt

# required to get logs out of the container
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["sh", "-c", "ddtrace-run flask run --port=2814 --host=0.0.0.0"]
