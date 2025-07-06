#!/usr/bin/env bash

set -ex

op run --env-file="./.env.dev" -- deno \
--allow-run \
--allow-env \
--allow-net \
./main.ts
