
FROM ruby:3.0.3

RUN apt-get update -yq \
  && apt-get upgrade -yq \
  #ESSENTIALS
  && apt-get install -y -qq --no-install-recommends build-essential curl git-core vim passwd unzip cron gcc wget netcat imagemagick postgresql-client wait-for-it \
  # INSTALL NODE
  && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  # INSTALL YARN
  && npm install -g yarn

# Clean cache and temp files, fix permissions
RUN apt-get clean -qy \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# install specific version of bundler
RUN gem install bundler -v 2.2.32

ENV BUNDLE_GEMFILE=/app/Gemfile \
  BUNDLE_JOBS=20 \
  BUNDLE_PATH=/bundle \
  BUNDLE_BIN=/bundle/bin \
  GEM_HOME=/bundle
ENV PATH="${BUNDLE_BIN}:${PATH}"


COPY . .

RUN bundle install
RUN yarn install
RUN yarn build

EXPOSE 4000

CMD ["/bin/bash", "-c", "bundle exec rails s -b 0.0.0.0 -p 4000"]
