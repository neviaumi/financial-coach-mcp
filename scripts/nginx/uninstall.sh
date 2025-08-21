#!/usr/bin/env bash

set -e

APP_NAME="mcp-banking"
sudo rm -f /etc/nginx/sites-enabled/$APP_NAME.conf
sudo rm -f /etc/nginx/sites-available/$APP_NAME.conf
sudo nginx -t
sudo systemctl reload nginx
