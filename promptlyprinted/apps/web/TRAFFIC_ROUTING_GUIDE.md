# Traffic Routing Strategy

## Overview
This guide explains how to route different traffic sources to the optimal entry point in the style quiz funnel for maximum conversion.

## Traffic Temperature Classification

### Cold Traffic (Low Intent)
**Characteristics**: First-time visitors, no prior knowledge of brand
**Entry Point**: `/quiz` - Universal Style Quiz
**Strategy**: Build relationship through personalization

**Sources**:
- TikTok Ads
- Meta Ads (Cold Lookalike)
- YouTube Ads
- Reddit Ads
- Pinterest Ads
- Display Retargeting (First Touch)

**URL Format**:
```
https://promptlyprinted.com/quiz?source=tiktok&campaign=general
https://promptlyprinted.com/quiz?source=meta-cold&campaign=holiday
```

### Warm Traffic (Medium Intent)
**Characteristics**: Familiar with AI fashion, exploring options
**Entry Point**: `/quiz` with pre-selected style preference
**Strategy**: Accelerate decision with style shortcuts

**Sources**:
- Instagram Organic
- SEO Blog Traffic
- YouTube Organic
- Email Newsletter
- Influencer Links
- Affiliate Links

**URL Format**:
```
https://promptlyprinted.com/quiz?source=instagram&style=streetwear
https://promptlyprinted.com/quiz?source=seo&keyword=ai-tshirt
```

### Hot Traffic (High Intent)
**Characteristics**: Ready to buy, looking for specific products
**Entry Point**: `/offer` - Direct to personalized offer
**Strategy**: Minimize friction, show value immediately

**Sources**:
- Google Ads (Search)
- Shopping Ads
- Remarketing Audiences
- Email Abandoned Cart
- SMS Campaigns
- Direct Traffic (Returning)

**URL Format**:
```
https://promptlyprinted.com/offer?source=google-search&clothingType=hoodie&prompt=cyberpunk+design
https://promptlyprinted.com/offer?source=remarketing&clothingType=tee
```

## Implementation Examples

### 1. TikTok Ad Campaign (Cold Traffic)
**Landing Page**: `/quiz?source=tiktok&campaign=holiday`

**Ad Copy**:
> "Find your perfect AI fashion style in 60 seconds"

**Flow**:
1. User takes 5-question style quiz
2. Gets personalized AI style result ("You're a Streetwear Icon!")
3. Sees offer page with recommended product + 40% discount
4. Clicks "Start Designing" → redirects to design studio
5. Customizes design → Checkout

### 2. Instagram Organic (Warm Traffic)
**Landing Page**: `/quiz?source=instagram&style=minimalist`

**Bio Link**: "Design Your Style ✨"

**Flow**:
1. User already interested in minimalist aesthetic
2. Quiz can pre-populate vibe preference
3. Faster path to results
4. Higher conversion rate due to style alignment

### 3. Google Shopping (Hot Traffic)
**Landing Page**: `/offer?source=google-shopping&clothingType=hoodie&prompt=streetwear+graphic`

**Search Query**: "custom AI hoodie"

**Flow**:
1. User searching specifically for hoodies
2. Skip quiz entirely → show offer immediately
3. Product pre-selected (Hoodie)
4. Prompt pre-generated (Streetwear Graphic)
5. One click to design studio → Checkout
6. Fastest path to purchase

### 4. Email Abandoned Cart (Hot Traffic)
**Landing Page**: `/offer?source=email-cart&clothingType=tee&prompt={saved_prompt}&discount=0.40`

**Email Subject**: "Your design is waiting! Complete your order + save 40%"

**Flow**:
1. User returns with saved context
2. Show exact product they abandoned
3. Apply discount as recovery incentive
4. Restore their design prompt
5. One-click back to checkout

## Traffic Source Tracking

### URL Parameters
All traffic should include these parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `source` | Traffic origin | `tiktok`, `google-search`, `email-cart` |
| `campaign` | Campaign theme | `holiday`, `blackfriday`, `general` |
| `style` | Pre-selected style (optional) | `minimalist`, `streetwear` |
| `clothingType` | Pre-selected product (optional) | `tee`, `hoodie` |
| `prompt` | Pre-filled prompt (optional) | `cyberpunk+design` |
| `discount` | Applied discount (optional) | `0.40` (40% off) |

