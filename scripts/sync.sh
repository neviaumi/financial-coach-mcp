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
if [ "$MODE" == "--dev" ]; then
    APP_ENV="DEV" op run --env-file="./.env.dev" -- deno \
    -P \
    ./cli/sync.ts $YEAR_MONTH_CODE
else
    APP_OPENBANKING_HOST="192.168.0.16" APP_ENV="PROD" deno \
    -P \
    ./cli/sync.ts $YEAR_MONTH_CODE
fi

echo "Analysis @.cache/statements/$YEAR_MONTH_CODE.json" | GEMINI_SYSTEM_MD=true gemini --approval-mode "auto_edit"
rclone copyto ".cache/statements/$YEAR_MONTH_CODE.json"  "gdrive:Consolidated Statements/json/$YEAR_MONTH_CODE.json"
