# n8n Quick Start Guide

**Get n8n running on Hetzner in 10 minutes**

---

## 🚀 Step-by-Step Deployment

### Step 1: Run Automated Deployment (2 minutes)

```bash
cd n8n-deployment
chmod +x deploy-to-hetzner.sh
./deploy-to-hetzner.sh
```

**What happens:**
- Creates Hetzner VPS (CX21: 2 vCPU, 4GB RAM, $5/month)
- Installs Docker + n8n + PostgreSQL + Redis + Nginx
- Configures SSL certificates
- Sets up backups and monitoring

**You'll see:**
```
🎉 Deployment Complete!
Server IP: 123.456.789.012
```

**Save this IP address!**

---

### Step 2: Configure DNS (5 minutes)

1. Log into your DNS provider (Cloudflare, Namecheap, etc.)
2. Add A record:
   ```
   Name:  n8n
   Type:  A
   Value: [SERVER_IP from Step 1]
   TTL:   300
   ```
3. Wait 5 minutes for DNS to propagate

**Check DNS:**
```bash
nslookup n8n.reachtheapex.net
```

---

### Step 3: Access n8n (1 minute)

1. Go to: https://n8n.reachtheapex.net
2. Create admin account:
   - **Email:** `admin@theapexway.net`
   - **Password:** `s4Xkilla1@`
   - **First Name:** Admin
   - **Last Name:** Apex
3. Click **Get Started**

---

### Step 4: Add Credentials (2 minutes)

#### Supabase Credential

1. Click **Settings** (gear icon) → **Credentials** → **Add Credential**
2. Search: `Postgres`
3. Fill in:
   ```
   Name: Supabase Production
   Host: db.brejvdvzwshroxkkhmzy.supabase.co
   Port: 5432
   Database: postgres
   User: postgres
   Password: [your SUPABASE_SERVICE_ROLE_KEY]
   SSL Mode: Require
   ```
4. Click **Test Connection** → Should see ✅ Success
5. Click **Save**

#### Resend Credential

1. Click **Add Credential** again
2. Search: `Resend`
3. Fill in:
   ```
   Name: Resend - Apex
   API Key: [your RESEND_API_KEY]
   ```
4. Click **Save**

**Where to get these:**
- Open your `.env.local` file
- Copy `SUPABASE_SERVICE_ROLE_KEY`
- Copy `RESEND_API_KEY`

---

### Step 5: Import Workflow (1 minute)

1. Click **Workflows** → **Add workflow**
2. Click **⋮** (three dots, top right) → **Import from File**
3. Select: `n8n-deployment/workflows/daily-enrollment-report.json`
4. Click **Import**

**You'll see:**
```
[Schedule] → [Query Supabase] → [Format HTML] → [Send Email] → [Log]
```

---

### Step 6: Assign Credentials (30 seconds)

1. Click on **"Query New Signups"** node
2. In right panel, under **Credential to connect with**:
   - Select **"Supabase Production"** from dropdown
3. Click on **"Send Email"** node
4. In right panel, under **Credential to connect with**:
   - Select **"Resend - Apex"** from dropdown
5. Click **Save** (top right)

---

### Step 7: Test the Workflow (30 seconds)

1. Click **Execute Workflow** button (play icon, top right)
2. Watch it run:
   - ✅ Schedule Trigger
   - ✅ Query New Signups (shows SQL results)
   - ✅ Format Email HTML (shows email content)
   - ✅ Send Email (shows Resend response)
   - ✅ Log Success

**Check your email!**
- To: `admin@theapexway.net`
- Subject: "Daily Enrollment Report - X new signups"
- From: `theapex@theapexway.net`

---

### Step 8: Activate the Workflow (10 seconds)

1. Toggle **Active** switch (top right) to ON
2. Workflow will now run automatically at 9 AM daily

---

## ✅ Success Checklist

- [x] VPS deployed on Hetzner
- [x] DNS configured (n8n.reachtheapex.net)
- [x] SSL certificate working (https://)
- [x] Admin account created
- [x] Supabase credential added
- [x] Resend credential added
- [x] Daily Enrollment Report workflow imported
- [x] Credentials assigned to nodes
- [x] Test execution successful
- [x] Email received
- [x] Workflow activated

---

## 🎯 What Happens Next

### Daily at 9 AM:
1. n8n wakes up
2. Queries Supabase for yesterday's signups
3. Formats beautiful HTML email
4. Sends to `admin@theapexway.net`
5. Logs execution (view in n8n Executions tab)

### If it fails:
- n8n shows error in Executions tab
- Click failed execution to see logs
- Fix issue (usually credential or query problem)
- Re-run manually

---

## 📊 Monitoring

### View Execution History

1. Click **Executions** in left sidebar
2. See all runs:
   - ✅ Green = Success
   - ❌ Red = Failed
3. Click any execution to see detailed logs

### Check Server Health

```bash
# SSH into server
ssh -i ~/.ssh/apex_deploy root@YOUR_SERVER_IP

# View n8n logs
docker logs -f n8n

# Check all containers
docker ps

# Exit
exit
```

---

## 🚨 Troubleshooting

### Can't access n8n.reachtheapex.net

**Check DNS:**
```bash
nslookup n8n.reachtheapex.net
```
Should show your server IP. If not, DNS hasn't propagated yet (wait 5-10 min).

### Workflow fails: "Connection refused"

**Fix:** Supabase credential issue
1. Go to Settings → Credentials
2. Click on "Supabase Production"
3. Click **Test Connection**
4. If fails, verify password is correct

### Email not sending

**Fix:** Resend credential issue
1. Go to Settings → Credentials
2. Click on "Resend - Apex"
3. Verify API key is correct
4. Check Resend dashboard for errors

### No signups in report

**Normal!** If no one signed up yesterday, you'll get email saying "No new signups".

To test with fake data:
1. Open workflow
2. Click "Execute Workflow"
3. Manually insert test data in Supabase

---

## 💰 Cost

| Item | Cost |
|------|------|
| Hetzner CX21 VPS | $5.40/month |
| SSL Certificate | Free (Let's Encrypt) |
| **Total** | **$5.40/month** |

**vs n8n Cloud:** $50/month
**Savings:** $535/year

---

## 🎯 Next Steps

After Daily Enrollment Report is working:

1. **Week 1:** Monitor daily emails
2. **Week 2:** Migrate "Onboarding Reminders" workflow
3. **Week 3:** Migrate "Nurture Email Campaigns"
4. **Week 4:** Migrate "Process Clawbacks"
5. **Month 2:** Migrate "Signup & Provisioning"
6. **Month 3:** Migrate "Commission Runs"

**Gradual migration** = Low risk!

---

## 📞 Need Help?

### Useful Commands

```bash
# View n8n logs
docker logs -f n8n

# Restart n8n
docker restart n8n

# Run backup manually
/usr/local/bin/backup-n8n.sh

# Check disk space
df -h
```

### SSH Access

```bash
ssh -i ~/.ssh/apex_deploy root@YOUR_SERVER_IP
```

---

**Total Setup Time:** ~10 minutes
**Difficulty:** Easy
**Risk:** Very Low (pilot workflow only)

---

**🎉 Congratulations! You now have professional workflow automation infrastructure!**
