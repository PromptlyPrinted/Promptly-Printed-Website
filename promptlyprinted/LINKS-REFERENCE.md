# Quick Links Reference Card

Print this or bookmark for quick access to all important URLs during deployment.

---

## 🔗 GitHub Links

### Repository & Code
- **Main Repository:** https://github.com/PromptlyPrinted/Promptly-Printed-Website
- **Code:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/tree/main

### GitHub Actions (Build Status)
- **All Workflows:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/actions
- **Docker Build Workflow:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/actions/workflows/docker-build-push.yml
- **Trigger Manual Build:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/actions/workflows/docker-build-push.yml → Click "Run workflow"

### Packages (Docker Images)
- **Organization Packages:** https://github.com/orgs/PromptlyPrinted/packages
- **Web Package:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/pkgs/container/promptly-printed-website%2Fweb
- **App Package:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/pkgs/container/promptly-printed-website%2Fapp
- **API Package:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/pkgs/container/promptly-printed-website%2Fapi

### Settings & Configuration
- **Repository Settings:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings
- **Webhooks:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings/hooks
- **Secrets (Actions):** https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings/secrets/actions
- **Variables (Actions):** https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings/variables/actions
- **Environments:** https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings/environments

### Personal Settings
- **Personal Access Tokens:** https://github.com/settings/tokens
- **Generate New PAT:** https://github.com/settings/tokens/new
- **Your Packages:** https://github.com/YOUR_USERNAME?tab=packages

---

## 🐳 Docker Image URLs

Use these in Coolify:

```
Web:  ghcr.io/promptlyprinted/promptly-printed-website/web:latest
App:  ghcr.io/promptlyprinted/promptly-printed-website/app:latest
API:  ghcr.io/promptlyprinted/promptly-printed-website/api:latest
```

### With Version Tags
```
Web:  ghcr.io/promptlyprinted/promptly-printed-website/web:v1.0.0
App:  ghcr.io/promptlyprinted/promptly-printed-website/app:v1.0.0
API:  ghcr.io/promptlyprinted/promptly-printed-website/api:v1.0.0
```

---

## ☁️ Coolify Links

### Main Dashboard
- **Coolify Instance:** `https://YOUR-COOLIFY-DOMAIN.com`
- **Login:** `https://YOUR-COOLIFY-DOMAIN.com/login`
- **Dashboard:** `https://YOUR-COOLIFY-DOMAIN.com/dashboard`

### Project & Services
- **Projects List:** `https://YOUR-COOLIFY-DOMAIN.com/projects`
- **Your Project:** `https://YOUR-COOLIFY-DOMAIN.com/project/[PROJECT-ID]`
- **Web Service:** `https://YOUR-COOLIFY-DOMAIN.com/project/[PROJECT-ID]/service/[WEB-SERVICE-ID]`
- **App Service:** `https://YOUR-COOLIFY-DOMAIN.com/project/[PROJECT-ID]/service/[APP-SERVICE-ID]`
- **API Service:** `https://YOUR-COOLIFY-DOMAIN.com/project/[PROJECT-ID]/service/[API-SERVICE-ID]`

### Configuration
- **Settings:** `https://YOUR-COOLIFY-DOMAIN.com/settings`
- **Registries:** `https://YOUR-COOLIFY-DOMAIN.com/settings/registries`
- **Environment Variables:** In each service → "Environment Variables" tab
- **Webhooks:** In each service → "Webhooks" tab

### Documentation
- **Official Docs:** https://coolify.io/docs
- **Getting Started:** https://coolify.io/docs/introduction
- **Docker Images Guide:** https://coolify.io/docs/resources/docker-images

### Community & Support
- **Discord:** https://discord.gg/coolify
- **GitHub Issues:** https://github.com/coollabsio/coolify/issues
- **GitHub Discussions:** https://github.com/coollabsio/coolify/discussions

---

## 🌐 Your Production URLs

After deployment, your sites will be at:

- **Public Website:** `https://yourdomain.com`
- **Admin Dashboard:** `https://app.yourdomain.com`
- **API:** `https://api.yourdomain.com`
- **API Health Check:** `https://api.yourdomain.com/api/health`

---

## 📊 Third-Party Services

### Analytics & Monitoring
- **PostHog:** https://app.posthog.com
- **Google Analytics:** https://analytics.google.com
- **BetterStack Uptime:** https://uptime.betterstack.com

### CMS & Content
- **BaseHub:** https://basehub.com
- **BaseHub Dashboard:** https://basehub.com/dashboard

### Payment Processing
- **Square Dashboard:** https://squareup.com/dashboard
- **Square Developer:** https://developer.squareup.com/apps

### Print Services
- **Prodigi Dashboard:** https://dashboard.prodigi.com
- **Prodigi API Docs:** https://www.prodigi.com/print-api/docs/

