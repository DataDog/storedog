FROM ruby:3.0.3

RUN apt-get update -yq \
  && apt-get upgrade -yq \
  #ESSENTIALS
  && apt-get install -y -qq --no-install-recommends build-essential curl git-core vim passwd unzip cron gcc wget netcat imagemagick postgresql-client wait-for-it \
  # INSTALL NODE
  && curl -sL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  # INSTALL YARN
  && npm install -g yarn

# Clean cache and temp files, fix permissions
RUN apt-get clean -qy \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# install specific version of bundler
RUN gem install bundler -v 2.2.32

ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA

ENV BUNDLE_GEMFILE=/app/Gemfile \
  BUNDLE_JOBS=20 \
  BUNDLE_PATH=/bundle \
  BUNDLE_BIN=/bundle/bin \
  GEM_HOME=/bundle \
  # Default environment variables
  RAILS_ENV=production \
  REDIS_URL=redis://redis:6379/0 \
  DB_HOST=postgres \
  DB_PORT=5432 \
  POSTGRES_PASSWORD=postgres \
  POSTGRES_USER=postgres \
  DB_POOL=25 \
  MAX_THREADS=5 \
  DISABLE_SPRING=1 \
  DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL} \
  DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

ENV PATH="${BUNDLE_BIN}:${PATH}"

COPY . .

RUN bundle install || exit 1
RUN npm install
RUN npm run build

EXPOSE 4000

CMD ["/bin/bash", "-c", "rm -f /app/tmp/pids/server.pid && bundle exec ddprofrb exec rails s -b 0.0.0.0 -p 4000"]
