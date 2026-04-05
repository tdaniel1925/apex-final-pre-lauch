#!/usr/bin/env node
/**
 * n8n Workflow Import Script
 * Automatically imports all workflows to your n8n instance via API
 *
 * Usage:
 *   node import-workflows.js
 *
 * Requirements:
 *   - n8n API key (get from: Settings > API in n8n)
 *   - n8n instance URL
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Try to load .env file if it exists
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    });
  }
} catch (e) {
  // Ignore errors loading .env
}

// Configuration
const N8N_URL = process.env.N8N_URL || 'https://botmakersbqst.app.n8n.cloud';
const N8N_API_KEY = process.env.N8N_API_KEY;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}!${colors.reset} ${msg}`)
};

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;

    const reqOptions = {
      ...options,
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = lib.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testConnection() {
  console.log('\n==================================');
  console.log('Testing n8n Connection');
  console.log('==================================\n');

  try {
    await makeRequest(`${N8N_URL}/api/v1/workflows`, { method: 'GET' });
    log.success('Connected to n8n successfully');
    return true;
  } catch (error) {
    log.error(`Failed to connect to n8n: ${error.message}`);
    return false;
  }
}

async function importWorkflow(filePath) {
  const workflowName = path.basename(filePath, '.json');
  log.info(`Importing: ${workflowName}`);

  try {
    const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const result = await makeRequest(`${N8N_URL}/api/v1/workflows`, {
      method: 'POST'
    }, workflowData);

    log.success(`Imported: ${workflowName} (ID: ${result.id})`);
    return result;
  } catch (error) {
    log.error(`Failed to import ${workflowName}: ${error.message}`);
    return null;
  }
}

async function getWebhookUrls() {
  console.log('\n==================================');
  console.log('Getting Webhook URLs');
  console.log('==================================\n');

  try {
    const workflows = await makeRequest(`${N8N_URL}/api/v1/workflows`, {
      method: 'GET'
    });

    const webhookUrls = {};

    for (const workflow of workflows.data) {
      // Look for webhook nodes in the workflow
      if (workflow.nodes) {
        const webhookNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
        if (webhookNode) {
          const webhookPath = webhookNode.parameters.path;
          const webhookUrl = `${N8N_URL}/webhook/${webhookPath}`;
          webhookUrls[workflow.name] = webhookUrl;
          console.log(`${colors.green}${workflow.name}:${colors.reset}`);
          console.log(`  ${webhookUrl}\n`);
        }
      }
    }

    return webhookUrls;
  } catch (error) {
    log.error(`Failed to get webhook URLs: ${error.message}`);
    return {};
  }
}

async function updateEnvFile(webhookUrls) {
  const envPath = path.join(__dirname, '..', '.env.local');

  if (!fs.existsSync(envPath)) {
    log.warn('.env.local not found - skipping update');
    return;
  }

  log.info('Updating .env.local with webhook URLs...');

  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update or add N8N_WEBHOOK_NEW_DISTRIBUTOR
  if (webhookUrls['New Distributor Onboarding']) {
    const webhookUrl = webhookUrls['New Distributor Onboarding'];
    const regex = /N8N_WEBHOOK_NEW_DISTRIBUTOR=.*/;

    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `N8N_WEBHOOK_NEW_DISTRIBUTOR=${webhookUrl}`);
    } else {
      envContent += `\n# n8n Workflow Webhooks\nN8N_WEBHOOK_NEW_DISTRIBUTOR=${webhookUrl}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    log.success('Updated .env.local');
  }
}

async function main() {
  console.log('\n==================================');
  console.log('n8n Workflow Import Tool');
  console.log('==================================\n');

  // Check for API key
  if (!N8N_API_KEY) {
    log.error('N8N_API_KEY environment variable not set');
    console.log('\nGet your API key from: ' + N8N_URL + '/settings/api');
    console.log('\nUsage:');
    console.log('  N8N_API_KEY=your-api-key node import-workflows.js');
    process.exit(1);
  }

  log.info(`n8n URL: ${N8N_URL}`);
  log.info(`API Key: ${N8N_API_KEY.substring(0, 10)}...`);

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  // Import workflows
  console.log('\n==================================');
  console.log('Importing Workflows');
  console.log('==================================\n');

  const workflowsDir = path.join(__dirname, 'workflows');
  const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));

  const results = [];
  for (const file of files) {
    const result = await importWorkflow(path.join(workflowsDir, file));
    if (result) {
      results.push(result);
    }
  }

  // Get webhook URLs
  const webhookUrls = await getWebhookUrls();

  // Update .env.local
  if (Object.keys(webhookUrls).length > 0) {
    await updateEnvFile(webhookUrls);
  }

  // Summary
  console.log('\n==================================');
  console.log('Setup Complete!');
  console.log('==================================\n');

  console.log(`Imported ${results.length} workflow(s)\n`);

  console.log('Next steps:');
  console.log('1. Configure Supabase credentials in n8n');
  console.log(`   ${N8N_URL}/credentials`);
  console.log('');
  console.log('2. Activate your workflows');
  console.log(`   ${N8N_URL}/workflows`);
  console.log('');
  console.log('3. Restart your dev server to load new .env.local');
  console.log('');
  console.log(`${colors.green}Happy automating! 🚀${colors.reset}\n`);
}

main().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
