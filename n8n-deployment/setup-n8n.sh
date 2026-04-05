#!/bin/bash
# n8n Setup Automation Script
# This script helps automate n8n workflow setup

set -e

echo "=================================="
echo "n8n Workflow Setup Assistant"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if n8n CLI is installed
if ! command -v n8n &> /dev/null; then
    echo -e "${YELLOW}n8n CLI not found. Installing globally...${NC}"
    npm install -g n8n
fi

echo -e "${GREEN}✓${NC} n8n CLI is available"
echo ""

# Get n8n instance URL
echo "Please enter your n8n Cloud instance URL:"
echo "Example: https://botmakersbqst.app.n8n.cloud"
read -p "> " N8N_URL

# Remove trailing slash if present
N8N_URL=${N8N_URL%/}

echo ""
echo "Please enter your n8n API key:"
echo "Get it from: ${N8N_URL}/settings/api"
read -sp "> " N8N_API_KEY
echo ""
echo ""

# Test connection
echo "Testing connection to n8n..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  "${N8N_URL}/api/v1/workflows")

if [ "$RESPONSE" != "200" ]; then
    echo -e "${RED}✗ Failed to connect to n8n (HTTP ${RESPONSE})${NC}"
    echo "Please check your URL and API key"
    exit 1
fi

echo -e "${GREEN}✓${NC} Successfully connected to n8n"
echo ""

# Import workflows
echo "=================================="
echo "Importing Workflows"
echo "=================================="
echo ""

WORKFLOWS_DIR="./workflows"

for workflow_file in "$WORKFLOWS_DIR"/*.json; do
    workflow_name=$(basename "$workflow_file" .json)

    echo "Importing: $workflow_name"

    # Import workflow via API
    RESULT=$(curl -s -X POST \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
      -H "Content-Type: application/json" \
      -d @"$workflow_file" \
      "${N8N_URL}/api/v1/workflows")

    WORKFLOW_ID=$(echo "$RESULT" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')

    if [ -n "$WORKFLOW_ID" ]; then
        echo -e "${GREEN}✓${NC} Imported: $workflow_name (ID: $WORKFLOW_ID)"
    else
        echo -e "${RED}✗${NC} Failed to import: $workflow_name"
        echo "Response: $RESULT"
    fi
    echo ""
done

echo "=================================="
echo "Getting Webhook URLs"
echo "=================================="
echo ""

# Get webhook URLs from workflows
WORKFLOWS=$(curl -s -H "X-N8N-API-KEY: ${N8N_API_KEY}" "${N8N_URL}/api/v1/workflows")

# Extract webhook URL for new-distributor-onboarding
WEBHOOK_URL=$(echo "$WORKFLOWS" | grep -o "${N8N_URL}/webhook[^\"]*new-distributor[^\"]*" | head -1)

if [ -n "$WEBHOOK_URL" ]; then
    echo -e "${GREEN}New Distributor Webhook URL:${NC}"
    echo "$WEBHOOK_URL"
    echo ""

    # Update .env.local if it exists
    if [ -f "../.env.local" ]; then
        echo "Updating .env.local..."

        # Check if N8N_WEBHOOK_NEW_DISTRIBUTOR already exists
        if grep -q "N8N_WEBHOOK_NEW_DISTRIBUTOR=" "../.env.local"; then
            # Update existing line
            sed -i "s|N8N_WEBHOOK_NEW_DISTRIBUTOR=.*|N8N_WEBHOOK_NEW_DISTRIBUTOR=$WEBHOOK_URL|" "../.env.local"
        else
            # Add new line
            echo "" >> "../.env.local"
            echo "# n8n Workflow Webhooks" >> "../.env.local"
            echo "N8N_WEBHOOK_NEW_DISTRIBUTOR=$WEBHOOK_URL" >> "../.env.local"
        fi

        echo -e "${GREEN}✓${NC} Updated .env.local with webhook URL"
    fi
else
    echo -e "${YELLOW}! Could not automatically find webhook URL${NC}"
    echo "Please get it manually from your workflow in n8n"
fi

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Configure Supabase credentials in n8n"
echo "   - Go to: ${N8N_URL}/credentials"
echo "   - Add 'Supabase API' credential"
echo "   - Name it: 'Supabase Production'"
echo ""
echo "2. Activate your workflows"
echo "   - Go to: ${N8N_URL}/workflows"
echo "   - Toggle each workflow to 'Active'"
echo ""
echo "3. Test the workflows"
echo "   - Create a test distributor signup"
echo "   - Check execution logs in n8n"
echo ""
echo -e "${GREEN}Happy automating! 🚀${NC}"
