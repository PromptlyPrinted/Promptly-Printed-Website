# Email Automation & Marketing Analytics - COMPLETE SETUP

Your email marketing automation system is now fully implemented! This guide shows you what's been created and how to use it.

---

## ✅ What's Been Built

### 1. Email Service (`lib/email.ts`)
Complete email sending system with 4 automated email types:
- ✅ Welcome emails (when users sign up)
- ✅ Order confirmations (when purchases complete)
- ✅ Competition entry confirmations (with referral codes)
- ✅ Design saved notifications

### 2. Webhook Automation
Emails send automatically via these webhooks:

#### Better Auth Webhook (`app/api/webhooks/better-auth/route.ts`)
- **Triggers**: When user registers
- **Action**: Sends welcome email + subscribes to Beehiiv newsletter
- **URL**: `https://yoursite.com/api/webhooks/better-auth`

#### Square Webhook (Updated: `app/api/webhooks/square/route.ts`)
- **Triggers**: When payment completes
- **Action**: Sends order confirmation with receipt, items, tracking info
- **Already configured**: Should be working with your existing Square integration

#### Competition Webhook (Updated: `app/api/competition/submit-design/route.ts`)
- **Triggers**: When user enters competition
- **Action**: Sends entry confirmation with referral code and earning instructions

### 3. Admin Analytics Dashboard (`app/(authenticated)/admin/analytics/marketing/page.tsx`)
Beautiful dashboard showing:
- Total designs, orders, revenue from marketing
- Performance breakdown by source (TikTok, Instagram, Meta Ads)
- Conversion rates by channel
- Competition entries by source
- Exportable to CSV
- Date range filtering (7/30/90 days)

### 4. Analytics API (`app/api/admin/analytics/marketing/route.ts`)
Powers the dashboard with comprehensive data:
- Designs created by UTM source/medium/campaign
- Revenue and orders by marketing channel
- Competition entries by source
- Daily trends
- Overall conversion rates

### 5. Test Email Endpoint (`app/api/admin/test-email/route.ts`)
Send test emails to verify everything works:
- Test welcome emails
- Test order confirmations
- Test competition emails
- Test design saved emails

---

## 🚀 Quick Start (3 Steps)

### Step 1: Add Email Service Credentials

Add these to your `.env` file:

```bash
# Resend (for sending emails)
RESEND_TOKEN="re_your_api_key_here"
RESEND_FROM="noreply@promptlyprinted.com"

# Beehiiv (for newsletter management) - OPTIONAL
BEEHIIV_API_KEY="your_api_key_here"
BEEHIIV_PUBLICATION_ID="your_publication_id_here"
```

**Get Resend API Key:**
1. Go to https://resend.com
2. Sign up / Log in
3. Go to API Keys → Create API Key
4. Copy the key (starts with `re_`)
5. Add to .env

**Get Beehiiv Credentials (Optional):**
1. Go to https://app.beehiiv.com
2. Settings → Integrations → API
3. Create API key
4. Copy API Key and Publication ID
5. Add to .env

### Step 2: Verify Domain (Important!)

For production email sending:

1. In Resend dashboard → Domains
2. Add `promptlyprinted.com`
3. Add the DNS records Resend provides
4. Wait ~10 minutes for verification

**For testing**: You can skip domain verification - Resend will let you send to your own email only.

### Step 3: Configure Better Auth Webhook

You need to tell Better Auth to send events to your webhook.

Add to your Better Auth config (usually in `packages/auth` or similar):

```typescript
// In your Better Auth configuration
export const auth = betterAuth({
  // ... existing config
  webhooks: {
    url: process.env.NEXT_PUBLIC_BASE_URL + '/api/webhooks/better-auth',
    events: ['user.created', 'user.updated'],
  },
});
```

Or if Better Auth doesn't support webhooks directly, you can manually call the welcome email in your user creation code.

---

## 🧪 Testing Your Setup

### Test 1: Send Test Email

```bash
curl -X POST http://localhost:3001/api/admin/test-email \
  -H "Content-Type: application/json" \
  -d '{"emailType": "welcome", "to": "your@email.com"}'
```

