# Coolify Deployment Guide - Promptly Printed

Complete step-by-step guide to deploy your monorepo on Hetzner using Coolify.

---

## Prerequisites Checklist

- [ ] Hetzner Cloud account created
- [ ] Domain name purchased (e.g., promptlyprinted.com)
- [ ] GitHub account with access to your repository
- [ ] All API keys ready (Stripe, Resend, etc.)

---

## Phase 1: Hetzner Server Setup

### Step 1.1: Create Hetzner Server

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Click **New Project** → Name it "Promptly Printed Production"
3. Click **Add Server**
4. Configure:
   - **Location**: Choose closest to your users (e.g., Nuremberg, Helsinki, or Ashburn)
   - **Image**: Ubuntu 22.04 or Ubuntu 24.04
   - **Type**:
     - Recommended: **CPX31** (4 vCPU, 8GB RAM) - €15/month
     - Alternative: **CCX23** (4 vCPU, 16GB RAM) - €20/month (better for monorepo builds)
   - **Volume**: None needed (default disk is fine)
   - **Network**: Default
   - **SSH Keys**: Add your public SSH key
     - If you don't have one: `ssh-keygen -t ed25519 -C "your_email@example.com"`
     - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - **Backups**: Optional (adds 20% to cost, recommended for production)
   - **Name**: promptly-printed-prod

5. Click **Create & Buy Now**
6. **IMPORTANT**: Copy your server's IP address (e.g., 123.45.67.89)

### Step 1.2: Configure DNS Records

1. Go to your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)
2. Add the following A records:

```
Type    Name    Value               TTL
A       @       123.45.67.89        300
A       www     123.45.67.89        300
A       app     123.45.67.89        300
A       api     123.45.67.89        300
```

3. Wait 5-10 minutes for DNS propagation
4. Test: `ping yourdomain.com` (should show your Hetzner IP)

### Step 1.3: Initial Server Access

```bash
# SSH into your server
ssh root@123.45.67.89

# Update system packages
apt update && apt upgrade -y

# Optional: Set timezone
timedatectl set-timezone America/New_York  # or your timezone
```

---

## Phase 2: Install Coolify

### Step 2.1: Run Coolify Installation

```bash
# Install Coolify (takes ~5 minutes)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Wait for installation to complete. You'll see:
```
✅ Coolify installed successfully!
🎉 Visit http://123.45.67.89:8000
```

### Step 2.2: Initial Coolify Setup

1. Open browser: `http://your-server-ip:8000`
2. Create admin account:
   - **Email**: your-email@example.com
   - **Password**: Create strong password (save in password manager!)
   - **Name**: Your Name
3. Click **Register**
4. You'll be redirected to the Coolify dashboard

### Step 2.3: Configure Coolify Settings (Optional)

1. Go to **Settings** → **Configuration**
2. Update:
   - **Instance Domain**: Leave as IP or add `coolify.yourdomain.com` (requires DNS setup)
   - **Auto-update**: Enable (recommended)
3. Save changes

---

## Phase 3: Setup Database

### Step 3.1: Create PostgreSQL Database

1. In Coolify dashboard, click **+ New Resource**
2. Select **Database** → **PostgreSQL**
3. Configure:
   - **Name**: promptly-printed-db
   - **Description**: Production database for Promptly Printed
   - **PostgreSQL Version**: 16 (latest stable)
   - **Database Name**: promptlyprinted
   - **Database User**: promptly_user
   - **Database Password**: (auto-generated) - **COPY THIS!**
   - **Port**: 5432 (default)
4. Click **Continue** → **Save**
5. Click **Deploy**

### Step 3.2: Wait for Database Deployment

- Status will change from "Deploying" → "Healthy" (takes ~2 minutes)
- Once healthy, click on the database to view details

### Step 3.3: Copy Database Connection String

1. Click on your database in Coolify
2. Find **Connection String** (looks like):
   ```
   postgresql://promptly_user:generated_password@postgres-promptly-printed-db:5432/promptlyprinted
   ```
3. **IMPORTANT**: Copy this - you'll need it for environment variables

