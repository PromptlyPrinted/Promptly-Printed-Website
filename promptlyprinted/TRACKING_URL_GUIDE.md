# Campaign Tracking URL Guide

This guide shows you how to create tracking URLs for your marketing campaigns.

## 🎯 Why Use Tracking URLs?

Tracking URLs help you understand:
- Which platform drives the most traffic (TikTok vs Meta vs Google)
- Which specific ads perform best
- ROI for each campaign
- Customer journey before purchase

## 📊 PostHog Integration

Your tracking URLs automatically:
1. Capture attribution data
2. Store in PostHog user properties
3. Show in funnel analysis
4. Enable cohort comparisons

## 🔗 URL Templates by Platform

### TikTok Organic
Use for: Bio link, video captions, organic posts

**Landing Page:**
```
https://promptlyprinted.com/black-friday?utm_source=tiktok&utm_medium=organic&utm_campaign=black-friday-2025
```

**Direct to Quiz (recommended for bio):**
```
https://promptlyprinted.com/black-friday/quiz?utm_source=tiktok&utm_medium=organic&utm_campaign=black-friday-2025
```

**When to use:**
- TikTok bio link
- Organic post captions
- Comments on your videos

---

### TikTok Spark Ads
Use for: Boosted posts, Spark Ads

**Landing Page:**
```
https://promptlyprinted.com/black-friday?utm_source=tiktok&utm_medium=spark_ads&utm_campaign=black-friday-2025&utm_content=video_1
```

**Direct to Quiz:**
```
https://promptlyprinted.com/black-friday/quiz?utm_source=tiktok&utm_medium=spark_ads&utm_campaign=black-friday-2025&utm_content=video_1
```

**With Bundle Pre-Selected:**
```
https://promptlyprinted.com/black-friday/quiz?utm_source=tiktok&utm_medium=spark_ads&utm_campaign=black-friday-2025&utm_content=video_1&bundle=design-stickers&discount=35
```

**Change `video_1` to identify each ad:**
- `video_1` = First video ad
- `video_2` = Second video ad
- `stitch_ad` = Stitch format
- `duet_ad` = Duet format

---

### Meta Ads (Facebook & Instagram)
Use for: All paid Meta ads

```
https://promptlyprinted.com/black-friday?utm_source=facebook&utm_medium=paid_social&utm_campaign=black-friday-2025&utm_content=carousel_1
```

**Content variations:**
- `carousel_1` = Carousel ad #1
- `single_image` = Single image ad
- `video_ad` = Video ad
- `stories` = Stories ad

---

### Instagram Organic
Use for: Bio link, organic posts, stories

```
https://promptlyprinted.com/black-friday?utm_source=instagram&utm_medium=organic&utm_campaign=black-friday-2025
```

**When to use:**
- Instagram bio link
- Story swipe-ups
- Link in bio services (Linktree, etc.)

---

### Google Ads
Use for: Search ads, Display ads, Shopping ads

```
https://promptlyprinted.com/black-friday?utm_source=google&utm_medium=cpc&utm_campaign=black-friday-2025&utm_content=search_ad_1
```

**Content variations:**
- `search_ad_1` = Search ad variant 1
- `display_banner` = Display banner
- `shopping_feed` = Shopping ad

---

## 🛠️ Quick URL Builder

Use this structure for any platform:

```
https://promptlyprinted.com/[PAGE]?utm_source=[PLATFORM]&utm_medium=[TYPE]&utm_campaign=[CAMPAIGN]&utm_content=[VARIANT]
```

### Parameters:

**utm_source** (required)
- `tiktok` = TikTok
- `facebook` = Facebook/Meta
- `instagram` = Instagram
- `google` = Google
- `twitter` = Twitter/X
- `snapchat` = Snapchat

**utm_medium** (required)
- `organic` = Free/organic posts
- `paid_social` = Paid social ads
- `cpc` = Pay-per-click ads
- `spark_ads` = TikTok Spark Ads
- `email` = Email campaigns