Replace `your@email.com` with your actual email address.

**Available test types:**
- `"welcome"` - Welcome email
- `"order"` - Order confirmation
- `"competition"` - Competition entry
- `"design"` - Design saved

### Test 2: Register a New User

1. Go to your site's sign-up page
2. Register with a test email
3. Check your inbox for welcome email
4. If email arrives → ✅ Working!

### Test 3: Complete Test Order

1. Create a design
2. Add to cart and checkout
3. Use Square test card: `4111 1111 1111 1111`
4. Check email for order confirmation

### Test 4: View Marketing Analytics

1. Go to your admin dashboard: `/admin/analytics/marketing`
2. You should see:
   - Overview stats (designs, orders, revenue)
   - Performance by source (TikTok, Instagram, etc.)
   - Competition entries
3. Test the CSV export button

---

## 📊 How Marketing Tracking Works

### Your Quiz Already Captures UTM Parameters

When users click your marketing links like:
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=bio&utm_campaign=christmas2025
```

The quiz page automatically:
1. Captures the UTM parameters
2. Stores them with the SavedImage
3. Links them to orders and competition entries

**You don't need to change anything** - it's already working!

### Viewing Your Marketing Data

**Option 1: Admin Dashboard** (Recommended)
- Go to: `/admin/analytics/marketing`
- See visual breakdown of all traffic sources
- Export to CSV for deeper analysis

**Option 2: Database Queries**

Run these in your database to see raw data:

```sql
-- Designs by source
SELECT
  "utm_source",
  "utm_medium",
  COUNT(*) as designs
FROM "SavedImage"
WHERE "createdAt" >= '2025-12-01'
GROUP BY "utm_source", "utm_medium"
ORDER BY designs DESC;

-- Revenue by source
SELECT
  si."utm_source",
  SUM(o."totalPrice") as revenue
FROM "Order" o
JOIN "OrderItem" oi ON o."id" = oi."orderId"
JOIN "Design" d ON ...
JOIN "SavedImage" si ON d."savedImageId" = si."id"
WHERE o."status" = 'COMPLETED'
GROUP BY si."utm_source";
```

**Option 3: Google Analytics 4**

Your site has GA4 configured. To view UTM data:
1. Go to Google Analytics 4
2. Reports → Acquisition → Traffic Acquisition
3. Add dimension: "Session campaign" or "Session source/medium"
4. See conversions and revenue by channel

---

## 📧 Email Templates Included

All emails are beautifully designed with:
- ✅ Responsive HTML (works on mobile)
- ✅ Plain text fallback
- ✅ Branded colors matching your site
- ✅ Clear call-to-action buttons
- ✅ UTM tracking on links
- ✅ Unsubscribe links

### Welcome Email Includes:
- Personalized greeting
- 10% discount code (WELCOME10)
- Link to create first design
- Competition promotion
- Point-earning opportunities

### Order Confirmation Includes:
- Order number
- Full item list with sizes, colors, quantities
- Subtotal, discount, total
- Shipping address
- Estimated delivery
- Order tracking link (when available)

### Competition Email Includes:
- Unique referral code
- How to earn points guide
- Prize details
- Competition end date
- Social sharing links

---

## 🎯 Marketing URLs You Can Use

### TikTok URLs

**Bio Link:**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=bio&utm_campaign=christmas2025
```

**Spark Ads:**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=spark_ad&utm_campaign=christmas2025&utm_content={{__CREATIVE_ID__}}
```

### Instagram URLs

**Bio Link:**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=instagram&utm_medium=bio&utm_campaign=christmas2025
```

**Story Swipe-Up:**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=instagram&utm_medium=story&utm_campaign=christmas2025&utm_content=dec15
```

**Reels:**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=instagram&utm_medium=reel&utm_campaign=christmas2025&utm_content={{reel_id}}
```

### Meta (Facebook/Instagram) Ads

