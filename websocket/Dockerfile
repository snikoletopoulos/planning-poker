FROM golang:1.24-bookworm AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

ENV CGO_ENABLED=1

RUN make build

FROM debian:bookworm-slim AS runner

RUN groupadd -r gogroup 
RUN useradd -r -g gogroup websockets
USER websockets

WORKDIR /app

COPY --from=builder --chown=websockets:gogroup /app/main .

EXPOSE 3001

CMD ["./main"]
