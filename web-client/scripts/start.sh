#!/usr/bin/env bash
set -ex


MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    dx vite dev "$ROOT"
else
    dx vite build
    dx vite preview --host
fi
