#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status.
# Print commands and their arguments as they are executed.
set -e

APP_NAME="financial-coach-client"

sudo systemctl restart "$SERVICE"
