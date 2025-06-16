all: build

format:
	@go fmt 

dev:
	@air

build:
	@go build -ldflags="-w -s" -o main ./cmd/web

start:
	@./tmp/websocket

clean:
	@rm -rf ./tmp

.PHONY: all format test clean