### Complete Examples

**Cold TikTok Traffic**:
```
/quiz?source=tiktok&campaign=holiday
```

**Warm Instagram with Style Hint**:
```
/quiz?source=instagram&campaign=general&style=streetwear
```

**Hot Google Search Traffic**:
```
/offer?source=google-search&clothingType=hoodie&prompt=minimalist+logo&discount=0.30
```

**Returning User with Saved Context**:
```
/offer?source=email-cart&clothingType=tee&prompt=neon+abstract+art&style=futuristic&discount=0.40
```

## Conversion Optimization by Source

### Cold Traffic Optimization
- **Goal**: Build trust, educate, personalize
- **Tactics**:
  - Show tribe membership ("Join 3,891 Streetwear Squad members")
  - Display social proof throughout quiz
  - Use progress bar to show commitment
  - Emphasize AI personalization benefits

### Warm Traffic Optimization
- **Goal**: Accelerate decision-making
- **Tactics**:
  - Pre-populate style preferences when possible
  - Skip redundant questions if source data available
  - Show relevant examples based on source context
  - Highlight limited-time offers

### Hot Traffic Optimization
- **Goal**: Remove friction, close sale
- **Tactics**:
  - Skip quiz entirely if product intent clear
  - Show offer immediately with discount
  - One-click path to design studio
  - Display urgency indicators ("40% off - First Drop Only")

## Tracking Implementation

### Analytics Events to Track
```typescript
// Quiz Started
trackEvent('quiz_started', {
  source: 'tiktok',
  campaign: 'holiday',
  timestamp: Date.now()
});

// Quiz Completed
trackEvent('quiz_completed', {
  source: 'tiktok',
  campaign: 'holiday',
  style_result: 'streetwear',
  product_recommended: 'hoodie',
  completion_time_seconds: 47
});

// Offer Viewed
trackEvent('offer_viewed', {
  source: 'tiktok',
  product: 'hoodie',
  discount: 0.40,
  price: 49.00,
  discounted_price: 29.40
});

// Design Studio Entered
trackEvent('design_studio_entered', {
  source: 'tiktok',
  product: 'hoodie',
  prompt_prefilled: true
});
```

## A/B Testing Recommendations

### Test 1: Quiz Length by Traffic Source
- **Hypothesis**: Cold traffic converts better with full quiz; hot traffic with shortened quiz
- **Variants**:
  - Control: 5 questions for all
  - Variant A: 5 questions cold, 3 questions warm, 0 questions hot
  - Variant B: 3 questions for all

### Test 2: Discount Display Timing
- **Hypothesis**: Showing discount early increases completion for cold traffic
- **Variants**:
  - Control: Show discount on offer page only
  - Variant A: Show discount on quiz result page
  - Variant B: Show discount in quiz progress bar

### Test 3: Product Recommendation Logic
- **Hypothesis**: Source-specific product defaults improve conversion
- **Variants**:
  - Control: Quiz answers determine product
  - Variant A: TikTok → default hoodie, Instagram → default tee, Google → user search term
  - Variant B: Style profile + source combined

## Campaign-Specific Routing

### Halloween Campaign
```
/quiz?source=tiktok&campaign=halloween-2025
/offer?source=google&campaign=halloween-2025&clothingType=hoodie
```

**Special Features**:
- Halloween-themed style questions
- Spooky design prompts
- Competition entry integration
- Leaderboard visibility

### Black Friday Campaign
```
/offer?source=meta-retargeting&campaign=blackfriday&discount=0.50
```

**Special Features**:
- Higher discount (50% off)
- Urgency timers
- Bundle offers
- Direct to offer page (skip quiz)

### Valentine's Day Campaign
```
/quiz?source=pinterest&campaign=valentines&style=romantic
```

**Special Features**:
- Couple design options
- Gift packaging offers
- Romantic style prompts
- Matching set recommendations

## Summary

| Traffic Type | Entry Point | Primary Goal | Key Metric |
|--------------|-------------|--------------|------------|
| **Cold** | `/quiz` | Educate & Personalize | Quiz Completion Rate |
| **Warm** | `/quiz` with hints | Accelerate Decision | Time to Offer Page |
| **Hot** | `/offer` directly | Remove Friction | Offer → Checkout Rate |

**Golden Rule**: The warmer the traffic, the fewer steps to checkout.
