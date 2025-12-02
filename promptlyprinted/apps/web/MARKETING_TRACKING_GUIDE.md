# Marketing Tracking & Campaign Guide

Complete guide for tracking TikTok, Instagram, Meta (Facebook) Ads, and Spark Ads campaigns for Promptly Printed.

---

## Table of Contents
1. [UTM Tracking Structure](#utm-tracking-structure)
2. [TikTok Tracking & Strategy](#tiktok-tracking--strategy)
3. [Instagram Tracking & Strategy](#instagram-tracking--strategy)
4. [Meta (Facebook) Ads Tracking & Strategy](#meta-facebook-ads-tracking--strategy)
5. [Spark Ads (TikTok) Tracking & Strategy](#spark-ads-tiktok-tracking--strategy)
6. [Campaign URL Examples](#campaign-url-examples)
7. [How to Track Performance](#how-to-track-performance)

---

## UTM Tracking Structure

UTM parameters are added to URLs to track where traffic comes from. Your system already captures these in the quiz:

```typescript
utm_source      // Platform (tiktok, instagram, facebook, etc.)
utm_medium      // Type of traffic (organic, paid, story, etc.)
utm_campaign    // Campaign name (christmas2025, summer_sale, etc.)
utm_content     // Specific ad or post ID
utm_term        // Keyword or audience segment
```

### Base URLs for Campaigns

**Christmas Competition:**
```
https://promptlyprinted.com/christmas-2025/quiz
```

**Main Site:**
```
https://promptlyprinted.com
```

**Specific Product:**
```
https://promptlyprinted.com/products/mens/t-shirts/TEE-SS-STTU755
```

---

## TikTok Tracking & Strategy

### 🎯 TikTok Organic (Non-Paid)

**Best Use Cases:**
- Behind-the-scenes design process
- Customer unboxing videos
- Design tutorials and tips
- Trending audio challenges with your products

**Tracking URLs:**

```
# Link in bio
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=bio&utm_campaign=christmas2025

# Specific video post
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=organic&utm_campaign=christmas2025&utm_content=video123

# Story/Highlights
https://promptlyprinted.com?utm_source=tiktok&utm_medium=story&utm_campaign=christmas2025&utm_content=story_dec15
```

**Content Strategy:**

1. **Hook-First Content (First 3 Seconds)**
   - "POV: You just won $500"
   - "This AI designed my Christmas sweater"
   - "Watch this design transform"

2. **Trending Sounds**
   - Use popular Christmas music with your design process
   - "Satisfying" sounds for design reveals
   - Before/after transformations

3. **Hashtag Strategy**
   ```
   #CustomApparel #AIDesign #ChristmasCompetition
   #SmallBusiness #PrintOnDemand #DesignYourOwn
   #TikTokMadeMeBuyIt #ChristmasShopping #UniqueGifts
   ```

4. **Posting Schedule**
   - **Best times**: 7-9 AM, 12-1 PM, 7-11 PM GMT
   - **Frequency**: 2-3 times per day
   - **Video length**: 15-30 seconds (max retention)

5. **Call-to-Action**
   - "Link in bio to enter the £500 competition"
   - "Use code TIKTOK10 for 10% off"
   - "Comment 'DESIGN' for the link"

**Example Video Scripts:**

```
🎄 SCRIPT 1: "AI Design Reveal"
[0-3s] Hook: "Watch AI design my Christmas sweater"
[3-10s] Screen recording of quiz answers
[10-20s] AI generating design (sped up)
[20-25s] Final product reveal
[25-30s] CTA: "Link in bio to create yours + win $500"
```

```
🎄 SCRIPT 2: "Customer Transformation"
[0-3s] Hook: "She uploaded a photo and got THIS"
[3-15s] Show customer's reference image
[15-25s] AI-generated design on product
[25-30s] "Enter competition link in bio"
```

---

## Instagram Tracking & Strategy

### 📸 Instagram Organic

**Best Use Cases:**
- Product photography (carousel posts)
- Reels with design process
- Stories with polls/engagement
- User-generated content reposts

**Tracking URLs:**

```
# Link in bio
https://promptlyprinted.com/christmas-2025/quiz?utm_source=instagram&utm_medium=bio&utm_campaign=christmas2025

# Story link (10k+ followers)
https://promptlyprinted.com/christmas-2025/quiz?utm_source=instagram&utm_medium=story&utm_campaign=christmas2025&utm_content=dec15

# Specific post
https://promptlyprinted.com?utm_source=instagram&utm_medium=organic&utm_campaign=christmas2025&utm_content=post456

# Reel
https://promptlyprinted.com/christmas-2025/quiz?utm_source=instagram&utm_medium=reel&utm_campaign=christmas2025&utm_content=reel789
```

**Content Strategy:**

1. **Feed Posts (Carousel)**
   - Slide 1: Eye-catching product photo
   - Slide 2-4: Design process screenshots
   - Slide 5: Competition details
   - Slide 6: Call-to-action with arrow to bio

2. **Instagram Reels**
   - 15-30 seconds
   - Trending audio
   - Text overlays explaining process
   - End screen with CTA

3. **Stories Strategy**
   - **Daily themes:**
     - Monday: Design showcase
     - Tuesday: Customer testimonial
     - Wednesday: Competition reminder
     - Thursday: Behind-the-scenes
     - Friday: Featured designs
     - Saturday: Weekend deal
     - Sunday: Next week preview

   - **Interactive elements:**
     - Polls: "Which design should win?"
     - Quizzes: "Guess the style"
     - Countdown: "Competition ends in..."
     - Questions: "What should I design?"

4. **Hashtag Strategy (30 max)**
   ```
   Main: #CustomApparel #PersonalizedGifts #ChristmasGifts
   Niche: #AIDesign #PrintOnDemand #DesignYourOwn
   Trending: #ChristmasShopping #GiftIdeas #UniqueGifts
   Competition: #GiveawayAlert #WinCash #ChristmasCompetition
   Local: #UKSmallBusiness #ShopSmall #MadeInUK
   ```

5. **Caption Formula**
   ```
   [Hook] Want to win £500 this Christmas?

   [Value] Create your own AI-designed apparel and enter our competition

   [Details] ✨ 8-step style quiz
   🎨 AI generates your unique design
   👕 Print on premium apparel
   💰 £500 cash prize

   [CTA] Link in bio to enter 👆

   [Social Proof] Over 200 designs entered!

   [Hashtags] #CustomApparel #ChristmasCompetition...
   ```

**Instagram Ads (Via Meta):**
See Meta Ads section below for detailed strategy.

---

## Meta (Facebook) Ads Tracking & Strategy

### 💼 Facebook & Instagram Paid Ads

**Best Use Cases:**
- Precise audience targeting (age, interests, location)
- Retargeting website visitors
- Lookalike audiences from past customers
- A/B testing different creatives

**Tracking URLs:**

Meta Ads Manager automatically adds tracking, but you should also add UTM parameters:

```
# Dynamic URL parameters (Meta adds these automatically)
{{site_source_name}}  // Platform (fb or ig)
{{campaign.name}}      // Campaign name
{{adset.name}}        // Ad set name
{{ad.name}}           // Ad name

# Your final URL structure in Ads Manager:
https://promptlyprinted.com/christmas-2025/quiz?utm_source={{site_source_name}}&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

**Campaign Structure:**

```
📁 Campaign: Christmas Competition 2025
   ├── 📂 Ad Set 1: Cold Audience (Interest-Based)
   │   ├── 🎯 Interests: Custom apparel, DIY, Design
   │   ├── 📍 Location: UK
   │   ├── 👥 Age: 25-45
   │   └── 💰 Budget: £20/day
   │
   ├── 📂 Ad Set 2: Warm Audience (Website Visitors)
   │   ├── 🎯 Retargeting: Visited quiz but didn't complete
   │   ├── 🕐 Time window: Last 14 days
   │   └── 💰 Budget: £15/day
   │
   └── 📂 Ad Set 3: Lookalike Audience
       ├── 🎯 1% Lookalike of past customers
       ├── 📍 Location: UK
       └── 💰 Budget: £25/day
```

**Ad Creative Strategy:**

1. **Image Ads**
   - **Hero image**: Product mockup with design
   - **Text overlay**: "$500 Competition" or "Free to Enter"
   - **Dimensions**: 1080x1080px (square)
   - **Format**: JPG or PNG

2. **Video Ads**
   - **Length**: 15-30 seconds
   - **Format**: 9:16 (Stories/Reels) or 1:1 (Feed)
   - **Hook**: First 3 seconds crucial
   - **Subtitles**: Always include (80% watch without sound)

3. **Carousel Ads**
   - 3-5 cards showing different designs
   - Each card: Different customer's design
   - Final card: CTA to enter competition

**Ad Copy Templates:**

```
🎄 TEMPLATE 1: Competition Focus
---
Win £500 This Christmas! 🎁

Create your own AI-designed Christmas apparel and enter our competition.

✅ Free to enter
✅ Takes 2 minutes
✅ Get unique, custom design
✅ Win cash prize

[Learn More Button] → Christmas Quiz
```

```
🎄 TEMPLATE 2: Product Focus
---
Your Design. Your Style. AI-Powered. 🎨

Custom apparel designed by AI based on YOUR style preferences.

👕 Premium quality
⚡ Fast delivery
🎨 Unlimited creativity
💝 Perfect Christmas gift

Plus, enter to win £500!

[Shop Now Button] → Christmas Quiz
```

```
🎄 TEMPLATE 3: Urgency
---
48 Hours Left to Enter! ⏰

Over 300 people have designed their Christmas apparel.

Will you win the £500 prize?

• Takes 2 minutes
• Completely free
• Unique AI design
• Competition ends Dec 31

[Sign Up Button] → Enter Now
```

**Audience Targeting:**

| Audience | Interests | Age | Location | Strategy |
|----------|-----------|-----|----------|----------|
| **Design Enthusiasts** | Graphic Design, Canva, Adobe, DIY | 25-45 | UK | Cold prospecting |
| **Fashion Lovers** | Fashion, Clothing, Style | 20-40 | UK | Cold prospecting |
| **Gift Shoppers** | Christmas Shopping, Gifts | 25-55 | UK | Seasonal targeting |
| **Print-on-Demand Users** | Redbubble, Teespring, Printful | 25-45 | UK, US | Competitor targeting |
| **Website Visitors** | Custom audience | All | All | Retargeting |
| **Past Customers** | Customer list upload | All | All | Retention |

**Budget Recommendations:**

- **Testing phase**: £10-15/day for 7 days
- **Scale phase**: £30-50/day once profitable
- **Peak season**: £75-100/day (Dec 15-25)

**Performance Benchmarks:**

- **CTR (Click-Through Rate)**: Aim for 2%+
- **CPC (Cost Per Click)**: £0.30-0.80
- **Conversion Rate**: 5-10% (quiz completion)
- **ROAS (Return on Ad Spend)**: 3:1 minimum

---

## Spark Ads (TikTok) Tracking & Strategy

### ⚡ TikTok Spark Ads (Boosted Organic Content)

**What are Spark Ads?**
Spark Ads let you boost your organic TikTok posts or user-generated content as ads, keeping all the engagement (likes, comments, shares).

**Why Use Spark Ads?**
- ✅ More authentic than regular TikTok ads
- ✅ Keeps social proof (engagement stays on original post)
- ✅ Can boost UGC (user-generated content)
- ✅ Higher engagement rates
- ✅ Lower CPC than standard TikTok ads

**Tracking URLs:**

```
# Spark Ad (Your Own Content)
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=spark_ad&utm_campaign=christmas2025&utm_content=video_{{__CAMPAIGN_ID__}}

# Spark Ad (UGC - User's Content)
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=ugc_spark&utm_campaign=christmas2025&utm_content={{__CREATIVE_ID__}}

# TikTok dynamic parameters:
{{__CAMPAIGN_ID__}}   // Campaign ID
{{__ADGROUP_ID__}}    // Ad group ID
{{__CREATIVE_ID__}}   // Creative ID
{{__AID__}}           // Advertiser ID
```

**How to Set Up Spark Ads:**

1. **Create Organic TikTok Post**
   - Post high-quality video showing your product
   - Include compelling caption and CTA
   - Add your website link in caption
   - Wait for organic engagement (24-48 hours)

2. **Enable Spark Ads Authorization**
   - Go to TikTok video → Three dots → "Ad Settings"
   - Turn on "Ad Authorization"
   - Copy the authorization code

3. **Create Campaign in TikTok Ads Manager**
   - Campaign Objective: "Traffic" or "Conversions"
   - Choose "Spark Ads" as placement
   - Enter authorization code
   - Set budget and targeting

4. **Targeting Options**
   - **Location**: UK (or your target market)
   - **Age**: 18-45
   - **Gender**: All
   - **Interests**: Fashion, DIY, Design, Shopping
   - **Custom Audiences**: Website visitors (retargeting)

**Spark Ads Content Strategy:**

1. **Your Own Content to Boost**
   ```
   Best performing videos:
   - Design transformation videos
   - Customer unboxing/reactions
   - Behind-the-scenes content
   - Competition announcement
   - Design tutorials
   ```

2. **User-Generated Content (UGC)**
   ```
   Partner with customers who received products:
   - Ask permission to boost their video
   - Offer incentive (discount, free product)
   - Get authorization code from them
   - Boost their authentic review
   ```

3. **Hybrid Approach**
   ```
   Test both:
   - 50% budget on your own best-performing organic content
   - 50% budget on customer UGC
   - Scale whichever performs better
   ```

**Spark Ads Creative Best Practices:**

```
✅ DO:
- Use trending sounds
- Keep it under 30 seconds
- Start with a hook (first 3 seconds)
- Show the product in use
- Include clear CTA
- Add text overlays
- Test multiple videos

❌ DON'T:
- Make it look like an ad
- Use stock footage
- Have poor lighting/quality
- Overly promotional language
- Ignore comments
```

**Budget Strategy:**

```
Phase 1: Testing (Week 1)
├── Budget: £20/day
├── Videos: 3-5 different Spark Ads
└── Goal: Find winning creative (CTR >2%)

Phase 2: Scaling (Week 2-3)
├── Budget: £50/day
├── Videos: Scale winners + test new
└── Goal: Maintain CPC <£0.50

Phase 3: Peak Season (Week 4)
├── Budget: £100/day
├── Videos: Best performers only
└── Goal: Maximize conversions
```

**Example Spark Ad Scripts:**

```
🎄 SCRIPT 1: Design Transformation
[Hook - 0-3s] "Watch AI turn my idea into THIS"
[Body - 3-20s] Screen recording of quiz + AI generation
[CTA - 20-25s] "Link in bio to create yours + win £500"
[End Screen] Product photo + "Use code TIKTOK10"

Performance Goal: CTR >2.5%, CPC <£0.40
```

```
🎄 SCRIPT 2: Customer Reaction (UGC)
[Hook - 0-3s] Customer opening package
[Body - 3-20s] Showing product, genuine reaction
[CTA - 20-25s] "I designed this in 2 minutes!"
[End Screen] "Link to create yours"

Performance Goal: Engagement Rate >8%, Shares >50
```

**Optimization Tips:**

1. **Monitor First 500 Views**
   - If CTR <1.5% in first 500 views → pause and test new creative
   - If CTR >2.5% → increase budget by 50%

2. **Comment Engagement**
   - Reply to ALL comments within 1 hour
   - Pin best comments to top
   - Use replies to drive traffic ("Link in bio!")

3. **A/B Testing**
   - Test same video with different captions
   - Test different CTAs ("Link in bio" vs "Comment DESIGN")
   - Test with/without discount codes

---

## Campaign URL Examples

### Christmas Competition Campaign

**TikTok Organic:**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=bio&utm_campaign=christmas2025
```

**TikTok Spark Ads:**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=spark_ad&utm_campaign=christmas2025&utm_content={{__CREATIVE_ID__}}
```

**Instagram Bio:**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=instagram&utm_medium=bio&utm_campaign=christmas2025
```

**Instagram Story (Swipe Up):**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=instagram&utm_medium=story&utm_campaign=christmas2025&utm_content=dec15
```

**Facebook/Instagram Ads:**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source={{site_source_name}}&utm_medium=paid&utm_campaign=christmas2025&utm_content={{ad.name}}
```

### Product-Specific Campaigns

**TikTok → T-Shirt Product:**
```
https://promptlyprinted.com/products/mens/t-shirts/TEE-SS-STTU755?utm_source=tiktok&utm_medium=organic&utm_campaign=mensweek&utm_content=video123
```

**Instagram Reel → Hoodie:**
```
https://promptlyprinted.com/products/mens/hoodies/HOODIE-PULLOVER?utm_source=instagram&utm_medium=reel&utm_campaign=winter2025&utm_content=reel456
```

### Discount Code Campaigns

**Newsletter Signup:**
```
https://promptlyprinted.com?utm_source=email&utm_medium=newsletter&utm_campaign=welcome&discount=WELCOME10
```

**TikTok Exclusive Offer:**
```
https://promptlyprinted.com/christmas-2025/quiz?utm_source=tiktok&utm_medium=bio&utm_campaign=exclusive&discount=TIKTOK10
```

---

## How to Track Performance

### 1. **Google Analytics 4 (GA4)**

Your UTM parameters automatically populate in GA4:

**Where to find data:**
```
GA4 → Reports → Acquisition → Traffic Acquisition

Filter by:
- utm_source: tiktok, instagram, facebook
- utm_medium: organic, paid, story, spark_ad
- utm_campaign: christmas2025
```

**Key Metrics to Track:**
- **Users**: Total visitors from each source
- **Sessions**: Number of visits
- **Engagement Rate**: % of engaged sessions
- **Conversions**: Quiz completions, purchases
- **Revenue**: Total sales from each source

### 2. **Database Tracking**

Your quiz already captures UTM data in the database:

```sql
-- Find all users from TikTok Spark Ads
SELECT * FROM "SavedImage"
WHERE "utm_source" = 'tiktok'
AND "utm_medium" = 'spark_ad'
AND "createdAt" >= '2025-12-01';

-- Calculate conversion rate by source
SELECT
  "utm_source",
  "utm_medium",
  COUNT(*) as total_designs,
  COUNT(DISTINCT "userId") as unique_users
FROM "SavedImage"
WHERE "utm_campaign" = 'christmas2025'
GROUP BY "utm_source", "utm_medium"
ORDER BY total_designs DESC;

-- Revenue by marketing channel
SELECT
  o."Order"."utm_source",
  COUNT(*) as total_orders,
  SUM("totalPrice") as total_revenue
FROM "Order" o
WHERE o."status" = 'COMPLETED'
AND o."createdAt" >= '2025-12-01'
GROUP BY o."utm_source"
ORDER BY total_revenue DESC;
```

### 3. **Platform-Specific Analytics**

**TikTok Analytics:**
- Profile views from bio link clicks
- Video views, likes, shares, comments
- Follower growth
- Traffic to website (Analytics → Profile Overview)

**Instagram Insights:**
- Link clicks in bio
- Story link clicks (10k+ followers)
- Reel plays and engagement
- Profile visits

**Meta Ads Manager:**
- CTR (Click-Through Rate)
- CPC (Cost Per Click)
- Conversions (if pixel installed)
- ROAS (Return on Ad Spend)

**TikTok Ads Manager:**
- Impressions, clicks, CTR
- CPC, CPM (Cost Per 1000 Impressions)
- Video views, engagement
- Conversion tracking (if pixel installed)

### 4. **Discount Code Tracking**

Track performance by discount code usage:

```sql
-- Revenue per discount code
SELECT
  dc."code",
  COUNT(du."id") as times_used,
  SUM(o."totalPrice") as total_revenue,
  AVG(o."totalPrice") as avg_order_value
FROM "DiscountCode" dc
LEFT JOIN "DiscountUsage" du ON dc."id" = du."discountCodeId"
LEFT JOIN "Order" o ON du."orderId" = o."id"
WHERE o."status" = 'COMPLETED'
GROUP BY dc."code"
ORDER BY total_revenue DESC;
```

### 5. **Referral Tracking**

Track competition referral performance:

```sql
-- Top referrers
SELECT
  ce."userId",
  ce."referralCode",
  COUNT(r."id") as total_referrals,
  SUM(CASE WHEN r."status" = 'completed' THEN 1 ELSE 0 END) as completed_referrals
FROM "CompetitionEntry" ce
LEFT JOIN "Referral" r ON ce."referralCode" = r."referralCode"
GROUP BY ce."userId", ce."referralCode"
ORDER BY completed_referrals DESC
LIMIT 20;
```

---

## Quick Reference: Best Tracking URLs by Platform

| Platform | Use Case | Tracking URL |
|----------|----------|--------------|
| **TikTok Bio** | Main link | `?utm_source=tiktok&utm_medium=bio&utm_campaign=christmas2025` |
| **TikTok Spark Ad** | Boosted post | `?utm_source=tiktok&utm_medium=spark_ad&utm_campaign=christmas2025&utm_content={{__CREATIVE_ID__}}` |
| **Instagram Bio** | Main link | `?utm_source=instagram&utm_medium=bio&utm_campaign=christmas2025` |
| **Instagram Story** | Swipe-up | `?utm_source=instagram&utm_medium=story&utm_campaign=christmas2025&utm_content=MMDD` |
| **Instagram Reel** | Specific reel | `?utm_source=instagram&utm_medium=reel&utm_campaign=christmas2025&utm_content=reelID` |
| **Facebook/IG Ads** | Paid ads | `?utm_source={{site_source_name}}&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}` |
| **TikTok Standard Ads** | Non-spark ads | `?utm_source=tiktok&utm_medium=paid&utm_campaign=christmas2025&utm_content={{__AD_ID__}}` |

---

## Next Steps

1. **Create discount codes in admin panel:**
   ```
   TIKTOK10    - 10% off for TikTok followers
   INSTA10     - 10% off for Instagram followers
   FACEBOOK10  - 10% off for Facebook fans
   SPARK15     - 15% off for Spark Ads campaigns
   ```

2. **Set up Meta Pixel** on your website for better tracking

3. **Install TikTok Pixel** for Spark Ads conversion tracking

4. **Create content calendar** for next 30 days across all platforms

5. **Start with organic content** for 1 week to build social proof before running ads

6. **Test Spark Ads** with £20/day budget on 3 best-performing organic posts

7. **Scale winners** - double budget on campaigns with ROAS >3:1

---

## Pro Tips

### 🎯 Cross-Platform Strategy

Run coordinated campaigns across all platforms:

**Week 1**: Organic content + community building
- Post 2-3x daily on TikTok
- 1x daily on Instagram feed
- 5-10 stories per day
- Engage with ALL comments

**Week 2**: Introduce paid advertising
- Start Spark Ads (£20/day)
- Test Meta Ads (£15/day)
- Continue organic posting
- Monitor performance daily

**Week 3**: Scale what works
- Increase budget on winning campaigns
- Pause underperforming ads
- Create more content similar to winners
- Partner with micro-influencers

**Week 4**: Peak season push
- Maximum budget allocation
- Urgency messaging ("Last chance!")
- Daily reminders about competition end date
- Showcase leading entries

### 📊 KPIs to Monitor Daily

- **Traffic**: Total visitors from each source
- **Engagement**: Likes, comments, shares per post
- **CTR**: Click-through rate (aim for >2%)
- **CPC**: Cost per click (aim for <£0.50)
- **Conversions**: Quiz completions, purchases
- **ROAS**: Return on ad spend (aim for >3:1)

Good luck with your campaigns! 🚀
