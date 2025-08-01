#!/usr/bin/env bash

set -ex

DANGEROUSLY_OMIT_AUTH=true deno run --allow-run --allow-env --allow-net --allow-read npm:@modelcontextprotocol/inspector --config mcp.json --server default-server