### Email
- **Resend Dashboard:** https://resend.com/overview
- **Resend Emails:** https://resend.com/emails
- **Resend API Keys:** https://resend.com/api-keys

### AI Services
- **Google AI Studio:** https://aistudio.google.com
- **Together AI:** https://api.together.xyz

### Other Services
- **Liveblocks:** https://liveblocks.io/dashboard
- **Svix Webhooks:** https://dashboard.svix.com
- **Arcjet Security:** https://app.arcjet.com

---

## 🛠️ Documentation Links

### Docker & Containers
- **Docker Hub:** https://hub.docker.com
- **Docker Docs:** https://docs.docker.com
- **Docker Build Reference:** https://docs.docker.com/engine/reference/builder/
- **Multi-stage Builds:** https://docs.docker.com/build/building/multi-stage/

### GitHub Packages
- **Container Registry Docs:** https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- **Publishing Images:** https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#publishing-container-images
- **Authenticating:** https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry

### GitHub Actions
- **Workflows Syntax:** https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
- **Docker Build-Push Action:** https://github.com/marketplace/actions/build-and-push-docker-images
- **Secrets:** https://docs.github.com/en/actions/security-guides/encrypted-secrets

### Next.js
- **Deployment:** https://nextjs.org/docs/deployment
- **Environment Variables:** https://nextjs.org/docs/basic-features/environment-variables
- **Docker:** https://github.com/vercel/next.js/tree/canary/examples/with-docker

---

## 📝 Common Commands

### Docker Login
```bash
# Login to GHCR
echo $GITHUB_PAT | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### Build & Push
```bash
# Build all apps
./build-all.sh

# Build specific app
./build-single.sh web

# Push all apps
./push-all.sh

# Build with version tag
./build-all.sh v1.0.0
```

### Git & Version Tags
```bash
# Create and push version tag
git tag v1.0.0
git push origin v1.0.0

# List tags
git tag -l

# Delete tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

### Docker Image Management
```bash
# List images
docker images | grep promptly-printed

# Remove image
docker rmi ghcr.io/promptlyprinted/promptly-printed-website/web:latest

# Pull image
docker pull ghcr.io/promptlyprinted/promptly-printed-website/web:latest

# Run image locally
docker run -p 3000:3000 ghcr.io/promptlyprinted/promptly-printed-website/web:latest

# View logs
docker logs <container-id>

# Clean up
docker system prune -a
```

---

## 🔑 Important Credentials Locations

### GitHub PAT
- **Create:** https://github.com/settings/tokens/new
- **Scopes needed:** `write:packages`, `read:packages`
- **Store:** In password manager or `~/github-pat.txt`

### Coolify
- **Admin Panel:** `https://YOUR-COOLIFY-DOMAIN.com/settings`
- **API Tokens:** In Coolify Settings → API Tokens

### Environment Variables
- **Template:** `.env.coolify.example` in repo
- **Store:** In Coolify → Each service → Environment Variables tab

---

## 📞 Support Channels

### Coolify
- **Discord:** https://discord.gg/coolify
- **GitHub Issues:** https://github.com/coollabsio/coolify/issues
- **Documentation:** https://coolify.io/docs

### GitHub
- **Support:** https://support.github.com
- **Community:** https://github.community

### General
- **Stack Overflow:** https://stackoverflow.com (tag: docker, coolify, next.js)
- **Docker Forums:** https://forums.docker.com

---

## ✅ Quick Deployment Checklist

```
Pre-deployment:
☐ GitHub PAT created
☐ Docker Desktop running
☐ Domain DNS configured
☐ Environment variables prepared

Build & Push:
☐ Built images locally (./build-all.sh)
☐ Logged into GHCR
☐ Pushed images (./push-all.sh)
☐ Packages made public

Coolify Setup:
☐ Project created
☐ 3 services created (web, app, api)
☐ Domains configured
☐ SSL enabled
☐ Environment variables set
☐ All services deployed

Verification:
☐ All services running
☐ Websites accessible
☐ Health checks passing
☐ Monitoring active

Optional:
☐ Webhooks configured
☐ Auto-deploy tested
☐ Backups configured
```

---

## 🎯 Bookmark These

**Most Important Links:**
1. GitHub Actions (check build status): https://github.com/PromptlyPrinted/Promptly-Printed-Website/actions
2. GitHub Packages (view images): https://github.com/orgs/PromptlyPrinted/packages
3. Coolify Dashboard: `https://YOUR-COOLIFY-DOMAIN.com/dashboard`
4. Create PAT: https://github.com/settings/tokens/new
5. Repository Settings: https://github.com/PromptlyPrinted/Promptly-Printed-Website/settings

---

**Save this file or print it for quick reference during deployment!**
