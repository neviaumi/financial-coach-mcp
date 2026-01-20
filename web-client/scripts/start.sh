#!/usr/bin/env bash
set -ex


MODE=${1:---dev}
ROOT='./web-client'

if [ "$MODE" == "--dev" ]; then
    dx vite dev "$ROOT"
else
    $DENO_HOME/bin/dx vite build "$ROOT"
    $DENO_HOME/bin/dx vite preview "$ROOT"
fi
