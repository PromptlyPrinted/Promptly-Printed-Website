# Complete Hetzner Server Setup Guide

## Step 1: Install Docker on Hetzner Server

SSH into your Hetzner server:

```bash
ssh root@your-server-ip
```

Install Docker and Docker Compose:

```bash
# Update package list
apt update && apt upgrade -y

# Install required packages
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# Add Docker repository
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Update package list again
apt update

# Install Docker
apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## Step 2: Configure Firewall

```bash
# Install UFW if not already installed
apt install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

## Step 3: Create Project Directory

```bash
# Create directory for the application
mkdir -p /opt/promptlyprinted
cd /opt/promptlyprinted
```

## Step 4: Set Up Environment File on Server

### Option A: Create .env.production directly on server

```bash
# Create the environment file
nano /opt/promptlyprinted/.env.production
```

Paste your environment variables (use the template from `.env.production.example`):

```bash
# Database
POSTGRES_PASSWORD=your_secure_password_here

# Better Auth
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=https://api.yourdomain.com

# Database Connection
DATABASE_URL=postgresql://promptly:your_secure_password_here@postgres:5432/promptlyprinted

# ... add all your other environment variables
```

Save and exit (Ctrl+X, then Y, then Enter)

### Option B: Copy from your local machine

```bash
# From your local machine (in the project directory)
scp .env.production root@your-server-ip:/opt/promptlyprinted/.env.production
```

## Step 5: Deploy from Your Local Machine

### Update the deploy script

Edit `deploy.sh` on your local machine:

```bash
nano deploy.sh
```

Change these lines:

```bash
SERVER_USER="root"                    # Your SSH username
SERVER_HOST="your-server-ip"          # Your actual server IP
```

### Run the deployment

```bash
# Make sure you're in the project directory
cd /Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted

# Run the deploy script
./deploy.sh
```

This will:
1. Copy all files to the server
2. Build Docker images
3. Start PostgreSQL and API
4. Run Prisma migrations
5. Show you the status

## Step 6: Verify Deployment

### Check if containers are running

```bash
ssh root@your-server-ip 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml ps'
```

You should see:
- `promptly-db` - running
- `promptly-api` - running

### Check logs

```bash
ssh root@your-server-ip 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml logs -f api'
```

Look for:
- ✅ "Database is ready!"
- ✅ "Migrations complete!"
- ✅ "Starting API server..."

### Test the API

```bash
curl http://your-server-ip:3000/health
```

## Step 7: Set Up Nginx Reverse Proxy (Optional but Recommended)

### Install Nginx

```bash
ssh root@your-server-ip

apt install -y nginx
```

### Create Nginx configuration

```bash
nano /etc/nginx/sites-available/promptly-api
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Change to your domain

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

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Enable the site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/promptly-api /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

## Step 8: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d api.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)

# Certbot will automatically update your Nginx config
```

## Step 9: Set Up Automatic Backups

### Create backup script

```bash
mkdir -p /opt/promptlyprinted/backups
nano /opt/promptlyprinted/backup.sh
```

Paste this:

```bash
#!/bin/bash
BACKUP_DIR="/opt/promptlyprinted/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
docker exec promptly-db pg_dump -U promptly promptlyprinted > "$BACKUP_DIR/db_$DATE.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup completed: db_$DATE.sql"
```

Make it executable:

```bash
chmod +x /opt/promptlyprinted/backup.sh
```

### Set up daily backup cron job

```bash
crontab -e
```

Add this line (runs backup daily at 2 AM):

```
0 2 * * * /opt/promptlyprinted/backup.sh >> /var/log/promptly-backup.log 2>&1
```

## Common Commands

### View logs
```bash
ssh root@your-server-ip 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml logs -f api'
```

### Restart services
```bash
ssh root@your-server-ip 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml restart'
```

### Stop services
```bash
ssh root@your-server-ip 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml down'
```

### Start services
```bash
ssh root@your-server-ip 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml up -d'
```

### Rebuild and restart
```bash
ssh root@your-server-ip 'cd /opt/promptlyprinted && docker-compose -f docker-compose.prod.yml up -d --build'
```

### Check disk usage
```bash
ssh root@your-server-ip 'df -h'
```

### Check Docker stats
```bash
ssh root@your-server-ip 'docker stats'
```

## Troubleshooting

### Can't connect to API
1. Check if containers are running: `docker-compose ps`
2. Check logs: `docker-compose logs api`
3. Check if port 3000 is open: `netstat -tuln | grep 3000`
4. Check firewall: `ufw status`

### Database connection errors
1. Check if PostgreSQL is running: `docker-compose ps postgres`
2. Check PostgreSQL logs: `docker-compose logs postgres`
3. Verify DATABASE_URL in .env.production

### Out of disk space
```bash
# Clean up old Docker images
docker system prune -a

# Check what's using space
du -sh /opt/promptlyprinted/*
```

### Memory issues
```bash
# Check memory usage
free -h

# Add swap if needed (2GB example)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## Security Checklist

- [ ] SSH key authentication set up (disable password auth)
- [ ] Firewall configured (UFW)
- [ ] Strong database password
- [ ] SSL certificate installed
- [ ] .env.production has secure values
- [ ] Regular backups configured
- [ ] Nginx rate limiting configured (optional)
- [ ] Fail2ban installed (optional)

## Next Steps

1. Point your domain's DNS to your server IP
2. Set up monitoring (e.g., Uptime Robot, Better Stack)
3. Configure log rotation
4. Set up alerts for downtime
5. Document your deployment process

## Quick Reference

**Server IP**: `your-server-ip`
**Project Directory**: `/opt/promptlyprinted`
**Nginx Config**: `/etc/nginx/sites-available/promptly-api`
**Logs**: `docker-compose -f docker-compose.prod.yml logs -f`
**Backups**: `/opt/promptlyprinted/backups`
