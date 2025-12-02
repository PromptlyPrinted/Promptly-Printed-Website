# Competition Verification System - Complete Guide

## Overview

This document explains how each aspect of the Christmas competition is verified to prevent fraud and ensure fair play.

---

## 1. PURCHASE VERIFICATION ✅

### How It Works

**Automatic verification when order is completed.**

```
User Flow:
1. User completes quiz → Creates design → Adds to cart
2. Proceeds to checkout with Stripe
3. Payment successful → Order status = COMPLETED
4. Webhook/order handler calls: POST /api/competition/verify-purchase
5. System verifies:
   - Order exists
   - Order belongs to user
   - Order status is COMPLETED/SHIPPED
   - Order total > minimum amount
6. Competition entry created/updated with orderId
7. User automatically entered into competition
```

### Proof Required

- **Order ID**: Stored in `CompetitionEntry.orderId`
- **Purchase Status**: Order must be COMPLETED or SHIPPED
- **Timestamp**: Order creation date recorded
- **User Link**: Order.userId must match CompetitionEntry.userId

### Anti-Fraud Measures

- ✅ No manual claim needed (automatic)
- ✅ Cannot enter without real purchase
- ✅ Order refunds can trigger entry removal
- ✅ Duplicate orders from same user allowed (one entry per design)

### Database Schema

```prisma
model CompetitionEntry {
  orderId          Int?     // Links to Order.id
  purchaseVerified Boolean  @default(false)
  // ... other fields
}
```

### Implementation

**Stripe Webhook Handler** (Add this to your existing webhook):
```typescript
// apps/web/app/api/webhooks/stripe/route.ts

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;

  // Get order and design info
  const orderId = session.metadata.orderId;
  const designId = session.metadata.designId;
  const userId = session.metadata.userId;

  // Verify purchase and enter competition
  await fetch('/api/competition/verify-purchase', {
    method: 'POST',
    body: JSON.stringify({ orderId, designId, userId }),
  });
}
```

**Order Completion Handler**:
```typescript
// When order status changes to COMPLETED
await fetch('/api/competition/verify-purchase', {
  method: 'POST',
  body: JSON.stringify({
    orderId: order.id,
    designId: order.metadata.designId,
  }),
});
```

---

## 2. SOCIAL MEDIA FOLLOW VERIFICATION 👥

### How It Works

**Manual verification with screenshot proof.**

```
User Flow:
1. User claims they follow your social account
2. Enters platform (Instagram/Facebook/Twitter/TikTok)
3. Enters their username
4. OPTIONAL: Uploads screenshot as proof
5. Submission goes to admin review queue
6. Admin manually verifies within 24-48 hours
7. If verified: User gets +50 points
```

### Why Manual Verification?

**Option 1: Manual (RECOMMENDED)** ⭐
- ✅ Simple to implement
- ✅ No API keys needed
- ✅ Works for all platforms
- ❌ Requires admin time

**Option 2: API Integration** (Complex)
- Instagram: Requires Business account + API access
- Facebook: Graph API + OAuth flow
- Twitter: API v2 + OAuth 2.0
- TikTok: No public follower verification API
- ❌ Complex setup
- ❌ Rate limits
- ❌ Requires app review for each platform

**Option 3: OAuth Flow** (Most Secure but Complex)
- User connects their social account via OAuth
- App checks if they follow your account via API
- ✅ Fully automated
- ❌ Very complex
- ❌ Requires multiple app approvals

### Proof Required

- **Username**: User's handle on the platform
- **Platform**: Which social media (Instagram/Facebook/etc)
- **Screenshot** (optional but recommended): Photo of their follow status
- **Admin Verification**: Manual check by admin

### Implementation

**User Submission**:
```typescript
// User submits follow claim
const formData = new FormData();
formData.append('platform', 'instagram');
formData.append('username', '@johndoe');
formData.append('screenshot', screenshotFile);

await fetch('/api/competition/verify-social-follow', {
  method: 'POST',
  body: formData,
});
```

**Admin Verification** (Create this dashboard):
```typescript
// Admin panel to review pending social follows
GET /api/admin/competition/pending-verifications

Returns:
[
  {
    userId: "user_123",
    userName: "John Doe",
    platform: "instagram",
    username: "@johndoe",
    screenshotUrl: "https://...",
    submittedAt: "2025-12-15T10:30:00Z",
    status: "pending"
  }
]

// Admin approves
POST /api/admin/competition/approve-social/{userId}
{
  "approved": true,
  "notes": "Verified on Instagram @promptlyprinted"
}
```

### Admin Verification Process

1. Admin logs into dashboard
2. Sees list of pending social follow claims
3. For each claim:
   - Opens the social platform
   - Searches for the user's handle
   - Checks if they follow @promptlyprinted
   - Views screenshot if provided
4. Clicks "Approve" or "Reject"
5. If approved: System awards 50 points automatically
6. User gets email notification

### Anti-Fraud Measures

