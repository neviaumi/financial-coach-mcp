#!/usr/bin/env bash

set -ex

tmux new-window -n "financial-coach" "deno task -f '@app/server' start"
tmux split-window -h "deno task -f '@app/web-client' start"
tmux select-window -t "financial-coach"
