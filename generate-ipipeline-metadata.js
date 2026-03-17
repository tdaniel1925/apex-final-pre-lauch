/**
 * Generate iPipeline IdP Metadata XML
 *
 * This script generates the SAML 2.0 IdP metadata file to send to iPipeline.
 * Run: node generate-ipipeline-metadata.js
 */

const fs = require('fs');
const path = require('path');

// Read the certificate
const certPath = path.join(__dirname, 'apex-saml.crt');
const certPem = fs.readFileSync(certPath, 'utf8');

// Clean certificate (remove headers/footers and whitespace)
const cleanCert = certPem
  .replace(/-----BEGIN CERTIFICATE-----/g, '')
  .replace(/-----END CERTIFICATE-----/g, '')
  .replace(/\s/g, '');

// Configuration
const entityId = 'https://reachtheapex.net/saml/idp';
const ssoUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reachtheapex.net';

// Generate metadata XML
const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
    entityID="${entityId}">
  <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>${cleanCert}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:SingleSignOnService
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="${ssoUrl}/api/integrations/ipipeline/sso"/>
  </md:IDPSSODescriptor>
  <md:Organization>
    <md:OrganizationName xml:lang="en">Apex Affinity Group</md:OrganizationName>
    <md:OrganizationDisplayName xml:lang="en">Apex Affinity Group</md:OrganizationDisplayName>
    <md:OrganizationURL xml:lang="en">${ssoUrl}</md:OrganizationURL>
  </md:Organization>
  <md:ContactPerson contactType="technical">
    <md:Company>Apex Affinity Group</md:Company>
    <md:EmailAddress>support@reachtheapex.net</md:EmailAddress>
  </md:ContactPerson>
</md:EntityDescriptor>`;

// Write to file
const outputPath = path.join(__dirname, 'IPIPELINE_METADATA.xml');
fs.writeFileSync(outputPath, metadata, 'utf8');

console.log('✅ iPipeline IdP Metadata generated successfully!');
console.log(`📄 File: ${outputPath}`);
console.log('');
console.log('📧 Next steps:');
console.log('1. Send IPIPELINE_METADATA.xml to your iPipeline account representative');
console.log('2. Ask them to configure SAML SSO for GAID 2643 (Apex Affinity Group/APEX)');
console.log('3. Request access to UAT environment first for testing');
console.log('');
console.log('ℹ️  Important information for iPipeline:');
console.log('   - GAID (Company Identifier): 2643');
console.log('   - Channel Name: APEX');
console.log('   - Groups: 02643-UsersGroup');
console.log('   - Entity ID:', entityId);
console.log('   - SSO URL:', `${ssoUrl}/api/integrations/ipipeline/sso`);
