# n8n Setup on Windows VPS - Simple Guide

**Get n8n running on Windows Server in 10 minutes**

---

## 🪟 Option 1: Create Windows VPS on Hetzner

### Step 1: Create VPS (5 minutes)

1. Go to https://cloud.hetzner.com
2. Click **"Add Server"**
3. Choose:
   - **Location:** Ashburn, VA (closest to US)
   - **Image:** Ubuntu 22.04 (Linux is actually easier than Windows!)
   - **Type:** CX21 (2 vCPU, 4GB RAM) - $5.40/month
   - **SSH Keys:** Add your SSH key or create one
4. Click **"Create & Buy Now"**
5. Wait ~60 seconds for server to provision
6. **Note the IP address!**

---

### Step 2: SSH into VPS and Run Setup

```powershell
# From PowerShell on your Windows machine
ssh root@YOUR_VPS_IP

# Once connected to VPS, run:
wget https://raw.githubusercontent.com/path-to/setup-hetzner.sh
chmod +x setup-hetzner.sh
./setup-hetzner.sh
```

**Or I can walk you through it manually!**

---

## 🖥️ Option 2: Use Existing Windows Server

If you already have a Windows VPS:

### Step 1: Run PowerShell as Administrator

1. Right-click **Start** → **Windows PowerShell (Admin)**

### Step 2: Run Setup Script

```powershell
cd "C:\dev\1 - Apex Pre-Launch Site\n8n-deployment\windows"
.\setup-windows-vps.ps1
```

**What it does:**
- Installs Chocolatey (package manager)
- Installs Docker Desktop
- Creates n8n + PostgreSQL + Redis containers
- Configures everything automatically

**Time:** ~10 minutes (includes Docker Desktop install)

---

## 🎯 After Setup

### Access n8n:

**Locally:**
```
http://localhost:5678
```

**From Internet (after DNS setup):**
```
https://n8n.reachtheapex.net
```

---

## 📋 DNS Configuration

Add this A record in your DNS provider:

```
Name:  n8n
Type:  A
Value: [YOUR_VPS_IP]
TTL:   300
```

---

## 🔒 HTTPS Setup (Optional but Recommended)

### Option A: Use Caddy (Easiest)

1. Install Caddy:
   ```powershell
   choco install caddy -y
   ```

2. Create Caddyfile:
   ```
   n8n.reachtheapex.net {
       reverse_proxy localhost:5678
   }
   ```

3. Run Caddy:
   ```powershell
   caddy run
   ```

**Caddy automatically gets SSL certificates!**

### Option B: Use IIS (Windows Native)

1. Install IIS with URL Rewrite and ARR
2. Configure reverse proxy to localhost:5678
3. Install SSL certificate manually

---

## 🧪 Test Everything

1. **Access n8n:**
   - Go to http://localhost:5678
   - Create admin account:
     - Email: `admin@theapexway.net`
     - Password: `s4Xkilla1@`

2. **Add Credentials:**
   - Supabase Production (PostgreSQL)
   - Resend API

3. **Import Workflow:**
   - Go to parent directory: `n8n-deployment/workflows/`
   - Import `daily-enrollment-report.json`

4. **Test Execution:**
   - Click **Execute Workflow**
   - Check execution logs
   - Verify email sent

---

## 💡 My Recommendation

**Use Linux VPS instead of Windows VPS!**

### Why?

| Linux VPS | Windows VPS |
|-----------|-------------|
| $5/month | $15-30/month |
| Docker native | Docker Desktop overhead |
| Better n8n support | Community support |
| Easier SSL setup | Manual SSL config |
| Lightweight | Resource-heavy |

**The setup script I created works perfectly on Ubuntu!**

---

## 🚀 Easiest Path (Linux on Hetzner)

1. Create Ubuntu VPS on Hetzner (5 min)
2. SSH in and run setup script (5 min)
3. Add DNS record (1 min)
4. Access n8n with auto-SSL (instant)

**Total:** ~10 minutes
**Cost:** $5.40/month
**Complexity:** Very low

vs Windows:
**Total:** ~20 minutes
**Cost:** $15-30/month
**Complexity:** Medium (manual SSL)

---

## 🤔 What Would You Like to Do?

**Option A:** Create **Linux VPS** on Hetzner (recommended)
- I'll walk you through it step-by-step
- Cheaper, easier, better supported

**Option B:** Use **Windows VPS** you already have
- Run the PowerShell script I created
- Manual SSL setup needed

**Option C:** Use **local Windows machine** for testing
- Run PowerShell script locally
- Only accessible on your network

**Which sounds best for you?**
