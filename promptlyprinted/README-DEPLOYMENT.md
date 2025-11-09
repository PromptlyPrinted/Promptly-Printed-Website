# Deployment Documentation

Welcome! This README provides quick links to all deployment documentation.

## 🚀 Quick Start

**New to deployment?** Start here:
- [QUICKSTART-DEPLOYMENT.md](./QUICKSTART-DEPLOYMENT.md) - Step-by-step guide to deploy in 30 minutes
- [docs/COOLIFY-SETUP-GUIDE.md](./docs/COOLIFY-SETUP-GUIDE.md) - **Complete Coolify setup with links & exact settings** ⭐

## 📚 Documentation

### Comprehensive Guides
- [docs/COOLIFY-SETUP-GUIDE.md](./docs/COOLIFY-SETUP-GUIDE.md) - **Exact steps with URLs, settings, and checklists** ⭐
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Complete deployment guide with all options
- [docs/DEPLOYMENT-WORKFLOW.md](./docs/DEPLOYMENT-WORKFLOW.md) - Visual workflow diagrams and strategies

### Configuration Files
- [.env.coolify.example](./.env.coolify.example) - Environment variables template for Coolify
- [LINKS-REFERENCE.md](./LINKS-REFERENCE.md) - **All important URLs and links in one place** 📌

## 🛠️ Build Scripts

Ready-to-use scripts in the project root:

```bash
# Build all apps (web, app, api)
./build-all.sh [tag]

# Build a single app
./build-single.sh [web|app|api] [tag]

# Push all apps to GitHub Container Registry
./push-all.sh [tag]
```

**Examples:**
```bash
# Build with latest tag
./build-all.sh

# Build with version tag
./build-all.sh v1.0.0

# Build single app
./build-single.sh web v1.0.0

# Push to registry
./push-all.sh v1.0.0
```

## 🎯 Deployment Options

### Option 1: Automatic CI/CD (Recommended)
Push to GitHub → Actions build & push → Webhook triggers Coolify → Auto-deploy

**Setup:**
1. GitHub Actions already configured (`.github/workflows/docker-build-push.yml`)
2. Push to `main` branch or create version tag
3. Configure webhook in Coolify (optional)

### Option 2: Manual Deployment
Build locally → Push to GHCR → Deploy in Coolify

**Setup:**
1. Run `./build-all.sh`
2. Run `./push-all.sh`
3. Click "Redeploy" in Coolify

### Option 3: Tagged Releases
Create version tag → Auto-build → Manual deploy in Coolify

**Setup:**
1. Create tag: `git tag v1.0.0 && git push origin v1.0.0`
2. GitHub Actions builds automatically
3. Update image tag in Coolify
4. Redeploy

## 📦 Docker Images

Your apps are published to GitHub Container Registry:

```
ghcr.io/promptlyprinted/promptly-printed-website/web:latest
ghcr.io/promptlyprinted/promptly-printed-website/app:latest
ghcr.io/promptlyprinted/promptly-printed-website/api:latest
```

**Available tags:**
- `latest` - Latest build from main branch
- `v1.0.0` - Semantic version tags
- `main-abc123` - Git SHA tags
- Custom tags via manual workflow

View packages: https://github.com/PromptlyPrinted?tab=packages

## 🔧 Coolify Configuration

### Service Setup (For each app: web, app, api)

1. **Create Service:**
   - Type: Docker Image (not Dockerfile)
   - Image: `ghcr.io/promptlyprinted/promptly-printed-website/[app]:latest`
   - Port: `3000:3000`

2. **Environment Variables:**
   - Copy from `.env.coolify.example`
   - Update with your actual values
   - Required for all apps: DATABASE_URL, AUTH secrets, etc.

