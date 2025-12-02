# How Users Submit Designs to Competition

## Complete User Journey

### 1. CREATE DESIGN
```
User Flow:
1. User visits /christmas-2025/quiz
2. Completes 8-step style quiz
3. Gets personalized AI design recommendations
4. Clicks "Create Design & Enter Competition"
5. Redirected to design editor/offer page
6. AI generates custom design based on quiz answers
7. Design is saved to database as SavedImage + Design record
8. User gets designId
```

**Database Records Created:**
- `SavedImage` - The actual AI-generated image URL
- `Design` - Links SavedImage + Product + User

---

### 2. PURCHASE DESIGN
```
User Flow:
1. User reviews their generated design
2. Selects product options (size, color, quantity)
3. Clicks "Add to Cart" / "Checkout"
4. Proceeds to Stripe checkout
5. Completes payment
6. Order created with status = PENDING
7. Payment webhook fires → Order status = COMPLETED
8. User receives order confirmation email
```

**Database Records Created:**
- `Order` - Order record with userId, totalPrice, status
- `OrderItem` - Links Order + Product + Design/Customization
- `Payment` - Stripe payment record

**Key Point:** The design must be linked to the order somehow. This can be done via:
- `OrderItem.customizationId` → `Customization.artworkUrl` (points to design)
- `Order.metadata` → JSON with designId
- Create a direct `OrderItem.designId` field (requires migration)

---

### 3. SUBMIT TO COMPETITION

#### Option A: Automatic Submission (Recommended)
```
Automatic Flow:
1. Order status changes to COMPLETED
2. Stripe webhook or order completion handler calls:
   POST /api/competition/submit-design
3. System automatically:
   - Gets designId from Order metadata or OrderItem
   - Verifies order is paid
   - Creates CompetitionEntry
   - Awards entry points
   - Generates referral code
4. User gets email: "Your design has been entered into the competition!"
```

#### Option B: Manual Submission (What I Built)
```
Manual Flow:
1. User goes to /my-designs page
2. Sees all their designs with purchase status
3. Designs show "Purchase Required" or "Submit to Competition"
4. User clicks "Submit to Competition" button
5. POST /api/competition/submit-design { designId }
6. System verifies:
   - User owns design
   - Design has been purchased (Order exists)
   - Not already submitted
7. Creates CompetitionEntry
8. User sees success message with next steps
```

---

## File Structure

### Pages Users Visit:

```
User Journey Pages:
├── /christmas-2025/quiz              → Create design via quiz
├── /offer?designId=123               → Review & purchase design
├── /checkout                         → Stripe checkout
├── /order/confirmation?orderId=456   → Order confirmation
├── /my-designs                       → View all designs & submit
└── /competition/dashboard            → Track competition stats
```

### How It Currently Works (Based on Your Schema):

1. **SavedImage Table** - Stores the generated AI images
   - Has `userId`, `url`, `productId`
   - This is what shows in `/my-designs` page

2. **Design Table** - Links SavedImage + Product + User
   - Has `savedImageId`, `productId`, `userId`
   - Can be submitted to competition

3. **Order + OrderItem** - Tracks purchases
   - `OrderItem` has `customizationId` → `Customization.artworkUrl`
   - Need to link this back to `Design`

---

## The Missing Link: Order → Design

Currently, there's no direct link between Order and Design. Here's how to fix it:

### Solution 1: Store in Order Metadata (Quick)
```typescript
// When creating Stripe session
const session = await stripe.checkout.sessions.create({
  metadata: {
    orderId: order.id,
    designId: design.id, // Add this
    userId: user.id,
  },
});

// In webhook
const metadata = event.data.object.metadata;
// Now you can link order to design!
```

### Solution 2: Add Direct Link (Best)
```sql
-- Add designId to OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "designId" INTEGER;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_designId_fkey"
  FOREIGN KEY ("designId") REFERENCES "Design"("id");
```

Then in the order creation:
```typescript
await prisma.orderItem.create({
  data: {
    orderId: order.id,
    productId: product.id,
    designId: design.id, // Direct link!
    // ... other fields
  },
});
```

---

## Implementation Steps

### Step 1: Link Orders to Designs

Choose one approach above and implement it.

**Recommended:** Use Order metadata for quick implementation:

```typescript
// apps/web/app/api/checkout/route.ts (or wherever you create Stripe sessions)

const session = await stripe.checkout.sessions.create({
  line_items: [...],
  metadata: {
    orderId: order.id,
    designId: design.id,     // ADD THIS
    userId: user.id,
    referralCode: referralCode || null,
  },
});
```

### Step 2: Auto-Submit on Purchase (Optional but Recommended)

In your Stripe webhook:

