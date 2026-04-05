#!/bin/bash

# Simple VPS creation script without jq dependency
# Creates Hetzner VPS and returns SSH command

HETZNER_API_TOKEN="2MVrG8YwHXa6I0bCp9hAjehN0J09H7O7eJL1aQ2kLBBwzqg5Nhx2ynbml70FvWT1"
SERVER_NAME="apex-n8n-production"
SERVER_TYPE="cx21"
LOCATION="ash"
IMAGE="ubuntu-22.04"

echo "🚀 Creating Hetzner VPS..."
echo ""

# Read SSH public key
SSH_KEY=$(cat ~/.ssh/apex_deploy.pub)

# Upload SSH key to Hetzner
echo "Uploading SSH key..."
RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $HETZNER_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"apex-deploy\",\"public_key\":\"$SSH_KEY\"}" \
    https://api.hetzner.cloud/v1/ssh_keys)

# Extract SSH key ID (simple grep method)
SSH_KEY_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$SSH_KEY_ID" ]; then
    echo "❌ Failed to upload SSH key. It may already exist."
    # Try to get existing key
    RESPONSE=$(curl -s -X GET \
        -H "Authorization: Bearer $HETZNER_API_TOKEN" \
        https://api.hetzner.cloud/v1/ssh_keys)
    SSH_KEY_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
fi

echo "✅ SSH Key ID: $SSH_KEY_ID"

# Create server
echo ""
echo "Creating VPS (this takes ~60 seconds)..."
RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $HETZNER_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$SERVER_NAME\",\"server_type\":\"$SERVER_TYPE\",\"location\":\"$LOCATION\",\"image\":\"$IMAGE\",\"ssh_keys\":[$SSH_KEY_ID],\"start_after_create\":true}" \
    https://api.hetzner.cloud/v1/servers)

# Extract server IP (simple grep method)
SERVER_IP=$(echo "$RESPONSE" | grep -o '"ipv4":{"ip":"[^"]*"' | grep -o '[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*' | head -1)

if [ -z "$SERVER_IP" ]; then
    echo "❌ Failed to create server"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "==========================================="
echo "🎉 VPS Created Successfully!"
echo "==========================================="
echo ""
echo "Server IP: $SERVER_IP"
echo "SSH Key: ~/.ssh/apex_deploy"
echo ""
echo "⏳ Please wait 60 seconds for server to boot..."
echo ""
echo "Then SSH in with:"
echo "  ssh -i ~/.ssh/apex_deploy root@$SERVER_IP"
echo ""
echo "After connecting, run:"
echo "  wget https://raw.githubusercontent.com/.../setup-hetzner.sh"
echo "  chmod +x setup-hetzner.sh"
echo "  ./setup-hetzner.sh"
echo ""
echo "OR paste this complete command:"
echo ""
echo "curl -sSL https://pastebin.com/raw/YOURLINK | bash"
echo ""
echo "==========================================="
echo ""
echo "💾 Server info saved to: server-info.txt"

# Save server info
cat > server-info.txt <<INFO
Hetzner VPS Information
=======================

Server IP: $SERVER_IP
SSH Key: ~/.ssh/apex_deploy
Server Type: $SERVER_TYPE
Location: Ashburn, VA

SSH Command:
ssh -i ~/.ssh/apex_deploy root@$SERVER_IP

DNS Configuration Needed:
Name: n8n
Type: A
Value: $SERVER_IP
TTL: 300

Created: $(date)
INFO

echo "Server IP: $SERVER_IP" > server-ip.txt
echo ""
echo "✅ Done! Server is booting..."
echo "   Wait 60 seconds, then SSH in using the command above."
