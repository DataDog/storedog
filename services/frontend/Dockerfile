FROM node:16.18.0 as builder
WORKDIR /storedog-app
COPY . .
EXPOSE 3000
RUN ["yarn","install", "--frozen-lockfile", "--network-timeout 1000000"]
