# Style Quiz Funnel - Complete Documentation

## Overview

The Style Quiz Funnel is a conversion-optimized system that guides users from discovery to purchase through personalization, product recommendations, and gamification.

**Inspired by**: Huel, AG1, and direct-to-consumer brands with clean, multi-step quiz funnels.

## Flow Architecture

### Complete User Journey

```
Entry Point (varies by traffic)
    ↓
Style Quiz (5 questions)
    ↓
Personalized Result Page (AI style profile)
    ↓
Offer Page (Product + Discount)
    ↓
Design Studio (Customize with AI)
    ↓
Checkout
    ↓
Post-Purchase (Leaderboard + Achievements)
```

## 1. Entry Points

### Routes
- `/quiz` - Universal style quiz entry point
- `/offer` - Direct to offer (hot traffic)

### Traffic Sources
See `TRAFFIC_ROUTING_GUIDE.md` for detailed routing strategy.

**Summary**:
- **Cold Traffic** → `/quiz` (TikTok, Meta Ads, YouTube)
- **Warm Traffic** → `/quiz` with pre-filled hints (Instagram, SEO, Email)
- **Hot Traffic** → `/offer` directly (Google Search, Remarketing, Cart Recovery)

## 2. Style Quiz (`/quiz`)

### Purpose
Personalize the experience and build engagement before showing product/price.

### Questions (5 total)
1. **What's your vibe?** - minimalist, streetwear, graphic, surreal, futuristic
2. **Preferred color palette?** - black-white, earth-tones, neon, pastels, monochrome
3. **Favorite clothing type?** - tee, hoodie, long-sleeve, crewneck
4. **Where do you wear your style most?** - everyday, gym, night-out, creative-work, chill
5. **Design personality?** - simple-logo, illustration, abstract-art, text-heavy, character

### Implementation
- **Location**: `apps/web/app/quiz/page.tsx`
- **Component**: `apps/web/app/quiz/components/QuizStep.tsx`
- **State Management**: Local React state
- **Progress Bar**: Visual indicator (20% per question)
- **Design**: Clean white background, gradient accents, Huel-inspired

### URL Parameters
```typescript
?campaign=halloween-2025  // Campaign tracking
?source=tiktok            // Traffic source
?style=streetwear         // Pre-filled style hint (optional)
```

### Result Calculation
Quiz answers are mapped to:
1. **AI Prompt** - Personalized design prompt generated from answers
2. **Style Profile** - One of 5 personality types (e.g., "Minimal Visionary")
3. **Product Recommendation** - Clothing type from Question 3
4. **Tribe Membership** - Social proof (e.g., "Join 3,891 Streetwear Squad members")

## 3. Style Result Page

### Purpose
Show personalized AI style result and build excitement before showing price.

### Implementation
- **Location**: `apps/web/app/quiz/components/StyleResult.tsx`
- **Auto-renders** when quiz completes (Step 6)

### Key Elements

#### Style Profile Cards
```typescript
const STYLE_PROFILES = {
  minimalist: {
    name: 'Minimal Visionary',
    description: 'You lean toward clean, confident looks...',
    tribe: 'Minimalist Tribe',
    tribeCount: 2347,
  },
  // ... 4 more profiles
}
```

#### AI Prompt Preview
Shows the generated prompt based on quiz answers:
```
"Create a bold urban streetwear graphic with graffiti-inspired elements
as a detailed hand-drawn illustration with vibrant neon colors with electric
glow effects, statement-making for social occasions."
```

#### Tribe Badge
Social proof element showing how many others share their style.

### CTA
- **Primary**: "See My Offer" → `/offer?prompt=...&style=...&clothingType=...`
- **Secondary**: "Change Style" → Go back to quiz

## 4. Offer Page (`/offer`)

### Purpose
Present product with first-drop discount to convert visitor into buyer.

### Implementation
- **Location**: `apps/web/app/offer/page.tsx`
- **Component**: `apps/web/app/offer/components/OfferPageContent.tsx`
- **Data Source**: `@repo/database/scripts/tshirt-details` (real product data)
- **Product Mapping**: `CLOTHING_TYPE_TO_SKU` maps quiz answers to actual SKUs

