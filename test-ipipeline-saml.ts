/**
 * Test iPipeline SAML Generation
 *
 * This script tests that the SAML client can generate valid signed assertions.
 * Run: npx tsx test-ipipeline-saml.ts
 */

import fs from 'fs';
import path from 'path';
import { iPipelineSAMLClient } from './src/lib/integrations/ipipeline/saml';

// Load certificate files if environment variables are not set
if (!process.env.IPIPELINE_SAML_PRIVATE_KEY) {
  const privateKey = fs.readFileSync(path.join(__dirname, 'apex-saml.key'), 'utf8');
  const certificate = fs.readFileSync(path.join(__dirname, 'apex-saml.crt'), 'utf8');

  process.env.IPIPELINE_SAML_PRIVATE_KEY = privateKey;
  process.env.IPIPELINE_SAML_CERTIFICATE = certificate;
  process.env.IPIPELINE_ENTITY_ID = 'https://reachtheapex.net/saml/idp';
  process.env.IPIPELINE_ENVIRONMENT = 'uat';
  process.env.IPIPELINE_SSO_ENABLED = 'true';

  console.log('ℹ️  Using certificate files (no environment variables found)');
}

console.log('');
console.log('🧪 Testing iPipeline SAML Generation...');
console.log('');

async function runTest() {
  try {
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
      product: 'igo' as const,
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
      console.log('');
      console.log('📄 See IPIPELINE_SETUP_INSTRUCTIONS.md for complete setup guide');
    } else {
      console.log('⚠️  Some validation checks failed!');
      console.log('   Review the SAML constants in src/lib/integrations/ipipeline/saml.ts');
    }

  } catch (error: unknown) {
    console.error('❌ Error during test:');
    console.error(error);
    process.exit(1);
  }
}

runTest();
