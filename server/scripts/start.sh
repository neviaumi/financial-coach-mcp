#!/usr/bin/env bash
set -ex


MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    deno serve -P --port 8084 --watch-hmr ./main.ts
else
    $DENO_HOME/bin/deno serve -P --port 8084 ./main.ts
fi