### URL Parameters Required
```
?prompt=...           // AI design prompt from quiz
?style=...            // Style preference
?campaign=...         // Campaign tracking
?source=...           // Traffic source
?clothingType=...     // Product type (tee, hoodie, etc.)
```

### Key Elements

#### Product Display
- **Real product data** fetched from `tshirtDetails` based on quiz answers
- **Actual pricing** from product pricing array (USD)
- **Real product images** from inventory (`product.imageUrls.base`)
- **Dynamic size selector** from `product.size` array
- **Dynamic color selector** from `product.colorOptions` array

#### Discount Display
```typescript
const FIRST_DROP_DISCOUNT = 0.40; // 40% off
const discountedPrice = product.price * (1 - FIRST_DROP_DISCOUNT);
```

**Visual**:
- Original price: £49.00 (strikethrough)
- Discounted price: £29.40 (large, bold)
- Savings badge: "Save £19.60 (40% off)"

#### What's Included Section
- AI-designed print personalized to style
- Organic cotton premium fabric up to 280gsm
- Free design toolkit (unlimited generations)
- 48-hour dispatch priority production

#### Trust Signals
- AI-Powered ✨
- Fast Shipping 🚀
- Eco-Friendly ♻️
- Social proof: "⭐⭐⭐⭐⭐ 4.9/5 from 2,431 reviews"

### CTA
**"Start Designing Now"** → Routes to actual product design page

```typescript
// Route format: /design/[productSku]
router.push(`/design/${product.sku}?${params.toString()}`);
```

**Parameters passed**:
- `prompt` - Pre-filled AI prompt
- `campaign` - Campaign tracking
- `source` - Traffic source
- `color` - Selected color
- `size` - Selected size
- `discount` - Discount amount to apply at checkout

## 5. Design Studio

### Purpose
Allow user to customize their AI-designed product before purchase.

### Implementation
**Uses existing product detail page** - no duplicate code!

- **Location**: `apps/web/app/products/[category]/[productName]/page.tsx`
- **Component**: `apps/web/app/products/[category]/[productName]/components/ProductDetail.tsx`

### Pre-filled Data
The product detail page reads URL params and auto-populates:
- AI prompt text from quiz (`?prompt=...`)
- Campaign tracking (`?campaign=...`)
- Selected size and color (`?size=M&color=White`)
- Discount to apply (`?discount=0.40`)

### User Actions
1. Generate AI design from pre-filled prompt (or modify prompt)
2. Preview design on product mockup
3. Adjust/regenerate if needed
4. Add to cart → Checkout

## 6. Post-Purchase Flow

### Purpose
Maximize engagement, encourage sharing, and build community after purchase.

### Implementation
- **Location**: `apps/web/lib/post-purchase-flow.ts`
- **Trigger**: Order confirmation webhook/success page

### Automated Actions

#### 1. Award Points
```typescript
await handlePostPurchase({
  userId,
  orderId,
  designId,
  campaign,
  source,
  style
});
```

**Points Awarded**:
- Design submission: 50 points
- First design: 100 bonus points
- Competition entry: 100 points
- First competition: 150 bonus points

#### 2. Auto-Submit to Competition
If the campaign has an active competition (e.g., `halloween-2025`), automatically submit the design.

```typescript
const competition = await prisma.competition.findFirst({
  where: {
    funnelTag: campaign,
    isActive: true,
    endDate: { gte: new Date() }
  }
});
```

#### 3. Update Leaderboard
User's new rank is calculated based on total points.

#### 4. Track Achievements
- First Design Created ✨
- First Competition Entry 🏆
- Daily Streak 🔥
- Level Up badges

### Confirmation Page Elements

#### Achievement Banner
```
🎉 Congratulations! You earned 250 points!

✨ Achievement Unlocked: First Design Created
🏆 You're now ranked #342 globally
```

#### Competition Entry Card
```
Your design has been entered into:
🎃 Halloween Design Contest
Prize: $500

Current Standings: #67 / 1,234 entries
```

