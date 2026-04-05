# Social Media API Setup Guide
## Auto-Posting to Facebook, LinkedIn, X (Twitter), Instagram, TikTok

---

## Overview

The n8n workflow now includes auto-posting nodes for all 5 platforms. Each platform requires API credentials that you'll configure once in n8n.

**Total Setup Time:** ~2-3 hours (mostly waiting for app approvals)

---

## 1. Facebook Page Posting

### What You Need:
- Facebook Business Page
- Facebook App with Page Access Token

### Setup Steps:

1. **Create Facebook App:**
   - Go to: https://developers.facebook.com/apps/
   - Click "Create App"
   - Select "Business" type
   - Name: "Apex Affinity Auto-Post"

2. **Add Facebook Login Product:**
   - In app dashboard, click "Add Product"
   - Select "Facebook Login"
   - Configure settings

3. **Get Page Access Token:**
   - In app dashboard, go to Tools > Graph API Explorer
   - Select your app from dropdown
   - Add permissions: `pages_manage_posts`, `pages_read_engagement`
   - Click "Generate Access Token"
   - **IMPORTANT:** Exchange for long-lived token (60 days)
   - Use this endpoint:
   ```
   GET https://graph.facebook.com/v18.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id={app-id}
     &client_secret={app-secret}
     &fb_exchange_token={short-lived-token}
   ```

4. **Get Page ID:**
   - Go to your Facebook Page
   - Click "About" section
   - Scroll to bottom, copy Page ID

5. **Configure in n8n:**
   - Open "Post to Facebook" node
   - Click "Add Credential"
   - Enter:
     - **Page ID:** (from step 4)
     - **Access Token:** (from step 3)

### Test:
```bash
curl -X POST "https://graph.facebook.com/v18.0/{PAGE_ID}/feed" \
  -d "message=Test post from n8n" \
  -d "access_token={YOUR_TOKEN}"
```

---

## 2. LinkedIn Company Page Posting

### What You Need:
- LinkedIn Company Page (NOT personal profile)
- LinkedIn App with OAuth 2.0

### Setup Steps:

1. **Create LinkedIn App:**
   - Go to: https://www.linkedin.com/developers/apps
   - Click "Create app"
   - Fill in:
     - App name: "Apex Affinity Auto-Post"
     - Company: Select your LinkedIn Company Page
     - Privacy policy URL: https://reachtheapex.net/privacy
     - Business email: tdaniel@botmakers.ai

2. **Request Access to Marketing Developer Platform:**
   - In app settings, go to "Products" tab
   - Request access to "Share on LinkedIn" and "Marketing Developer Platform"
   - **NOTE:** This requires review (1-2 days)

3. **Configure OAuth 2.0:**
   - Go to "Auth" tab
   - Add redirect URL: `https://botmakersbqst.app.n8n.cloud/rest/oauth2-credential/callback`
   - Copy:
     - **Client ID**
     - **Client Secret**

4. **Configure in n8n:**
   - In n8n, go to Settings > Credentials
   - Click "Create New Credential"
   - Select "LinkedIn OAuth2 API"
   - Enter Client ID and Client Secret
   - Click "Connect my account"
   - Authorize the app

5. **Set Company URN:**
   - After OAuth, get your company URN:
   ```bash
   curl -X GET "https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=apex-affinity-group" \
     -H "Authorization: Bearer {ACCESS_TOKEN}"
   ```
   - Use the `id` value in posts

### Test:
The LinkedIn node in n8n will handle posting once OAuth is configured.

---

## 3. X (Twitter) Posting

### What You Need:
- X (Twitter) Developer Account
- Twitter App with OAuth 2.0

### Setup Steps:

1. **Apply for Developer Account:**
   - Go to: https://developer.twitter.com/en/portal/dashboard
   - Click "Sign up for Free Account"
   - Fill out application (describe use case: "Auto-posting new team member announcements")
   - **NOTE:** Approval takes 1-2 hours to 1 day

