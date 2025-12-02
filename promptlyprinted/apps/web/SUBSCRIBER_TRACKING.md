# How to Track Newsletter Subscribers

## Method 1: Beehiiv Dashboard (Recommended)

### View All Subscribers
1. Go to https://app.beehiiv.com
2. Click **"Audience"** → **"Subscribers"**
3. See:
   - Total count
   - New subscribers this week/month
   - Subscriber details (email, name, signup date)
   - Activity status (active, inactive, unsubscribed)

### View Campaign Performance
1. Go to **"Posts"** → Click any sent campaign
2. Metrics shown:
   - **Open Rate**: % of people who opened (aim for 20-30%)
   - **Click Rate**: % who clicked links (aim for 2-5%)
   - **Unsubscribes**: Who left after this email
   - **Bounces**: Invalid email addresses

### Export Subscribers
1. Audience → **"Export Subscribers"**
2. Gets CSV file with:
   - Email addresses
   - Signup dates
   - UTM source/campaign data
   - Subscription status

### Segment Subscribers
1. Audience → **"Segments"**
2. Create groups like:
   - "Active users" (opened last 3 emails)
   - "Inactive" (haven't opened in 30 days)
   - "High engagers" (click rate > 10%)

---

## Method 2: Database Tracking (Advanced)

### Current Subscribers in Your Database

All users who sign up are automatically in your database. Check with:

```sql
-- Count all registered users (potential newsletter subscribers)
SELECT COUNT(*) as total_users
FROM "User"
WHERE "emailVerified" IS NOT NULL OR "emailVerified" IS NULL;

-- Users who signed up recently
SELECT
  "email",
  "name",
  "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 100;

-- Users by signup date
SELECT
  DATE("createdAt") as signup_date,
  COUNT(*) as signups
FROM "User"
GROUP BY DATE("createdAt")
ORDER BY signup_date DESC
LIMIT 30;
```

### Track Newsletter Subscription Status

**Option A: Add a field to User table**

Migration to add newsletter preference:
```sql
ALTER TABLE "User"
ADD COLUMN "subscribedToNewsletter" BOOLEAN DEFAULT true,
ADD COLUMN "newsletterSubscribedAt" TIMESTAMP,
ADD COLUMN "newsletterUnsubscribedAt" TIMESTAMP;
```

Then query:
```sql
-- Active newsletter subscribers
SELECT COUNT(*) FROM "User"
WHERE "subscribedToNewsletter" = true;

-- Unsubscribed users
SELECT COUNT(*) FROM "User"
WHERE "subscribedToNewsletter" = false;
```

**Option B: Separate NewsletterSubscription table**

```sql
CREATE TABLE "NewsletterSubscription" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "userId" TEXT,
  "subscribedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "unsubscribedAt" TIMESTAMP,
  "isActive" BOOLEAN DEFAULT true,
  "source" TEXT, -- 'signup', 'footer', 'quiz', etc.
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- Query active subscribers
SELECT COUNT(*) FROM "NewsletterSubscription"
WHERE "isActive" = true;

-- Subscribers by source
SELECT
  "source",
  COUNT(*) as subscribers
FROM "NewsletterSubscription"
WHERE "isActive" = true
GROUP BY "source";
```

---

## Method 3: Admin Dashboard (I Can Build This)

**What it would show:**

### Overview
- Total subscribers
- New this week/month
- Growth rate
- Unsubscribe rate

### Charts
- Signups over time (line chart)
- Subscribers by source (pie chart: signup, footer, quiz)
- Active vs inactive subscribers

### Recent Activity
- Latest 50 subscribers
- When they joined
- Which emails they've opened

### Export
- Download full subscriber list as CSV
- Filter by date range, source, activity

**Would you like me to build this?**

---

## Method 4: Google Sheets Sync (Automation)

You can set up automatic sync from Beehiiv to Google Sheets:

1. **Use Zapier or Make.com:**
   - Trigger: New subscriber in Beehiiv
   - Action: Add row to Google Sheets

2. **Benefits:**
   - Always-updated subscriber list
   - Easy to share with team
   - Can add formulas for analysis
   - Track growth over time

---

## Method 5: API Queries (For Developers)

### Get Beehiiv Subscriber Count via API

```bash
curl https://api.beehiiv.com/v2/publications/YOUR_PUB_ID/subscriptions \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Returns:
```json
{
  "data": [
    {
      "id": "sub_123",
      "email": "user@example.com",
      "status": "active",
      "created": "2025-12-01T10:00:00Z"
    }
  ],
  "total": 1250
}
```

### Build Dashboard API Endpoint

Create `/api/admin/subscribers/stats`:

```typescript
export async function GET() {
  // Fetch from Beehiiv API
  const beehiivResponse = await fetch(
    `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/stats`,
    {
      headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` }
    }
  );

  const stats = await beehiivResponse.json();

  // Also get from your database
  const dbSubscribers = await prisma.user.count();

  return {
    total: stats.total_subscribers,
    active: stats.active_subscribers,
    databaseUsers: dbSubscribers,
    growth: stats.growth_rate
  };
}
```

---

## Quick Reference: Where to Check What

| What You Want to Know | Where to Look |
|----------------------|---------------|
| **Total subscribers** | Beehiiv → Audience (top right) |
| **Who subscribed today** | Beehiiv → Audience → Sort by date |
| **Email campaign performance** | Beehiiv → Posts → Click campaign |
| **Subscriber growth chart** | Beehiiv → Analytics |
| **All user emails** | Database: `SELECT email FROM "User"` |
| **Recent signups** | Database: `SELECT * FROM "User" ORDER BY "createdAt" DESC` |
| **Export full list** | Beehiiv → Audience → Export |

---

## Testing Subscriber Tracking

### Test 1: Verify Beehiiv Integration

```bash
# Check if API credentials work
curl https://api.beehiiv.com/v2/publications/YOUR_PUB_ID/subscriptions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

Should return your subscriber list.

### Test 2: Register New User

1. Go to your site's `/sign-up` page
2. Register with test email: `test+123@yourdomain.com`
3. Wait 30 seconds
4. Check Beehiiv → Audience
5. Should see new subscriber!

### Test 3: Check Database

```sql
-- See latest user
SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 1;
```

---

## My Recommendation

**Start with:** Beehiiv Dashboard (Method 1)
- Zero setup required
- All analytics built-in
- Easy to export data

**Add later:** Database tracking (Method 2)
- If you want more control
- If you need custom segments
- If you want offline access

**Optional:** Admin dashboard (Method 3)
- If you want a unified view
- If you have a team managing subscribers
- If you want custom metrics

**Advanced:** API integration (Method 5)
- If you're building custom features
- If you want automated reports
- If you need real-time sync

---

## Common Questions

**Q: Can I see who unsubscribed?**
A: Yes - Beehiiv → Audience → Filter by "Unsubscribed"

**Q: Can I re-subscribe someone?**
A: Yes, but only if they request it. Export their email, manually re-add.

**Q: How do I remove someone completely?**
A: Beehiiv → Audience → Find subscriber → Delete

**Q: Can I import existing email list?**
A: Yes - Beehiiv → Audience → Import → Upload CSV

**Q: Do social logins (Google/Apple) get subscribed?**
A: Yes! The welcome API endpoint handles all signup methods.

**Q: What if Beehiiv API fails?**
A: The code logs the error but doesn't block signup. User still gets created, just not added to newsletter.

---

Let me know if you want me to build the admin dashboard (Method 3) for you!