```typescript
// apps/web/app/api/webhooks/stripe/route.ts

if (event.type === 'checkout.session.completed') {
  const metadata = event.data.object.metadata;

  // Auto-submit to competition
  if (metadata.designId) {
    await fetch('/api/competition/submit-design', {
      method: 'POST',
      body: JSON.stringify({
        designId: parseInt(metadata.designId),
        orderId: parseInt(metadata.orderId),
        autoSubmit: true,
      }),
    });
  }
}
```

### Step 3: Create "Get My Designs" API Endpoint

```typescript
// apps/web/app/api/designs/my-designs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all user's designs
  const designs = await prisma.design.findMany({
    where: { userId: session.user.id },
    include: {
      savedImage: true,
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // For each design, check if it's been purchased
  const designsWithPurchaseStatus = await Promise.all(
    designs.map(async (design) => {
      // Find order containing this design
      // This depends on how you store design info in orders
      const order = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          status: { in: ['COMPLETED', 'PROCESSING', 'SHIPPED'] },
          // You might need to query OrderItem or metadata here
        },
      });

      // Check competition entry status
      const entry = await prisma.competitionEntry.findFirst({
        where: {
          designId: design.id,
          competition: { isActive: true },
        },
        include: {
          _count: {
            select: { likes: true, votes: true },
          },
        },
      });

      return {
        id: design.id,
        name: design.name,
        imageUrl: design.savedImage.url,
        productName: design.product.name,
        createdAt: design.createdAt,
        hasPurchase: !!order,
        orderId: order?.id,
        orderStatus: order?.status,
        competitionEntry: entry
          ? {
              id: entry.id,
              submitted: true,
              likes: entry._count.likes,
              votes: entry._count.votes,
              // @ts-ignore
              referralCode: entry.referralCode,
            }
          : undefined,
      };
    })
  );

  return NextResponse.json({
    designs: designsWithPurchaseStatus,
  });
}
```

### Step 4: Get Active Competition Endpoint

```typescript
// apps/web/app/api/competition/current/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET() {
  const competition = await prisma.competition.findFirst({
    where: {
      isActive: true,
      endDate: { gte: new Date() },
    },
    orderBy: { startDate: 'desc' },
  });

  if (!competition) {
    return NextResponse.json({ error: 'No active competition' }, { status: 404 });
  }

  return NextResponse.json({
    id: competition.id,
    name: competition.theme,
    prize: competition.prize,
    endDate: competition.endDate,
    icon: competition.themeIcon,
  });
}
```

---

## User Experience

### After Purchase:
Users should see a prominent message:

```
✅ Order Confirmed!

Your design has been automatically entered into the Christmas Competition!

Win $500 USD by:
• Getting likes on your design (5 pts each)
• Uploading a photo wearing it (100 pts)
• Referring friends (150 pts each)

[View My Competition Dashboard] [Share My Design]
```

### In My Designs Page:
Each design shows:
- Design preview image
- Product name
- Purchase status (✅ Purchased or ❌ Not yet purchased)
- Competition status:
  - **Not purchased**: "Complete purchase to enter"
  - **Purchased but not submitted**: [Submit to Competition] button
  - **Submitted**: Shows likes, votes, referral code

---

## Quick Testing Guide

### Test the Flow:

1. **Create Design**
   ```
   Visit: /christmas-2025/quiz
   Complete quiz → Generate design
   Note the designId
   ```

2. **Purchase Design**
   ```
   Complete checkout with test Stripe card
   Verify Order created with status = COMPLETED
   Check Order.metadata has designId
   ```

3. **View My Designs**
   ```
   Visit: /my-designs
   Should see design with "Purchased" status
   Click "Submit to Competition"
   ```

4. **Verify Competition Entry**
   ```
   Check CompetitionEntry table has new record
   Check entry has orderId, purchaseVerified = true
   Check referralCode was generated
   ```

5. **Check Dashboard**
   ```
   Visit: /competition/dashboard
   Should show: Purchase verified ✅
   Should show: Referral code
   ```

---

## Summary

**The key insight**: Users don't "upload" their design - they submit the design they already created and purchased.

**The flow is:**
1. Create design (saved in database)
2. Purchase design (order links to design via metadata)
3. Submit to competition (creates CompetitionEntry linking design+order+user)

**What I built:**
✅ `/api/competition/submit-design` - Submit endpoint
✅ `/my-designs` page - View & submit designs
✅ Verification that design was purchased
✅ Auto-generation of referral codes
✅ Competition entry tracking

**What you need to do:**
1. Add `designId` to Stripe checkout metadata
2. Create `/api/designs/my-designs` endpoint (template above)
3. Create `/api/competition/current` endpoint (template above)
4. Optionally: Auto-submit after purchase in webhook

**Result:** Users can easily submit their purchased designs to win $500! 🎉
