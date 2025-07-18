# syntax = docker/dockerfile:1
FROM python:3.9.23-slim-bookworm

# Update, upgrade, and cleanup debian packages
RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get upgrade --yes && \
    apt-get install --yes build-essential libpq-dev dumb-init wait-for-it && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Bring in app
WORKDIR /app
COPY . .

# Let Flask know what to boot
ENV FLASK_APP=discounts.py \
    # Default environment variables
    FLASK_DEBUG=0 \
    POSTGRES_HOST=postgres \
    POSTGRES_PORT=5432

# Install dependencies via pip and avoid caching build artifacts
RUN pip install --no-cache-dir -r requirements.txt

# required to get logs out of the container
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["flask", "run", "--port=2814", "--host=0.0.0.0"]
