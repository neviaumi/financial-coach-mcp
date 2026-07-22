#!/usr/bin/env bash

set -ex

tmux new-window -n "financial-coach" "deno task -f '@app/server' start"
tmux split-window -h "VITE_API_BASE_URL=http://localhost:8084 deno task -f '@app/web-client' start"
tmux select-window -t "financial-coach"
