#!/usr/bin/env bash

set -ex

deno fmt
deno lint
deno test --allow-read --allow-env --allow-net --allow-write --allow-sys --unstable-temporal
