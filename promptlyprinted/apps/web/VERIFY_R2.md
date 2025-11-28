# Verify R2 Storage is Active

## Quick Check

### 1. Restart your dev server
```bash
npm run dev
```

### 2. Look for startup logs

You should see:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗄️  STORAGE CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
☁️  Provider: S3-COMPATIBLE (Cloudflare R2, AWS S3, etc.)
📦 Bucket: promptlyprinted-images
🔗 Endpoint: https://7ba11196c7fd51940d7406b17b773014.r2.cloudflarestorage.com
🔑 Credentials: ✅ Configured
✅ Files are stored permanently
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If you see this ☝️ - R2 is active! ✅**

**If you see "LOCAL FILESYSTEM" ❌ - Check your .env file**

### 3. Upload a test image

1. Go to any product page
2. Generate a design
3. Check console logs for:
```
[Upload Image] Standard PNG uploaded successfully: https://pub-39f280c9d2f446668f96b18e8ef5109d.r2.dev/...
[Upload Image] ✅ Using CLOUD STORAGE (R2/S3) - URL is permanent
```

**Look for:**
- ✅ URL starts with `https://pub-...r2.dev`
- ✅ "Using CLOUD STORAGE" message

**Not:**
- ❌ URL starts with `/api/images/`
- ❌ "Using LOCAL STORAGE" warning

### 4. Verify in browser

Open the uploaded URL in a new tab - should display the image.

## Troubleshooting

### Still seeing "LOCAL FILESYSTEM"?

**Check:**
1. `.env` file has `STORAGE_PROVIDER=s3` (no quotes in .env file)
2. All S3_* variables are set
3. Restarted dev server after changing .env
4. Using `.env.local` or `.env` (not `.env.example`)

### Seeing S3 but missing credentials?

```
🔑 Credentials: ❌ Missing
```

**Fix:** Add to `.env`:
```
S3_ACCESS_KEY_ID=979f185e5e5af09b7203ed3c937436ed
S3_SECRET_ACCESS_KEY=12c50777f084de9331b31e142c59afb329f7dfc82d1b4f2e0ee51f26299c13fd
```

### Error: "S3 storage configuration missing"

Your environment variables aren't loading. Make sure the file is named exactly `.env.local` or `.env` in the `/apps/web/` directory.