**Note**: For internal Coolify network connections, use the format above. For external connections (like from your local machine), you'd use:
```
postgresql://promptly_user:password@your-server-ip:5432/promptlyprinted
```

---

## Phase 4: Connect GitHub

### Step 4.1: Add GitHub Source

1. In Coolify dashboard, go to **Sources**
2. Click **+ Add New Source**
3. Select **GitHub**
4. Choose **GitHub App** (recommended)

### Step 4.2: Install GitHub App

1. Click **Install GitHub App**
2. You'll be redirected to GitHub
3. Choose where to install:
   - **Only select repositories**: Choose `promptlyprinted` repository
   - Or: **All repositories** (if you want to deploy other projects later)
4. Click **Install**
5. You'll be redirected back to Coolify
6. Confirmation message: "GitHub source added successfully"

---

## Phase 5: Deploy Main Website (apps/web)

### Step 5.1: Create Application

1. In Coolify dashboard, click **+ New Resource**
2. Select **Application**
3. Choose **Public Repository** or select your GitHub source
4. Configure:
   - **Repository**: promptlyprinted (or your repo name)
   - **Branch**: `main` (or `SalesFunnel` if you want to deploy that branch)
   - **Build Pack**: Nixpacks (auto-selected)
   - **Name**: promptly-printed-web
   - **Description**: Main website

5. Click **Continue**

### Step 5.2: Configure Build Settings

In the application settings:

**General Tab:**
- **Port**: 3000 (Next.js default)
- **Base Directory**: Leave empty (monorepo root)

**Build Tab:**
```bash
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm --filter=web build
Start Command: cd apps/web && pnpm start
```

Alternative (simpler):
```bash
Build Command: pnpm install && cd apps/web && pnpm build
Start Command: cd apps/web && pnpm start
```

**Health Check:**
- **Path**: `/` (homepage)
- **Interval**: 30 seconds

### Step 5.3: Add Environment Variables

Go to **Environment Variables** tab and add:

#### Required Variables (from your .env.example)

```bash
# Node Environment
NODE_ENV=production

# Database
DATABASE_URL=postgresql://promptly_user:password@postgres-promptly-printed-db:5432/promptlyprinted

# Auth (Better Auth)
BETTER_AUTH_SECRET=generate-random-secret-64-chars
BETTER_AUTH_URL=https://yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Resend)
RESEND_FROM=noreply@yourdomain.com
RESEND_TOKEN=re_your_token_here

# Google Gemini
GOOGLE_GEMINI_API_KEY=your_gemini_key

# Feature Flags
FLAGS_SECRET=your_flags_secret

# Arcjet (Rate Limiting)
ARCJET_KEY=your_arcjet_key

# Observability (Optional)
BETTERSTACK_API_KEY=your_betterstack_key
BETTERSTACK_URL=your_betterstack_url
SENTRY_AUTH_TOKEN=your_sentry_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project

# Public URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_WEB_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_DOCS_URL=https://docs.yourdomain.com
NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL=https://yourdomain.com

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# CMS
BASEHUB_TOKEN=your_basehub_token

# Webhooks
SVIX_TOKEN=your_svix_token
```

**Generate Secrets:**
```bash
# On your local machine or server:
openssl rand -base64 64  # for BETTER_AUTH_SECRET
openssl rand -base64 32  # for FLAGS_SECRET
```

### Step 5.4: Configure Domain

1. Go to **Domains** tab
2. Click **+ Add Domain**
3. Enter: `yourdomain.com` (or `promptlyprinted.com`)
4. Click **Add**
5. Coolify will automatically:
   - Configure reverse proxy
   - Request SSL certificate from Let's Encrypt
   - Set up HTTPS redirect

Wait ~1 minute for SSL certificate to be issued.

### Step 5.5: Deploy!

1. Click **Deploy** button (top right)
2. Watch the deployment logs
3. First build will take ~5-10 minutes (installing dependencies, building)
4. Status will change: Deploying → Running → Healthy

### Step 5.6: Run Database Migrations

Once deployed successfully:

1. Go to your application in Coolify
2. Click **Terminal** tab (or **Execute Command**)
3. Run:
   ```bash
   cd packages/database && npx prisma migrate deploy
   ```

