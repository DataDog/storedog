# syntax = docker/dockerfile:1
FROM golang:1.26-alpine AS builder

WORKDIR /app
COPY go.mod ./
COPY main.go ./

RUN go build -o pricing .

FROM alpine:3.22

WORKDIR /app
COPY --from=builder /app/pricing .

ENV PORT=5001

EXPOSE 5001

CMD ["./pricing"]
