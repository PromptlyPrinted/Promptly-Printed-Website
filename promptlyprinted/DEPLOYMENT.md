# Multi-Subdomain Deployment Guide

## Production Architecture

```
promptlyprinted.com         → Web app (customer-facing)
app.promptlyprinted.com     → Admin app (business management)
auth.promptlyprinted.com    → Auth service (optional dedicated)
```

## Environment Configuration

### Production Environment Variables
```bash
# Auth Configuration
BETTER_AUTH_URL="https://promptlyprinted.com"
NEXT_PUBLIC_BETTER_AUTH_URL="https://promptlyprinted.com"

# App URLs
NEXT_PUBLIC_APP_URL="https://app.promptlyprinted.com"
NEXT_PUBLIC_WEB_URL="https://promptlyprinted.com"

# Security
NODE_ENV="production"
```

## Session Sharing Setup

The auth configuration is now set to:
- **Development**: Share cookies across `localhost` ports
- **Production**: Share cookies across `.promptlyprinted.com` subdomains

### Cookie Configuration
- Domain: `.promptlyprinted.com` (note the leading dot)
- Secure: `true` in production
- SameSite: `lax` (allows cross-subdomain)
- HttpOnly: `true` for security

## Deployment Options

### Option 1: Separate Vercel Deployments
```bash
# Deploy web app
cd apps/web
vercel --prod

# Deploy admin app
cd apps/app
vercel --prod
```

### Option 2: Monorepo with Custom Domains
1. Deploy as single Vercel project
2. Configure custom domains:
   - `promptlyprinted.com` → web app
   - `app.promptlyprinted.com` → admin app

### Option 3: Docker + Load Balancer
```yaml
# docker-compose.yml
services:
  web:
    build: ./apps/web
    ports: ["3001:3000"]

  admin:
    build: ./apps/app
    ports: ["3002:3000"]

  nginx:
    image: nginx
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

## DNS Configuration

```
A     promptlyprinted.com         → Your server IP
CNAME app.promptlyprinted.com     → promptlyprinted.com
CNAME auth.promptlyprinted.com    → promptlyprinted.com (optional)
```

## SSL Certificate

Use a wildcard certificate for `*.promptlyprinted.com` to cover all subdomains.

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Cookie Domain | `localhost` | `.promptlyprinted.com` |
| Secure Cookies | `false` | `true` |
| Base URL | `http://localhost:8888` | `https://promptlyprinted.com` |
| Session Sharing | Cross-port | Cross-subdomain |

## Why This Works Better Than Proxy

1. **No Single Point of Failure**: Each app can be deployed independently
2. **CDN Friendly**: Static assets can be served from CDN
3. **Scalable**: Can scale apps independently based on load
4. **Simpler Auth**: Standard cookie-based auth across subdomains
5. **Production Ready**: Standard web architecture pattern

## Migration Path

For your current development setup:
1. Keep using the proxy for development
2. Test subdomain setup in staging
3. Deploy to production with subdomain architecture
4. Eventually consolidate if desired

The auth configuration now automatically adapts to the environment!