4. Alternative: Run migrations from your local machine:
   ```bash
   # Update DATABASE_URL to use server IP
   DATABASE_URL="postgresql://user:pass@your-server-ip:5432/db" npx prisma migrate deploy
   ```

---

## Phase 6: Deploy Additional Apps (Optional)

If you want to deploy `apps/app` or `apps/api` separately:

### Step 6.1: Deploy Dashboard (apps/app)

Repeat Phase 5 with these changes:

**Application Settings:**
- **Name**: promptly-printed-app
- **Build Command**: `pnpm install && cd apps/app && pnpm build`
- **Start Command**: `cd apps/app && pnpm start`
- **Port**: 3000
- **Domain**: `app.yourdomain.com`

**Environment Variables**: Same as main website + update:
```bash
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_WEB_URL=https://yourdomain.com
```

### Step 6.2: Deploy API (apps/api)

**Application Settings:**
- **Name**: promptly-printed-api
- **Build Command**: `pnpm install && cd apps/api && pnpm build`
- **Start Command**: `cd apps/api && pnpm start`
- **Port**: 3000 (or whatever your API uses)
- **Domain**: `api.yourdomain.com`

**Environment Variables**: Same database connection + API-specific vars

---

## Phase 7: Post-Deployment Configuration

### Step 7.1: Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add Endpoint**
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events to send:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - (Add others as needed)
5. Copy **Webhook Secret** (starts with `whsec_`)
6. Update `STRIPE_WEBHOOK_SECRET` in Coolify environment variables
7. Redeploy application

### Step 7.2: Test Your Deployment

1. Visit `https://yourdomain.com`
2. Check:
   - [ ] Site loads correctly
   - [ ] SSL certificate is valid (🔒 in browser)
   - [ ] Images load
   - [ ] Database connections work
   - [ ] Authentication works
   - [ ] Stripe checkout works (test mode first!)

### Step 7.3: Enable Auto-Deploy (Optional)

1. In your application settings in Coolify
2. Go to **General** tab
3. Find **Auto Deploy**
4. Toggle ON
5. Now every `git push` to your branch will trigger automatic deployment

### Step 7.4: Set Up Monitoring (Optional)

**Built-in Coolify Monitoring:**
- View logs: Application → **Logs** tab
- View metrics: Application → **Metrics** tab (CPU, memory, disk)

**External Monitoring (if you added BetterStack/Sentry):**
- Configure uptime monitoring in BetterStack
- Check Sentry for error tracking

---

## Phase 8: Backup Strategy

### Step 8.1: Enable Hetzner Backups

1. Go to Hetzner Cloud Console
2. Select your server
3. Enable **Backups** (+20% cost)
4. Backups run automatically daily

### Step 8.2: Database Backups in Coolify

1. Go to your database in Coolify
2. Click **Backups** tab
3. Configure:
   - **Frequency**: Daily
   - **Retention**: 7 days (or more)
   - **Time**: 2:00 AM (low traffic time)
4. Enable backups

### Step 8.3: Manual Database Backup

```bash
# SSH into server
ssh root@your-server-ip

# Find database container
docker ps | grep postgres

# Backup database
docker exec postgres-container-name pg_dump -U promptly_user promptlyprinted > backup_$(date +%Y%m%d).sql

# Download to local machine
scp root@your-server-ip:/root/backup_*.sql ./
```

---

## Troubleshooting Guide

### Build Fails

**Issue**: `pnpm not found`
**Solution**:
```bash
# Update install command to:
npm install -g pnpm && pnpm install --frozen-lockfile
```

**Issue**: Workspace dependencies not found
**Solution**: Install from monorepo root first
```bash
# Build command:
pnpm install && pnpm build
```

**Issue**: Out of memory during build
**Solution**: Upgrade Hetzner server to more RAM (CPX31 → CCX23)

### Application Won't Start

**Issue**: Port already in use
**Solution**: Check if another app is using port 3000, change port in settings

**Issue**: Environment variables missing
**Solution**: Double-check all required vars are set, especially DATABASE_URL

### Database Connection Issues

**Issue**: Can't connect to database
**Solution**:
- Verify DATABASE_URL format
- Use internal network name: `postgres-promptly-printed-db` not `localhost`
- Check database is running: Coolify → Database → Status should be "Healthy"