#### Share Prompt
```
📱 Share Your Design & Earn More Points

[Share on Twitter] [Share on Facebook] [Share on Instagram]

Get 5 points for every like your design receives!
```

#### Recommended Actions
- "Vote for Other Designs" (+2 points per vote)
- "Create Another Style" (+50 points)
- "Invite a Friend" (+25 points)
- "View Leaderboard" (see your rank)

## Traffic Source Integration

### URL Parameter Strategy

Every traffic source should include tracking parameters:

```
https://promptlyprinted.com/quiz?source=tiktok&campaign=holiday
```

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `source` | Traffic origin | `tiktok`, `google-search`, `email-cart` |
| `campaign` | Campaign theme | `halloween-2025`, `blackfriday`, `general` |
| `style` | Pre-filled style | `streetwear`, `minimalist` |
| `clothingType` | Pre-selected product | `hoodie`, `tee` |
| `prompt` | Pre-filled prompt | URL-encoded design prompt |
| `discount` | Applied discount | `0.40` (40% off) |

### Analytics Tracking

Track these events throughout the funnel:

```typescript
// Quiz Started
trackEvent('quiz_started', { source, campaign });

// Quiz Completed
trackEvent('quiz_completed', {
  source,
  style_result,
  product_recommended,
  completion_time_seconds
});

// Offer Viewed
trackEvent('offer_viewed', {
  source,
  product,
  discount,
  price
});

// Design Studio Entered
trackEvent('design_studio_entered', {
  source,
  product,
  prompt_prefilled
});

// Purchase Completed
trackEvent('purchase_completed', {
  source,
  product,
  discount_applied,
  final_price
});

// Competition Entered
trackEvent('competition_entered', {
  competition_id,
  user_id
});
```

## Campaign Variations

### How to Create Seasonal Campaigns

The system supports unlimited campaign variations using the `campaign` parameter.

#### Example: Halloween Campaign

1. **Create Competition** (in database):
```typescript
await prisma.competition.create({
  data: {
    theme: 'Halloween Design Contest',
    themeIcon: '🎃',
    prize: '$500',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2025-10-31'),
    funnelTag: 'halloween-2025',
    isActive: true,
  }
});
```

2. **Route Traffic**:
```
https://promptlyprinted.com/quiz?campaign=halloween-2025&source=tiktok
```

3. **Automatic Integration**:
- Quiz answers are the same
- AI prompts can be themed (add "spooky" keywords)
- Offer page shows standard discount
- Post-purchase auto-enters Halloween competition
- Leaderboard shows Halloween-specific rankings

#### Example: Black Friday Campaign

1. **No Competition** - Just higher discount:
```
https://promptlyprinted.com/offer?campaign=blackfriday&discount=0.50
```

2. **Skip Quiz** - Go straight to offer with 50% off

3. **Urgency Timer** - Add countdown in offer page

See `THEME_FUNNEL_GUIDE.md` for detailed campaign creation instructions.

## Key Files Reference

### Core Funnel Pages
- `/apps/web/app/quiz/page.tsx` - Quiz container
- `/apps/web/app/quiz/components/QuizStep.tsx` - Question UI
- `/apps/web/app/quiz/components/StyleResult.tsx` - Result page
- `/apps/web/app/offer/page.tsx` - Offer container
- `/apps/web/app/offer/components/OfferPageContent.tsx` - Offer UI

### Product Integration
- `/apps/web/app/products/[category]/[productName]/page.tsx` - Product page
- `/apps/web/app/products/[category]/[productName]/components/ProductDetail.tsx` - Design studio

### Backend Logic
- `/apps/web/lib/post-purchase-flow.ts` - Post-purchase automation
- `/apps/web/lib/gamification.ts` - Points, levels, achievements
- `/packages/database/prisma/schema.prisma` - Database schema

### Documentation
- `/apps/web/TRAFFIC_ROUTING_GUIDE.md` - Traffic source strategy
- `/apps/web/THEME_FUNNEL_GUIDE.md` - Campaign creation guide
- `/apps/web/STYLE_QUIZ_FUNNEL.md` - This file

