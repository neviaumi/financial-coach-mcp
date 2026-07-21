#!/usr/bin/env bash

set -ex

# 1. Set default mode
MODE="--dev"

# 2. Check if the first argument is a flag (starts with --)
if [[ "$1" == --* ]]; then
    MODE="$1"
    shift
fi

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

if [ "$MODE" == "--dev" ]; then
    APP_ENV="DEV" deno -P \
    ./cli/sync.ts $YEAR_MONTH_CODE
else
    APP_OPENBANKING_HOST="bank.home.pi" APP_ENV="PROD" deno \
    -P \
    ./cli/sync.ts $YEAR_MONTH_CODE
fi

SYSTEM_INSTRUCTIONS=$(cat .gemini/system.md)
agy --mode accept-edits --dangerously-skip-permissions -p "$SYSTEM_INSTRUCTIONS

Analysis @.cache/statements/$YEAR_MONTH_CODE.json"
rclone copyto ".cache/statements/$YEAR_MONTH_CODE.json"  "gdrive:Consolidated Statements/json/$YEAR_MONTH_CODE.json"
