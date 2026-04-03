# iPipeline Environment Variables Setup Guide

## 🚨 Current Error
```
Error: iPipeline SSO integration is not enabled
```

This error occurs because the required environment variables are not configured.

---

## ✅ Required Environment Variables

Add these to your `.env.local` file (or your hosting platform's environment variables):

### 1. **Enable iPipeline SSO**
```bash
IPIPELINE_SSO_ENABLED=true
```

### 2. **Environment Selection**
```bash
# For testing (UAT)
IPIPELINE_ENVIRONMENT=uat

# For production (once iPipeline confirms ready)
IPIPELINE_ENVIRONMENT=production
```

### 3. **SAML Certificate (Private Key)**
```bash
IPIPELINE_SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[Your RSA private key here - multi-line PEM format]
-----END PRIVATE KEY-----"
```

### 4. **SAML Certificate (Public Certificate)**
```bash
IPIPELINE_SAML_CERTIFICATE="-----BEGIN CERTIFICATE-----
[Your X.509 certificate here - multi-line PEM format]
-----END CERTIFICATE-----"
```

### 5. **Entity ID (Optional - has default)**
```bash
IPIPELINE_ENTITY_ID=https://reachtheapex.net/saml/idp
```

---

## 📝 Complete `.env.local` Example

```bash
# iPipeline SAML SSO Configuration
IPIPELINE_SSO_ENABLED=true
IPIPELINE_ENVIRONMENT=uat

# SAML Certificates (replace with your actual certificates)
IPIPELINE_SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
[full private key here]
...
-----END PRIVATE KEY-----"

IPIPELINE_SAML_CERTIFICATE="-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKJ3vM8Q7Z...
[full certificate here]
...
-----END CERTIFICATE-----"

# Entity ID (optional - defaults to this value)
IPIPELINE_ENTITY_ID=https://reachtheapex.net/saml/idp
```

---

## 🔐 Certificate Format Notes

### Accepted Formats:
The implementation automatically handles these formats:

1. **Multi-line PEM with actual newlines:**
   ```
   -----BEGIN PRIVATE KEY-----
   MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
   ...
   -----END PRIVATE KEY-----
   ```

2. **Single-line with escaped newlines:**
   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n-----END PRIVATE KEY-----
   ```

3. **Single-line base64 (auto-formatted):**
   ```
   MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
   ```

The code in `src/lib/integrations/ipipeline/saml.ts` automatically reformats any of these to proper PEM format.

---

## 🎯 Where to Get Certificates

### Option 1: Generate New Certificates (for testing)
```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Generate certificate signing request
openssl req -new -key private.pem -out csr.pem

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in csr.pem -signkey private.pem -out certificate.pem

# View the private key (copy this to IPIPELINE_SAML_PRIVATE_KEY)
cat private.pem

# View the certificate (copy this to IPIPELINE_SAML_CERTIFICATE)
cat certificate.pem
```

### Option 2: Use Existing Certificates
If iPipeline provided you with certificates, use those instead.

### Option 3: Request from iPipeline
Contact your iPipeline representative and request:
- Your SAML signing certificate
- Your SAML private key
- Confirmation that your GAID (2643) is configured in their system

---

## 🔍 Verification Steps

### 1. Check if variables are loaded:
```typescript
// Add this to any server-side file temporarily
console.log('iPipeline SSO Enabled:', process.env.IPIPELINE_SSO_ENABLED);
console.log('iPipeline Environment:', process.env.IPIPELINE_ENVIRONMENT);
console.log('Has Private Key:', !!process.env.IPIPELINE_SAML_PRIVATE_KEY);
console.log('Has Certificate:', !!process.env.IPIPELINE_SAML_CERTIFICATE);
```

### 2. Test the configuration:
Navigate to: `/dashboard/licensed-agent/applications`
- You should see the "Launch iGO" button
- Click it
- If properly configured, it should generate a SAML response
- A new window should open with iPipeline login

### 3. Check for errors:
- Open browser console (F12)
- Look for any error messages
- Common errors:
  - `"iPipeline SSO integration is not enabled"` → Set `IPIPELINE_SSO_ENABLED=true`
  - `"SAML signing keys not configured"` → Add private key and certificate
  - `"Invalid response from SSO endpoint"` → Check certificate format

---

## 🚀 Deployment Steps

### Local Development (.env.local)
1. Create `.env.local` file in project root
2. Add all variables above
3. Restart Next.js dev server: `npm run dev`
4. Test at `/dashboard/licensed-agent/applications`

### Vercel Deployment
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - `IPIPELINE_SSO_ENABLED` = `true`
   - `IPIPELINE_ENVIRONMENT` = `uat` (or `production`)
   - `IPIPELINE_SAML_PRIVATE_KEY` = `[paste private key]`
   - `IPIPELINE_SAML_CERTIFICATE` = `[paste certificate]`
3. Redeploy the project

### Other Hosting Platforms
- **AWS**: Add to Secrets Manager or environment variables
- **Azure**: Add to App Settings
- **Heroku**: Use `heroku config:set`
- **Docker**: Add to `docker-compose.yml` or pass via `-e` flag

---

## ⚠️ Security Best Practices

### DO:
- ✅ Store certificates in environment variables (never in code)
- ✅ Use different certificates for UAT and production
- ✅ Rotate certificates periodically (every 1-2 years)
- ✅ Keep private keys secure and never commit them to Git
- ✅ Use `.env.local` for local development (Git-ignored)

### DON'T:
- ❌ Commit `.env.local` to Git
- ❌ Share private keys in chat/email (use secure channels)
- ❌ Use production certificates in UAT environment
- ❌ Store certificates in client-side code
- ❌ Hardcode certificates in source files

---

## 📞 iPipeline Contact Info

**For certificate issues or configuration questions:**
- Contact your iPipeline Account Manager
- Reference your GAID: **2643**
- Reference your Channel Name: **APEX**
- Reference your Company Identifier: **2643**

**Recent Communication:**
> "Hi Trent, I've just completed the configuration for this. You may now test logging in."

This confirms that iPipeline has:
- ✅ Configured your GAID (2643) in their system
- ✅ Imported your SAML metadata
- ✅ Established certificate trust
- ⚠️ You now need to add environment variables to complete the setup

---

## 🐛 Troubleshooting

### Error: "iPipeline SSO integration is not enabled"
**Solution:** Add `IPIPELINE_SSO_ENABLED=true` to environment variables

### Error: "SAML signing keys not configured"
**Solution:** Add both `IPIPELINE_SAML_PRIVATE_KEY` and `IPIPELINE_SAML_CERTIFICATE`

### Error: "Popup blocked"
**Solution:** Allow popups for your domain in browser settings

### Error: "Invalid SAML response"
**Solution:**
1. Check certificate format (must be valid PEM)
2. Verify you're using the correct environment (UAT vs production)
3. Ensure iPipeline has your public certificate

### Buttons appear but clicking does nothing
**Solution:**
1. Check browser console for errors
2. Verify all environment variables are set
3. Restart the dev server to reload environment variables

---

## ✅ Quick Setup Checklist

- [ ] Create `.env.local` file (or set in hosting platform)
- [ ] Set `IPIPELINE_SSO_ENABLED=true`
- [ ] Set `IPIPELINE_ENVIRONMENT=uat` (for testing)
- [ ] Add `IPIPELINE_SAML_PRIVATE_KEY` (PEM format)
- [ ] Add `IPIPELINE_SAML_CERTIFICATE` (PEM format)
- [ ] Restart development server
- [ ] Navigate to `/dashboard/licensed-agent/applications`
- [ ] Click "Launch iGO" button
- [ ] Verify new window opens with iPipeline
- [ ] Test successful login to iGO

---

## 📊 Environment Variable Summary Table

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `IPIPELINE_SSO_ENABLED` | ✅ Yes | `undefined` | `true` |
| `IPIPELINE_ENVIRONMENT` | ✅ Yes | `uat` | `uat` or `production` |
| `IPIPELINE_SAML_PRIVATE_KEY` | ✅ Yes | `undefined` | `-----BEGIN PRIVATE KEY-----\n...` |
| `IPIPELINE_SAML_CERTIFICATE` | ✅ Yes | `undefined` | `-----BEGIN CERTIFICATE-----\n...` |
| `IPIPELINE_ENTITY_ID` | ⚪ Optional | `https://reachtheapex.net/saml/idp` | Custom entity ID |

---

**Last Updated:** April 3, 2026
**Integration Status:** Ready for configuration
**Next Step:** Add environment variables and test
