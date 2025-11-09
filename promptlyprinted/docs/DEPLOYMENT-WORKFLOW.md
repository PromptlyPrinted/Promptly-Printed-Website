# Deployment Workflow Diagram

## Complete CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOCAL DEVELOPMENT                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ├─> Make code changes
                                ├─> Run tests locally
                                ├─> Commit changes
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          GIT PUSH                                │
│                    git push origin main                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS                              │
│  (.github/workflows/docker-build-push.yml)                       │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  Build Web │  │  Build App │  │  Build API │               │
│  │   Image    │  │   Image    │  │   Image    │               │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘               │
│        │                │                │                       │
│        └────────────────┴────────────────┘                       │
│                         │                                        │
│                         ▼                                        │
│                 Push to GHCR                                     │
│  ghcr.io/promptlyprinted/promptly-printed-website/[app]:tag     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              GITHUB CONTAINER REGISTRY (GHCR)                    │
│                                                                  │
│  📦 web:latest   📦 web:v1.0.0   📦 web:main-abc123            │
│  📦 app:latest   📦 app:v1.0.0   📦 app:main-abc123            │
│  📦 api:latest   📦 api:v1.0.0   📦 api:main-abc123            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ├─> Webhook (optional)
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                           COOLIFY                                │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   Web Service    │  │   App Service    │  │ API Service  │ │
│  │  Port: 3000      │  │  Port: 3000      │  │ Port: 3000   │ │
│  │  yourdomain.com  │  │  app.yourdomain  │  │ api.your...  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
│                     🌐 Live Website                              │
└─────────────────────────────────────────────────────────────────┘
```

## Local Build & Deploy Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                      Run: ./build-all.sh
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DOCKER BUILD                                 │
│                                                                  │
│  Stage 1: Base      → Install Node.js, pnpm, dependencies       │
│  Stage 2: Deps      → Install all workspace packages            │
│  Stage 3: Build     → Build specific app (web/app/api)          │
│  Stage 4: Runner    → Create minimal production image           │
│                                                                  │
│  Result: 3 optimized Docker images (~500MB each)                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                      Run: ./push-all.sh
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              GITHUB CONTAINER REGISTRY                           │
│                                                                  │
│  Images stored in GHCR with multiple tags:                      │
│  • latest                                                        │
│  • version tag (v1.0.0)                                          │
│  • git SHA (main-abc123)                                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    Coolify: Click "Redeploy"
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT                                │
│                                                                  │
│  1. Pull image from GHCR                                         │
│  2. Stop old container                                           │
│  3. Start new container                                          │
│  4. Health check                                                 │
│  5. Switch traffic to new container                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                          ✅ DEPLOYED
```

## Build Process Details

```
┌─────────────────────────────────────────────────────────────────┐
│                      BUILD STAGES                                │
└─────────────────────────────────────────────────────────────────┘

📦 BASE (node:22-bookworm-slim)
   │
   ├─> Install pnpm
   ├─> Install system dependencies (Python, make, g++, libvips)
   ├─> Set memory limits (2GB for builds)
   │
   ▼
📦 DEPS (Install Dependencies)
   │
   ├─> Copy package.json, pnpm-lock.yaml
   ├─> Copy all workspace code (apps/, packages/)
   ├─> pnpm install --frozen-lockfile
   │   └─> Uses cache to speed up repeated builds
   │
   ▼
📦 BUILD (Build Application)
   │
   ├─> Copy source code
   ├─> Set build environment variables
   ├─> Generate Prisma client
   ├─> Build app (web/app/api)
   │   └─> Sequential builds to prevent memory issues
   ├─> pnpm deploy (extract production files)
   │
   ▼
📦 RUNNER (Production Image)
   │
   ├─> Install runtime dependencies only
   ├─> Copy built app from BUILD stage
   ├─> Create non-root user (nextjs:nodejs)
   ├─> Set runtime environment variables
   ├─> Expose port 3000
   │
   ▼
🎯 FINAL IMAGE (~500MB, optimized for production)
```

## Environment Variables Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  BUILD-TIME vs RUNTIME                           │
└─────────────────────────────────────────────────────────────────┘

BUILD-TIME (required during docker build):
┌─────────────────────────────────────────┐
│ • NEXT_PUBLIC_* variables               │  → Baked into the build
│   (embedded in frontend code)           │
│                                         │
│ • DATABASE_URL                          │  → For Prisma generation
│ • BASEHUB_TOKEN                         │  → For CMS build
└─────────────────────────────────────────┘
                    │
                    ▼
            Docker Build Process
                    │
                    ▼
