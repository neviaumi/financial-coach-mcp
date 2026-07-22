#!/usr/bin/env bash
set -ex

if [ -z "$VITE_API_BASE_URL" ]; then
    echo "Error: VITE_API_BASE_URL environment variable is not set." >&2
    exit 1
fi

MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    dx vite dev
else
    export PATH="$DENO_HOME/bin:$PATH"
    $DENO_HOME/bin/dx vite build
    $DENO_HOME/bin/dx vite preview --host
fi
