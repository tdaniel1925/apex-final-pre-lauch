#!/bin/bash

#############################################
# n8n Automated Setup on Hetzner VPS
# For Apex Platform Automation
# Domain: n8n.reachtheapex.net
#############################################

set -e  # Exit on any error

echo "🚀 Starting n8n Setup on Hetzner VPS..."
echo "==========================================="

# Configuration
DOMAIN="n8n.reachtheapex.net"
EMAIL="support@theapexway.net"
N8N_VERSION="latest"
POSTGRES_VERSION="15"
REDIS_VERSION="7-alpine"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Generate secure passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)

echo -e "${BLUE}Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

echo -e "${BLUE}Step 2: Installing Docker and Docker Compose...${NC}"
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
apt-get install -y docker-compose-plugin

# Start Docker
systemctl start docker
systemctl enable docker

echo -e "${GREEN}✅ Docker installed successfully${NC}"

echo -e "${BLUE}Step 3: Creating directory structure...${NC}"
mkdir -p /opt/n8n
mkdir -p /opt/n8n/data
mkdir -p /opt/n8n/postgres
mkdir -p /opt/n8n/redis
mkdir -p /opt/n8n/backups
mkdir -p /opt/n8n/nginx

cd /opt/n8n

echo -e "${BLUE}Step 4: Creating environment file...${NC}"
cat > .env <<EOF
# n8n Configuration
N8N_VERSION=${N8N_VERSION}
DOMAIN=${DOMAIN}
SUBDOMAIN=n8n
GENERIC_TIMEZONE=America/New_York

# Database
POSTGRES_USER=n8n
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=n8n
POSTGRES_NON_ROOT_USER=n8n
POSTGRES_NON_ROOT_PASSWORD=${POSTGRES_PASSWORD}

# n8n Settings
N8N_HOST=${DOMAIN}
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://${DOMAIN}/
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}

# Authentication
N8N_BASIC_AUTH_ACTIVE=false
N8N_USER_MANAGEMENT_DISABLED=false

# Email (for notifications)
N8N_EMAIL_MODE=smtp
N8N_SMTP_HOST=smtp.resend.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=resend
N8N_SMTP_SENDER=${EMAIL}

# Execution
EXECUTIONS_PROCESS=main
EXECUTIONS_MODE=regular
EXECUTIONS_TIMEOUT=300
EXECUTIONS_TIMEOUT_MAX=3600

# Logs
N8N_LOG_LEVEL=info
N8N_LOG_OUTPUT=console,file
N8N_LOG_FILE_LOCATION=/home/node/.n8n/logs/
EOF

echo -e "${GREEN}✅ Environment file created${NC}"

echo -e "${BLUE}Step 5: Creating Docker Compose configuration...${NC}"
cat > docker-compose.yml <<'DOCKERCOMPOSE'
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: n8n-postgres
    restart: always
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - ./postgres:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -h localhost -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
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
    image: n8nio/n8n:${N8N_VERSION}
    container_name: n8n
    restart: always
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${POSTGRES_DB}
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=${N8N_PORT}
      - N8N_PROTOCOL=${N8N_PROTOCOL}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - N8N_USER_MANAGEMENT_DISABLED=${N8N_USER_MANAGEMENT_DISABLED}
      - N8N_LOG_LEVEL=${N8N_LOG_LEVEL}
      - N8N_LOG_OUTPUT=${N8N_LOG_OUTPUT}
      - EXECUTIONS_PROCESS=${EXECUTIONS_PROCESS}
      - EXECUTIONS_MODE=${EXECUTIONS_MODE}
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

  nginx:
    image: nginx:alpine
    container_name: n8n-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - n8n
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  n8n_data:
DOCKERCOMPOSE

echo -e "${GREEN}✅ Docker Compose file created${NC}"

echo -e "${BLUE}Step 6: Creating Nginx configuration...${NC}"
cat > nginx/nginx.conf <<'NGINX'
events {
    worker_connections 1024;
}

