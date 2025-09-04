#!/usr/bin/env bash

set -ex

MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    APP_ENV="DEV" op run --env-file="./.env.dev" -- deno \
    --unstable-temporal \
    --allow-read \
    --allow-write \
    --allow-run \
    --allow-env \
    --allow-net \
    ./cli/sync.ts
else
    APP_ENV="PROD" deno \
    --env-file \
    --unstable-temporal \
    --allow-sys \
    --allow-read \
    --allow-write \
    --allow-run \
    --allow-env \
    --allow-net \
    ./cli/sync.ts
fi
