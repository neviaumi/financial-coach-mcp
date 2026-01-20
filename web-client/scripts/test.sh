#!/usr/bin/env bash

set -ex

deno fmt
deno lint
deno test -P
