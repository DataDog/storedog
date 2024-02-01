FROM node:20 as builder
WORKDIR /storedog-app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
