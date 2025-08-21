#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status.
# Print commands and their arguments as they are executed.
set -e

APP_NAME="mcp-banking"
APP_DESCRIPTION="Financial Coach Banking Service"

echo "--- Starting systemd service installation ---"

# Get the absolute path of the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Define the relative path from the script's directory to the target script
RELATIVE_SCRIPT_PATH="../start.sh"

# Use realpath to get the canonical absolute path of the start.sh script
ACTUAL_SCRIPT_PATH="$(realpath "${SCRIPT_DIR}/${RELATIVE_SCRIPT_PATH}")"
echo "INFO: Target script absolute path is: ${ACTUAL_SCRIPT_PATH}"
# Define the service file content and replace the placeholder path using sed
echo "INFO: Generating systemd service file content..."
SERVICE_CONTENT=$(cat <<EOF
[Unit]
Description=$APP_DESCRIPTION
After=network.target

[Service]
ExecStart=/usr/bin/bash "$ACTUAL_SCRIPT_PATH"
Restart=always

[Install]
WantedBy=multi-user.target
EOF
)
echo "INFO: Systemd service file content generated."

# Copy the processed content to the systemd system directory
echo "INFO: Copying generated service file to /etc/systemd/system/$APP_NAME.service..."
echo "$SERVICE_CONTENT" | sudo tee /etc/systemd/system/$APP_NAME.service
echo "INFO: Service file copied successfully."

# Reload systemd to recognize the new service file
echo "INFO: Reloading systemd manager configuration..."
sudo systemctl daemon-reload
echo "INFO: Systemd configuration reloaded."

# Enable the service to start on boot
echo "INFO: Enabling the '$APP_NAME.service' to start on boot..."
sudo systemctl enable "$APP_NAME.service"
echo "INFO: Service '$APP_NAME.service' enabled."

sudo systemctl start "$APP_NAME.service"

echo "--- Systemd service installation completed successfully! ---"
echo "You can now check its status using: sudo systemctl status $APP_NAME.service"
