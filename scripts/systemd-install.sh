#!/usr/bin/env bash
set -e

deno task -f "@app/server" systemd-install
deno task -f "@app/web-client" systemd-install