- ✅ Screenshot provides visual proof
- ✅ Admin can verify against actual follower list
- ✅ One claim per user (cannot re-claim)
- ✅ Username stored for audit trail
- ⚠️ Users can unfollow after verification (acceptable risk)

---

## 3. REFERRAL VERIFICATION 🔗

### How It Works

**Automatic tracking via unique referral codes.**

```
Complete Flow:
1. User A completes purchase → Gets entry
2. System generates unique code: XMAS-A1B2-C3D4E5
3. User A shares: yoursite.com/christmas-2025/quiz?ref=XMAS-A1B2-C3D4E5
4. User B clicks link → Cookie/session stores ref code
5. User B completes purchase
6. Order metadata includes: { referralCode: "XMAS-A1B2-C3D4E5" }
7. Order completion handler calls: POST /api/competition/complete-referral
8. System:
   - Verifies referral code is valid
   - Checks User B actually purchased (order completed)
   - Prevents self-referrals (User A ≠ User B)
   - Creates Referral record
   - Awards User A: +150 points
9. User A sees update in dashboard
```

### Proof Required

- **Referral Code**: Unique per user entry
- **Order ID**: Referred user must complete purchase
- **User IDs**: Referrer ≠ Referred (no self-referrals)
- **Timestamp**: Tracks when referral was completed

### Referral Code Generation

```typescript
// Format: XMAS-{userId_first4}-{entryId_first6}
const referralCode = `XMAS-${userId.slice(0, 4)}-${entryId.slice(0, 6)}`.toUpperCase();
// Example: XMAS-CM3A-BF9E2D
```

### Implementation

**1. Store Referral Code in Session** (Add to quiz page):
```typescript
// apps/web/app/christmas-2025/quiz/page.tsx

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');

  if (refCode) {
    // Store in localStorage for the session
    localStorage.setItem('referralCode', refCode);

    // Optional: Track click
    fetch('/api/competition/referral', {
      method: 'POST',
      body: JSON.stringify({ referralCode: refCode }),
    });
  }
}, []);
```

**2. Pass Referral Code to Checkout**:
```typescript
// When creating Stripe checkout session
const referralCode = localStorage.getItem('referralCode');

const session = await stripe.checkout.sessions.create({
  // ... other params
  metadata: {
    orderId: order.id,
    designId: design.id,
    userId: user.id,
    referralCode: referralCode, // Include here
  },
});
```

**3. Complete Referral After Payment**:
```typescript
// In Stripe webhook after successful payment
if (event.type === 'checkout.session.completed') {
  const metadata = event.data.object.metadata;

  if (metadata.referralCode) {
    await fetch('/api/competition/complete-referral', {
      method: 'POST',
      body: JSON.stringify({
        orderId: metadata.orderId,
        userId: metadata.userId,
        referralCode: metadata.referralCode,
      }),
    });
  }
}
```

### Anti-Fraud Measures