**utm_campaign** (required)
- `black-friday-2025` = Black Friday campaign
- `christmas-2025` = Christmas campaign
- `launch` = Product launch
- `summer-sale` = Summer sale

**utm_content** (optional but recommended)
- Use to identify specific ad variants
- Examples: `video_1`, `carousel_blue`, `ad_variant_a`

---

## 📈 Tracking Best Practices

### 1. **Use Consistent Naming**
✅ Good: `black-friday-2025`
❌ Bad: `Black Friday`, `BF2025`, `blackfriday`

### 2. **Be Specific with Content**
✅ Good: `video_1_hook_variant_a`
❌ Bad: `ad1`

### 3. **Track Everything**
- Every social media post
- Every ad variant
- Every email campaign
- Every influencer partnership

### 4. **Document Your Campaigns**
Create a spreadsheet:
| Platform | Medium | Campaign | Content | URL |
|----------|---------|----------|---------|-----|
| TikTok | organic | black-friday-2025 | bio_link | [Full URL] |
| TikTok | spark_ads | black-friday-2025 | video_1 | [Full URL] |
| Facebook | paid_social | black-friday-2025 | carousel_1 | [Full URL] |

---

## 🎯 Example: Complete Black Friday Campaign

### Phase 1: Organic Teaser (Nov 15-20)
**TikTok Bio:**
```
https://promptlyprinted.com/black-friday?utm_source=tiktok&utm_medium=organic&utm_campaign=black-friday-2025&utm_content=bio_link
```

**Instagram Bio:**
```
https://promptlyprinted.com/black-friday?utm_source=instagram&utm_medium=organic&utm_campaign=black-friday-2025&utm_content=bio_link
```

### Phase 2: Paid Launch (Nov 21-25)
**TikTok Spark Ad #1:**
```
https://promptlyprinted.com/black-friday?utm_source=tiktok&utm_medium=spark_ads&utm_campaign=black-friday-2025&utm_content=launch_video_1
```

**Meta Carousel Ad:**
```
https://promptlyprinted.com/black-friday?utm_source=facebook&utm_medium=paid_social&utm_campaign=black-friday-2025&utm_content=carousel_bundle_offer
```

**Google Search Ad:**
```
https://promptlyprinted.com/black-friday?utm_source=google&utm_medium=cpc&utm_campaign=black-friday-2025&utm_content=search_custom_tshirts
```

### Phase 3: Final Push (Nov 26-29)
**TikTok Urgency Ad:**
```
https://promptlyprinted.com/black-friday?utm_source=tiktok&utm_medium=spark_ads&utm_campaign=black-friday-2025&utm_content=urgency_last_chance
```

**Meta Retargeting:**
```
https://promptlyprinted.com/black-friday?utm_source=facebook&utm_medium=paid_social&utm_campaign=black-friday-2025&utm_content=retargeting_last_day
```

---

## 📊 Where to See Your Data

### PostHog Dashboard
1. Go to PostHog
2. Navigate to **People** → **Properties**
3. Look for:
   - `initial_utm_source`
   - `initial_utm_medium`
   - `initial_utm_campaign`

### Funnel Analysis
1. Create funnel: Landing → Quiz → Purchase
2. Break down by `utm_source`
3. See which platform converts best

### Event Stream
Search for event: `campaign_attribution`
View all traffic sources in real-time

---

## ⚠️ Common Mistakes to Avoid

### 1. **Inconsistent Capitalization**
❌ `UTM_Source=TikTok`
✅ `utm_source=tiktok`

### 2. **Spaces in Parameters**
❌ `utm_campaign=black friday 2025`
✅ `utm_campaign=black-friday-2025`

### 3. **Missing Parameters**
❌ `?utm_source=tiktok`
✅ `?utm_source=tiktok&utm_medium=organic&utm_campaign=black-friday-2025`

