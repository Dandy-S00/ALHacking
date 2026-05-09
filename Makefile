BINARY    = netchian
BUILD_DIR = ./bin
GO        = go
GOFLAGS   = -ldflags="-s -w"

.PHONY: all build install clean test deps

all: deps build

deps:
	$(GO) mod tidy
	$(GO) mod download

build:
	mkdir -p $(BUILD_DIR)
	$(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY) ./cmd/netchian/

install: build
	install -Dm755 $(BUILD_DIR)/$(BINARY) /usr/local/bin/$(BINARY)
	@echo "[+] Installed to /usr/local/bin/$(BINARY)"

clean:
	rm -rf $(BUILD_DIR)

test:
	$(GO) test ./...
