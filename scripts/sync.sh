#!/usr/bin/env bash

set -ex

MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    APP_ENV="DEV" op run --env-file="./.env.dev" -- deno \
    -P \
    ./cli/sync.ts
else
    APP_ENV="PROD" deno \
    -P \
    ./cli/sync.ts
fi
