# n8n Deployment for Apex Platform

**Complete automation infrastructure on Hetzner VPS**

---

## 🎯 What This Does

Sets up a production-ready n8n instance on Hetzner VPS with:
- ✅ Docker containerization
- ✅ PostgreSQL database
- ✅ Redis queue management
- ✅ Nginx reverse proxy
- ✅ SSL certificates (Let's Encrypt)
- ✅ Automatic backups
- ✅ Health monitoring
- ✅ Auto-restart on failure

**Domain:** `https://n8n.reachtheapex.net`
**Cost:** ~$5/month (Hetzner CX21 server)

---

## 🚀 Quick Start (Automated Deployment)

### Option 1: Fully Automated (Recommended)

```bash
cd n8n-deployment
chmod +x deploy-to-hetzner.sh
./deploy-to-hetzner.sh
```

This will:
1. Create SSH key
2. Create Hetzner VPS
3. Install Docker
4. Install n8n + PostgreSQL + Redis
5. Configure Nginx with SSL
6. Set up backups and monitoring

**Time:** ~5 minutes

---

### Option 2: Manual Setup (Existing VPS)

If you already have a Hetzner VPS:

```bash
# 1. SSH into your VPS
ssh root@YOUR_VPS_IP

# 2. Download setup script
wget https://raw.githubusercontent.com/YOUR_REPO/n8n-deployment/setup-hetzner.sh

# 3. Run setup
chmod +x setup-hetzner.sh
./setup-hetzner.sh
```

---

## 📋 Prerequisites

### What You Need:
1. Hetzner Cloud account
2. Hetzner API token (provided)
3. Access to reachtheapex.net DNS settings

### API Credentials Saved:
- **Hetzner API Token:** `2MVrG8YwHXa6I0bCp9hAjehN0J09H7O7eJL1aQ2kLBBwzqg5Nhx2ynbml70FvWT1`
- **n8n Admin Password:** `s4Xkilla1@`

---

## 🔧 Post-Deployment Setup

### Step 1: Add DNS Record

Add this A record in your DNS provider (Cloudflare/Namecheap/etc.):

```
Name:  n8n
Type:  A
Value: [SERVER_IP from deployment output]
TTL:   300
```

**Wait 5-10 minutes** for DNS to propagate.

### Step 2: Access n8n

1. Go to: `https://n8n.reachtheapex.net`
2. Create admin account:
   - **Email:** `admin@theapexway.net`
   - **Password:** `s4Xkilla1@`
   - **First Name:** Admin
   - **Last Name:** Apex

### Step 3: Add Credentials

#### Supabase (PostgreSQL)
```
Credential Type: Postgres
Name: Supabase Production

Host: db.brejvdvzwshroxkkhmzy.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [from your .env file: SUPABASE_SERVICE_ROLE_KEY]
SSL Mode: Require
```

#### Resend (Email)
```
Credential Type: Resend API
Name: Resend - Apex

API Key: [from your .env file: RESEND_API_KEY]
```

#### Slack (Optional - for alerts)
```
Credential Type: Slack
Name: Slack - Admin Alerts

Webhook URL: [from Slack workspace]
```

---

## 📦 Importing Workflows

### Daily Enrollment Report (Pilot Workflow)

1. In n8n, click **Workflows** → **Add workflow**
2. Click **⋮** (three dots) → **Import from File**
3. Select: `n8n-deployment/workflows/daily-enrollment-report.json`
4. Click nodes to assign credentials:
   - **Supabase Query** → Select "Supabase Production"
   - **Resend Email** → Select "Resend - Apex"
5. Click **Save**
6. Click **Active** toggle to enable

---

## 🎯 Testing the Workflow

### Manual Test Run

1. Open the "Daily Enrollment Report" workflow
2. Click **Execute Workflow** button (play icon)
3. Watch the execution in real-time:
   - ✅ Schedule Trigger
   - ✅ Query Supabase (new signups from yesterday)
   - ✅ Format HTML email
   - ✅ Send via Resend
4. Check your inbox for the report

### What to Expect

You should receive an email at `admin@theapexway.net` with:
- Subject: "Daily Enrollment Report - [X] new signups"
- HTML table with distributor details
- Sent from: `theapex@theapexway.net`

---

## 📊 Monitoring

### View Execution History

1. In n8n, click **Executions** in sidebar
2. See all workflow runs with:
   - ✅ Success (green)
   - ⚠️ Warning (yellow)
   - ❌ Error (red)
3. Click any execution to see detailed logs

### Health Checks

SSH into server and run:

```bash
# Check all containers
docker ps

# View n8n logs
docker logs -f n8n

# View PostgreSQL logs
docker logs -f n8n-postgres

# Check disk usage
df -h

# Check memory usage
free -h
```

---

## 🔄 Backup & Recovery

### Automatic Backups

Backups run daily at 2 AM:
- **Database:** PostgreSQL dump
- **Workflows:** n8n data directory
- **Location:** `/opt/n8n/backups`
- **Retention:** 7 days

### Manual Backup

```bash
ssh root@YOUR_SERVER_IP
/usr/local/bin/backup-n8n.sh
```

### Restore from Backup

```bash
# List backups
ls -lh /opt/n8n/backups

# Restore database
cat /opt/n8n/backups/n8n_db_YYYYMMDD_HHMMSS.sql | \
  docker exec -i n8n-postgres psql -U n8n -d n8n

# Restore data
tar -xzf /opt/n8n/backups/n8n_data_YYYYMMDD_HHMMSS.tar.gz -C /
docker restart n8n
```

---

## 🚨 Troubleshooting

### n8n won't start

```bash
# Check logs
docker logs n8n

# Restart
docker restart n8n

# Nuclear option (recreates containers)
cd /opt/n8n
docker compose down
docker compose up -d
```

### SSL certificate errors

```bash
# Renew certificate manually
certbot renew --force-renewal
docker restart n8n-nginx
```

### Can't access n8n.reachtheapex.net

```bash
# Check DNS
nslookup n8n.reachtheapex.net

# Check Nginx
docker logs n8n-nginx

# Check firewall
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```

### Database connection failed

```bash
# Check PostgreSQL
docker logs n8n-postgres

# Verify credentials in /opt/n8n/.env
cat /opt/n8n/.env | grep POSTGRES
```

---

## 📁 File Structure

```
/opt/n8n/
├── .env                      # Environment variables
├── docker-compose.yml        # Container configuration
├── data/                     # n8n workflows & executions
├── postgres/                 # PostgreSQL data
├── redis/                    # Redis data
├── backups/                  # Daily backups
├── nginx/
│   └── nginx.conf           # Reverse proxy config
└── logs/                    # Application logs
```

---

## 🔐 Security

### SSH Access

```bash
# Only use SSH key (password auth disabled)
ssh -i ~/.ssh/apex_deploy root@YOUR_SERVER_IP
```

### Firewall Rules

```bash
# Only these ports are open:
# 22  - SSH
# 80  - HTTP (redirects to HTTPS)
# 443 - HTTPS
# All other ports blocked
```

### Database Security

- PostgreSQL only accessible from Docker network
- No external access
- Strong random passwords

### n8n Security

- HTTPS enforced
- User authentication required
- Webhook authentication tokens
- Execution data encrypted at rest

---

## 💰 Cost Breakdown

| Service | Cost | Details |
|---------|------|---------|
| Hetzner CX21 VPS | $5.40/month | 2 vCPU, 4GB RAM, 40GB SSD |
| Let's Encrypt SSL | Free | Auto-renewing certificates |
| **Total** | **$5.40/month** | vs $50/month for n8n Cloud |

**Annual Cost:** $64.80
**Savings:** $535/year vs n8n Cloud

---

## 📞 Support

### Useful Commands

```bash
# View all running containers
docker ps

# Restart n8n
docker restart n8n

# View n8n logs (live)
docker logs -f n8n

# Access n8n container shell
docker exec -it n8n /bin/sh

# Run manual backup
/usr/local/bin/backup-n8n.sh

# Check system resources
htop

# Check disk space
df -h

# Update n8n to latest version
cd /opt/n8n
docker compose pull n8n
docker compose up -d n8n
```

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Deploy VPS (automated)
2. ✅ Configure DNS
3. ✅ Access n8n web interface
4. ✅ Create admin account
5. ✅ Add credentials (Supabase, Resend)
6. ✅ Import Daily Enrollment Report workflow
7. ✅ Test workflow execution
8. ⏭️ Monitor for 1 week
9. ⏭️ Migrate more workflows (onboarding, nurture, etc.)
10. ⏭️ Deprecate old cron job code

---

## 📚 Additional Resources

- **n8n Documentation:** https://docs.n8n.io
- **Hetzner Cloud Docs:** https://docs.hetzner.com
- **Let's Encrypt:** https://letsencrypt.org
- **Docker Docs:** https://docs.docker.com

---

**Last Updated:** April 4, 2026
**Maintained By:** Apex Platform DevOps
