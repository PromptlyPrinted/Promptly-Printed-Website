# Deployment Guide - Pre-built Docker Images

This guide explains how to build Docker images locally and configure Coolify to use pre-built images from GitHub Container Registry (GHCR).

## Overview

Your project uses a multi-stage Dockerfile that builds three separate applications:
- `web` - Public-facing website
- `app` - Admin dashboard
- `api` - Backend API

## Prerequisites

1. **Docker** installed on your local machine
2. **GitHub Personal Access Token** (PAT) with `read:packages` permission
3. **Coolify** instance set up and running

---

## Part 1: Building Images Locally

### Option A: Build All Images at Once

Create a script to build all three applications:

```bash
#!/bin/bash
# build-all.sh

set -e

REGISTRY="ghcr.io"
REPO_OWNER="promptlyprinted"  # Change to your GitHub username/org
IMAGE_PREFIX="$REGISTRY/$REPO_OWNER/promptly-printed-website"
TAG="${1:-latest}"

# Apps to build
APPS=("web" "app" "api")

echo "Building images with tag: $TAG"
echo "Registry: $IMAGE_PREFIX"
echo ""

for APP in "${APPS[@]}"; do
  echo "================================"
  echo "Building $APP..."
  echo "================================"

  docker build \
    --build-arg APP_NAME=$APP \
    --tag "$IMAGE_PREFIX/$APP:$TAG" \
    --tag "$IMAGE_PREFIX/$APP:latest" \
    --file ./Dockerfile \
    .

  echo "✓ Built $IMAGE_PREFIX/$APP:$TAG"
  echo ""
done

echo "All images built successfully!"
echo ""
echo "To push to registry, run:"
echo "  docker push $IMAGE_PREFIX/web:$TAG"
echo "  docker push $IMAGE_PREFIX/app:$TAG"
echo "  docker push $IMAGE_PREFIX/api:$TAG"
```

Make it executable:
```bash
chmod +x build-all.sh
```

### Option B: Build Single Image

Build a specific app:

```bash
# Build web app
docker build \
  --build-arg APP_NAME=web \
  --tag ghcr.io/promptlyprinted/promptly-printed-website/web:latest \
  --file ./Dockerfile \
  .

# Build admin app
docker build \
  --build-arg APP_NAME=app \
  --tag ghcr.io/promptlyprinted/promptly-printed-website/app:latest \
  --file ./Dockerfile \
  .

# Build API
docker build \
  --build-arg APP_NAME=api \
  --tag ghcr.io/promptlyprinted/promptly-printed-website/api:latest \
  --file ./Dockerfile \
  .
```

### Test Image Locally

Run the image to verify it works:

```bash
# Test the web app
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e BETTER_AUTH_SECRET="your-secret" \
  ghcr.io/promptlyprinted/promptly-printed-website/web:latest

# Access at http://localhost:3000
```

---

## Part 2: Push Images to GitHub Container Registry

### 1. Authenticate with GHCR

```bash
# Create a Personal Access Token at https://github.com/settings/tokens
# with 'write:packages' and 'read:packages' permissions

echo $GITHUB_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 2. Push Images

```bash
# Push all images
docker push ghcr.io/promptlyprinted/promptly-printed-website/web:latest
docker push ghcr.io/promptlyprinted/promptly-printed-website/app:latest
docker push ghcr.io/promptlyprinted/promptly-printed-website/api:latest
```

Or use the script:
```bash
# Create push-all.sh
#!/bin/bash

set -e

REGISTRY="ghcr.io"
REPO_OWNER="promptlyprinted"
IMAGE_PREFIX="$REGISTRY/$REPO_OWNER/promptly-printed-website"
TAG="${1:-latest}"

APPS=("web" "app" "api")

for APP in "${APPS[@]}"; do
  echo "Pushing $APP..."
  docker push "$IMAGE_PREFIX/$APP:$TAG"
  echo "✓ Pushed $IMAGE_PREFIX/$APP:$TAG"
done

echo "All images pushed successfully!"
```

---

## Part 3: Automatic Builds with GitHub Actions

Your repository already has `.github/workflows/docker-build-push.yml` which automatically:

1. **Triggers on:**
   - Push to `main` branch
   - New version tags (e.g., `v1.0.0`)
   - Manual workflow dispatch

2. **Builds and pushes:**
   - All three apps (web, app, api)
   - Tagged with multiple tags:
     - Branch name (e.g., `main`)
     - Git SHA (e.g., `main-abc1234`)
     - Semantic version (e.g., `1.0.0`, `1.0`, `1`)
     - `latest` for main branch

### To trigger a build:

**Option 1: Push to main**
```bash
git add .
git commit -m "Update deployment"
git push origin main
```

**Option 2: Create a version tag**
```bash
git tag v1.0.0
git push origin v1.0.0
```

**Option 3: Manual trigger**
- Go to GitHub → Actions → "Build and Push Docker Images"
- Click "Run workflow"
- Choose branch and custom tag (optional)

---

## Part 4: Configure Coolify to Use Pre-built Images

### Step 1: Make GHCR Package Public (Recommended)

1. Go to your GitHub profile → Packages
2. Find `promptly-printed-website/web`, `/app`, and `/api`
3. For each package:
   - Click on the package
   - Go to "Package settings"
   - Scroll to "Danger Zone"
   - Click "Change visibility" → "Public"

This allows Coolify to pull without authentication.

### Step 2: Configure Coolify Service

For each application (web, app, api):

1. **Go to Coolify** → Your Project → Create New Resource
2. Select **"Docker Image"** (not Dockerfile)
3. Configure as follows:

**Web App:**
```yaml
Image: ghcr.io/promptlyprinted/promptly-printed-website/web:latest
Port Mappings: 3000:3000
Environment Variables:
  DATABASE_URL: <your-database-url>
  BETTER_AUTH_SECRET: <your-secret>
  BETTER_AUTH_URL: https://app.yourdomain.com
  NEXT_PUBLIC_APP_URL: https://app.yourdomain.com
  NEXT_PUBLIC_WEB_URL: https://yourdomain.com
  NEXT_PUBLIC_API_URL: https://api.yourdomain.com
  # ... add all other required env vars
