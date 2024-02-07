FROM node:20 as builder

# install wait-for-it
RUN apt-get update && apt-get install -y wait-for-it

WORKDIR /storedog-app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
