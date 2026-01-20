#!/usr/bin/env bash
set -ex


MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    dx vite dev
else
    export PATH="$DENO_HOME/bin:$PATH"
    $DENO_HOME/bin/dx vite build
    $DENO_HOME/bin/dx vite preview --host
fi
