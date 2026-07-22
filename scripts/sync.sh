#!/usr/bin/env bash

set -ex

# 1. Set default mode
MODE="--dev"

# 2. Parse option flags
while [[ "$1" == --* ]]; do
    MODE="$1"
    shift
done

# 3. Capture the mandatory year
YEAR_MONTH_CODE=$1
if [[ -z "$YEAR_MONTH_CODE" ]]; then
    echo "Error: YEAR_MONTH_CODE argument is required."
    exit 1
fi
YEAR_MONTH_CODE=$(deno ./cli/print-statement-start-date.ts $YEAR_MONTH_CODE)

# Fetch GoCardless secrets from GCP Secret Manager if not already set in the environment
export GO_CARD_LESS_SECRET_ID=$(gcloud secrets versions access latest --secret="gocardless-secret-id")
export GO_CARD_LESS_SECRET_KEY=$(gcloud secrets versions access latest --secret="gocardless-secret-key")

if ! command -v cloudflared &> /dev/null; then
    echo "Error: cloudflared is not installed but tunnel is required."
    exit 1
fi
PORT=${APP_OPENBANKING_PORT:-8083}
mkdir -p .cache
TUNNEL_LOG=".cache/cf_tunnel.log"
rm -f "$TUNNEL_LOG"

echo "Starting cloudflared tunnel on port $PORT..."
cloudflared tunnel --url "http://localhost:$PORT" > "$TUNNEL_LOG" 2>&1 &
CLOUDFLARED_PID=$!

# Set a trap to clean up the background cloudflared process when the script exits
cleanup() {
    echo "Shutting down cloudflared tunnel..."
    kill "$CLOUDFLARED_PID" 2>/dev/null || true
    rm -f "$TUNNEL_LOG"
}
trap cleanup EXIT

echo "Waiting for tunnel URL..."
TIMEOUT=30
ELAPSED=0
TUNNEL_URL=""
while [ $ELAPSED -lt $TIMEOUT ]; do
    if [ -f "$TUNNEL_LOG" ]; then
        TUNNEL_URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' "$TUNNEL_LOG" | head -n 1)
        if [ -n "$TUNNEL_URL" ]; then
            break
        fi
    fi
    sleep 1
    ELAPSED=$((ELAPSED + 1))
done

if [ -z "$TUNNEL_URL" ]; then
    echo "Error: Failed to obtain Cloudflare Tunnel URL within $TIMEOUT seconds."
    exit 1
fi

echo "Cloudflare Tunnel established: $TUNNEL_URL"
export APP_OPENBANKING_REDIRECT_URL="$TUNNEL_URL"

if [ "$MODE" == "--dev" ]; then
    APP_ENV="DEV" deno -P \
    ./cli/sync.ts $YEAR_MONTH_CODE
else
    export APP_OPENBANKING_REDIRECT_URL="${APP_OPENBANKING_REDIRECT_URL:-http://bank.home.pi}"
    APP_ENV="PROD" deno \
    -P \
    ./cli/sync.ts $YEAR_MONTH_CODE
fi

SYSTEM_INSTRUCTIONS=$(cat .gemini/system.md)
agy --mode accept-edits --dangerously-skip-permissions -p "$SYSTEM_INSTRUCTIONS

Analysis @.cache/statements/$YEAR_MONTH_CODE.json"
rclone copyto ".cache/statements/$YEAR_MONTH_CODE.json"  "gdrive:david/expense/Consolidated Statements/json/$YEAR_MONTH_CODE.json"
