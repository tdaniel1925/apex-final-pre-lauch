#!/bin/bash

#############################################
# Automated Hetzner VPS Deployment
# Creates VPS and installs n8n automatically
# Using Hetzner Cloud API
#############################################

set -e

# Configuration
HETZNER_API_TOKEN="2MVrG8YwHXa6I0bCp9hAjehN0J09H7O7eJL1aQ2kLBBwzqg5Nhx2ynbml70FvWT1"
SERVER_NAME="apex-n8n-production"
SERVER_TYPE="cx21"  # 2 vCPU, 4GB RAM, 40GB SSD (~$5/month)
LOCATION="ash"  # Ashburn, VA (closest to US East)
IMAGE="ubuntu-24.04"
SSH_KEY_NAME="apex-deployment-key"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Automated Hetzner Deployment${NC}"
echo "============================================="

# Check if SSH key exists
if [ ! -f ~/.ssh/apex_deploy ]; then
    echo -e "${BLUE}Generating SSH key for deployment...${NC}"
    ssh-keygen -t ed25519 -f ~/.ssh/apex_deploy -N "" -C "apex-n8n-deployment"
    echo -e "${GREEN}✅ SSH key generated${NC}"
fi

# Get SSH public key
SSH_PUBLIC_KEY=$(cat ~/.ssh/apex_deploy.pub)

echo -e "${BLUE}Step 1: Uploading SSH key to Hetzner...${NC}"
SSH_KEY_ID=$(curl -s -X POST \
    -H "Authorization: Bearer $HETZNER_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$SSH_KEY_NAME\",\"public_key\":\"$SSH_PUBLIC_KEY\"}" \
    https://api.hetzner.cloud/v1/ssh_keys \
    | jq -r '.ssh_key.id')

if [ -z "$SSH_KEY_ID" ] || [ "$SSH_KEY_ID" == "null" ]; then
    echo -e "${RED}❌ Failed to upload SSH key. It may already exist.${NC}"
    # Try to get existing key ID
    SSH_KEY_ID=$(curl -s -X GET \
        -H "Authorization: Bearer $HETZNER_API_TOKEN" \
        https://api.hetzner.cloud/v1/ssh_keys \
        | jq -r ".ssh_keys[] | select(.name==\"$SSH_KEY_NAME\") | .id")
fi

echo -e "${GREEN}✅ SSH Key ID: $SSH_KEY_ID${NC}"

echo -e "${BLUE}Step 2: Creating Hetzner VPS...${NC}"
CREATE_RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $HETZNER_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$SERVER_NAME\",
        \"server_type\": \"$SERVER_TYPE\",
        \"location\": \"$LOCATION\",
        \"image\": \"$IMAGE\",
        \"ssh_keys\": [$SSH_KEY_ID],
        \"start_after_create\": true
    }" \
    https://api.hetzner.cloud/v1/servers)

SERVER_ID=$(echo $CREATE_RESPONSE | jq -r '.server.id')
SERVER_IP=$(echo $CREATE_RESPONSE | jq -r '.server.public_net.ipv4.ip')

if [ -z "$SERVER_ID" ] || [ "$SERVER_ID" == "null" ]; then
    echo -e "${RED}❌ Failed to create server${NC}"
    echo $CREATE_RESPONSE | jq
    exit 1
fi

echo -e "${GREEN}✅ Server created!${NC}"
echo -e "   Server ID: $SERVER_ID"
echo -e "   Server IP: $SERVER_IP"

echo -e "${BLUE}Step 3: Waiting for server to be ready...${NC}"
sleep 60  # Wait for server to fully boot

echo -e "${BLUE}Step 4: Uploading setup script to server...${NC}"
scp -i ~/.ssh/apex_deploy \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    ./setup-hetzner.sh root@$SERVER_IP:/root/

echo -e "${GREEN}✅ Setup script uploaded${NC}"

echo -e "${BLUE}Step 5: Running setup script on server...${NC}"
ssh -i ~/.ssh/apex_deploy \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    root@$SERVER_IP "chmod +x /root/setup-hetzner.sh && /root/setup-hetzner.sh"

echo ""
echo "==========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "==========================================="
echo ""
echo -e "${BLUE}Server Details:${NC}"
echo "   IP Address: $SERVER_IP"
echo "   Server ID: $SERVER_ID"
echo "   SSH Key: ~/.ssh/apex_deploy"
echo ""
echo -e "${RED}⚠️  IMPORTANT NEXT STEPS:${NC}"
echo ""
echo "1. Add DNS A Record in your domain registrar:"
echo "   Name: n8n"
echo "   Type: A"
echo "   Value: $SERVER_IP"
echo "   TTL: 300"
echo ""
echo "2. Wait 5-10 minutes for DNS to propagate"
echo ""
echo "3. Access n8n at: https://n8n.reachtheapex.net"
echo ""
echo "4. Create your admin account on first login"
echo ""
echo "5. SSH access:"
echo "   ssh -i ~/.ssh/apex_deploy root@$SERVER_IP"
echo ""
echo "==========================================="

# Save server info
cat > deployment-info.txt <<INFO
Hetzner VPS Deployment Information
===================================

Server Name: $SERVER_NAME
Server ID: $SERVER_ID
Server IP: $SERVER_IP
Server Type: $SERVER_TYPE ($5/month)
Location: Ashburn, VA (ash)
OS: Ubuntu 24.04 LTS

SSH Access:
ssh -i ~/.ssh/apex_deploy root@$SERVER_IP

n8n URL:
https://n8n.reachtheapex.net

DNS Configuration Needed:
Name: n8n
Type: A
Value: $SERVER_IP
TTL: 300

Created: $(date)
INFO

echo -e "${GREEN}✅ Deployment info saved to: deployment-info.txt${NC}"
