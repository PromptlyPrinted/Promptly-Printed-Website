# Coolify Setup Guide - Step by Step

This guide provides exact steps, links, and settings for deploying to Coolify using pre-built Docker images.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Part 1: GitHub Setup](#part-1-github-setup)
- [Part 2: Build and Push Images](#part-2-build-and-push-images)
- [Part 3: Coolify Project Setup](#part-3-coolify-project-setup)
- [Part 4: Deploy Each Service](#part-4-deploy-each-service)
- [Part 5: Configure Auto-Deploy](#part-5-configure-auto-deploy)
- [Verification](#verification)

---

## Prerequisites

### ✅ Required Accounts & Access
- [ ] GitHub account with repository access
- [ ] Coolify instance URL (your server)
- [ ] Coolify admin credentials
- [ ] Domain names configured (DNS)

### ✅ Required Tools
- [ ] Docker Desktop installed and running
- [ ] Git installed
- [ ] Terminal/Command line access

---

## Part 1: GitHub Setup

### Step 1.1: Create Personal Access Token

1. **Go to GitHub Settings:**
   - URL: https://github.com/settings/tokens
   - Or: GitHub Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Click "Generate new token (classic)"**

3. **Configure token:**
   - Note: `Coolify Docker Registry Access`
   - Expiration: `No expiration` (or your preference)
   - **Select scopes:**
     - ✅ `write:packages` - Upload packages
     - ✅ `read:packages` - Download packages
     - ✅ `delete:packages` - Delete packages (optional)

4. **Generate token** and **COPY IT** (you won't see it again!)

5. **Save token securely:**
   ```bash
   # Save to a file (optional)
   echo "YOUR_TOKEN_HERE" > ~/github-pat.txt

   # Or set as environment variable
   export GITHUB_PAT="YOUR_TOKEN_HERE"
   ```

### Step 1.2: Configure GitHub Repository Secrets

These are already set up in your workflow, but verify them:

1. **Go to Repository Settings:**
   - URL: https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings/secrets/actions

2. **Required Secrets:**
   - `BETTER_AUTH_SECRET` - Your auth secret
   - `BETTER_AUTH_URL` - https://app.yourdomain.com
   - `DATABASE_URL` - Your database connection string
   - `BASEHUB_TOKEN` - Your BaseHub token
   - `SQUARE_ACCESS_TOKEN` - Square payment token
   - ... (see `.env.coolify.example` for full list)

3. **Required Variables:**
   - Go to: https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings/variables/actions
   - Add NEXT_PUBLIC_* variables:
     - `NEXT_PUBLIC_APP_URL`
     - `NEXT_PUBLIC_WEB_URL`
     - `NEXT_PUBLIC_API_URL`

### Step 1.3: Make GitHub Packages Public

1. **Go to your packages:**
   - URL: https://github.com/orgs/PromptlyPrinted/packages
   - Or: https://github.com/PromptlyPrinted?tab=packages

2. **For each package** (web, app, api):
   - Click on the package name
   - Click "⚙️ Package settings" (right sidebar)
   - Scroll to "Danger Zone"
   - Click "Change visibility"
   - Select "Public"
   - Type the repository name to confirm
   - Click "I understand, change package visibility"

**Why make public?**
- Coolify can pull without credentials
- Simpler setup
- No authentication errors

**Keep private?** See [Private Registry Setup](#private-registry-alternative) below.

---

## Part 2: Build and Push Images

### Step 2.1: Build Images Locally

```bash
# Navigate to project root
cd /Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted

# Build all three apps
./build-all.sh

# This will build:
# - ghcr.io/promptlyprinted/promptly-printed-website/web:latest
# - ghcr.io/promptlyprinted/promptly-printed-website/app:latest
# - ghcr.io/promptlyprinted/promptly-printed-website/api:latest
```

**Expected output:**
```
================================
Building Docker Images
================================

Registry: ghcr.io/promptlyprinted/promptly-printed-website
Tag: latest

✓ Found .env file

================================
Building: web
================================
[Building progress...]
✓ Built ghcr.io/promptlyprinted/promptly-printed-website/web:latest
  Build time: 420s
...
```

### Step 2.2: Login to GitHub Container Registry

```bash
# Using saved token
echo $GITHUB_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Or interactive (paste token when prompted)
docker login ghcr.io -u YOUR_GITHUB_USERNAME
```

**Replace:**
- `YOUR_GITHUB_USERNAME` with your actual GitHub username
- `YOUR_TOKEN_HERE` with your personal access token

**Expected output:**
```
Login Succeeded
```

### Step 2.3: Push Images to Registry

```bash
# Push all apps
./push-all.sh

# Or push individually
docker push ghcr.io/promptlyprinted/promptly-printed-website/web:latest
docker push ghcr.io/promptlyprinted/promptly-printed-website/app:latest
docker push ghcr.io/promptlyprinted/promptly-printed-website/api:latest
```

**Verify images were pushed:**
- Go to: https://github.com/orgs/PromptlyPrinted/packages
- You should see three packages: web, app, api

---

## Part 3: Coolify Project Setup

### Step 3.1: Create New Project

1. **Login to Coolify:**
   - URL: `https://your-coolify-instance.com`

2. **Create Project:**
   - Click "Projects" in sidebar
   - Click "+ New Project"
   - **Name:** `Promptly Printed`
   - **Description:** `E-commerce platform with web, admin, and API`
   - Click "Create"

### Step 3.2: Set Up Environment Groups (Optional)

This allows sharing environment variables across services.

1. **In your project:**
   - Click "Environment Variables"
   - Click "+ New Environment Group"
   - **Name:** `Shared Production Variables`

2. **Add shared variables:**
   ```
   DATABASE_URL=postgresql://...
   BETTER_AUTH_SECRET=your-secret
   BASEHUB_TOKEN=your-token
   BASEHUB_ADMIN_TOKEN=your-admin-token
   PULSE_API_KEY=your-key
   NEXT_PUBLIC_POSTHOG_KEY=your-key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

---

## Part 4: Deploy Each Service

You'll create 3 services: Web, App (Admin), and API.

### Service 1: Web Application

#### Step 4.1: Create Service

1. **In Coolify Project:**
   - Click "+ New Resource"
   - Select "Docker Image" ⚠️ **NOT** "Dockerfile"

2. **Configure Service:**
   - **Name:** `Promptly Printed Web`
   - **Image:** `ghcr.io/promptlyprinted/promptly-printed-website/web:latest`
   - **Port Mapping:** `3000`
   - Click "Continue"

#### Step 4.2: Configure Domain

1. **Domain Settings:**
   - **Domain:** `yourdomain.com`
   - **HTTPS:** ✅ Enable
   - **Force HTTPS:** ✅ Enable
   - **Generate SSL:** ✅ Let's Encrypt
   - Click "Save"

#### Step 4.3: Add Environment Variables

Click "Environment Variables" tab and add:

**Required Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
PULSE_API_KEY=your-pulse-key

# Authentication
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=https://app.yourdomain.com

# CMS
BASEHUB_TOKEN=your-basehub-token
BASEHUB_ADMIN_TOKEN=your-basehub-admin-token

# Payments - Square
SQUARE_ACCESS_TOKEN=your-square-token
SQUARE_LOCATION_ID=your-location-id
SQUARE_ENVIRONMENT=production
SQUARE_WEBHOOK_SIGNATURE_KEY=your-webhook-key

# Print API - Prodigi
PRODIGI_API_KEY=your-prodigi-key
PRODIGI_API=https://api.prodigi.com/v4.0

# Email - Resend
RESEND_TOKEN=your-resend-token
RESEND_FROM=noreply@yourdomain.com
RESEND_AUDIENCE_ID=your-audience-id

# AI Services
GOOGLE_GEMINI_API_KEY=your-gemini-key
TOGETHER_API_KEY=your-together-key

# Feature Flags
FLAGS_SECRET=your-flags-secret

# Webhooks
SVIX_TOKEN=your-svix-token

# Collaboration
LIVEBLOCKS_SECRET=your-liveblocks-secret

# Monitoring
BETTERSTACK_API_KEY=your-betterstack-key
BETTERSTACK_URL=https://uptime.betterstack.com

# Security
ARCJET_KEY=your-arcjet-key

# Analytics (Public)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Public URLs (Important - must match domains)
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_WEB_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_DOCS_URL=https://docs.yourdomain.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://app.yourdomain.com

# Runtime
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

#### Step 4.4: Advanced Settings (Optional)

1. **Resource Limits:**
   - Memory Limit: `1024Mi` (1GB)
   - Memory Reservation: `512Mi` (512MB)
   - CPU Limit: `1.0` (1 CPU)

2. **Health Check:**
   - Enabled: ✅
   - Path: `/api/health`
   - Port: `3000`
   - Interval: `30s`

3. **Restart Policy:**
   - Policy: `always`

#### Step 4.5: Deploy

1. Click "Deploy" button
2. Monitor logs in real-time
3. Wait for "Deployment Successful" message

**Expected logs:**
```
Pulling image ghcr.io/promptlyprinted/promptly-printed-website/web:latest
Image pulled successfully
Starting container...
Container started
Health check passed
Deployment successful
```

---

### Service 2: App (Admin Dashboard)

Repeat the same process:

1. **Create Service:**
   - Name: `Promptly Printed App`
   - Image: `ghcr.io/promptlyprinted/promptly-printed-website/app:latest`
   - Port: `3000`

2. **Domain:**
   - Domain: `app.yourdomain.com`
   - HTTPS: ✅ Enabled

3. **Environment Variables:**
   - Same as Web (copy from above)

4. **Deploy**

---

### Service 3: API

Repeat the same process:

1. **Create Service:**
   - Name: `Promptly Printed API`
   - Image: `ghcr.io/promptlyprinted/promptly-printed-website/api:latest`
   - Port: `3000`

2. **Domain:**
   - Domain: `api.yourdomain.com`
   - HTTPS: ✅ Enabled

3. **Environment Variables:**
   - Same as Web (copy from above)

4. **Deploy**

---

## Part 5: Configure Auto-Deploy

### Option A: GitHub Webhook (Recommended)

This triggers Coolify to redeploy when new images are pushed to GHCR.

#### Step 5.1: Get Webhook URLs from Coolify

For each service (web, app, api):

1. **In Coolify:**
   - Go to service
   - Click "Webhooks" tab
   - Click "Enable Webhook"
   - **Copy the webhook URL** (looks like: `https://coolify.yourdomain.com/api/v1/deploy?uuid=xxx&token=xxx`)

You'll have 3 webhook URLs:
- Web webhook: `https://coolify.yourdomain.com/api/v1/deploy?uuid=web-uuid&token=web-token`
- App webhook: `https://coolify.yourdomain.com/api/v1/deploy?uuid=app-uuid&token=app-token`
- API webhook: `https://coolify.yourdomain.com/api/v1/deploy?uuid=api-uuid&token=api-token`

#### Step 5.2: Create GitHub Webhook

1. **Go to Repository Settings:**
   - URL: https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings/hooks

2. **Click "Add webhook"**

3. **Configure webhook for Web:**
   - **Payload URL:** Paste Coolify webhook URL for web
   - **Content type:** `application/json`
   - **Secret:** Leave empty
   - **Which events:**
     - Select "Let me select individual events"
     - ✅ Check "Package"
     - ✅ Check "Workflow runs" (optional)
   - **Active:** ✅ Checked
   - Click "Add webhook"

4. **Repeat for App and API:**
   - Create 2 more webhooks with their respective URLs

#### Step 5.3: Test Auto-Deploy

1. **Make a small change and push:**
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```

2. **Watch GitHub Actions:**
   - URL: https://github.com/PromptlyPrinted/Promptly-Printed-Website/actions
   - Wait for build to complete (~10-15 minutes)

3. **Check Coolify:**
   - Services should automatically redeploy when images are pushed
   - Check logs for deployment activity

### Option B: Manual Deploy

If you prefer manual control:

1. **After pushing new images:**
   ```bash
   ./build-all.sh
   ./push-all.sh
   ```

2. **In Coolify:**
   - Go to each service
   - Click "Redeploy" button
   - Wait for deployment to complete

---

## Verification

### Step 1: Check Service Status

1. **In Coolify Dashboard:**
   - All services should show "Running" status
   - Green indicators

2. **Check logs:**
   - Click each service
   - View "Logs" tab
   - Look for successful startup messages

### Step 2: Test Websites

1. **Web (Public Site):**
   - URL: https://yourdomain.com
   - Should load homepage
   - Test navigation

2. **App (Admin):**
   - URL: https://app.yourdomain.com
   - Should load sign-in page
   - Test authentication

3. **API:**
   - URL: https://api.yourdomain.com/api/health
   - Should return health check response

### Step 3: Test Functionality

- [ ] Authentication works
- [ ] Database connections successful
- [ ] Can create/view orders (web)
- [ ] Admin dashboard accessible (app)
- [ ] API endpoints responding

### Step 4: Monitor Performance

1. **In Coolify:**
   - Check CPU usage (should be < 50%)
   - Check memory usage (should be < 80%)
   - Check response times

2. **External Monitoring:**
   - BetterStack: https://uptime.betterstack.com
   - PostHog: https://app.posthog.com

---

## Private Registry Alternative

If you want to keep packages private:

### Step 1: Configure Registry in Coolify

1. **In Coolify:**
   - Go to "Settings" → "Registries"
   - Click "+ Add Registry"

2. **Configure:**
   - **Name:** `GitHub Container Registry`
   - **URL:** `ghcr.io`
   - **Username:** Your GitHub username
   - **Password:** Your GitHub PAT (from Part 1.1)
   - Click "Save"

### Step 2: Update Services

For each service:
1. Go to service settings
2. Under "Registry"
3. Select "GitHub Container Registry"
4. Redeploy

---

## Troubleshooting Links

### Coolify Issues
- **Official Docs:** https://coolify.io/docs
- **Discord Community:** https://discord.gg/coolify
- **GitHub Issues:** https://github.com/coollabsio/coolify/issues

### Docker Issues
- **GHCR Authentication:** https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- **Docker Build:** https://docs.docker.com/engine/reference/commandline/build/

### Application Issues
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Environment Variables:** Check `.env.coolify.example`

---

## Quick Reference Commands

```bash
# Build and push
./build-all.sh && ./push-all.sh

# Check Docker images
docker images | grep promptly-printed

# View running containers
docker ps

# Check container logs
docker logs <container-id>

# Login to GHCR
echo $GITHUB_PAT | docker login ghcr.io -u USERNAME --password-stdin

# Test image locally
docker run -p 3000:3000 ghcr.io/promptlyprinted/promptly-printed-website/web:latest
```

---

## Useful URLs

### GitHub
- **Repository:** https://github.com/PromptlyPrinted/Promptly-Printed-Website
- **Actions:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/actions
- **Packages:** https://github.com/orgs/PromptlyPrinted/packages
- **Settings:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings
- **Webhooks:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings/hooks
- **Secrets:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings/secrets/actions
- **PAT Tokens:** https://github.com/settings/tokens

### Coolify
- **Dashboard:** `https://your-coolify-instance.com`
- **Docs:** https://coolify.io/docs
- **Community:** https://discord.gg/coolify

### Services (After Deployment)
- **Web:** https://yourdomain.com
- **App:** https://app.yourdomain.com
- **API:** https://api.yourdomain.com

---

## Checklist

### Initial Setup
- [ ] GitHub PAT created
- [ ] Logged into GHCR
- [ ] Images built locally
- [ ] Images pushed to GHCR
- [ ] Packages made public on GitHub
- [ ] Coolify project created
- [ ] Domains configured (DNS)

### Service Deployment (x3)
- [ ] Service created in Coolify
- [ ] Docker image configured
- [ ] Domain set up
- [ ] SSL enabled
- [ ] Environment variables added
- [ ] Service deployed
- [ ] Health check passing

### Auto-Deploy
- [ ] Webhooks enabled in Coolify
- [ ] Webhooks added to GitHub
- [ ] Test deployment successful

### Verification
- [ ] All services running
- [ ] Websites accessible
- [ ] Authentication working
- [ ] Monitoring configured

---

## Success! 🎉

Your Promptly Printed website should now be fully deployed on Coolify!

**Next steps:**
- Monitor performance in Coolify dashboard
- Set up automated backups
- Configure monitoring alerts
- Test all functionality thoroughly

**Need help?** Check the troubleshooting section or reach out to Coolify community.