- ✅ Purchase required (no points without purchase)
- ✅ Unique codes prevent guessing
- ✅ Self-referral blocked (referrer ≠ referred)
- ✅ One-time per order (duplicate orders don't give duplicate points)
- ✅ Code linked to specific user (cannot transfer)
- Optional: IP address tracking
- Optional: Max 10 referrals per user
- Optional: Suspicious pattern detection (same IP, rapid referrals)

### Referral Limits (Optional Enhancement)

```typescript
// Add to complete-referral endpoint
const referralCount = await prisma.referral.count({
  where: {
    referrerId: referrerEntry.userId,
    status: 'completed',
  },
});

if (referralCount >= 10) {
  return NextResponse.json({
    error: 'Maximum referral limit reached',
  }, { status: 400 });
}
```

---

## 4. WEARING PHOTO VERIFICATION 📸

### How It Works

**User uploads photo, stored in R2 bucket.**

```
User Flow:
1. User goes to competition dashboard
2. Clicks "Upload Wearing Photo"
3. Selects photo from device
4. Photo uploaded to R2: competition-photos/{competitionId}/{userId}-{timestamp}.jpg
5. URL stored in CompetitionEntry.wearingPhotoUrl
6. Photo visible in user's dashboard
7. Automatically awards +100 points
8. Optional: Admin review for inappropriate content
```

### Proof Required

- **Photo File**: Uploaded to R2 bucket
- **Photo URL**: Stored in database
- **Entry ID**: Links photo to specific competition entry
- **Timestamp**: When photo was uploaded

### Storage Structure

```
R2 Bucket:
└── competition-photos/
    └── christmas-2025/
        ├── user_abc123-1703001234567.jpg
        ├── user_def456-1703002345678.jpg
        └── user_ghi789-1703003456789.jpg
```

### Implementation

Already implemented in:
- `/api/competition/upload-photo/route.ts`

### Anti-Fraud Measures

- ✅ File size limits (max 5MB)
- ✅ File type validation (images only)
- ✅ One upload per entry
- ✅ URL stored for review
- Optional: Image moderation API
- Optional: Manual admin review
- Optional: AI detection for fake/stock photos

### Content Moderation (Optional)

Use AWS Rekognition or similar:
```typescript
// Before awarding points
const moderationResult = await detectInappropriateContent(buffer);

if (moderationResult.isInappropriate) {
  return NextResponse.json({
    error: 'Photo violates content policy',
  }, { status: 400 });
}
```

---

## Database Schema

```sql
-- Add to CompetitionEntry
ALTER TABLE "CompetitionEntry" ADD COLUMN "orderId" INTEGER;
ALTER TABLE "CompetitionEntry" ADD COLUMN "purchaseVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "CompetitionEntry" ADD COLUMN "wearingPhotoUrl" TEXT;
ALTER TABLE "CompetitionEntry" ADD COLUMN "wearingPhotoVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "CompetitionEntry" ADD COLUMN "socialFollowVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "CompetitionEntry" ADD COLUMN "socialPlatform" TEXT;
ALTER TABLE "CompetitionEntry" ADD COLUMN "socialUsername" TEXT;
ALTER TABLE "CompetitionEntry" ADD COLUMN "referralCode" TEXT UNIQUE;

-- New Referral table
CREATE TABLE "Referral" (
  "id" TEXT PRIMARY KEY,
  "referrerId" TEXT NOT NULL,
  "referredUserId" TEXT,
  "orderId" INTEGER,
  "status" TEXT DEFAULT 'pending',
  "pointsAwarded" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP
);
```

---

## Admin Dashboard (To Build)

Create an admin panel at `/admin/competition` with:

### 1. Pending Verifications

```typescript
// Shows all pending social follows
[
  {
    user: "John Doe (@johndoe)",
    platform: "Instagram",
    username: "@johndoe",
    screenshot: "View",
    submittedAt: "2 hours ago",
    actions: [Approve, Reject]
  }
]
```

### 2. Suspicious Activity

```typescript
// Flags potential fraud
[
  {
    type: "Multiple referrals from same IP",
    user: "Jane Smith",
    details: "5 referrals in 10 minutes",
    severity: "high",
    actions: [Investigate, Dismiss]
  }
]
```

### 3. Leaderboard Management

- View all entries
- See verification status
- Manually adjust points (with audit log)
- Export data

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/competition/verify-purchase` | POST | Verify purchase & create entry | User |
| `/api/competition/verify-social-follow` | POST | Submit social follow claim | User |
| `/api/competition/verify-social-follow` | GET | Check verification status | User |
| `/api/competition/upload-photo` | POST | Upload wearing photo | User |
| `/api/competition/referral` | POST | Track referral click | Public |
| `/api/competition/referral` | GET | Get referral stats | User |
| `/api/competition/complete-referral` | POST | Complete referral after purchase | System |
| `/api/admin/competition/pending-verifications` | GET | View pending verifications | Admin |
| `/api/admin/competition/approve-social/:userId` | POST | Approve social follow | Admin |

---

## Security Checklist

- [ ] Purchase verification linked to real orders
- [ ] Self-referrals blocked
- [ ] Rate limiting on API endpoints
- [ ] File upload size limits
- [ ] Image type validation
- [ ] CSRF protection
- [ ] Admin authentication
- [ ] Audit logs for point adjustments
- [ ] Suspicious pattern detection
- [ ] Max referrals per user (optional)
- [ ] IP tracking for fraud detection (optional)

---

## Testing the System

### 1. Purchase Verification
```bash
# Create test order
# Mark as completed
# Call verify-purchase endpoint
# Check CompetitionEntry has orderId
```

### 2. Social Follow
```bash
# Submit follow claim
# Check pending status
# Admin approves
# Verify 50 points awarded
```

### 3. Referrals
```bash
# User A gets referral code
# User B clicks referral link
# User B completes purchase
# Verify User A gets 150 points
# Check Referral record created
```

### 4. Wearing Photo
```bash
# Upload photo to endpoint
# Check R2 bucket for file
# Verify 100 points awarded
# Check URL in database
```

---

## Next Steps

1. **Run Migration**: Apply database changes
   ```bash
   # Apply the migration SQL
   psql $DATABASE_URL < packages/database/migrations/add_verification_fields.sql
   ```

2. **Update Stripe Webhook**: Add referral code handling

3. **Build Admin Dashboard**: For social follow approvals

4. **Add to Order Completion**: Call verify-purchase automatically

5. **Test Each Flow**: Ensure all verifications work

6. **Monitor for Fraud**: Set up alerts for suspicious activity

---

## Summary

| Feature | Verification Method | Proof | Automation Level |
|---------|-------------------|-------|------------------|
| Purchase | Order ID linkage | Order record | ✅ Fully Automatic |
| Social Follow | Admin review + screenshot | Username + screenshot | ⚠️ Manual approval |
| Referral | Unique code tracking | Order metadata | ✅ Fully Automatic |
| Wearing Photo | R2 upload | Photo URL | ✅ Fully Automatic |

**All systems prevent common fraud vectors while maintaining user experience!** 🎉