### SSL Certificate Issues

**Issue**: SSL certificate not issued
**Solution**:
- Verify DNS points to server IP: `dig yourdomain.com`
- Wait 5-10 minutes for DNS propagation
- Check domain is correctly added in Coolify
- Ensure port 80 and 443 are open (Coolify handles this)

### Auto-Deploy Not Working

**Issue**: Pushing to GitHub doesn't trigger deployment
**Solution**:
- Check webhook in GitHub: Settings → Webhooks (should see Coolify webhook)
- Verify auto-deploy is enabled in Coolify
- Check webhook delivery in GitHub (Recent Deliveries tab)

---

## Maintenance Tasks

### Weekly
- [ ] Check application logs for errors
- [ ] Monitor resource usage (CPU, memory, disk)
- [ ] Review database size

### Monthly
- [ ] Review and update dependencies: `pnpm bump-deps`
- [ ] Check for Coolify updates (auto-updates if enabled)
- [ ] Review backup retention policy
- [ ] Check SSL certificate expiry (auto-renewed, but verify)

### As Needed
- [ ] Update environment variables when API keys rotate
- [ ] Scale server resources if needed
- [ ] Add additional servers if traffic increases

---

## Scaling Options

### When to Scale?

**Vertical Scaling** (upgrade server):
- CPU consistently >80%
- Memory consistently >80%
- Build times too slow

**Horizontal Scaling** (add servers):
- Traffic consistently high
- Want redundancy/high availability
- Multiple regions needed

### How to Scale in Coolify

**Option 1: Upgrade Hetzner Server**
1. Create snapshot of current server in Hetzner
2. Resize server to bigger plan
3. Restart services

**Option 2: Add Load Balancer**
1. Create multiple servers in Hetzner
2. Add them to Coolify as new destinations
3. Deploy same app to multiple servers
4. Use Coolify's built-in load balancing

**Option 3: Separate Services**
- Database on dedicated server
- Multiple app instances
- CDN for static assets (Cloudflare, BunnyCDN)

---

## Cost Breakdown

### Monthly Costs

**Hetzner Server (CPX31)**: €15/month
- 4 vCPU
- 8GB RAM
- 160GB SSD

**Hetzner Backups (Optional)**: +€3/month (20%)

**Total Infrastructure**: ~€18/month

**Additional Services** (varies):
- Domain name: ~€10-15/year
- Stripe: Transaction fees only
- Resend: Free tier available
- Other APIs: Depends on usage

**Coolify**: FREE ✅

### Compare to Alternatives

**Vercel/Netlify Pro**: $20/user/month + usage fees
**Heroku**: ~$25-50/month for similar resources
**AWS/GCP**: $30-100/month (more complex)

**Coolify on Hetzner**: €18/month all-in 🎉

---

## Quick Reference Commands

### SSH into Server
```bash
ssh root@your-server-ip
```

### View Coolify Logs
```bash
docker logs -f coolify
```

### Restart Coolify
```bash
docker restart coolify
```

### View All Containers
```bash
docker ps -a
```

### Database Backup
```bash
docker exec postgres-container pg_dump -U user dbname > backup.sql
```

### Check Disk Space
```bash
df -h
```

### Check Memory Usage
```bash
free -h
```

### Update Coolify Manually
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

---

## Support Resources

- **Coolify Docs**: https://coolify.io/docs
- **Coolify Discord**: https://discord.gg/coolify
- **Hetzner Support**: https://console.hetzner.cloud/support
- **Next.js Docs**: https://nextjs.org/docs

---

## Checklist Summary

- [ ] Hetzner server created and accessible
- [ ] DNS records configured
- [ ] Coolify installed and accessible
- [ ] PostgreSQL database deployed
- [ ] GitHub connected to Coolify
- [ ] Main website deployed
- [ ] Environment variables configured
- [ ] Domain added with SSL
- [ ] Database migrations run
- [ ] Stripe webhooks configured
- [ ] Application tested and working
- [ ] Backups enabled
- [ ] Monitoring configured

**Congratulations! Your app is now live! 🚀**