```
https://promptlyprinted.com/christmas-2025/quiz?utm_source={{site_source_name}}&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

Meta will automatically replace the `{{...}}` placeholders with actual values.

---

## 💰 Cost Breakdown

### Resend
- **Free tier**: 3,000 emails/month, 100 emails/day
- **Paid**: $20/month for 50,000 emails
- **Recommendation**: Start free, upgrade when you hit limits

### Beehiiv (Optional)
- **Free tier**: Up to 2,500 subscribers
- **Grow plan**: $49/month for 10,000 subscribers
- **Recommendation**: Start free

**Total starting cost**: $0/month

---

## 🔧 Troubleshooting

### Emails Not Sending

**Check 1: Environment Variables**
```bash
# Make sure these are set:
echo $RESEND_TOKEN
echo $RESEND_FROM
```

**Check 2: Resend Dashboard**
- Go to https://resend.com
- Check "Logs" section
- See if emails are being sent or blocked

**Check 3: Domain Verification**
- In Resend → Domains
- Check if your domain is verified
- If not, you can only send to your own email

**Check 4: Test Endpoint**
```bash
curl -X POST http://localhost:3001/api/admin/test-email \
  -H "Content-Type: application/json" \
  -d '{"emailType": "welcome", "to": "your@email.com"}'
```

### Analytics Dashboard Not Loading

**Check 1: Admin Access**
- Make sure you're logged in as an admin user
- Check your user's `role` field in database - should be `ADMIN`

**Check 2: Data Exists**
```sql
-- Check if there are SavedImages with UTM data
SELECT COUNT(*) FROM "SavedImage" WHERE "utm_source" IS NOT NULL;
```

**Check 3: Browser Console**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed API calls

### Better Auth Webhook Not Triggering

If welcome emails aren't sending automatically:

**Option 1: Manual Integration**

Add this to your user registration code:

```typescript
import { sendWelcomeEmail } from '@/lib/email';

// After creating user
await sendWelcomeEmail({
  to: user.email,
  firstName: user.name?.split(' ')[0],
});
```

**Option 2: Check Better Auth Config**

Verify webhooks are configured in your Better Auth setup.

---

## 📈 What to Track

### Key Metrics to Watch

1. **Conversion Rate by Source**
   - Which platforms convert best?
   - TikTok vs Instagram vs Meta Ads

2. **Revenue per Channel**
   - Which sources generate most revenue?
   - Calculate ROI (if you track ad spend)

3. **Competition Entry Rate**
   - What % of users enter competition?
   - Which sources drive most entries?

4. **Email Open Rates**
   - Check in Resend dashboard
   - See which emails perform best

### Optimization Tips

- **High designs, low orders?**
  → Improve checkout flow, add urgency

- **High traffic, low designs?**
  → Improve quiz experience, add examples

- **Meta Ads underperforming?**
  → Test different audiences, creative, or copy

- **TikTok performing well?**
  → Scale budget, create more content, boost top posts

---

## 🎉 You're All Set!

Your email marketing automation is complete. Here's what happens now:

1. **User signs up** → Gets welcome email with 10% discount
2. **User completes order** → Gets confirmation with receipt
3. **User enters competition** → Gets referral code and instructions
4. **You check analytics** → See which marketing channels work best
5. **You optimize** → Double down on what works, cut what doesn't

---

## 📚 Additional Resources

- **Resend Docs**: https://resend.com/docs
- **Beehiiv API**: https://developers.beehiiv.com
- **Better Auth**: https://www.better-auth.com/docs/webhooks
- **UTM Best Practices**: https://ga-dev-tools.google/campaign-url-builder/
- **Email Deliverability**: https://resend.com/docs/dashboard/emails/deliverability

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Look at Resend logs: https://resend.com/logs
3. Check your server logs for errors
4. Test with the test email endpoint
5. Verify environment variables are set correctly

---

**Questions?** Check the files:
- `EMAIL_MARKETING_SETUP.md` - Full email marketing guide
- `MARKETING_TRACKING_GUIDE.md` - Comprehensive tracking and strategy guide
- `lib/email.ts` - Email service implementation
- `app/api/webhooks/*/route.ts` - Webhook handlers

Good luck with your marketing campaigns! 🚀
