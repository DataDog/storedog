# syntax = docker/dockerfile:1
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod ./
COPY main.go ./

RUN go build -o ad-provider .

FROM alpine:3.19

WORKDIR /app
COPY --from=builder /app/ad-provider .

ENV PORT=8081 \
    AD_PROVIDER_LATENCY_MS=100

EXPOSE 8081

CMD ["./ad-provider"]
