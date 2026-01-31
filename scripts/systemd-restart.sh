#!/usr/bin/env bash
set -e

deno task -f "@app/server" systemd:restart
deno task -f "@app/web-client" systemd:restart
