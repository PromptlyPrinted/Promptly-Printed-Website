# 🚀 START HERE - Deployment Guide

**Welcome!** This is your starting point for deploying Promptly Printed to Coolify.

---

## 📖 Which Guide Should I Use?

Choose based on your experience level:

### 🟢 **I'm new to Docker and deployment**
→ Start with: [QUICKSTART-DEPLOYMENT.md](./QUICKSTART-DEPLOYMENT.md)
- Simple step-by-step guide
- Assumes no prior knowledge
- Gets you deployed in 30-60 minutes

### 🟡 **I need exact settings and screenshots**
→ Use: [docs/COOLIFY-SETUP-GUIDE.md](./docs/COOLIFY-SETUP-GUIDE.md)
- Complete setup with exact URLs
- Links to every GitHub/Coolify page you need
- Environment variables template
- Checklists to track progress

### 🟠 **I want to understand the workflow**
→ Read: [docs/DEPLOYMENT-WORKFLOW.md](./docs/DEPLOYMENT-WORKFLOW.md)
- Visual diagrams of the entire process
- Understand how everything connects
- Different deployment strategies
- Rollback procedures

### 🔵 **I need comprehensive documentation**
→ See: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- Every deployment option explained
- Advanced configurations
- Troubleshooting guide
- Best practices

### 📌 **I need quick links and commands**
→ Check: [LINKS-REFERENCE.md](./LINKS-REFERENCE.md)
- All important URLs in one place
- Common commands
- Bookmark-ready reference

### 🖼️ **I need to see what Coolify screens look like**
→ View: [docs/COOLIFY-SETTINGS-SCREENSHOT-GUIDE.md](./docs/COOLIFY-SETTINGS-SCREENSHOT-GUIDE.md)
- Visual representation of Coolify UI
- Exactly what to enter in each field
- Step-by-step screen-by-screen guide

---

## ⚡ Quick Start (5 Minutes)

If you just want to get started NOW:

### 1️⃣ Build Images
```bash
cd /Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted
./build-all.sh
```

### 2️⃣ Login to GitHub Container Registry
```bash
# Get a token: https://github.com/settings/tokens/new
# Scopes needed: write:packages, read:packages
echo YOUR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### 3️⃣ Push Images
```bash
./push-all.sh
```

### 4️⃣ Make Packages Public
- Go to: https://github.com/orgs/PromptlyPrinted/packages
- For each package (web, app, api): Settings → Change visibility → Public

### 5️⃣ Configure Coolify
For each app (web, app, api):
- Create service → Type: "Docker Image"
- Image: `ghcr.io/promptlyprinted/promptly-printed-website/[app]:latest`
- Port: `3000`
- Add environment variables from `.env.coolify.example`
- Deploy!

**Done!** Your sites should be live.

---

## 📁 What's in This Repository?

### 📋 Documentation
```
├── START-HERE.md                           ← You are here!
├── README-DEPLOYMENT.md                    ← Documentation hub
├── QUICKSTART-DEPLOYMENT.md                ← 30-min quick start
├── LINKS-REFERENCE.md                      ← All URLs & links
├── .env.coolify.example                    ← Environment variables template
└── docs/
    ├── COOLIFY-SETUP-GUIDE.md              ← Complete setup guide ⭐
    ├── COOLIFY-SETTINGS-SCREENSHOT-GUIDE.md ← Visual guide
    ├── DEPLOYMENT.md                        ← Comprehensive guide
    └── DEPLOYMENT-WORKFLOW.md               ← Workflow diagrams
```

### 🛠️ Build Scripts
```
├── build-all.sh      ← Build all three apps
├── build-single.sh   ← Build one specific app
└── push-all.sh       ← Push images to GitHub Container Registry
```

### 🐳 Docker & CI/CD
```
├── Dockerfile                              ← Multi-stage build config
├── docker-entrypoint.sh                    ← Container startup script
└── .github/workflows/
    └── docker-build-push.yml               ← Auto-build on git push
