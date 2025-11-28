# Cloudflare R2 Storage Setup

## Quick Start

Your application is now configured to use Cloudflare R2 for persistent image storage. Follow these steps to enable it:

### 1. Create R2 Bucket
1. Go to https://dash.cloudflare.com/ → **R2**
2. Create bucket: `promptlyprinted-images`
3. Enable public access or set up custom domain

### 2. Get API Credentials
1. R2 → **Manage R2 API Tokens**
2. Create token with **Admin Read & Write**
3. Save Access Key ID and Secret Access Key

### 3. Set Environment Variables

**Local (.env.local):**
```bash
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_BUCKET_NAME=promptlyprinted-images
S3_ACCESS_KEY_ID=<your_access_key>
S3_SECRET_ACCESS_KEY=<your_secret_key>
S3_REGION=auto
S3_PUBLIC_URL=https://images.promptlyprinted.com
```

**Vercel:**
Add the same variables in: **Settings → Environment Variables**

### 4. Deploy/Restart

- **Local:** Restart dev server
- **Vercel:** Redeploy application

## Verification

✅ Upload test image → URL should be `https://images.promptlyprinted.com/...`
✅ Image accessible in browser
✅ Image persists after deployment

## Documentation

See [walkthrough.md](file:///.gemini/antigravity/brain/124c30c6-40c1-4816-8e46-ebb348136c6c/walkthrough.md) for detailed setup instructions.

## Cost

~$0.50-1.00/month for typical usage (10k images, 500k views)
