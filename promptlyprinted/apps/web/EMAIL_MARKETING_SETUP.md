# Email Marketing & Analytics Tracking Setup Guide

Complete guide for setting up email marketing automation and tracking your marketing campaigns.

---

## Table of Contents

1. [How to Track Marketing Links](#how-to-track-marketing-links)
2. [Email Marketing Overview](#email-marketing-overview)
3. [Setting Up Resend for Transactional Emails](#setting-up-resend)
4. [Setting Up Beehiiv for Marketing Emails](#setting-up-beehiiv)
5. [Automated Email Sequences](#automated-email-sequences)
6. [Analytics Dashboard](#analytics-dashboard)

---

## How to Track Marketing Links

### What Gets Tracked Automatically

Your application **already tracks** all marketing links! Here's what happens:

#### 1. **Quiz Page Tracking**

When someone visits your quiz with UTM parameters:
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=bio&utm_campaign=christmas2025
```

The quiz page captures these values (see `apps/web/app/christmas-2025/quiz/page.tsx` lines 44-49):
```typescript
const utmSource = searchParams.get('utm_source') || undefined;
const utmMedium = searchParams.get('utm_medium') || undefined;
const utmCampaign = searchParams.get('utm_campaign') || undefined;
const utmContent = searchParams.get('utm_content') || undefined;
const utmTerm = searchParams.get('utm_term') || undefined;
```

And stores them in the `answers` state (lines 52-61), which eventually gets saved to the database.

#### 2. **Where UTM Data is Stored**

When users create designs, UTM parameters are saved in:
- **`SavedImage` table** - Each generated image stores utm_source, utm_medium, utm_campaign
- **`Design` table** - Design records linked to saved images
- **`Order` table** - Orders can include UTM data from the session

### How to View Tracking Data

#### Option 1: Database Queries (Easiest)

Run these queries in your database to see what's working:

```sql
-- See total designs created per marketing source
SELECT
  "utm_source",
  "utm_medium",
  "utm_campaign",
  COUNT(*) as total_designs,
  COUNT(DISTINCT "userId") as unique_users
FROM "SavedImage"
WHERE "createdAt" >= '2025-12-01'  -- Adjust date
GROUP BY "utm_source", "utm_medium", "utm_campaign"
ORDER BY total_designs DESC;

-- Result example:
-- utm_source | utm_medium | utm_campaign    | total_designs | unique_users
-- tiktok     | bio        | christmas2025   | 145           | 98
-- instagram  | story      | christmas2025   | 87            | 64
-- tiktok     | spark_ad   | christmas2025   | 156           | 112
```

```sql
-- Revenue by marketing source
SELECT
  si."utm_source",
  si."utm_medium",
  COUNT(DISTINCT o."id") as total_orders,
  SUM(o."totalPrice") as total_revenue,
  AVG(o."totalPrice") as avg_order_value
FROM "Order" o
JOIN "OrderItem" oi ON o."id" = oi."orderId"
JOIN "SavedImage" si ON oi."customization" ->> 'designUrl' LIKE '%' || si."url" || '%'
WHERE o."status" = 'COMPLETED'
GROUP BY si."utm_source", si."utm_medium"
ORDER BY total_revenue DESC;
```

```sql
-- Competition entries by source
SELECT
  si."utm_source",
  COUNT(ce."id") as competition_entries
FROM "CompetitionEntry" ce
JOIN "Design" d ON ce."designId" = d."id"
JOIN "SavedImage" si ON d."savedImageId" = si."id"
GROUP BY si."utm_source"
ORDER BY competition_entries DESC;
```

#### Option 2: Create an Admin Analytics Dashboard

I'll create an admin page that shows this data visually below.

#### Option 3: Google Analytics (If Set Up)

Your app has Google Analytics configured (`NEXT_PUBLIC_GA_MEASUREMENT_ID` in env).

To view UTM data in GA4:
1. Go to **Google Analytics 4**
2. Navigate to **Reports → Acquisition → Traffic Acquisition**
3. Add secondary dimension: **Session campaign** or **Session source/medium**
4. Filter by date range
5. See conversions, revenue, etc. by source

---

## Email Marketing Overview

### Current Situation

**What you have:**
- ✅ **Resend** configured (for sending emails)
- ✅ **Beehiiv** configured (for newsletter management)
- ✅ Users register with email (via Better Auth)
- ❌ **No automated emails** sending when users register
- ❌ **No welcome sequence**
- ❌ **No order confirmation emails**
- ❌ **No abandoned cart emails**

**What users currently experience:**
- User signs up → **Nothing happens** ❌
- User creates design → **No email** ❌
- User completes purchase → **No confirmation email** ❌
- User enters competition → **No notification** ❌

### What We'll Set Up

1. **Transactional Emails (Resend)** - Triggered by user actions
   - Welcome email when user signs up
   - Order confirmation
   - Competition entry confirmation
   - Design saved notification

2. **Marketing Emails (Beehiiv)** - Newsletters, promotions
   - Weekly design showcase
   - Competition updates
   - Special offers

---

## Setting Up Resend

### What is Resend?

Resend is a developer-first email service. Perfect for transactional emails (order confirmations, welcome emails, etc.).

### 1. Get Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up / Log in
3. Go to **API Keys**
4. Click **Create API Key**
5. Name it "Promptly Printed Production"
6. Copy the key (starts with `re_...`)

### 2. Configure Environment Variables

Add to your `.env`:
```bash
RESEND_TOKEN="re_your_api_key_here"
RESEND_FROM="noreply@promptlyprinted.com"
```

**Important:** You need to verify your sending domain first:
1. In Resend dashboard → **Domains**
2. Add `promptlyprinted.com`
3. Add DNS records (Resend will show you which ones)
4. Wait for verification (~10 minutes)

**For testing:** You can use Resend's free tier without domain verification (sends to your own email only).

### 3. Install Resend Package

```bash
cd apps/web
pnpm add resend
```

### 4. Create Email Utility

I'll create this below.

---

## Setting Up Beehiiv

### What is Beehiiv?

Beehiiv is a newsletter platform. Great for marketing emails, subscriber management, and analytics.

### 1. Get Beehiiv API Credentials

1. Go to [https://app.beehiiv.com](https://app.beehiiv.com)
2. Go to **Settings → Integrations → API**
3. Create an API key
4. Copy **API Key** and **Publication ID**

### 2. Configure Environment Variables

Add to your `.env`:
```bash
BEEHIIV_API_KEY="your_api_key_here"
BEEHIIV_PUBLICATION_ID="your_publication_id_here"
```

### 3. How It Works

- **Resend** = Sends the actual emails
- **Beehiiv** = Manages your subscriber list and newsletters

When a user signs up:
1. Add them to Beehiiv (so they get newsletters)
2. Send welcome email via Resend (instant transactional email)

---

## Automated Email Sequences

### Email Sequence Overview

Here's what emails should send automatically:

| Trigger | Email Type | When | Purpose |
|---------|-----------|------|---------|
| **User signs up** | Welcome Email | Immediately | Introduce brand, next steps |
| **Design created** | Design Saved | Immediately | Confirm save, encourage purchase |
| **Order placed** | Order Confirmation | Immediately | Receipt, tracking info |
| **Competition entry** | Entry Confirmed | Immediately | Competition details, referral code |
| **Cart abandoned** | Reminder | 24 hours later | Encourage completion |
| **No activity 7 days** | Re-engagement | 7 days | Discount offer, new designs |

### Email Templates

I'll create production-ready email templates below with:
- Responsive HTML
- Plain text fallback
- Tracking links
- Clear CTAs

---

## Files I'm Creating for You

### 1. Email Service (`lib/email.ts`)
Central email sending service using Resend.

### 2. Email Templates (`emails/`)
Folder with all email templates:
- `welcome.tsx` - Welcome email
- `order-confirmation.tsx` - Order receipt
- `competition-entry.tsx` - Competition confirmed
- `design-saved.tsx` - Design saved notification

### 3. Webhook Handlers
Update your auth webhook to send welcome emails.

### 4. Admin Analytics Dashboard (`app/api/admin/analytics/marketing/route.ts`)
API endpoint that returns marketing performance data.

### 5. Admin Analytics Page (`app/(authenticated)/admin/analytics/marketing/page.tsx`)
Visual dashboard showing:
- Traffic by source (TikTok, Instagram, etc.)
- Conversion rates
- Revenue by channel
- Top-performing campaigns

---

## Quick Start Steps

### Step 1: Set Up Resend (5 minutes)

```bash
# 1. Get API key from https://resend.com
# 2. Add to .env
echo 'RESEND_TOKEN="re_your_key"' >> .env
echo 'RESEND_FROM="noreply@promptlyprinted.com"' >> .env

# 3. Install package
cd apps/web
pnpm add resend
```

### Step 2: Set Up Beehiiv (5 minutes)

```bash
# 1. Get credentials from https://app.beehiiv.com
# 2. Add to .env
echo 'BEEHIIV_API_KEY="your_key"' >> .env
echo 'BEEHIIV_PUBLICATION_ID="your_id"' >> .env
```

### Step 3: Deploy Email Files (I'll create these)

```bash
# Files I'm creating:
apps/web/lib/email.ts                           # Email service
apps/web/emails/templates/welcome.tsx           # Welcome email
apps/web/emails/templates/order-confirmation.tsx # Order email
apps/web/emails/templates/competition-entry.tsx  # Competition email
apps/web/app/api/webhooks/better-auth/route.ts  # Auth webhook
apps/app/app/api/admin/analytics/marketing/route.ts # Analytics API
apps/app/app/(authenticated)/admin/analytics/marketing/page.tsx # Dashboard
```

### Step 4: Test

```bash
# Send test email
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com"}'
```

---

## Email Automation Examples

### When User Signs Up

**File**: `apps/web/app/api/webhooks/better-auth/route.ts`

```typescript
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
  const event = await req.json();

  if (event.type === 'user.created') {
    const { email, firstName } = event.data;

    // Send welcome email via Resend
    await sendWelcomeEmail({
      to: email,
      firstName: firstName || 'there',
    });

    // Add to Beehiiv newsletter
    await fetch('https://api.beehiiv.com/v2/publications/' + process.env.BEEHIIV_PUBLICATION_ID + '/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'website',
        utm_campaign: 'signup',
      }),
    });
  }

  return Response.json({ success: true });
}
```

### When Order is Completed

**File**: `apps/web/app/api/webhooks/square/route.ts` (add to existing webhook)

```typescript
import { sendOrderConfirmation } from '@/lib/email';

// After order status changes to COMPLETED
if (payment.status === 'COMPLETED') {
  const order = await prisma.order.findUnique({
    where: { id: updatedOrder.id },
    include: { orderItems: true, recipient: true },
  });

  await sendOrderConfirmation({
    to: order.recipient.email,
    orderNumber: order.id.toString(),
    items: order.orderItems,
    total: order.totalPrice,
    trackingUrl: order.trackingUrl,
  });
}
```

### When User Enters Competition

**File**: `apps/web/app/api/competition/submit-design/route.ts` (already exists, add email)

```typescript
import { sendCompetitionEntryEmail } from '@/lib/email';

// After creating competition entry
await sendCompetitionEntryEmail({
  to: session.user.email,
  referralCode: referralCode,
  competitionName: competition.theme,
  prize: competition.prize,
  endDate: competition.endDate,
});
```

---

## Analytics Dashboard Preview

Your admin dashboard will show:

### Marketing Performance Table

| Source | Medium | Visitors | Designs | Orders | Revenue | ROI |
|--------|--------|----------|---------|--------|---------|-----|
| TikTok | Bio | 1,245 | 234 | 45 | £1,350 | - |
| TikTok | Spark Ad | 3,456 | 567 | 123 | £3,690 | 184% |
| Instagram | Bio | 890 | 156 | 34 | £1,020 | - |
| Instagram | Story | 567 | 89 | 19 | £570 | - |
| Facebook | Paid | 2,345 | 456 | 98 | £2,940 | 147% |

### Conversion Funnel

```
TikTok Spark Ad Campaign:
├── 3,456 Visitors (100%)
├── 567 Designs Created (16.4% conversion)
├── 234 Added to Cart (6.8%)
├── 123 Completed Purchase (3.6%)
└── £3,690 Revenue (£30 per order)
```

### Top Campaigns (Last 30 Days)

1. **TikTok Spark Ads - Christmas 2025**: £3,690 revenue, 123 orders
2. **Facebook Ads - Holiday Gift**: £2,940 revenue, 98 orders
3. **Instagram Stories - Competition**: £1,020 revenue, 34 orders

---

## Cost Breakdown

### Email Services

**Resend:**
- Free tier: 3,000 emails/month, 100 emails/day
- Paid: $20/month for 50,000 emails
- **Recommended**: Start free, upgrade when you hit limits

**Beehiiv:**
- Free tier: Up to 2,500 subscribers
- Grow plan: $49/month for 10,000 subscribers
- **Recommended**: Start free

### Total Monthly Cost

- **Starting out**: $0/month (both free tiers)
- **Growing**: $20-69/month (Resend paid + Beehiiv paid)
- **Scaled**: $100-200/month (higher tiers)

---

## Next Steps After I Create Files

1. **Get API keys** (Resend + Beehiiv) - 10 minutes
2. **Add to .env** - 2 minutes
3. **Install packages** - 1 minute
4. **Deploy updated code** - 5 minutes
5. **Send test email** - 1 minute
6. **Set up first campaign** - 20 minutes

**Total setup time: ~40 minutes**

---

## Testing Your Setup

### Test Welcome Email

```bash
# Register a new user with your email
# Go to /sign-up and create account
# Check your inbox for welcome email
```

### Test Order Confirmation

```bash
# Complete a test order
# Use Square test card: 4111 1111 1111 1111
# Check email for order confirmation
```

### Test Analytics Dashboard

```bash
# Go to /admin/analytics/marketing
# See breakdown of all traffic sources
# Export data to CSV
```

---

## Support Resources

- **Resend Docs**: https://resend.com/docs
- **Beehiiv API**: https://developers.beehiiv.com
- **Better Auth Webhooks**: https://www.better-auth.com/docs/webhooks
- **React Email** (for templates): https://react.email

---

Let me know when you've added the API keys to your .env and I'll create all the email files! 🚀
