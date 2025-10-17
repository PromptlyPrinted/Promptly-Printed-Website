# Prodigi API Development Guide

## Understanding the Issue

The Prodigi API requires **publicly accessible HTTPS URLs** to download images for printing. This means:

- ❌ `http://localhost:3001/uploads/image.png` - **Does NOT work** (localhost is not accessible to Prodigi's servers)
- ❌ `data:image/png;base64,...` - **Does NOT work** (Prodigi doesn't accept base64/data URIs)
- ✅ `https://your-domain.com/uploads/image.png` - **Works** (publicly accessible)
- ✅ `https://your-vercel-app.vercel.app/uploads/image.png` - **Works** (publicly accessible)

## Solutions for Development Testing

### Option 1: Use a Tunneling Service (Recommended for Local Testing)

Use a service like ngrok or localtunnel to temporarily expose your localhost:

#### Using ngrok:
```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/download

# Start your Next.js app
pnpm turbo dev

# In another terminal, create a tunnel
ngrok http 3001

# Update your .env with the ngrok URL
NEXT_PUBLIC_WEB_URL="https://your-random-id.ngrok.io"
```

#### Using localtunnel:
```bash
# Install localtunnel
npm install -g localtunnel

# Start your Next.js app
pnpm turbo dev

# In another terminal, create a tunnel
lt --port 3001

# Update your .env with the localtunnel URL
NEXT_PUBLIC_WEB_URL="https://your-random-subdomain.loca.lt"
```

### Option 2: Use Prodigi's Sandbox API with Test Images

Use publicly hosted test images instead of uploading your own:

```typescript
// In your test code
const testImageUrl = 'https://pwintyimages.blob.core.windows.net/samples/stars/test-sample-grey.png';
```

### Option 3: Deploy to a Staging Environment

Deploy your app to Vercel (or any other hosting platform) for testing:

```bash
# Deploy to Vercel preview
vercel

# The preview URL will be something like:
# https://your-app-xyz123.vercel.app
```

Make sure your `.env.production` or Vercel environment variables have:
```env
NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL="your-app.vercel.app"
```

### Option 4: Use Cloud Storage (Recommended for Production)

For production, images should be uploaded to cloud storage:

#### Cloudflare R2 (S3-compatible, no egress fees):
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function uploadToR2(file: Buffer, filename: string): Promise<string> {
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: filename,
    Body: file,
  }));

  return `https://your-r2-public-domain.com/${filename}`;
}
```

#### AWS S3:
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadToS3(file: Buffer, filename: string): Promise<string> {
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: filename,
    Body: file,
    ACL: 'public-read',
  }));

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
}
```

## Current Implementation

The application saves base64 images to the local file system during checkout:

1. **Checkout API** (`apps/web/app/api/checkout/route.ts`):
   - Converts base64 images to files
   - Saves to `apps/web/public/uploads/checkout/`
   - Stores relative path in database (e.g., `/uploads/checkout/uuid.png`)

2. **Success Page** (`apps/web/app/checkout/success/page.tsx`):
   - Retrieves the relative path from database
   - Converts to absolute URL using `getImageUrl()`
   - Passes URL to Prodigi API

3. **Prodigi Service** (`apps/web/lib/prodigi.ts`):
   - Validates that URLs are publicly accessible
   - Rejects localhost URLs with helpful error message
   - Rejects data URIs (base64) with helpful error message

## Error Messages You Might See

### "Prodigi cannot access localhost URLs"
This means you're trying to send a `http://localhost:...` URL to Prodigi. Use one of the solutions above to make your local server publicly accessible.

### "Prodigi API does not accept base64/data URI images"
This means a data URI (starting with `data:image/...`) is being sent to Prodigi. These should be converted to uploaded files during checkout.

### "Failed to create order: Bad Request - ModelBindingFailed, InvalidDataType"
This is Prodigi's error when the URL format is invalid. Common causes:
- URL is not properly formatted
- URL is URL-encoded when it shouldn't be
- URL points to localhost or an inaccessible location

## Testing Your Fix

After implementing one of the solutions above:

1. Clear your cart
2. Add a product with a custom design
3. Go through checkout
4. Check the console logs to see the resolved image URLs
5. Verify the URL is publicly accessible by opening it in an incognito browser window
6. Complete the order
7. Check that the Prodigi order was created successfully

## Production Checklist

Before deploying to production:

- [ ] Images are uploaded to cloud storage (not saved locally)
- [ ] `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` is set correctly in production environment
- [ ] Test URL generation returns HTTPS URLs
- [ ] Test that Prodigi can successfully fetch your images
- [ ] Monitor logs for any URL-related errors
- [ ] Set up proper error handling for failed image uploads
