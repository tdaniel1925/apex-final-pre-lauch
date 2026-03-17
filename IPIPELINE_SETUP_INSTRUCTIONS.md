# iPipeline SAML SSO Setup Instructions

## Current Status

✅ **Your Side (Apex Affinity Group)**: Integration code is complete!
- SAML generation is implemented
- Digital signature signing is configured
- All 5 products are set up (iGO, LifePipe, FormsPipe, XRAE, ProductInfo)
- Frontend launcher component is ready

❌ **iPipeline Side**: They need to configure your SAML certificate

---

## What You Need to Send to iPipeline

### Required File

**File:** `IPIPELINE_METADATA.xml` (in your project root)

**Send this file to your iPipeline account representative** and ask them to:
1. Configure SAML SSO for GAID 2643 (Apex Affinity Group/APEX)
2. Import this metadata file into their UAT environment
3. Enable the integration for your account
4. Confirm when it's ready to test

---

## Information iPipeline Needs

When contacting iPipeline support, provide:

### Your Account Details:
- **GAID (Company Identifier)**: 2643
- **Channel Name**: APEX
- **Groups**: 02643-UsersGroup
- **Environment**: UAT (Testing) - then Production later
- **Entity ID**: `https://reachtheapex.net/saml/idp`

### Technical Details:
- **SSO URL**: `https://reachtheapex.net/api/integrations/ipipeline/sso`
- **Signature Method**: RSA-SHA256
- **Digest Method**: SHA-256
- **Name ID Format**: unspecified
- **Binding**: HTTP-POST

### Products You Want to Enable:
1. iGO Illustration (Life Insurance E-Applications)
2. LifePipe Quotes (Term Life Quoting)
3. XRAE Risk Assessment Engine
4. FormsPipe (Insurance Forms)
5. Product Information (Product Catalog)

---

## Email Template for iPipeline

```
Subject: SAML SSO Configuration Request - GAID 2643 (Apex Affinity Group/APEX)

Hello iPipeline Support,

We would like to set up SAML 2.0 Single Sign-On for our Apex Affinity Group account.

Account Information:
- GAID: 2643
- Channel: APEX
- Environment: UAT (for testing, then Production)

We have attached our SAML IdP metadata file (IPIPELINE_METADATA.xml).

Please configure SAML SSO for the following products:
1. iGO Illustration
2. LifePipe Quotes
3. XRAE Risk Assessment
4. FormsPipe
5. Product Information

Our SAML configuration:
- Entity ID: https://reachtheapex.net/saml/idp
- SSO URL: https://reachtheapex.net/api/integrations/ipipeline/sso
- Certificate included in metadata file

Could you please:
1. Import our SAML metadata into your UAT environment
2. Enable SAML SSO for GAID 2643
3. Let us know when it's ready to test

Thank you!
```

---

## Environment Configuration

### Step 1: Configure Environment Variables

You need to add the iPipeline SAML configuration to your environment variables.

#### For Local Development (.env.local):

```bash
# iPipeline SAML SSO Integration
IPIPELINE_SSO_ENABLED="true"
IPIPELINE_ENVIRONMENT="uat"
IPIPELINE_ENTITY_ID="https://reachtheapex.net/saml/idp"

# SAML Private Key (single line with \n escaped)
IPIPELINE_SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[content from apex-saml.key]\n-----END PRIVATE KEY-----"

# SAML Certificate (single line with \n escaped)
IPIPELINE_SAML_CERTIFICATE="-----BEGIN CERTIFICATE-----\n[content from apex-saml.crt]\n-----END CERTIFICATE-----"
```

#### For Production (Vercel/Hosting Platform):

1. Go to your hosting platform's environment variables settings
2. Add the same variables as above
3. For the certificate and key, you can use either:
   - **Option A**: Single line with `\n` for newlines
   - **Option B**: Multi-line (if your platform supports it)

**IMPORTANT**:
- Keep `apex-saml.key` SECRET and SECURE
- Never commit `.env.local` or the private key to git
- Only share `IPIPELINE_METADATA.xml` or `apex-saml.crt` with iPipeline

### Step 2: Convert Certificate Files to Environment Variables

To convert the PEM files to single-line format for environment variables:

**On macOS/Linux:**
```bash
# Private Key
cat apex-saml.key | tr '\n' '@' | sed 's/@/\\n/g'

# Certificate
cat apex-saml.crt | tr '\n' '@' | sed 's/@/\\n/g'
```

**On Windows (PowerShell):**
```powershell
# Private Key
(Get-Content apex-saml.key -Raw) -replace "`r`n", "\n"

# Certificate
(Get-Content apex-saml.crt -Raw) -replace "`r`n", "\n"
```

---

## Using the iPipeline Integration

### In Your Application Code

```typescript
import { IPipelineLauncher } from '@/components/integrations/IPipelineLauncher';

// In your component
<IPipelineLauncher
  user={{
    id: currentUser.id,
    firstName: currentUser.first_name,
    lastName: currentUser.last_name,
    email: currentUser.email,
    phone: currentUser.phone,
    address1: currentUser.address1,
    city: currentUser.city,
    state: currentUser.state,
    zipCode: currentUser.zip_code,
  }}
  defaultProduct="igo"
  variant="default"
  buttonText="Launch iGO"
/>
```

### Show Product Selector

```typescript
<IPipelineLauncher
  user={currentUser}
  showProductSelector={true}
  buttonText="Launch iPipeline"
/>
```

### Quick Launch Buttons

