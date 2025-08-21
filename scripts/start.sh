#!/usr/bin/env bash
set -ex


MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    deno serve --allow-env --allow-read --port 8084 --watch-hmr ./server/main.ts
else
    $DENO_HOME/bin/deno serve --allow-env --allow-read --port 8084 ./server/main.ts
fi
