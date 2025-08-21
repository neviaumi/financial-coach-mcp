#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status.
# Print commands and their arguments as they are executed.
set -ex

echo "--- Starting systemctl service uninstall ---"

APP_NAME="mcp-banking"
APP_FILE="/etc/systemd/system/${APP_NAME}"

# 1. Stop the service if it's running
echo "1. Stopping the '${APP_NAME}' service..."
if sudo systemctl is-active --quiet "${APP_NAME}"; then
    sudo systemctl stop "${APP_NAME}"
    echo "   Service '${APP_NAME}' stopped."
else
    echo "   Service '${APP_NAME}' is not active, skipping stop."
fi

# 2. Disable the service (prevent it from starting on boot)
echo "2. Disabling the '${APP_NAME}' service..."
if sudo systemctl is-enabled --quiet "${APP_NAME}"; then
    sudo systemctl disable "${APP_NAME}"
    echo "   Service '${APP_NAME}' disabled."
else
    echo "   Service '${APP_NAME}' is not enabled, skipping disable."
fi

# 3. Remove the service file
echo "3. Removing the service file: ${APP_NAME}..."
if [ -f "${APP_NAME}" ]; then
    sudo rm "${APP_NAME}"
    echo "   Service file '${APP_NAME}' removed."
else
    echo "   Service file '${APP_NAME}' not found, skipping removal."
fi

# 4. Reload systemd to recognize the removal
echo "4. Reloading systemd manager configuration..."
sudo systemctl daemon-reload
echo "   Systemd configuration reloaded."

echo "--- Systemd service uninstall completed successfully! ---"
echo "The '${APP_NAME}' service has been removed and disabled."