RUNTIME (set in Coolify):
┌─────────────────────────────────────────┐
│ • All environment variables             │  → Used at runtime
│   (secrets, API keys, URLs)             │
│                                         │
│ Can be changed without rebuild!         │
└─────────────────────────────────────────┘
```

## Deployment Strategies

### Strategy 1: Continuous Deployment (Recommended)

```
Code Change → GitHub → Actions → GHCR → Webhook → Coolify → Deploy
               │                                              │
               └──────────────── Automatic ──────────────────┘

✅ Automatic deployment on every push to main
✅ No manual intervention needed
✅ Fast iteration
⚠️  Need proper testing before pushing
```

### Strategy 2: Tagged Releases

```
Create Tag → GitHub → Actions → GHCR → Manual Deploy in Coolify
  v1.0.0      │                          │
              └──────── Automatic ───────┘  Manual

✅ Control over when deployments happen
✅ Version tracking
✅ Rollback to previous versions easy
⚠️  Requires manual trigger in Coolify
```

### Strategy 3: Local Build & Push

```
Local Build → Push to GHCR → Manual Deploy in Coolify
    │              │               │
    Manual      Manual          Manual

✅ Full control over build process
✅ Test locally before pushing
✅ No CI/CD dependency
⚠️  Slower process
⚠️  Requires local Docker resources
```

## Rollback Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLLBACK PROCESS                              │
└─────────────────────────────────────────────────────────────────┘

If deployment fails or bugs discovered:

Option 1: Rollback to Previous Tag
  1. In Coolify → Service Settings
  2. Change image tag:
     ghcr.io/promptlyprinted/promptly-printed-website/web:v1.0.0
     ↓
     ghcr.io/promptlyprinted/promptly-printed-website/web:v0.9.9
  3. Redeploy
  ⏱️  < 2 minutes

Option 2: Rollback to Previous SHA
  1. Check GitHub Actions for previous build SHA
  2. Use SHA tag: web:main-abc1234
  3. Redeploy
  ⏱️  < 2 minutes

Option 3: Rebuild Previous Version
  1. git checkout v0.9.9
  2. ./build-all.sh v0.9.9
  3. ./push-all.sh v0.9.9
  4. Update Coolify to use v0.9.9
  ⏱️  ~ 20 minutes
```

## Monitoring & Verification

```
┌─────────────────────────────────────────────────────────────────┐
│                   POST-DEPLOYMENT CHECKS                         │
└─────────────────────────────────────────────────────────────────┘

1. Coolify Dashboard
   ├─> Check service status (running/healthy)
   ├─> View logs for errors
   └─> Monitor resource usage

2. Application Health
   ├─> Visit website URLs
   ├─> Test authentication
   ├─> Check API endpoints
   └─> Verify database connections

3. External Monitoring
   ├─> BetterStack uptime checks
   ├─> PostHog analytics
   └─> Error tracking (Sentry if configured)

4. Performance
   ├─> Page load times
   ├─> API response times
   └─> Memory/CPU usage in Coolify
```

## Quick Commands Reference

```bash
# Build all apps
./build-all.sh [tag]

# Build single app
./build-single.sh web [tag]

# Push to registry
./push-all.sh [tag]

# Test locally
docker run -p 3000:3000 ghcr.io/promptlyprinted/promptly-printed-website/web:latest

# View logs
docker logs <container-id>

# Access container shell
docker exec -it <container-id> /bin/bash

# Clean up old images
docker image prune -a
```

## Troubleshooting Flowchart

```
Deployment Failed?
        │
        ├─> Build Failed?
        │   ├─> Check GitHub Actions logs
        │   ├─> Verify build args
        │   └─> Check memory limits
        │
        ├─> Push Failed?
        │   ├─> Verify GHCR authentication
        │   ├─> Check package permissions
        │   └─> Verify image exists
        │
        └─> Deploy Failed?
            ├─> Check Coolify logs
            ├─> Verify environment variables
            ├─> Check database connectivity
            └─> Verify image tag exists
```

---

## Summary

This deployment workflow provides:

✅ **Automated builds** via GitHub Actions
✅ **Version control** with tags and SHAs
✅ **Fast deployments** using pre-built images
✅ **Easy rollbacks** to previous versions
✅ **Resource efficiency** on Coolify (4GB server optimized)
✅ **Flexibility** - local builds or CI/CD

Choose the strategy that works best for your team and iterate!
