# n8n Workflow Import Instructions

## File to Import:
`workflows/new-distributor-onboarding.json`

---

## How to Import:

1. **Open n8n:** https://botmakersbqst.app.n8n.cloud

2. **Create new workflow:**
   - Click "Add workflow" (top right)

3. **Import from file:**
   - Click "..." menu (top right)
   - Select "Import from File"
   - Choose: `new-distributor-onboarding.json`

4. **Configure Social Media Credentials:**
   - **BEFORE activating**, set up API credentials for auto-posting
   - See: `SOCIAL-MEDIA-API-SETUP.md` for complete guide
   - Required:
     - Facebook Page Access Token
     - LinkedIn OAuth 2.0
     - Twitter/X OAuth 2.0
     - Instagram Business Account ID
     - TikTok OAuth 2.0 (optional - requires approval)

5. **Activate workflow:**
   - Toggle "Active" switch (top right)

6. **Copy webhook URL:**
   - It will be: `https://botmakersbqst.app.n8n.cloud/webhook/new-distributor`

---

## Update Environment Variable:

**In Vercel Dashboard:**
1. Go to Settings → Environment Variables
2. Add/Update:
   - Name: `N8N_WEBHOOK_NEW_DISTRIBUTOR`
   - Value: `https://botmakersbqst.app.n8n.cloud/webhook/new-distributor`
3. Redeploy

**OR via CLI:**
```bash
vercel env add N8N_WEBHOOK_NEW_DISTRIBUTOR production
# Paste: https://botmakersbqst.app.n8n.cloud/webhook/new-distributor
vercel --prod
```

---

## Test the Workflow:

```bash
curl -X POST https://botmakersbqst.app.n8n.cloud/webhook/new-distributor \
  -H "Content-Type: application/json" \
  -d '{
    "distributorId": "0b72d952-b556-4a09-8f86-7eae0299cfa4",
    "email": "sellag.sb@gmail.com",
    "firstName": "Sella",
    "lastName": "Daniel"
  }'
```

**Expected Results:**
- ✅ Immediate response: `{"message":"Workflow started"}`
- ✅ Welcome email sent to sellag.sb@gmail.com
- ✅ AI phone provisioned (check distributor record)
- ✅ Social media posts generated (visible in n8n execution)

---

## Workflow Nodes:

1. **Webhook** - Receives signup data
2. **Respond** - Returns 200 OK immediately
3. **Send Welcome Email** - Calls `/api/email/send-welcome` (uses existing template)
4. **Get Distributor** - Fetches full data + sponsor from Supabase
5. **Prepare Data** - Extracts sponsor name, builds URLs
6. **Provision AI Phone** - Creates VAPI assistant with personalized prompt
7. **Social Media Posts** - Generates posts for all 5 platforms
8. **Post to Facebook** - Auto-posts to Facebook Page
9. **Post to LinkedIn** - Auto-posts to LinkedIn Company Page
10. **Post to X (Twitter)** - Auto-posts to Twitter/X
11. **Post to Instagram** - Auto-posts to Instagram Business Account
12. **Post to TikTok** - Auto-posts to TikTok Business Account

---

## What Each Step Does:

### Send Welcome Email
- Calls existing `enrollInCampaign()` function
- Uses database template (licensed vs non-licensed)
- Renders: `{{first_name}}`, `{{slug}}`, `{{sponsor_name}}`
- Logs to `email_campaigns` and `email_sends` tables

### Provision AI Phone
- Creates VAPI assistant with personalized prompt
- Provisions phone number (matching area code)
- Grants 20 free minutes, 24-hour trial
- Updates distributor with AI phone details

### Social Media Posts
Generates ready-to-post content:
- **Facebook:** Emoji, friendly tone
- **Twitter:** Hashtags, mentions
- **LinkedIn:** Professional, detailed

---

## Troubleshooting:

**Workflow not triggering?**
- Check workflow is "Active" (green toggle)
- Verify webhook URL matches environment variable
- Check n8n execution history for errors

**Email not sending?**
- Check n8n execution - click "Send Welcome Email" node
- Look for error message in output
- Verify `/api/email/send-welcome` endpoint is deployed

**AI phone not provisioning?**
- Check VAPI API key is configured in production
- Look at "Provision AI Phone" node output in n8n
- Check if timeout (30 seconds) is sufficient

**Social media posts not generating?**
- Check "Prepare Data" node has all required fields
- Verify sponsor name is being fetched correctly
- Look at "Social Media Posts" node output

**Social media posts failing to publish?**
- Check API credentials are configured in n8n
- Verify tokens haven't expired (Facebook: 60 days)
- For Instagram: Ensure image URL is valid
- For TikTok: Ensure video URL is valid and Content Posting API is approved
- Check node error messages for specific platform issues

---

## Notes:

- **Replicated sites are automatic** - no n8n action needed (slug creates URL)
- **Matrix placement stays in code** - for data integrity/race condition prevention
- **Workflow runs asynchronously** - signup doesn't wait for completion
- **All nodes have "Continue On Fail: true"** - one failure won't stop entire workflow
