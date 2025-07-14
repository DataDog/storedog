# syntax = docker/dockerfile:1.2
# ^ This enables the new BuildKit stable syntax which can be
# run with the DOCKER_BUILDKIT=1 environment variable in your
# docker build command (see build.sh)
FROM python:3.9.23-slim-bookworm

# Update, upgrade, and cleanup debian packages
RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get upgrade --yes && \
    apt-get install --yes build-essential libpq-dev openssh-server sudo dumb-init rsyslog wait-for-it && \
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
    FLASK_DEBUG=0 \
    POSTGRES_HOST=postgres \
    POSTGRES_PORT=5432 \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_USER=postgres \
    DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL} \
    DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

# Install dependencies via pip and avoid caching build artifacts
RUN pip install --no-cache-dir -r requirements.txt

# Pass in Port mapping (default to 2814)
ARG DISCOUNTS_PORT=2814
# Because CMD is a runtime instruction, we have to create an additional ENV var that reads the ARG val
# Only ENV vars are accessible via CMD
ENV DISCOUNTS_PORT ${DISCOUNTS_PORT}

# required to get logs out of the container
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["sh", "-c", "ddtrace-run flask run --port=${DISCOUNTS_PORT} --host=0.0.0.0"]
