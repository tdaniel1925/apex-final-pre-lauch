# iPipeline Integration - Complete

## ✅ Integration Status: Ready for iPipeline Configuration

The iPipeline SAML 2.0 SSO integration has been successfully implemented for the Apex Affinity Group site.

---

## 📋 What Was Installed

### Core Integration Files

1. **SAML Library** (`src/lib/integrations/ipipeline/`)
   - `saml.ts` - SAML 2.0 client with digital signature signing
   - `types.ts` - TypeScript type definitions and endpoint URLs

2. **API Routes** (`src/app/api/integrations/ipipeline/`)
   - `sso/route.ts` - SSO endpoint that generates SAML assertions
   - `metadata/route.ts` - Metadata endpoint for downloading IdP XML

3. **Frontend Components** (`src/components/integrations/`)
   - `IPipelineLauncher.tsx` - React component for launching iPipeline products

4. **Certificates & Metadata**
   - `apex-saml.key` - Private key for SAML signing (keep secure!)
   - `apex-saml.crt` - Public certificate
   - `APEX_IPIPELINE_METADATA.XML` - IdP metadata to send to iPipeline

5. **Utility Scripts**
   - `generate-ipipeline-metadata.js` - Regenerate metadata XML
   - `test-ipipeline-saml.ts` - Test SAML generation

6. **Documentation**
   - `IPIPELINE_SETUP_INSTRUCTIONS.md` - Complete setup guide

---

## 🔧 Configuration Details

### GAID & Channel Information
- **GAID (Company Identifier)**: 2643
- **Channel Name**: APEX
- **Groups**: 02643-UsersGroup

### Supported Products
1. iGO (Life Insurance E-Applications)
2. LifePipe (Term Life Quoting)
3. XRAE (Risk Assessment Engine)
4. FormsPipe (Insurance Forms)
5. Product Information (Product Catalog)

### Environments
- **UAT**: https://federate-uat.ipipeline.com/sp/ACS.saml2
- **Production**: https://federate.ipipeline.com/sp/ACS.saml2

---

## 🚀 Quick Start

### 1. Configure Environment Variables

Add to `.env.local`:

```bash
IPIPELINE_SSO_ENABLED="true"
IPIPELINE_ENVIRONMENT="uat"
IPIPELINE_ENTITY_ID="https://reachtheapex.net/saml/idp"
IPIPELINE_SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
IPIPELINE_SAML_CERTIFICATE="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
```

**Get the certificate values:**
```powershell
# Private Key (paste the output into IPIPELINE_SAML_PRIVATE_KEY)
Get-Content apex-saml.key -Raw

# Certificate (paste the output into IPIPELINE_SAML_CERTIFICATE)
Get-Content apex-saml.crt -Raw
```

### 2. Send Metadata to iPipeline

Email `APEX_IPIPELINE_METADATA.XML` to your iPipeline account representative with:
- **GAID**: 2643
- **Channel**: APEX
- **Environment**: Start with UAT, then Production

### 3. Add to Your Application

```typescript
import { IPipelineLauncher } from '@/components/integrations/IPipelineLauncher';

// Simple launcher for specific product
<IPipelineLauncher
  user={{
    id: currentUser.id,
    firstName: currentUser.first_name,
    lastName: currentUser.last_name,
    email: currentUser.email,
  }}
  defaultProduct="igo"
/>

// Product selector
<IPipelineLauncher
  user={currentUser}
  showProductSelector={true}
/>
```

### 4. Test Locally

```bash
# Test SAML generation
npx tsx test-ipipeline-saml.ts

# Start dev server
npm run dev
```

---

## 📦 Dependencies Installed

- `xml-crypto` (SAML signature generation)
- `uuid` (unique ID generation) - already installed
- `shadcn/ui` components: `dialog`, `select`

---

## 🔒 Security Notes

### Keep Private
- `apex-saml.key` - **NEVER** commit or share
- `.env.local` - **NEVER** commit
- Any file containing the private key

### Safe to Share
- `APEX_IPIPELINE_METADATA.XML` - Send to iPipeline
- `apex-saml.crt` - Public certificate (optional)

---

## 🧪 Test Results

```
✅ SAML client configured successfully
✅ SAML Response generated (7556 characters base64)
✅ Contains GAID 2643
✅ Contains Channel APEX
✅ Contains Groups 02643-UsersGroup
✅ Contains Digital Signature
✅ Contains CompanyIdentifier
```

All validation checks passed! ✨

---

## 📞 Support

### iPipeline
- Support: support@ipipeline.com
- Website: https://www.ipipeline.com/support

### Integration Questions
- See: `IPIPELINE_SETUP_INSTRUCTIONS.md` (complete guide)
- Test: `npx tsx test-ipipeline-saml.ts`

---

## 🎯 Next Steps

1. ✅ **Configure environment variables** in `.env.local`
2. ✅ **Send metadata** to iPipeline (APEX_IPIPELINE_METADATA.XML)
3. ⏳ **Wait for iPipeline** to configure your certificate (1-3 days)
4. ⏳ **Test in UAT** environment
5. ⏳ **Request Production** configuration
6. ⏳ **Go live** with production environment

---

## 📁 File Locations

```
c:\dev\1 - Apex Pre-Launch Site\
├── apex-saml.key                              # Private key (keep secure!)
├── apex-saml.crt                              # Public certificate
├── APEX_IPIPELINE_METADATA.XML                     # Send to iPipeline
├── generate-ipipeline-metadata.js             # Regenerate metadata
├── test-ipipeline-saml.ts                     # Test SAML generation
├── IPIPELINE_SETUP_INSTRUCTIONS.md            # Complete setup guide
├── IPIPELINE_INTEGRATION_SUMMARY.md           # This file
│
├── src/
│   ├── lib/
│   │   └── integrations/
│   │       └── ipipeline/
│   │           ├── saml.ts                    # SAML client
│   │           └── types.ts                   # Type definitions
│   │
│   ├── app/
│   │   └── api/
│   │       └── integrations/
│   │           └── ipipeline/
│   │               ├── sso/route.ts           # SSO endpoint
│   │               └── metadata/route.ts      # Metadata endpoint
│   │
│   └── components/
│       └── integrations/
│           └── IPipelineLauncher.tsx          # Frontend component
│
└── .env.example                               # Updated with iPipeline config
```

---

**Status**: ✅ Complete - Awaiting iPipeline Configuration
**Date**: 2026-03-16
**GAID**: 2643
**Channel**: APEX
