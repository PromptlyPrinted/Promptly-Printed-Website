# Docker Compose Deployment Guide

## Overview

Deploy the Promptly Printed API to your Hetzner server using Docker Compose.

## Prerequisites

1. **Hetzner Server** with:
   - Docker installed
   - Docker Compose installed
   - SSH access configured
   - At least 4GB RAM

2. **Local Machine** with:
   - SSH access to server
   - rsync installed

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with your actual values:
- Database passwords
- API keys
- OAuth credentials
- Public URLs

### 2. Update Deploy Script

Edit `deploy.sh` and update these variables:

```bash
SERVER_USER="root"              # Your SSH username
SERVER_HOST="your-server-ip"    # Your server IP or domain
```

### 3. Deploy

Run the deployment script:

```bash
./deploy.sh
```

This will:
1. ✅ Copy files to server
2. ✅ Build Docker images
3. ✅ Start PostgreSQL database
4. ✅ Start API service
5. ✅ Run health checks

## Manual Deployment (Alternative)

If you prefer to deploy manually:

### On your server:

```bash
# 1. SSH into server
ssh root@your-server-ip

# 2. Create directory
mkdir -p /opt/promptlyprinted
cd /opt/promptlyprinted

# 3. Clone your repository (or use rsync)
git clone your-repo-url .

# 4. Create .env.production file
nano .env.production
# (paste your environment variables)

# 5. Build and start
docker-compose -f docker-compose.prod.yml up -d --build
```

## Managing Your Deployment

### View logs
```bash
ssh root@your-server 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml logs -f api'
```

### Check status
```bash
ssh root@your-server 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml ps'
```

### Restart services
```bash
ssh root@your-server 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml restart'
```

### Stop services
```bash
ssh root@your-server 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml down'
```

### Update deployment
```bash
./deploy.sh
```

## Nginx Configuration (Optional)

If you want to add a reverse proxy with SSL:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Database Backups

### Create backup
```bash
ssh root@your-server 'docker exec promptly-db pg_dump -U promptly promptlyprinted > /backup/db-$(date +%Y%m%d).sql'
```

### Restore backup
```bash
ssh root@your-server 'cat /backup/db-20250107.sql | docker exec -i promptly-db psql -U promptly promptlyprinted'
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api

# Check if ports are available
sudo netstat -tuln | grep 3000
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Test database connection
docker exec -it promptly-db psql -U promptly -d promptlyprinted
```

### Out of memory
- Check Docker stats: `docker stats`
- Reduce NODE_OPTIONS memory in Dockerfile
- Add swap space to server

## Costs

Deploying on your Hetzner server:
- **Monthly**: Only your existing Hetzner server cost (no additional fees)
- **Vs Fly.io**: Save ~$10-30/month

## Security Checklist

- [ ] Strong database password set
- [ ] .env.production not committed to git
- [ ] SSH key authentication enabled
- [ ] Firewall configured (only 80, 443, 22 open)
- [ ] SSL certificate installed
- [ ] Regular backups configured
- [ ] Monitor logs for suspicious activity

## Next Steps

1. Set up automated backups
2. Configure monitoring (Betterstack)
3. Set up CI/CD with GitHub Actions
4. Add health check monitoring
5. Configure log rotation
