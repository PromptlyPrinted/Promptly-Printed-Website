# ChatGPT App Deployment Guide for Coolify

## Quick Deploy to Coolify

### Step 1: Add as a New Service

1. In Coolify dashboard, go to your project
2. Click **+ Add Resource** → **Docker Compose**
3. Point to this file: `packages/chatgpt-app/docker-compose.yaml`

Or for a simpler setup, use **Dockerfile** deployment:
1. Click **+ Add Resource** → **Dockerfile**
2. Set:
   - **Build context**: `/` (monorepo root)
   - **Dockerfile path**: `packages/chatgpt-app/Dockerfile`

### Step 2: Configure Domain

1. In the service settings, add domain:
   ```
   chatgpt-app.promptlyprinted.com
   ```
2. Enable **HTTPS** (Let's Encrypt)
3. Set port to `3100`

### Step 3: Environment Variables

Add these in Coolify's environment section:

```env
NODE_ENV=production
PORT=3100
PROMPTLY_PRINTED_URL=https://promptlyprinted.com
```

### Step 4: DNS Setup

Add a DNS A record:
```
chatgpt-app.promptlyprinted.com → [Your Server IP]
```

Or if using Cloudflare with a wildcard:
```
*.promptlyprinted.com → [Your Server IP]
```

### Step 5: Deploy

Click **Deploy** and wait for the build to complete.

### Step 6: Verify

Test the health endpoint:
```bash
curl https://chatgpt-app.promptlyprinted.com/health
# Should return: {"status":"ok","service":"promptlyprinted-chatgpt-app"}
```

---

## Connect to ChatGPT

Once deployed:

1. **Enable Developer Mode** in ChatGPT:
   - Settings → Apps & Connectors → Advanced settings → Developer mode ON

2. **Add Your Connector**:
   - Settings → Connectors → Create
   - **URL**: `https://chatgpt-app.promptlyprinted.com/mcp`
   - **Name**: PromptlyPrinted
   - **Description**: Create custom AI-designed t-shirts and hoodies

3. **Test It**:
   - New chat → Click + → Select your connector
   - Try: "Show me your t-shirts" or "Create a design for a hoodie"

---

## Local Testing with ngrok

For testing before deploying:

```bash
# Terminal 1: Run the server
cd packages/chatgpt-app
pnpm dev

# Terminal 2: Expose with ngrok
ngrok http 3100
# Copy the https URL (e.g., https://abc123.ngrok.io)
```

Then add `https://abc123.ngrok.io/mcp` as a connector in ChatGPT.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Health check fails | Check if port 3100 is exposed |
| CORS errors | Already configured in server.ts |
| SSL issues | Verify Coolify/Traefik is generating certs |
| Can't find in ChatGPT | Refresh connector in Settings |
