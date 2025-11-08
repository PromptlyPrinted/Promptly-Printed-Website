# Docker Deployment Guide - Pre-built Images

This guide explains how to deploy Promptly Printed apps using pre-built Docker images to avoid memory issues on the server.

## Overview

Instead of building Docker images on the 4GB Coolify server, we build them locally or via GitHub Actions and push to GitHub Container Registry. Coolify then pulls the pre-built images.

## Option 1: Build Locally (Recommended for Quick Updates)

### Prerequisites
1. Docker installed and running
2. GitHub Personal Access Token with `write:packages` and `read:packages` scopes
   - Create at: https://github.com/settings/tokens

### Steps

1. **Set up environment variables**
   ```bash
   # Create a .env file with all your secrets
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Login to GitHub Container Registry**
   ```bash
   export CR_PAT=your_github_token_here
   echo $CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

3. **Build and push all images**
   ```bash
   # Load environment variables
   source .env

   # Build and push (uses 'latest' tag by default)
   ./scripts/build-and-push.sh

   # Or with a specific version tag
   ./scripts/build-and-push.sh v1.0.0
   ```

4. **Configure Coolify**
   - In Coolify, update your service to use `docker-compose.prod.yaml` instead of `docker-compose.yaml`
   - Set environment variable: `IMAGE_TAG=latest` (or your version tag)
   - Deploy!

## Option 2: Automated Builds via GitHub Actions

### Setup

1. **Add GitHub Secrets** (Repository Settings → Secrets and Variables → Actions)

   Required Secrets:
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `DATABASE_URL`
   - `PULSE_API_KEY`
   - `ARCJET_KEY`
   - `BASEHUB_TOKEN`
   - `BASEHUB_ADMIN_TOKEN`
   - `PRODIGI_API_KEY`
   - `PRODIGI_API`
   - `SQUARE_ACCESS_TOKEN`
   - `SQUARE_LOCATION_ID`
   - `SQUARE_ENVIRONMENT`
   - `SQUARE_WEBHOOK_SIGNATURE_KEY`
   - `GOOGLE_GEMINI_API_KEY`
   - `TOGETHER_API_KEY`
   - `RESEND_TOKEN`
   - `RESEND_FROM`
   - `RESEND_AUDIENCE_ID`
   - `BETTERSTACK_API_KEY`
   - `BETTERSTACK_URL`
   - `FLAGS_SECRET`
   - `SVIX_TOKEN`
   - `LIVEBLOCKS_SECRET`

   Required Variables (Repository Settings → Secrets and Variables → Actions → Variables):
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_WEB_URL`
   - `NEXT_PUBLIC_BETTER_AUTH_URL`
   - `NEXT_PUBLIC_DOCS_URL`
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
   - `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`

2. **Trigger builds**
   - Automatically on push to `main` branch
   - Automatically on version tags (`v*`)
   - Manually via GitHub Actions UI

3. **Configure Coolify**
   - Use `docker-compose.prod.yaml`
   - Images will be automatically available at:
     - `ghcr.io/promptlyprinted/promptly-printed-website/web:latest`
     - `ghcr.io/promptlyprinted/promptly-printed-website/app:latest`
     - `ghcr.io/promptlyprinted/promptly-printed-website/api:latest`

## Coolify Configuration

### Using Pre-built Images

1. Go to your service in Coolify
2. Change the docker-compose file path to `docker-compose.prod.yaml`
3. Set environment variables (all runtime secrets)
4. Set `IMAGE_TAG=latest` (or specific version)
5. Deploy

### Advantages

✅ **No building on server** - Saves memory and CPU
✅ **Faster deployments** - Just pulls pre-built images
✅ **Build on powerful hardware** - Your Mac or GitHub's runners
✅ **Consistent builds** - Same image across environments
✅ **Rollback capability** - Keep multiple image versions

## Image Tags

Images are tagged in multiple ways:

- `latest` - Latest build from main branch
- `main` - Latest build from main branch
- `v1.0.0` - Semantic version tags
- `v1.0` - Major.minor version
- `v1` - Major version
- `main-sha-abc123` - Commit SHA

## Apps

Three separate apps are built:

1. **web** - Marketing website (port 3001)
2. **app** - Main application (port 3000)
3. **api** - API service (port 3002)

Each can be deployed independently in Coolify by selecting the service name.

## Troubleshooting

### Authentication Issues
```bash
# Re-login to ghcr.io
echo $CR_PAT | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### Build Fails Locally
```bash
# Check Docker memory/CPU limits
docker system info

# Clean build cache
docker buildx prune -af
```

### Coolify Can't Pull Images
1. Check image exists: `docker pull ghcr.io/promptlyprinted/promptly-printed-website/web:latest`
2. Verify repository is public or Coolify has access token
3. Check IMAGE_TAG environment variable in Coolify

### Making Repository Packages Public
Go to: https://github.com/orgs/PromptlyPrinted/packages
→ Find your package
→ Package settings
→ Change visibility to Public

## Build Times

Approximate build times:
- Local (on Mac): 5-10 minutes per app
- GitHub Actions: 8-15 minutes per app
- Coolify pulling image: 1-2 minutes

## Resources

- GitHub Container Registry: https://ghcr.io
- Docker Buildx: https://docs.docker.com/build/
- Coolify Docs: https://coolify.io/docs
