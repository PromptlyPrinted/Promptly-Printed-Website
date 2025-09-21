# Caddy Setup for Better Auth Session Sharing

## Install Caddy

### macOS
```bash
brew install caddy
```

### Other platforms
Download from: https://caddyserver.com/download

## Usage

1. **Start your Next.js apps:**
```bash
pnpm dev
```

2. **Start Caddy (in project root):**
```bash
caddy run
```

3. **Access your apps:**
- Admin app: http://localhost:8080/app
- Web app: http://localhost:8080/web
- Auth API: http://localhost:8080/api/auth

## How it works

- Both apps run on `localhost:8080` (same domain)
- Cookies are automatically shared
- Auth API is served from admin app
- No code changes needed!

## Update Environment Variables

You'll need to update your .env files to use the proxy URLs:

### apps/app/.env
```
BETTER_AUTH_URL="http://localhost:8080"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:8080"
```

### apps/web/.env
```
BETTER_AUTH_URL="http://localhost:8080"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:8080"
```