2. **Create Project & App:**
   - Once approved, create new project: "Apex Auto-Post"
   - Create app under project: "Apex n8n Integration"
   - App environment: "Production"

3. **Enable OAuth 2.0:**
   - In app settings, go to "User authentication settings"
   - Enable OAuth 2.0
   - App permissions: "Read and write"
   - Type of App: "Web App"
   - Callback URL: `https://botmakersbqst.app.n8n.cloud/rest/oauth2-credential/callback`
   - Website URL: https://reachtheapex.net

4. **Get API Keys:**
   - Go to "Keys and tokens" tab
   - Copy:
     - **API Key** (Consumer Key)
     - **API Secret** (Consumer Secret)
     - **Client ID** (OAuth 2.0)
     - **Client Secret** (OAuth 2.0)

5. **Configure in n8n:**
   - In n8n, open "Post to X (Twitter)" node
   - Click "Create New Credential"
   - Select "Twitter OAuth2 API"
   - Enter:
     - Client ID
     - Client Secret
   - Click "Connect my account"
   - Authorize the app

### Test:
The Twitter node in n8n will handle posting once OAuth is configured.

---

## 4. Instagram Business Account Posting

### What You Need:
- Instagram Business Account (connected to Facebook Page)
- Same Facebook App from step 1

### Setup Steps:

1. **Convert to Business Account:**
   - In Instagram app, go to Settings > Account
   - Select "Switch to Professional Account"
   - Choose "Business"
   - Connect to your Facebook Page

2. **Get Instagram Account ID:**
   - Use Graph API Explorer:
   ```
   GET https://graph.facebook.com/v18.0/me/accounts
     ?fields=instagram_business_account
     &access_token={PAGE_ACCESS_TOKEN}
   ```
   - Copy the `instagram_business_account.id`

3. **Add Permissions to Facebook App:**
   - In Facebook App dashboard, add permissions:
     - `instagram_basic`
     - `instagram_content_publish`
     - `pages_read_engagement`

4. **Configure in n8n:**
   - Open "Post to Instagram" node
   - Click "Add Credential"
   - Enter:
     - **Instagram Account ID:** (from step 2)
     - **Access Token:** (same as Facebook Page token)

### IMPORTANT - Instagram Posting Requirements:
- **Images REQUIRED:** Instagram requires an image URL
- Current workflow uses: `https://reachtheapex.net/og-image.png`
- **You should create:** A branded "Welcome to Apex" image template
- Update the `image_url` field in the workflow

### Test:
```bash
# Step 1: Create media container
curl -X POST "https://graph.facebook.com/v18.0/{IG_ACCOUNT_ID}/media" \
  -d "image_url=https://reachtheapex.net/og-image.png" \
  -d "caption=Test post" \
  -d "access_token={YOUR_TOKEN}"

# Step 2: Publish the container
curl -X POST "https://graph.facebook.com/v18.0/{IG_ACCOUNT_ID}/media_publish" \
  -d "creation_id={CREATION_ID_FROM_STEP_1}" \
  -d "access_token={YOUR_TOKEN}"
```

---

## 5. TikTok Posting

### What You Need:
- TikTok Business Account
- TikTok Developer App with Content Posting API

### Setup Steps:

1. **Create TikTok Developer Account:**
   - Go to: https://developers.tiktok.com/
   - Click "Register"
   - Fill out developer application
   - **NOTE:** Approval can take 3-7 days

2. **Create App:**
   - Once approved, go to: https://developers.tiktok.com/apps
   - Click "Create an app"
   - Fill in:
     - App name: "Apex Affinity Auto-Post"
     - Category: "Social"
     - Description: "Auto-posting team announcements"

3. **Request Content Posting API Access:**
   - In app dashboard, go to "Products"
   - Request access to "Content Posting API"
   - Fill out use case form
   - **NOTE:** This requires review (approval not guaranteed)

4. **Configure OAuth 2.0:**
   - In app settings, add redirect URI: `https://botmakersbqst.app.n8n.cloud/rest/oauth2-credential/callback`
   - Copy:
     - **Client Key**
     - **Client Secret**