## Conversion Optimization Tips

### A/B Test Ideas

1. **Quiz Length**
   - 5 questions vs 3 questions
   - Track completion rate

2. **Discount Visibility**
   - Show discount on result page vs offer page only
   - Track click-through rate

3. **Social Proof**
   - Tribe count vs customer reviews
   - Track conversion rate

4. **Product Recommendation**
   - Quiz-based vs traffic source-based
   - Track average order value

### Performance Metrics

Track these KPIs:

| Metric | Target | Formula |
|--------|--------|---------|
| Quiz Completion Rate | >60% | Completed / Started |
| Quiz → Offer CTR | >40% | Offer Views / Quiz Completions |
| Offer → Design CTR | >30% | Design Starts / Offer Views |
| Design → Purchase CVR | >15% | Purchases / Design Starts |
| Overall Funnel CVR | >2% | Purchases / Quiz Starts |
| Post-Purchase Share Rate | >10% | Shares / Purchases |

### Retention Metrics

| Metric | Target |
|--------|--------|
| Competition Entry Rate | >80% of purchases |
| Leaderboard Check Rate | >50% return within 7 days |
| Repeat Purchase Rate | >20% within 90 days |
| Referral Rate | >15% share with friend |

## Technical Implementation Notes

### Product Slug Generation
```typescript
// Normalize product names to URL-safe slugs
const createSlug = (str: string) =>
  str.toLowerCase()
    .replace(/[''"]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
```

### Discount Application
Discount is passed as URL parameter and applied at checkout:
```typescript
?discount=0.40  // 40% off
```

**Implementation needed**: Checkout page must read `discount` param and apply to final price.

### Competition Auto-Entry
```typescript
// In post-purchase webhook/confirmation
const result = await handlePostPurchase({
  userId: user.id,
  orderId: order.id,
  designId: design.id,
  campaign: 'halloween-2025',
  source: 'tiktok',
  style: 'streetwear'
});

// Result contains:
// - pointsEarned: 250
// - newLevel: 2
// - newRank: 342
// - competitionEntry: { id, competitionId, competitionName }
// - achievements: ['First Design Created']
```

## Future Enhancements

### Phase 2
- [ ] Dynamic quiz questions based on traffic source
- [ ] AI-generated style recommendations (ML model)
- [ ] Real-time leaderboard updates (WebSocket)
- [ ] Social sharing with auto-generated images
- [ ] Referral tracking and rewards
- [ ] Email automation for abandoned quiz

### Phase 3
- [ ] Video quiz format for TikTok/Instagram
- [ ] Influencer-specific landing pages
- [ ] Team/group competitions
- [ ] NFT badges for top performers
- [ ] Collaborative designs (vote on community designs)
- [ ] Subscription model for repeat buyers

## Support & Troubleshooting

### Common Issues

**Issue**: Quiz doesn't route to offer page
- **Check**: Ensure all 5 questions are answered
- **Check**: `clothingType` parameter is set in URL
- **Fix**: Update `StyleResult.tsx` to include all params

**Issue**: Discount not applied at checkout
- **Check**: Checkout page reads `discount` URL parameter
- **Check**: Parameter value is decimal (0.40, not 40)
- **Fix**: Implement discount logic in checkout flow

**Issue**: Competition entry not created
- **Check**: Competition exists with matching `funnelTag`
- **Check**: Competition is active and not expired
- **Check**: User is authenticated
- **Fix**: Verify `handlePostPurchase` is called after order

**Issue**: Product images not loading
- **Check**: Image paths match inventory structure
- **Check**: Next.js image optimization configured
- **Fix**: Update product mapping in `OfferPageContent.tsx`

## Contact & Contribution

For questions, issues, or feature requests related to the Style Quiz Funnel:
1. Check this documentation first
2. Review `TRAFFIC_ROUTING_GUIDE.md` for routing issues
3. Review `THEME_FUNNEL_GUIDE.md` for campaign creation
4. Open an issue with detailed reproduction steps

---

**Last Updated**: 2025-01-17
**Version**: 1.0
**Status**: Production Ready ✅
