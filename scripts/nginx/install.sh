#!/usr/bin/env bash

set -e

APP_NAME="mcp-banking"
SITE_CONFIG=$(cat <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name banking.dk-home-pi.net; # Your desired subdomain

    # Proxy requests for /admin to Pi-hole's Lighttpd
    location /auth {
        proxy_pass http://127.0.0.1:8083/auth; # Forward to Lighttpd on 8080
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
        proxy_buffering off; # Important for Pi-hole's live tail logs
        proxy_http_version 1.1; # Required for WebSocket (live tail)
        proxy_set_header Upgrade \$http_upgrade; # Required for WebSocket
        proxy_set_header Connection "upgrade"; # Required for WebSocket
    }

    # Proxy requests for the root path (e.g., the blocked page)
    location / {
        proxy_pass http://127.0.0.1:8084/; # Forward to Lighttpd on 8080
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
        proxy_buffering off; # Important for live tail logs
        proxy_http_version 1.1; # Required for WebSocket (live tail)
        proxy_set_header Upgrade \$http_upgrade; # Required for WebSocket
        proxy_set_header Connection "upgrade"; # Required for WebSocket
    }

    # Optional: You can add custom error pages if needed
    # error_page 404 /404.html;
    # location = /40x.html { }
}
EOF
)

echo "$SITE_CONFIG" | sudo tee /etc/nginx/sites-available/$APP_NAME.conf
sudo ln -s /etc/nginx/sites-available/$APP_NAME.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