5. **Configure in n8n:**
   - Open "Post to TikTok" node
   - Click "Add Credential"
   - Select "OAuth2 API"
   - Enter:
     - Authorization URL: `https://www.tiktok.com/v2/auth/authorize/`
     - Access Token URL: `https://open.tiktokapis.com/v2/oauth/token/`
     - Client ID: {Client Key}
     - Client Secret: {Client Secret}
     - Scope: `user.info.basic,video.publish`
   - Click "Connect my account"

### IMPORTANT - TikTok Posting Requirements:
- **Video REQUIRED:** TikTok requires a video URL
- Current workflow uses: `https://reachtheapex.net/welcome-video.mp4`
- **You MUST create:** A branded "Welcome to Apex" video (15-60 seconds)
- Upload to your server and update the `video_url` field

### Test:
```bash
curl -X POST "https://open.tiktokapis.com/v2/post/publish/video/init/" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "post_info": {
      "title": "Test post",
      "privacy_level": "PUBLIC_TO_EVERYONE"
    },
    "source_info": {
      "source": "PULL_FROM_URL",
      "video_url": "https://reachtheapex.net/welcome-video.mp4"
    }
  }'
```

---

## Summary Checklist

Before importing the workflow, complete these steps:

### Required Assets:
- [ ] **Facebook:** Page Access Token (long-lived, 60 days)
- [ ] **LinkedIn:** OAuth 2.0 credentials configured in n8n
- [ ] **Twitter:** OAuth 2.0 credentials configured in n8n
- [ ] **Instagram:** Business Account ID + Facebook token
- [ ] **TikTok:** OAuth 2.0 credentials + Content Posting API access

### Required Media:
- [ ] **Instagram Image:** Create branded "Welcome" graphic
  - Upload to: `https://reachtheapex.net/welcome-template.png`
  - Update workflow `image_url` field
- [ ] **TikTok Video:** Create branded "Welcome" video (15-60 sec)
  - Upload to: `https://reachtheapex.net/welcome-video.mp4`
  - Update workflow `video_url` field

### Optional Enhancements:
- [ ] Set up Facebook token auto-refresh (use business tokens)
- [ ] Create multiple post templates (A/B testing)
- [ ] Add error notifications (send email on post failure)
- [ ] Schedule posts for optimal times (delay nodes)

---

## Estimated Timeline

| Platform | Setup Time | Approval Time | Total |
|----------|------------|---------------|-------|
| Facebook | 30 min | Instant | 30 min |
| LinkedIn | 20 min | 1-2 days | ~2 days |
| Twitter | 20 min | 1-24 hours | ~1 day |
| Instagram | 15 min | Instant | 15 min |
| TikTok | 30 min | 3-7 days | ~1 week |

**Fastest path:** Start with Facebook and Instagram (instant), then Twitter, LinkedIn, TikTok.

---

## Troubleshooting

### Facebook: "Error validating access token"
- Token expired (60-day limit) → Generate new long-lived token
- Missing permissions → Check `pages_manage_posts` is granted

### LinkedIn: "Not authorized to post"
- Marketing Developer Platform not approved → Wait for LinkedIn review
- Wrong company URN → Verify company ID in API response

### Twitter: "Forbidden"
- OAuth 2.0 not enabled → Enable in app settings
- Wrong permissions → Select "Read and write"

### Instagram: "Media type not supported"
- Missing image URL → Must provide valid image
- Business account not connected → Link to Facebook Page

### TikTok: "Content Posting API access denied"
- API access not approved → Reapply with detailed use case
- Video format issue → Ensure MP4, H.264, under 287.6MB

---

## Security Best Practices

1. **Never commit tokens to git** - Use n8n credentials system
2. **Rotate tokens regularly** - Set calendar reminders
3. **Use least privilege** - Only request needed permissions
4. **Monitor API usage** - Check for unusual activity
5. **Enable 2FA** - On all social media accounts

---

Generated: 2026-04-05