3. **Domain & SSL:**
   - Add domain (e.g., `app.yourdomain.com`)
   - Enable SSL (automatic with Let's Encrypt)

4. **Deploy:**
   - Click "Deploy"
   - Monitor logs for any issues

## 🔐 Environment Variables

All environment variables are listed in `.env.coolify.example`.

**Critical variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- `BASEHUB_TOKEN` - CMS access
- `SQUARE_*` - Payment processing (for web)
- `NEXT_PUBLIC_*` - Frontend URLs (baked into build)

## 🚨 Troubleshooting

### Build Issues
```bash
# Check Docker is running
docker info

# Increase Docker memory
# Docker Desktop → Settings → Resources → Memory → 6GB+

# Clean Docker cache
docker system prune -a
```

### Push Issues
```bash
# Login to GHCR
echo $GITHUB_PAT | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Verify image exists
docker images | grep promptly-printed
```

### Deploy Issues
- Check Coolify logs for errors
- Verify all environment variables are set
- Test database connection
- Check image tag exists in GHCR

## 📊 Monitoring

After deployment, verify:
- ✅ Services are running in Coolify
- ✅ Websites are accessible
- ✅ Authentication works
- ✅ Database connections successful
- ✅ External monitoring (BetterStack) shows healthy

## 🔄 Update Process

### For automatic deployments:
```bash
git add .
git commit -m "Update feature"
git push origin main
# Wait for GitHub Actions
# Webhook triggers Coolify deployment (if configured)
```

### For manual deployments:
```bash
./build-all.sh
./push-all.sh
# Go to Coolify → Click "Redeploy"
```

### For version releases:
```bash
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions builds automatically
# Update image tag in Coolify
# Redeploy
```

## 🎓 Learning Resources

- [Docker Documentation](https://docs.docker.com/)
- [Coolify Documentation](https://coolify.io/docs)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Actions](https://docs.github.com/en/actions)

## 📝 Cheat Sheet

```bash
# Quick deploy from scratch
./build-all.sh          # Build images
./push-all.sh           # Push to registry
# Configure in Coolify
# Deploy

# Update and deploy
git push origin main    # Triggers auto-build
# Wait for GitHub Actions
# Auto-deploys if webhook configured

# Rollback
# In Coolify: Change image tag to previous version
# Click "Redeploy"

# View logs
# In Coolify: Click service → Logs tab
docker logs <container-id>  # Local testing
```

## 🆘 Getting Help

1. **Check documentation:**
   - [QUICKSTART-DEPLOYMENT.md](./QUICKSTART-DEPLOYMENT.md)
   - [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
   - [docs/DEPLOYMENT-WORKFLOW.md](./docs/DEPLOYMENT-WORKFLOW.md)

2. **Common issues:**
   - Memory errors → Increase Docker memory
   - Permission errors → Check GHCR authentication
   - Build errors → Check GitHub Actions logs
   - Deploy errors → Check Coolify logs

3. **Still stuck?**
   - Check Coolify documentation
   - Review GitHub Actions logs
   - Verify environment variables
   - Test locally first

## ✅ Deployment Checklist

Before first deployment:
- [ ] Build scripts are executable (`chmod +x *.sh`)
- [ ] GitHub PAT created with `write:packages` permission
- [ ] Logged into GHCR (`docker login ghcr.io`)
- [ ] Environment variables prepared (`.env.coolify.example`)
- [ ] Coolify instance ready
- [ ] Domains configured (DNS pointing to Coolify)

For each deployment:
- [ ] Code changes tested locally
- [ ] Tests passing
- [ ] Environment variables updated (if needed)
- [ ] Database migrations run (if needed)
- [ ] Build successful
- [ ] Images pushed to GHCR
- [ ] Coolify deployment successful
- [ ] Health checks passing
- [ ] Monitoring shows healthy status

## 🎉 Success!

Once deployed, your apps will be live at:
- **Web:** https://yourdomain.com
- **App:** https://app.yourdomain.com
- **API:** https://api.yourdomain.com

Enjoy your deployment! 🚀