```

**App (Admin):**
```yaml
Image: ghcr.io/promptlyprinted/promptly-printed-website/app:latest
Port Mappings: 3000:3000
Environment Variables: <same as web>
```

**API:**
```yaml
Image: ghcr.io/promptlyprinted/promptly-printed-website/api:latest
Port Mappings: 3000:3000
Environment Variables: <same as web>
```

### Step 3: Configure Auto-Deploy Webhooks (Optional)

To automatically deploy when new images are pushed:

1. **In Coolify:**
   - Go to each service
   - Enable "Webhook"
   - Copy the webhook URL

2. **In GitHub Repository:**
   - Go to Settings → Webhooks → Add webhook
   - Paste the Coolify webhook URL
   - Select "Packages" event
   - Save

Now whenever GitHub Actions pushes a new image, Coolify will automatically deploy it.

### Step 4: Private Registry Setup (If keeping packages private)

If you want to keep packages private:

1. **In Coolify:**
   - Go to Configuration → Registry
   - Add GitHub Container Registry:
     - URL: `ghcr.io`
     - Username: Your GitHub username
     - Password: Your GitHub PAT (with `read:packages` permission)

2. **Update service configuration:**
   - Use the same image paths
   - Coolify will use the registry credentials to pull

---

## Part 5: Deploy Updates

### Method 1: Through GitHub Actions (Recommended)

```bash
# Make your changes
git add .
git commit -m "Update application"
git push origin main

# GitHub Actions will:
# 1. Build new images
# 2. Push to GHCR
# 3. (If webhook configured) Trigger Coolify deployment
```

### Method 2: Manual Build and Push

```bash
# Build locally
./build-all.sh

# Push to registry
./push-all.sh

# In Coolify: Click "Redeploy" for each service
```

### Method 3: Coolify Manual Redeploy

1. Go to Coolify → Your Service
2. Click "Redeploy"
3. Coolify will pull the latest image from GHCR

---

## Troubleshooting

### Build fails with memory errors

The Dockerfile is optimized for 4GB servers. If building locally with limited RAM:

```bash
# Increase Docker Desktop memory limit
# Docker Desktop → Settings → Resources → Memory → 4GB+

# Or reduce build concurrency
docker build --memory=4g --build-arg APP_NAME=web ...
```

### Coolify can't pull image

**Check package visibility:**
```bash
# Test pull manually
docker pull ghcr.io/promptlyprinted/promptly-printed-website/web:latest

# If authentication required, package is private
# Either make it public or configure registry credentials in Coolify
```

### Environment variables not working

Verify all required variables are set in Coolify:
- Database credentials
- API keys
- Public URLs
- Auth secrets

---

## Quick Reference

### Build Commands
```bash
# Build all apps
./build-all.sh

# Build specific app
docker build --build-arg APP_NAME=web -t ghcr.io/promptlyprinted/promptly-printed-website/web:latest .
```

### Push Commands
```bash
# Login
echo $GITHUB_PAT | docker login ghcr.io -u USERNAME --password-stdin

# Push all
./push-all.sh

# Push specific
docker push ghcr.io/promptlyprinted/promptly-printed-website/web:latest
```

### Image Names
```
ghcr.io/promptlyprinted/promptly-printed-website/web:latest
ghcr.io/promptlyprinted/promptly-printed-website/app:latest
ghcr.io/promptlyprinted/promptly-printed-website/api:latest
```

### Coolify Configuration
```
Image: ghcr.io/promptlyprinted/promptly-printed-website/[APP]:latest
Port: 3000
Auto-Deploy: Enable webhook for automatic updates
```

---

## Best Practices

1. **Use version tags** for production:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   # Use in Coolify: ghcr.io/.../web:v1.0.0
   ```

2. **Keep `latest` for staging:**
   ```bash
   # Staging uses :latest
   # Production uses specific version tags
   ```

3. **Test locally before pushing:**
   ```bash
   docker build --build-arg APP_NAME=web -t test-web .
   docker run -p 3000:3000 test-web
   # Test at localhost:3000
   ```

4. **Monitor builds:**
   - Check GitHub Actions for build status
   - Monitor Coolify logs for deployment issues

---

## Next Steps

1. ✅ Set up build scripts (`build-all.sh`, `push-all.sh`)
2. ✅ Configure GitHub secrets for automatic builds
3. ✅ Make GHCR packages public (or configure private registry)
4. ✅ Configure Coolify services with pre-built images
5. ✅ Set up webhooks for auto-deployment
6. ✅ Test the complete workflow

For questions or issues, check the troubleshooting section above.