### 4. **Not Tracking Organic**
Even organic posts should have UTM parameters!

---

## 🚀 Quick Start Checklist

- [ ] Read this guide
- [ ] Create URL tracking spreadsheet
- [ ] Build URLs for each campaign
- [ ] Test URLs before posting
- [ ] Add to social media bios
- [ ] Track in ads manager
- [ ] Monitor PostHog data
- [ ] Adjust campaigns based on data

---

## 🔧 Tools

### URL Builder Tool
Visit: https://ga-dev-tools.google/campaign-url-builder/

### Quick Copy (for Black Friday)

**TikTok Organic:**
```
https://promptlyprinted.com/black-friday?utm_source=tiktok&utm_medium=organic&utm_campaign=black-friday-2025
```

**Meta Ads:**
```
https://promptlyprinted.com/black-friday?utm_source=facebook&utm_medium=paid_social&utm_campaign=black-friday-2025&utm_content=CHANGE_ME
```

**Instagram Organic:**
```
https://promptlyprinted.com/black-friday?utm_source=instagram&utm_medium=organic&utm_campaign=black-friday-2025
```

---

## 🔄 UTM Flow Tracking

Your app automatically preserves UTM parameters through the entire user journey:

### Example Flow

**1. User clicks TikTok ad:**
```
https://promptlyprinted.com/black-friday/quiz?utm_source=tiktok&utm_medium=spark_ads&utm_campaign=black-friday-2025&utm_content=video_1
```

**2. After quiz, redirects to offer page with UTMs preserved:**
```
/offer?utm_source=tiktok&utm_medium=spark_ads&utm_campaign=black-friday-2025&utm_content=video_1&...other_params
```

**3. After selecting size/color, redirects to design page with UTMs:**
```
/design/TEE-SS-STTU755?utm_source=tiktok&utm_medium=spark_ads&utm_campaign=black-friday-2025&utm_content=video_1&...
```

**4. At checkout, attribution is tracked:**
PostHog records the sale came from:
- `utm_source`: tiktok
- `utm_medium`: spark_ads
- `utm_campaign`: black-friday-2025
- `utm_content`: video_1

### What This Means

✅ **No data loss** - UTMs persist through all pages
✅ **Accurate attribution** - Know exactly which ad drove the sale
✅ **Multi-step funnels** - Track dropoff at each stage
✅ **A/B testing** - Compare `video_1` vs `video_2` performance

---

## 🎯 Quiz-Specific URLs

### Direct to Quiz (Best for Ads)

**TikTok Bio/Ads:**
```
https://promptlyprinted.com/black-friday/quiz?utm_source=tiktok&utm_medium=organic&utm_campaign=black-friday-2025
```

**Meta Ads:**
```
https://promptlyprinted.com/black-friday/quiz?utm_source=facebook&utm_medium=paid_social&utm_campaign=black-friday-2025&utm_content=ad_variant_1
```

**Instagram Bio:**
```
https://promptlyprinted.com/black-friday/quiz?utm_source=instagram&utm_medium=organic&utm_campaign=black-friday-2025
```

### Pre-Select Bundle in Quiz

**35% + Stickers Bundle:**
```
https://promptlyprinted.com/black-friday/quiz?bundle=design-stickers&discount=35&utm_source=tiktok&utm_medium=spark_ads&utm_campaign=black-friday-2025
```

**40% Mega Deal:**
```
https://promptlyprinted.com/black-friday/quiz?bundle=mega-discount&discount=40&utm_source=facebook&utm_medium=paid_social&utm_campaign=black-friday-2025
```

### Why Use Quiz URLs?

✅ **Higher conversion** - Direct action vs browsing
✅ **Better tracking** - See quiz completion rates
✅ **Qualification** - Users self-select their style
✅ **Engagement** - Interactive vs static landing page

---

**Questions?** Check PostHog documentation or review the tracking code in `/lib/tracking.ts`
