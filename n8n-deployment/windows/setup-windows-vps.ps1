# n8n Setup for Windows VPS
# PowerShell deployment script

# Requires: Windows Server 2022 or Windows 10/11 Pro
# Run as Administrator

param(
    [string]$Domain = "n8n.reachtheapex.net",
    [string]$Email = "support@theapexway.net"
)

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator"
    exit 1
}

Write-Host "🚀 Starting n8n Setup on Windows VPS..." -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue

# Install Chocolatey if not already installed
Write-Host "Step 1: Installing Chocolatey package manager..." -ForegroundColor Cyan
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Host "✅ Chocolatey installed" -ForegroundColor Green
} else {
    Write-Host "✅ Chocolatey already installed" -ForegroundColor Green
}

# Install Docker Desktop
Write-Host "Step 2: Installing Docker Desktop..." -ForegroundColor Cyan
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    choco install docker-desktop -y
    Write-Host "✅ Docker Desktop installed" -ForegroundColor Green
    Write-Host "⚠️  Please restart your computer and run this script again" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "✅ Docker already installed" -ForegroundColor Green
}

# Create n8n directory structure
Write-Host "Step 3: Creating directory structure..." -ForegroundColor Cyan
$n8nPath = "C:\n8n"
New-Item -ItemType Directory -Force -Path $n8nPath | Out-Null
New-Item -ItemType Directory -Force -Path "$n8nPath\data" | Out-Null
New-Item -ItemType Directory -Force -Path "$n8nPath\postgres" | Out-Null
New-Item -ItemType Directory -Force -Path "$n8nPath\redis" | Out-Null
New-Item -ItemType Directory -Force -Path "$n8nPath\backups" | Out-Null
Write-Host "✅ Directories created at $n8nPath" -ForegroundColor Green

# Generate secure passwords
Write-Host "Step 4: Generating secure passwords..." -ForegroundColor Cyan
$PostgresPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$EncryptionKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "✅ Passwords generated" -ForegroundColor Green

# Create .env file
Write-Host "Step 5: Creating environment configuration..." -ForegroundColor Cyan
$envContent = @"
# n8n Configuration
N8N_VERSION=latest
DOMAIN=$Domain
GENERIC_TIMEZONE=America/New_York

# Database
POSTGRES_USER=n8n
POSTGRES_PASSWORD=$PostgresPassword
POSTGRES_DB=n8n

# n8n Settings
N8N_HOST=$Domain
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://$Domain/
N8N_ENCRYPTION_KEY=$EncryptionKey

# Authentication
N8N_BASIC_AUTH_ACTIVE=false
N8N_USER_MANAGEMENT_DISABLED=false

# Email
N8N_EMAIL_MODE=smtp
N8N_SMTP_HOST=smtp.resend.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=resend
N8N_SMTP_SENDER=$Email

# Execution
EXECUTIONS_PROCESS=main
EXECUTIONS_MODE=regular
EXECUTIONS_TIMEOUT=300
EXECUTIONS_TIMEOUT_MAX=3600

# Logs
N8N_LOG_LEVEL=info
N8N_LOG_OUTPUT=console,file
N8N_LOG_FILE_LOCATION=/home/node/.n8n/logs/
"@

$envContent | Out-File -FilePath "$n8nPath\.env" -Encoding UTF8
Write-Host "✅ Environment file created" -ForegroundColor Green

# Create docker-compose.yml
Write-Host "Step 6: Creating Docker Compose configuration..." -ForegroundColor Cyan
$dockerComposeContent = @"
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: n8n-postgres
    restart: always
    environment:
      - POSTGRES_USER=`${POSTGRES_USER}
      - POSTGRES_PASSWORD=`${POSTGRES_PASSWORD}
      - POSTGRES_DB=`${POSTGRES_DB}
    volumes:
      - ./postgres:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -h localhost -U `${POSTGRES_USER} -d `${POSTGRES_DB}']
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - n8n-network

  redis:
    image: redis:7-alpine
    container_name: n8n-redis
    restart: always
    volumes:
      - ./redis:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - n8n-network

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=`${POSTGRES_DB}
      - DB_POSTGRESDB_USER=`${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=`${POSTGRES_PASSWORD}
      - N8N_HOST=`${N8N_HOST}
      - N8N_PORT=`${N8N_PORT}
      - N8N_PROTOCOL=`${N8N_PROTOCOL}
      - WEBHOOK_URL=`${WEBHOOK_URL}
      - GENERIC_TIMEZONE=`${GENERIC_TIMEZONE}
      - N8N_ENCRYPTION_KEY=`${N8N_ENCRYPTION_KEY}
      - N8N_USER_MANAGEMENT_DISABLED=`${N8N_USER_MANAGEMENT_DISABLED}
      - N8N_LOG_LEVEL=`${N8N_LOG_LEVEL}
      - EXECUTIONS_PROCESS=`${EXECUTIONS_PROCESS}
      - EXECUTIONS_MODE=`${EXECUTIONS_MODE}
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
    ports:
      - "5678:5678"
    volumes:
      - ./data:/home/node/.n8n
      - ./backups:/backups
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge
"@

$dockerComposeContent | Out-File -FilePath "$n8nPath\docker-compose.yml" -Encoding UTF8
Write-Host "✅ Docker Compose file created" -ForegroundColor Green

# Start Docker containers
Write-Host "Step 7: Starting Docker containers..." -ForegroundColor Cyan
Set-Location $n8nPath
docker-compose up -d

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "🎉 n8n Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Important Information:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installation Path: $n8nPath"
Write-Host "Access URL (local): http://localhost:5678"
Write-Host "Access URL (production): https://$Domain"
Write-Host ""
Write-Host "Database Credentials (saved in .env):" -ForegroundColor Yellow
Write-Host "PostgreSQL Password: $PostgresPassword"
Write-Host "Encryption Key: $EncryptionKey"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure your firewall to allow port 5678"
Write-Host "2. Set up reverse proxy (IIS or Caddy) for HTTPS"
Write-Host "3. Add DNS A record pointing to this server's IP"
Write-Host "4. Create your admin account at http://localhost:5678"
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:    docker logs -f n8n"
Write-Host "  Restart n8n:  docker restart n8n"
Write-Host "  Stop all:     docker-compose down"
Write-Host "  Start all:    docker-compose up -d"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
