#!/usr/bin/env bash
set -ex


MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    deno serve --allow-env --allow-read --watch-hmr ./server/main.ts
else
    deno serve --allow-env --allow-read ./server/main.ts
fi
