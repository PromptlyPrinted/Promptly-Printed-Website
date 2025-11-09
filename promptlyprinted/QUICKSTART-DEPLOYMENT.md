# Quick Start: Deploy with Pre-built Docker Images

This is a quick guide to get you up and running with pre-built Docker images in Coolify.

## Step 1: Build Images Locally

```bash
# Make sure you're in the project root
cd /Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted

# Build all three apps (web, app, api)
./build-all.sh

# Or build just one app
./build-single.sh web    # Build web app
./build-single.sh app    # Build admin app
./build-single.sh api    # Build API
```

**Note:** Builds take 5-15 minutes per app depending on your machine.

## Step 2: Push to GitHub Container Registry

### First-time setup:

1. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `write:packages` and `read:packages`
   - Generate and copy the token

2. Login to GHCR:
```bash
# Replace YOUR_USERNAME with your GitHub username
# When prompted, paste your token
echo YOUR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### Push images:

```bash
# Push all apps
./push-all.sh

# Or push specific app
docker push ghcr.io/promptlyprinted/promptly-printed-website/web:latest
```

## Step 3: Make Packages Public (Easiest Option)

1. Go to https://github.com/PromptlyPrinted?tab=packages
2. Click on each package (web, app, api)
3. Go to "Package settings"
4. Scroll to "Danger Zone"
5. Click "Change visibility" → "Public"

This allows Coolify to pull without authentication.

## Step 4: Configure Coolify

### For each app (web, app, api):

1. **In Coolify Dashboard:**
   - Click "Add New Resource"
   - Select "Docker Image" (NOT Dockerfile)

2. **Configure Service:**
   ```
   Image: ghcr.io/promptlyprinted/promptly-printed-website/web:latest
   Port Mapping: 3000:3000
   ```

3. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all required variables (see list below)

4. **Set Domain:**
   - Add your domain (e.g., `app.yourdomain.com`)
   - Enable SSL

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

### Required Environment Variables

**For all apps:**
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=https://app.yourdomain.com
BASEHUB_TOKEN=your-token
BASEHUB_ADMIN_TOKEN=your-admin-token
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_WEB_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Additional for web app:**
```
PRODIGI_API_KEY=your-key
PRODIGI_API=https://api.prodigi.com/v4.0
SQUARE_ACCESS_TOKEN=your-token
SQUARE_LOCATION_ID=your-location
SQUARE_ENVIRONMENT=production
```

## Step 5: Auto-Deploy on Git Push

Your repository already has GitHub Actions configured. To enable auto-deployment:

### Option 1: Using Webhooks

1. **In Coolify:**
   - Go to each service
   - Click "Webhooks"
   - Enable webhook
   - Copy the webhook URL

2. **In GitHub:**
   - Go to repository Settings → Webhooks
   - Add webhook
   - Paste Coolify webhook URL
   - Select "Package" events
   - Save

Now whenever you push to `main`, GitHub Actions will:
1. Build new images
2. Push to GHCR
3. Trigger Coolify to deploy

### Option 2: Manual Redeploy

After GitHub Actions builds new images:

1. Go to Coolify
2. Click on your service
3. Click "Redeploy"
4. Coolify pulls the latest image and redeploys

## Common Commands

### Build & Deploy Workflow

```bash
# 1. Build locally
./build-all.sh

# 2. Test locally (optional)
docker run -p 3000:3000 ghcr.io/promptlyprinted/promptly-printed-website/web:latest

# 3. Push to registry
./push-all.sh

# 4. Go to Coolify and click "Redeploy"
```

### Using Version Tags

```bash
# Build with version tag
./build-all.sh v1.0.0

# Push versioned images
./push-all.sh v1.0.0

# In Coolify, use:
# ghcr.io/promptlyprinted/promptly-printed-website/web:v1.0.0
```

### View Built Images

```bash
# List local images
docker images | grep promptly-printed

# List remote images
# Go to: https://github.com/PromptlyPrinted?tab=packages
```

## Troubleshooting

### "Permission denied" when running scripts
```bash
chmod +x build-all.sh push-all.sh build-single.sh
```

### "Cannot connect to Docker daemon"
```bash
# Make sure Docker Desktop is running
open -a Docker
```

### Build fails with "out of memory"
```bash
# Increase Docker Desktop memory
# Docker Desktop → Settings → Resources → Memory → 6GB+
```

### Coolify can't pull image
- Make sure package is public on GitHub
- Or configure private registry in Coolify with your GitHub credentials

### App crashes on startup
- Check Coolify logs
- Verify all environment variables are set
- Make sure DATABASE_URL is accessible from Coolify

## Next Steps

1. ✅ Build images locally: `./build-all.sh`
2. ✅ Push to GHCR: `./push-all.sh`
3. ✅ Make packages public on GitHub
4. ✅ Configure three Coolify services (web, app, api)
5. ✅ Set environment variables in Coolify
6. ✅ Set up domains and SSL
7. ✅ Deploy and test
8. ✅ Configure webhooks for auto-deploy

## Need More Help?

See the full deployment guide: `docs/DEPLOYMENT.md`

## Quick Reference

**Image Names:**
```
ghcr.io/promptlyprinted/promptly-printed-website/web:latest
ghcr.io/promptlyprinted/promptly-printed-website/app:latest
ghcr.io/promptlyprinted/promptly-printed-website/api:latest
```

**GitHub Packages:**
- https://github.com/PromptlyPrinted?tab=packages

**GitHub Actions:**
- https://github.com/PromptlyPrinted/Promptly-Printed-Website/actions

**Coolify:**
- Your Coolify instance URL