http {
    upstream n8n {
        server n8n:5678;
    }

    server {
        listen 80;
        server_name n8n.reachtheapex.net;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name n8n.reachtheapex.net;

        ssl_certificate /etc/letsencrypt/live/n8n.reachtheapex.net/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/n8n.reachtheapex.net/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        client_max_body_size 50M;

        location / {
            proxy_pass http://n8n;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
    }
}
NGINX

echo -e "${GREEN}✅ Nginx configuration created${NC}"

echo -e "${BLUE}Step 7: Installing Certbot for SSL...${NC}"
apt-get install -y certbot

echo -e "${BLUE}Step 8: Starting Docker containers (without SSL first)...${NC}"
# Start without nginx first to get SSL cert
docker compose up -d postgres redis n8n

echo -e "${BLUE}Waiting for n8n to be ready...${NC}"
sleep 30

echo -e "${BLUE}Step 9: Obtaining SSL certificate...${NC}"
# Stop nginx if running
docker compose stop nginx 2>/dev/null || true

# Get SSL certificate
certbot certonly --standalone \
  --preferred-challenges http \
  --email ${EMAIL} \
  --agree-tos \
  --no-eff-email \
  -d ${DOMAIN}

echo -e "${GREEN}✅ SSL certificate obtained${NC}"

echo -e "${BLUE}Step 10: Starting Nginx with SSL...${NC}"
docker compose up -d nginx

echo -e "${BLUE}Step 11: Setting up automatic SSL renewal...${NC}"
# Create renewal script
cat > /etc/cron.daily/renew-ssl <<'RENEWAL'
#!/bin/bash
certbot renew --quiet --deploy-hook "docker compose -f /opt/n8n/docker-compose.yml restart nginx"
RENEWAL

chmod +x /etc/cron.daily/renew-ssl

echo -e "${GREEN}✅ SSL auto-renewal configured${NC}"

echo -e "${BLUE}Step 12: Setting up automatic backups...${NC}"
cat > /usr/local/bin/backup-n8n.sh <<'BACKUP'
#!/bin/bash
BACKUP_DIR="/opt/n8n/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL database
docker exec n8n-postgres pg_dump -U n8n n8n > "$BACKUP_DIR/n8n_db_$DATE.sql"

# Backup n8n data directory
tar -czf "$BACKUP_DIR/n8n_data_$DATE.tar.gz" /opt/n8n/data

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "n8n_*" -mtime +7 -delete

echo "Backup completed: $DATE"
BACKUP

chmod +x /usr/local/bin/backup-n8n.sh

# Schedule daily backups at 2 AM
cat > /etc/cron.d/n8n-backup <<'CRON'
0 2 * * * root /usr/local/bin/backup-n8n.sh >> /var/log/n8n-backup.log 2>&1
CRON

echo -e "${GREEN}✅ Automatic backups configured${NC}"

echo -e "${BLUE}Step 13: Creating monitoring script...${NC}"
cat > /usr/local/bin/monitor-n8n.sh <<'MONITOR'
#!/bin/bash
if ! docker ps | grep -q n8n; then
    echo "n8n is down! Restarting..."
    cd /opt/n8n
    docker compose restart n8n
fi
MONITOR

chmod +x /usr/local/bin/monitor-n8n.sh

# Check every 5 minutes
cat > /etc/cron.d/n8n-monitor <<'MONITORCRON'
*/5 * * * * root /usr/local/bin/monitor-n8n.sh >> /var/log/n8n-monitor.log 2>&1
MONITORCRON

echo -e "${GREEN}✅ Monitoring configured${NC}"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "==========================================="
echo -e "${GREEN}🎉 n8n Setup Complete!${NC}"
echo "==========================================="
echo ""
echo -e "${BLUE}Important Information:${NC}"
echo ""
echo "Server IP: $SERVER_IP"
echo "Domain: $DOMAIN"
echo ""
echo -e "${RED}⚠️  NEXT STEPS REQUIRED:${NC}"
echo ""
echo "1. Add DNS A Record:"
echo "   Name: n8n"
echo "   Type: A"
echo "   Value: $SERVER_IP"
echo "   TTL: 300"
echo ""
echo "2. After DNS propagates (5-10 minutes), access n8n at:"
echo "   https://$DOMAIN"
echo ""
echo "3. First-time setup:"
echo "   - Create admin account"
echo "   - Email: admin@theapexway.net"
echo "   - Password: [choose a strong password]"
echo ""
echo "4. Database credentials (save these!):"
echo "   PostgreSQL Password: $POSTGRES_PASSWORD"
echo "   Encryption Key: $N8N_ENCRYPTION_KEY"
echo ""
echo "5. Useful commands:"
echo "   - View logs: docker compose -f /opt/n8n/docker-compose.yml logs -f n8n"
echo "   - Restart n8n: docker compose -f /opt/n8n/docker-compose.yml restart n8n"
echo "   - Backup now: /usr/local/bin/backup-n8n.sh"
echo ""
echo "Credentials saved to: /opt/n8n/.env"
echo "==========================================="
