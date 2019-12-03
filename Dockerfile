FROM golang:1.12 AS build_base
WORKDIR /twilight-go
COPY go.mod .
RUN GO111MODULE=on go mod download

# This image builds the weavaite server
FROM build_base AS builder
# Here we copy the rest of the source code
COPY . .
# And compile the project
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -ldflags '-extldflags "-static"'  -o twilight-go

FROM alpine:3.9
RUN apk add --no-cache bash tzdata
COPY --from=builder /twilight-go/public /
COPY --from=builder /twilight-go/twilight-go /
COPY --from=0 /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
WORKDIR /
CMD ["/twilight-go"]