```typescript
import { IPipelineQuickLaunch } from '@/components/integrations/IPipelineLauncher';

<IPipelineQuickLaunch
  user={currentUser}
  products={['igo', 'lifepipe', 'xrae']}
/>
```

---

## Testing After iPipeline Setup

Once iPipeline confirms they've configured your certificate:

### UAT Testing (Development)

1. Ensure `IPIPELINE_ENVIRONMENT="uat"` in your environment variables
2. Add the launcher component to a page accessible to authenticated users
3. Click the "Launch iPipeline" button
4. Select a product
5. You should be automatically logged into iPipeline UAT environment

### Expected Behavior:
- A new window opens
- SAML form is submitted automatically
- iPipeline product loads with your user logged in
- No authentication prompt should appear

### If You See an Error:
```
Single sign-on authentication was unsuccessful (reference # XXXXXXXX).
Please contact your system administrator for assistance regarding this error.
```

**This means**: iPipeline hasn't configured your certificate yet. Contact your iPipeline representative.

---

## Moving to Production

After UAT testing is successful:

1. **Update iPipeline**: Ask iPipeline to configure the same certificate in **Production** environment
2. **Update Environment Variable**: Change `IPIPELINE_ENVIRONMENT` from `uat` to `production`
3. **Redeploy**: Deploy your application with the updated environment variable
4. **Test Again**: Verify SSO works in production

---

## Troubleshooting

### Error: "iPipeline SSO integration is not enabled"
**Cause**: `IPIPELINE_SSO_ENABLED` is not set to `"true"`
**Fix**: Update environment variable and restart application

### Error: "SAML signing keys not configured"
**Cause**: `IPIPELINE_SAML_PRIVATE_KEY` or `IPIPELINE_SAML_CERTIFICATE` is missing or invalid
**Fix**:
1. Verify environment variables are set correctly
2. Check for proper PEM format with escaped newlines
3. Restart application after updating

### Error: "Single sign-on authentication was unsuccessful"
**Cause**: iPipeline hasn't configured your certificate yet
**Fix**: Contact iPipeline support with metadata file

### Error: "Invalid SAML Response"
**Cause**: Certificate mismatch or expired
**Fix**:
1. Regenerate metadata: `node generate-ipipeline-metadata.js`
2. Send updated metadata to iPipeline
3. Verify certificate expiration date

### Error: "Authentication required" (401)
**Cause**: User not logged into your application
**Fix**: Ensure user is authenticated before launching iPipeline

### Popup Blocked
**Cause**: Browser popup blocker
**Fix**:
1. Allow popups for your domain
2. Click the browser's popup blocker notification and allow
3. Try again

---

## Technical Architecture

### SAML Flow:

1. User clicks "Launch iPipeline" button
2. Frontend sends user data to `/api/integrations/ipipeline/sso`
3. API generates signed SAML assertion with:
   - CompanyIdentifier: 2643
   - ChannelName: APEX
   - Groups: 02643-UsersGroup
   - User profile data
4. SAML response is digitally signed with RSA-SHA256
5. Frontend opens new window and submits SAML form via POST
6. iPipeline receives and verifies SAML signature
7. User is logged into iPipeline product

### Security:

- SAML assertions are valid for 5 minutes only
- Each request gets unique IDs (prevents replay attacks)
- Digital signatures ensure authenticity
- SSL/TLS required for all communications
- Private key never leaves your server

---

## Files in This Integration

| File | Purpose | Share with iPipeline? |
|------|---------|----------------------|
| `apex-saml.key` | Private key for signing SAML | ❌ NEVER |
| `apex-saml.crt` | Public certificate | ✅ Optional |
| `IPIPELINE_METADATA.xml` | IdP metadata with certificate | ✅ Required |
| `generate-ipipeline-metadata.js` | Script to regenerate metadata | ❌ Internal |
| `src/lib/integrations/ipipeline/saml.ts` | SAML client implementation | ❌ Internal |
| `src/lib/integrations/ipipeline/types.ts` | TypeScript types | ❌ Internal |
| `src/app/api/integrations/ipipeline/sso/route.ts` | SSO API endpoint | ❌ Internal |
| `src/components/integrations/IPipelineLauncher.tsx` | Frontend launcher component | ❌ Internal |

---

## Contact Information

### iPipeline Support:
- Website: https://www.ipipeline.com/support
- Email: support@ipipeline.com

### Your Account Manager:
Contact your iPipeline account representative directly for faster setup

---

## Next Steps Checklist

- [ ] Send `IPIPELINE_METADATA.xml` to iPipeline (use email template above)
- [ ] Configure environment variables in `.env.local`
- [ ] Add launcher component to your application
- [ ] Wait for iPipeline confirmation (usually 1-3 business days)
- [ ] Test integration in UAT environment
- [ ] Request production configuration from iPipeline
- [ ] Update environment to `production` and test again

---

## Certificate Renewal

Certificates generated with this setup are valid for **10 years**. When renewal is needed:

1. Generate new certificate pair:
   ```bash
   openssl req -newkey rsa:2048 -nodes -keyout apex-saml-new.key -x509 -days 3650 -out apex-saml-new.crt -subj "/C=US/ST=State/L=City/O=Apex Affinity Group/OU=IT/CN=reachtheapex.net"
   ```
2. Run: `node generate-ipipeline-metadata.js` (after updating the script to use new cert)
3. Send new metadata to iPipeline
4. Update environment variables
5. Coordinate switch-over with iPipeline

---

**Integration Status**: ✅ Complete - Ready for iPipeline Configuration
**GAID**: 2643
**Channel**: APEX
**Last Updated**: 2026-03-16