```

---

## 🎯 Recommended Path

**For first-time deployment:**

1. **Read** [QUICKSTART-DEPLOYMENT.md](./QUICKSTART-DEPLOYMENT.md) (10 min)
2. **Follow** [docs/COOLIFY-SETUP-GUIDE.md](./docs/COOLIFY-SETUP-GUIDE.md) (30-60 min)
3. **Reference** [LINKS-REFERENCE.md](./LINKS-REFERENCE.md) as needed
4. **Refer to** [docs/COOLIFY-SETTINGS-SCREENSHOT-GUIDE.md](./docs/COOLIFY-SETTINGS-SCREENSHOT-GUIDE.md) for exact settings

**After successful deployment:**

1. **Study** [docs/DEPLOYMENT-WORKFLOW.md](./docs/DEPLOYMENT-WORKFLOW.md) to understand the process
2. **Bookmark** [LINKS-REFERENCE.md](./LINKS-REFERENCE.md) for future reference
3. **Set up** auto-deploy webhooks (in Coolify Setup Guide)

---

## 🆘 Troubleshooting

### Build Issues
**Problem:** Build fails or takes too long
- Check: Docker Desktop is running and has enough memory (6GB+)
- Fix: Increase Docker memory in Settings → Resources
- See: `docs/DEPLOYMENT.md` → Troubleshooting section

### Authentication Issues
**Problem:** Can't push images to GHCR
- Check: GitHub PAT has `write:packages` permission
- Fix: Create new token at https://github.com/settings/tokens
- See: `docs/COOLIFY-SETUP-GUIDE.md` → Part 1

### Coolify Deployment Issues
**Problem:** Service won't start or crashes
- Check: Environment variables are set correctly
- Check: Package visibility is Public (or registry configured)
- Check: Logs in Coolify for specific error messages
- See: `docs/COOLIFY-SETUP-GUIDE.md` → Troubleshooting section

### Environment Variable Issues
**Problem:** App crashes with "missing environment variable"
- Fix: Copy all variables from `.env.coolify.example`
- Check: Variables match your actual service credentials
- See: `.env.coolify.example` for full list

---

## 📊 Deployment Status

Track your progress:

- [ ] **Prerequisites Complete**
  - [ ] GitHub PAT created
  - [ ] Docker Desktop installed and running
  - [ ] Coolify instance ready
  - [ ] Domains configured

- [ ] **Images Built & Pushed**
  - [ ] Built images locally
  - [ ] Logged into GHCR
  - [ ] Pushed to GitHub Container Registry
  - [ ] Packages made public

- [ ] **Coolify Configured**
  - [ ] Web service created and deployed
  - [ ] App service created and deployed
  - [ ] API service created and deployed
  - [ ] Environment variables set
  - [ ] Domains and SSL configured

- [ ] **Verification Complete**
  - [ ] All services running
  - [ ] Websites accessible
  - [ ] Authentication working
  - [ ] Health checks passing

- [ ] **Optional Enhancements**
  - [ ] Auto-deploy webhooks configured
  - [ ] Monitoring set up
  - [ ] Backups configured

---

## 🔗 Essential Links

**Must-Bookmark:**
- GitHub Actions: https://github.com/PromptlyPrinted/Promptly-Printed-Website/actions
- GitHub Packages: https://github.com/orgs/PromptlyPrinted/packages
- Create PAT: https://github.com/settings/tokens/new
- Your Coolify: `https://your-coolify-instance.com`

**Full link list:** See [LINKS-REFERENCE.md](./LINKS-REFERENCE.md)

---

## 💡 Tips for Success

1. **Read before you build** - Skim the Quick Start guide first
2. **Use the checklists** - They ensure you don't miss steps
3. **Test locally first** - Build and run images locally before pushing
4. **One service at a time** - Get web working before moving to app and api
5. **Check the logs** - Coolify logs show exactly what's wrong
6. **Join the community** - Coolify Discord is helpful: https://discord.gg/coolify

---

## 🎓 Learning Path

**Never deployed before?**
1. Read: Quick Start guide (understand the process)
2. Do: Follow Coolify Setup Guide (hands-on deployment)
3. Understand: Read Deployment Workflow (see how it works)
4. Master: Read comprehensive Deployment guide (advanced topics)

**Have deployment experience?**
1. Skim: Quick Start guide
2. Reference: Coolify Setup Guide for specific settings
3. Customize: Based on Deployment guide

---

## 🚦 Next Steps

**Right now:**
1. Open [docs/COOLIFY-SETUP-GUIDE.md](./docs/COOLIFY-SETUP-GUIDE.md)
2. Follow Part 1: GitHub Setup
3. Continue through each section

**After deployment:**
1. Test all functionality
2. Set up monitoring
3. Configure auto-deploy
4. Review security settings

---

## 📞 Get Help

**Stuck? Try these:**

1. **Check the guides** - Most questions are answered in:
   - [QUICKSTART-DEPLOYMENT.md](./QUICKSTART-DEPLOYMENT.md)
   - [docs/COOLIFY-SETUP-GUIDE.md](./docs/COOLIFY-SETUP-GUIDE.md)

2. **Check the logs**
   - Coolify: Service → Logs tab
   - GitHub Actions: Check build logs
   - Local: `docker logs <container-id>`

3. **Ask the community**
   - Coolify Discord: https://discord.gg/coolify
   - Coolify GitHub: https://github.com/coollabsio/coolify/discussions

---

## ✅ You're Ready!

Everything you need is in these docs. Pick your starting guide and go! 🚀

**Recommended first step:**
Open [docs/COOLIFY-SETUP-GUIDE.md](./docs/COOLIFY-SETUP-GUIDE.md) and start with Part 1.

Good luck! 🎉
