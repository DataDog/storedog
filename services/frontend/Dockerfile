FROM node:20 AS builder

# install wait-for-it
RUN apt-get update && apt-get install -y wait-for-it

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
