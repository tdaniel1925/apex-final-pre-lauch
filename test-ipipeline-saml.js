/**
 * Test iPipeline SAML Generation
 *
 * This script tests that the SAML client can generate valid signed assertions.
 * Run: node test-ipipeline-saml.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
  console.log('✅ Loaded environment variables from .env.local');
} else {
  // Set test environment variables
  const privateKey = fs.readFileSync(path.join(__dirname, 'apex-saml.key'), 'utf8');
  const certificate = fs.readFileSync(path.join(__dirname, 'apex-saml.crt'), 'utf8');

  process.env.IPIPELINE_SAML_PRIVATE_KEY = privateKey;
  process.env.IPIPELINE_SAML_CERTIFICATE = certificate;
  process.env.IPIPELINE_ENTITY_ID = 'https://apexaffinitygroup.com/saml/idp';
  process.env.IPIPELINE_ENVIRONMENT = 'uat';
  process.env.IPIPELINE_SSO_ENABLED = 'true';

  console.log('ℹ️  Using certificate files (no .env.local found)');
}

console.log('');
console.log('🧪 Testing iPipeline SAML Generation...');
console.log('');

// Import the SAML client (using dynamic import for ESM modules)
async function runTest() {
  try {
    // Check if TypeScript files need to be compiled
    const { iPipelineSAMLClient } = require('./src/lib/integrations/ipipeline/saml.ts');

    console.log('Configuration:');
    console.log('  - Environment:', process.env.IPIPELINE_ENVIRONMENT || 'uat');
    console.log('  - Entity ID:', process.env.IPIPELINE_ENTITY_ID);
    console.log('  - Configured:', iPipelineSAMLClient.isConfigured() ? '✅ Yes' : '❌ No');
    console.log('');

    if (!iPipelineSAMLClient.isConfigured()) {
      console.error('❌ SAML client is not configured!');
      console.error('   Please ensure IPIPELINE_SAML_PRIVATE_KEY and IPIPELINE_SAML_CERTIFICATE are set.');
      process.exit(1);
    }

    // Test SAML generation
    console.log('Generating SAML Response...');

    const testRequest = {
      userId: 'test-user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-1234',
      address1: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      product: 'igo',
    };

    const result = await iPipelineSAMLClient.generateSAMLResponse(testRequest);

    console.log('');
    console.log('✅ SAML Response Generated Successfully!');
    console.log('');
    console.log('Result:');
    console.log('  - SAMLResponse Length:', result.samlResponse.length, 'characters (base64)');
    console.log('  - RelayState URL:', result.relayState);
    console.log('  - ACS URL:', result.acsUrl);
    console.log('');

    // Decode and display SAML XML (first 500 chars)
    const decodedSaml = Buffer.from(result.samlResponse, 'base64').toString('utf8');
    console.log('SAML XML Preview (first 500 chars):');
    console.log('─'.repeat(80));
    console.log(decodedSaml.substring(0, 500) + '...');
    console.log('─'.repeat(80));
    console.log('');

    // Verify it contains APEX-specific constants
    const hasGAID2643 = decodedSaml.includes('2643');
    const hasAPEXChannel = decodedSaml.includes('APEX');
    const hasAPEXGroups = decodedSaml.includes('02643-UsersGroup');
    const hasSignature = decodedSaml.includes('<Signature');
    const hasCompanyIdentifier = decodedSaml.includes('CompanyIdentifier');

    console.log('Validation Checks:');
    console.log('  - Contains GAID 2643:', hasGAID2643 ? '✅' : '❌');
    console.log('  - Contains Channel APEX:', hasAPEXChannel ? '✅' : '❌');
    console.log('  - Contains Groups 02643-UsersGroup:', hasAPEXGroups ? '✅' : '❌');
    console.log('  - Contains Digital Signature:', hasSignature ? '✅' : '❌');
    console.log('  - Contains CompanyIdentifier:', hasCompanyIdentifier ? '✅' : '❌');
    console.log('');

    if (hasGAID2643 && hasAPEXChannel && hasAPEXGroups && hasSignature && hasCompanyIdentifier) {
      console.log('🎉 All validation checks passed!');
      console.log('');
      console.log('Next Steps:');
      console.log('1. Send IPIPELINE_METADATA.xml to iPipeline');
      console.log('2. Configure environment variables in .env.local');
      console.log('3. Wait for iPipeline to configure your certificate');
      console.log('4. Test the integration from your application');
    } else {
      console.log('⚠️  Some validation checks failed!');
      console.log('   Review the SAML constants in src/lib/integrations/ipipeline/saml.ts');
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error('');
    console.error('Full error:', error);
    process.exit(1);
  }
}

runTest();
