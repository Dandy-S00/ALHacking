#!/usr/bin/env bash
# =============================================================================
#  ALHACKING — NetChain Setup Script
#  Target: Kali Linux (6.x kernel), Go 1.22+
#  Jules Config: https://jules.google.com/repo/github/Dandy-S00/ALHacking/config
#
#  Chains: Host Discovery → Port/Service Scan → CVE Lookup → Exploit Correlation
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

banner() {
  echo -e "${CYAN}${BOLD}"
  echo '  _   _      _  ____ _           _       '
  echo ' | \ | | ___| |/ ___| |__   __ _(_)_ __  '
  echo ' |  \| |/ _ \ | |   | '"'"'_ \ / _` | | '"'"'_ \ '
  echo ' | |\  |  __/ | |___| | | | (_| | | | | |'
  echo ' |_| \_|\___|_|\____|_| |_|\__,_|_|_| |_|'
  echo -e "${NC}"
  echo -e "${YELLOW}  ALHacking :: Network Recon + Vuln Chain Tool${NC}"
  echo -e "${YELLOW}  Kali Linux | Go 1.22+ | Jules-Ready${NC}"
  echo ""
}

log()  { echo -e "${GREEN}[+]${NC} $*"; }
info() { echo -e "${CYAN}[*]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
die()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# ─── Privilege Check ──────────────────────────────────────────────────────────
check_root() {
  if [[ $EUID -ne 0 ]]; then
    warn "Not running as root. Some nmap features (SYN scan, OS detection) require root."
    warn "Re-run with: sudo bash setup.sh"
    read -rp "Continue anyway? [y/N] " ans
    [[ "$ans" =~ ^[Yy]$ ]] || exit 1
  fi
}

# ─── System Dependencies ──────────────────────────────────────────────────────
install_system_deps() {
  info "Updating package lists..."
  apt-get update -qq

  info "Installing system dependencies..."
  apt-get install -y -qq \
    nmap \
    golang-go \
    git \
    curl \
    jq \
    libpcap-dev \
    build-essential \
    exploitdb \
    || die "Failed to install system packages. Check your apt sources."

  log "System dependencies installed."
}

# ─── Go Version Check ─────────────────────────────────────────────────────────
check_go_version() {
  if ! command -v go &>/dev/null; then
    info "Go not found via PATH. Installing Go 1.22 manually..."
    install_go_manual
    return
  fi

  GO_VER=$(go version | awk '{print $3}' | sed 's/go//')
  REQUIRED="1.22"
  if [[ "$(printf '%s\n' "$REQUIRED" "$GO_VER" | sort -V | head -n1)" != "$REQUIRED" ]]; then
    warn "Go $GO_VER found, but $REQUIRED+ required. Installing newer version..."
    install_go_manual
  else
    log "Go $GO_VER detected — OK."
  fi
}

install_go_manual() {
  local GO_VERSION="1.22.3"
  local ARCH
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64)  GOARCH="amd64" ;;
    aarch64) GOARCH="arm64" ;;
    *)       die "Unsupported architecture: $ARCH" ;;
  esac

  local TARBALL="go${GO_VERSION}.linux-${GOARCH}.tar.gz"
  local URL="https://go.dev/dl/${TARBALL}"

  info "Downloading Go ${GO_VERSION} for ${GOARCH}..."
  curl -fsSL "$URL" -o "/tmp/${TARBALL}"
  rm -rf /usr/local/go
  tar -C /usr/local -xzf "/tmp/${TARBALL}"
  rm "/tmp/${TARBALL}"

  export PATH="/usr/local/go/bin:$PATH"
  echo 'export PATH="/usr/local/go/bin:$PATH"' >> /etc/profile.d/golang.sh
  chmod +x /etc/profile.d/golang.sh

  log "Go ${GO_VERSION} installed at /usr/local/go"
}


# ─── Build ────────────────────────────────────────────────────────────────────
build_project() {
  local PROJECT_DIR="${1:-$PWD}"
  info "Fetching Go module dependencies..."
  cd "$PROJECT_DIR"
  go mod tidy
  go mod download

  info "Building netchian binary..."
  mkdir -p bin
  go build -ldflags="-s -w" -o bin/netchian ./cmd/netchian/

  log "Build successful: $PROJECT_DIR/bin/netchian"
}

install_binary() {
  local PROJECT_DIR="${1:-$PWD}"
  install -Dm755 "$PROJECT_DIR/bin/netchian" /usr/local/bin/netchian
  log "Installed: /usr/local/bin/netchian"
}

# ─── Main ─────────────────────────────────────────────────────────────────────
main() {
  banner
  check_root

  PROJECT_DIR="${NETCHIAN_DIR:-$PWD}"

  install_system_deps
  check_go_version
  build_project    "$PROJECT_DIR"
  install_binary   "$PROJECT_DIR"

  echo ""
  color.Cyan() { echo -e "${CYAN}$*${NC}"; }
  echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}${BOLD}  ✓ NetChain setup complete!${NC}"
  echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "  Run: ${CYAN}sudo netchian scan -t 192.168.1.0/24${NC}"
  echo -e "  Run: ${CYAN}sudo netchian --help${NC}"
  echo ""
}

main "$@"
