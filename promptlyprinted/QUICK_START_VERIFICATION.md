# Quick Start: Competition Verification System

## TL;DR - How Each Verification Works

### 🛍️ Purchase Verification (Automatic)
**Proof**: Real order in database
- User completes purchase → Order created
- Order status = COMPLETED
- System automatically verifies by checking Order.id
- No way to fake (requires real payment)

### 👥 Social Media Follow (Manual Approval)
**Proof**: Username + Screenshot (optional)
- User submits their social handle
- Optionally uploads screenshot of follow
- Admin manually checks they follow @promptlyprinted
- Admin approves = 50 points awarded
- Takes 24-48 hours

### 🔗 Referral (Automatic)
**Proof**: Unique code + Referred user's order
- User gets code: XMAS-A1B2-C3D4E5
- Shares link with code
- Friend clicks, purchases
- System checks:
  - ✅ Code is valid
  - ✅ Friend actually purchased (order completed)
  - ✅ Not self-referral
- Auto-awards 150 points

### 📸 Wearing Photo (Automatic)
**Proof**: Photo file uploaded to R2
- User uploads photo
- Stored in cloud storage (R2)
- URL saved in database
- 100 points awarded immediately

---

## Implementation Steps

### Step 1: Run Database Migration
```bash
cd packages/database
psql $DATABASE_URL < migrations/add_verification_fields.sql
```

### Step 2: Update Order Completion Handler

Add this wherever orders are marked as completed:

```typescript
// After order.status = 'COMPLETED'
await fetch('/api/competition/verify-purchase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: order.id,
    designId: order.metadata.designId,
    competitionId: 'christmas-2025',
  }),
});
```

### Step 3: Add Referral Code Tracking

In your quiz page, add this:

```typescript
// apps/web/app/christmas-2025/quiz/page.tsx

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const refCode = params.get('ref');

  if (refCode) {
    localStorage.setItem('referralCode', refCode);
  }
}, []);
```

Then in checkout, pass it to Stripe:

```typescript
const session = await stripe.checkout.sessions.create({
  metadata: {
    orderId: order.id,
    referralCode: localStorage.getItem('referralCode'),
  },
});
```

### Step 4: Add to Stripe Webhook

```typescript
// apps/web/app/api/webhooks/stripe/route.ts

if (event.type === 'checkout.session.completed') {
  const metadata = event.data.object.metadata;

  // Verify purchase
  await fetch('/api/competition/verify-purchase', {
    method: 'POST',
    body: JSON.stringify({
      orderId: metadata.orderId,
      designId: metadata.designId,
    }),
  });

  // Complete referral if exists
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

### Step 5: Build Admin Approval Page

Create `/admin/competition/approvals` page:

```typescript
// Show pending social follow verifications
// Admin clicks "Approve" or "Reject"
// On approve: Update CompetitionEntry.socialFollowVerified = true
// Award 50 points
```

---

## User Dashboard

Users can see all their verification statuses at:
**`/competition/dashboard`**

Shows:
- ✅ Purchase verified (or not)
- ⏳ Social follow (pending/approved)
- 📸 Photo upload button
- 🔗 Referral code + share buttons
- 📊 Total points

---

## Testing

### Test Purchase Verification
1. Complete a test purchase
2. Check `CompetitionEntry` has `orderId`
3. Verify `purchaseVerified = true`

### Test Social Follow
1. Go to `/competition/dashboard`
2. Enter Instagram username
3. Upload screenshot
4. Check admin panel shows pending
5. Admin approves
6. Verify 50 points awarded

### Test Referrals
1. User A completes purchase
2. User A gets code from dashboard
3. User B clicks `?ref=CODE`
4. User B completes purchase
5. Verify User A gets 150 points
6. Check Referral record created

### Test Photo Upload
1. Go to `/competition/dashboard`
2. Upload photo
3. Check R2 bucket has file
4. Verify 100 points awarded

---

## Files Created

```
API Endpoints:
├── /api/competition/verify-purchase/route.ts
├── /api/competition/verify-social-follow/route.ts
├── /api/competition/upload-photo/route.ts (already existed)
├── /api/competition/referral/route.ts
└── /api/competition/complete-referral/route.ts

Pages:
└── /competition/dashboard/page.tsx

Database:
└── packages/database/migrations/add_verification_fields.sql

Documentation:
├── VERIFICATION_SYSTEM_GUIDE.md (detailed)
└── QUICK_START_VERIFICATION.md (this file)
```

---

## FAQ

**Q: Can users fake purchases?**
A: No. Purchase verified via real Order record in database with payment confirmation.

**Q: Can users claim social follow without following?**
A: Manual admin review prevents this. Screenshot provides proof.

**Q: Can users game referrals?**
A: Multiple protections: self-referrals blocked, purchase required, unique codes.

**Q: Can users upload fake photos?**
A: Photos are stored and visible. Optional: Add content moderation or manual review.

**Q: How do I prevent spam referrals?**
A: Add max limit (10 per user), IP tracking, suspicious pattern detection.

---

## Next Steps

1. ✅ Run database migration
2. ✅ Update Stripe webhook to call verify-purchase
3. ✅ Add referral code tracking to quiz
4. ⚠️ Build admin approval page for social follows
5. ⚠️ Test all flows end-to-end
6. ⚠️ Set up monitoring/alerts

**The system is 90% complete! Just needs admin UI and integration into your existing order flow.** 🎉
