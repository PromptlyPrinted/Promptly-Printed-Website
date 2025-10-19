# Dynamic Quiz System - Complete Guide

## Overview

The enhanced quiz system now dynamically selects products based on user preferences including:
- **Gender/Audience** (Men's, Women's, Kids, Babies)
- **Style Type** (Classic Tee, V-Neck, Triblend, Tank Top, Long Sleeve, Hoodie, etc.)
- **Theme/Occasion** (Halloween, Christmas, Summer, Everyday, Custom)
- **AI Model** (Flux Dev, LORA variants, Nano Banana, SeeDance)
- **Color Preferences** from actual product inventory
- **Design Vibe & Personality**

## Quiz Flow (8 Steps)

### Step 1: Audience Selection
**Question:** "Who's this for?"

Options:
- 👨 Men's - Classic and modern men's apparel
- 👩 Women's - Stylish women's clothing
- 👦 Kids - Fun designs for children
- 👶 Babies - Adorable baby apparel

**Purpose:** Determines which product catalog to show in next steps

---

### Step 2: Style Type Selection
**Question:** "What style do you prefer?"

**Dynamic Options Based on Audience:**

**For Babies:**
- 👕 Bodysuit - Comfortable baby bodysuit (SKU: A-BB-LA4411)
- 👶 Baby Tee - Cute baby t-shirt (SKU: GLOBAL-TEE-RS-3322)

**For Kids:**
- 👕 Kids Tee - Classic t-shirt for kids (SKU: A-KT-GD64000B)
- 🧥 Kids Hoodie - Cozy hoodie (SKU: HOOD-AWD-JH001B)
- 👔 Sweatshirt - Comfortable sweatshirt (SKU: SWEAT-AWD-JH030B)

**For Women:**
- 👕 Classic Tee - Everyday women's t-shirt (SKU: A-WT-GD64000L)
- 👚 V-Neck - Flattering v-neck style (SKU: GLOBAL-TEE-BC-6035)
- 🧥 Hoodie - Cozy and stylish (SKU: A-WH-JH001F)

**For Men:**
- 👕 Classic Tee - Timeless everyday wear (SKU: TEE-SS-STTU755)
- 👚 V-Neck - Modern v-neck style (SKU: GLOBAL-TEE-GIL-64V00)
- ✨ Triblend - Ultra-soft premium blend (SKU: GLOBAL-TEE-BC-3413)
- 🎽 Tank Top - Athletic sleeveless (SKU: TT-GIL-64200)
- 👔 Long Sleeve - Year-round versatility (SKU: A-ML-GD2400)
- 🧥 Hoodie - Statement comfort piece (SKU: A-MH-JH001)
- ⚾ Baseball Tee - Sporty raglan style (SKU: AU3-TEE-U-B-3200)

**Purpose:** Selects exact product SKU from inventory

---

### Step 3: Theme/Occasion
**Question:** "What's the occasion?"

Options:
- ☀️ Everyday Wear - Timeless, versatile designs
- 🎃 Halloween - Spooky seasonal vibes
- 🎄 Christmas - Festive holiday cheer
- 🌴 Summer - Bright tropical vibes
- 🎨 Custom - Fully personalized

**Purpose:** Adds theme-specific modifiers to AI prompt

**Theme Modifiers:**
- **Halloween:** "with spooky Halloween theme, featuring pumpkins, ghosts, or dark atmospheric elements"
- **Christmas:** "with festive Christmas theme, featuring winter elements, holiday cheer, and seasonal colors"
- **Summer:** "with bright summer vibes, beach elements, sunshine, and tropical colors"
- **Everyday:** "versatile for everyday wear with timeless appeal"
- **Custom:** No modifier - user has full control

---

### Step 4: AI Model Selection
**Question:** "Choose your AI model"

Options with strengths:

| Model | Icon | Description | Best For |
|-------|------|-------------|----------|
| **Flux Dev** | ⚡ | Balanced, versatile, high quality | General purpose, logos, illustrations |
| **LORA Normal** | 🎨 | Artistic detail, vibrant colors | Complex artwork, character designs |
| **LORA Context** | 📖 | Smart themes, storytelling | Narrative designs, themed collections |
| **Nano Banana** | 🍌 | Fast, clean, minimalist | Simple designs, text-heavy, minimalist |
| **SeeDance** | 💃 | Dynamic, energetic visuals | Streetwear, bold graphics, action themes |

**Purpose:** Influences design generation and adds model-specific guidance to prompt

---

### Step 5: Vibe Selection
**Question:** "What's your vibe?"

Options:
- ⚪ Minimalist - Clean lines, simple elegance
- 🔥 Streetwear - Urban, bold, statement-making
- 🎨 Graphic - Eye-catching designs, expressive
- 🌙 Surreal - Dreamy, artistic, unique
- 🚀 Futuristic - Tech-inspired, modern edge

**Purpose:** Determines style profile and design aesthetic

---

### Step 6: Color Palette
**Question:** "Preferred color palette?"

Options:
- ⚫ Black & White - Classic monochrome
- 🌿 Earth Tones - Natural, warm colors
- 💥 Neon - Bright, electric vibes
- 🌸 Pastels - Soft, calming hues
- 🎭 Monochrome - Single color focus

**Purpose:** Guides color scheme in AI prompt generation

---

### Step 7: Wear Location
**Question:** "Where do you wear your style most?"

Options:
- ☀️ Everyday - Casual daily wear
- 💪 Gym - Active lifestyle
- 🌃 Night Out - Social occasions
- 💼 Creative Work - Studio, office, events
- 🛋️ Chill - Relaxed comfort

**Purpose:** Adds contextual styling to design prompt

---

### Step 8: Design Personality
**Question:** "Design personality?"

Options:
- ✨ Simple Logo - Clean branding aesthetic
- 🖌️ Illustration - Artistic hand-drawn style
- 🎨 Abstract Art - Creative, unique patterns
- 📝 Text-Heavy - Typography-focused
- 👾 Character - Mascots, personas

**Purpose:** Determines primary design approach

---

## Product Selection Logic

### SKU Mapping

The system uses `quiz-product-selector.ts` to map answers to actual products:

```typescript
const PRODUCT_SKU_MAP = {
  mens: {
    'classic-tee': 'TEE-SS-STTU755',
    'triblend': 'GLOBAL-TEE-BC-3413',
    'tank-top': 'TT-GIL-64200',
    'v-neck': 'GLOBAL-TEE-GIL-64V00',
    'long-sleeve': 'A-ML-GD2400',
    'hoodie': 'A-MH-JH001',
    'baseball-tee': 'AU3-TEE-U-B-3200',
  },
  womens: {
    'classic-tee': 'A-WT-GD64000L',
    'v-neck': 'GLOBAL-TEE-BC-6035',
    'hoodie': 'A-WH-JH001F',
  },
  kids: {
    'classic-tee': 'A-KT-GD64000B',
    'hoodie': 'HOOD-AWD-JH001B',
    'sweatshirt': 'SWEAT-AWD-JH030B',
  },
  babies: {
    'bodysuit': 'A-BB-LA4411',
    'classic-tee': 'GLOBAL-TEE-RS-3322',
  },
};
```

### Selection Function

```typescript
function selectProductFromQuiz(answers: QuizAnswers): string | null {
  const audience = answers.audience || 'mens';
  const styleType = answers.styleType || 'classic-tee';

  return PRODUCT_SKU_MAP[audience][styleType];
}
```

---

## AI Prompt Generation

The system builds a comprehensive prompt from all quiz answers:

### Example Generated Prompt

**User Selections:**
- Audience: Men's
- Style: Hoodie
- Theme: Halloween
- AI Model: SeeDance
- Vibe: Streetwear
- Color: Neon
- Personality: Character
- Location: Night Out

**Generated Prompt:**
```
Create a bold urban streetwear graphic with graffiti-inspired elements
featuring a unique character design with spooky Halloween theme, featuring
pumpkins, ghosts, or dark atmospheric elements, focusing on vibrant neon
colors with electric glow effects, statement-making for social occasions.
Optimize for apparel print with high contrast and bold details suitable
for t-shirt printing. Style should emphasize: Streetwear, bold graphics,
action themes.
```

### Prompt Building Function

```typescript
function generateAIPrompt(answers: QuizAnswers): string {
  const vibe = vibeMap[answers.vibe];
  const personality = designPersonalityMap[answers.designPersonality];
  const themeModifier = THEME_MODIFIERS[answers.theme];

  let prompt = `Create a ${vibe} ${personality}`;

  if (themeModifier) prompt += ` ${themeModifier}`;
  if (answers.colorPreference) prompt += `, focusing on ${answers.colorPreference} tones`;

  prompt += '. Optimize for apparel print with high contrast and bold details.';

  if (answers.aiModel) {
    prompt += ` Style should emphasize: ${AI_MODEL_INFO[answers.aiModel].bestFor}.`;
  }

  return prompt;
}
```

---

## Giveaway & Discount System

### Giveaway Tiers

The system determines giveaway rewards based on user context:

| Tier | Discount | Free Items | Trigger |
|------|----------|-----------|---------|
| **Standard** | 30% OFF | Free Sticker Sheet | Quiz completion |
| **Email Capture** | 35% OFF | Sticker + Postcard | Email provided |
| **First Purchase** | 40% OFF | Sticker + Temporary Tattoo | First-time buyer |
| **Campaign** | 35% OFF | Sticker + Keyring | Active campaign (Halloween, etc.) |
| **Bundle** | 45% OFF | Keyring + Coaster per item | 2+ items in cart |

### Recommended Giveaway Products

**Best Low-Cost, High-Value Items:**

1. **Stickers** (GLOBAL-STI-3X4-G) - $2-3 cost
   - High perceived value
   - Easy to ship
   - Shareable/Instagram-worthy

2. **Temporary Tattoos** (GLOBAL-TATT-S) - $1-2 cost
   - Unique offering
   - Social media content potential

3. **Postcards** (GLOBAL-POST-MOH-6X4) - $2 cost
   - Can feature their AI design
   - Keepsake value

4. **Keyrings** (PLA-KEYRING) - $3-4 cost
   - Practical daily use
   - Brand visibility

5. **Drink Coasters 2-pack** (H-COAST-2PK) - $4-5 cost
   - Useful household item
   - Can showcase design

### Giveaway Selection Logic

```typescript
function determineGiveawayTier(context: {
  isFirstPurchase?: boolean;
  hasEmailCaptured?: boolean;
  isCampaign?: boolean;
  itemCount?: number;
}): keyof typeof GIVEAWAY_ITEMS {
  if (context.itemCount >= 2) return 'bundle';
  if (context.isFirstPurchase) return 'firstPurchase';
  if (context.isCampaign) return 'campaign';
  if (context.hasEmailCaptured) return 'emailCapture';
  return 'standard';
}
```

---

## Result Page Display

### Components Shown

1. **Style Profile Card**
   - Personality name (e.g., "Streetwear Icon")
   - Description
   - Tribe membership count

2. **AI Prompt Preview**
   - Full generated prompt
   - AI model selected with description

3. **Giveaway Offer Banner** ⭐
   - Discount percentage prominently displayed
   - Free bonus items listed
   - Benefits included (unlimited AI generations, priority production)

4. **Product Recommendation**
   - Selected product display name
   - Product benefits

5. **CTA Buttons**
   - Primary: "See My Offer" → Routes to `/offer` page
   - Secondary: "Change Style" → Go back to quiz

### URL Parameters Passed to Offer Page

```
?prompt=...                    // Generated AI prompt
&style=streetwear              // User vibe
&campaign=halloween-2025       // Campaign tag
&source=style-quiz             // Traffic source
&productSKU=A-MH-JH001        // Selected product SKU
&audience=mens                 // Audience type
&styleType=hoodie              // Style type
&theme=halloween               // Theme selected
&aiModel=seedance              // AI model choice
&discount=0.30                 // Discount to apply (30%)
&giveawayTier=standard         // Giveaway tier
&clothingType=hoodie           // Legacy compatibility
```

---

## Integration with Existing Flow

### Flow Diagram

```
User arrives → Quiz (8 steps) → Style Result Page → Offer Page → Design Studio → Checkout
```

### File Structure

**Core Quiz Files:**
- `/apps/web/app/quiz/page.tsx` - Main quiz container (8 steps)
- `/apps/web/app/quiz/components/QuizStep.tsx` - Reusable question UI
- `/apps/web/app/quiz/components/StyleResult.tsx` - Result page with giveaway display
- `/apps/web/lib/quiz-product-selector.ts` - Product selection logic

**Data Flow:**
1. User answers 8 questions → stored in `StyleQuizAnswers` state
2. On completion → `generateAIPrompt(answers)` builds personalized prompt
3. `selectProductFromQuiz(answers)` determines exact product SKU
4. `determineGiveawayTier()` selects appropriate discount/giveaway
5. All data passed via URL params to `/offer` page
6. Offer page fetches actual product data using SKU
7. User proceeds to design studio with pre-filled prompt

---

## Campaign-Specific Features

### Halloween Campaign Example

**URL Entry Point:**
```
https://promptlyprinted.com/quiz?campaign=halloween-2025&source=tiktok
```

**Quiz Behavior:**
- Theme step auto-highlights Halloween option
- Giveaway tier defaults to "Campaign" (35% OFF + themed items)
- AI prompts automatically include spooky modifiers
- Post-purchase auto-enters Halloween competition

### Creating New Campaigns

1. **Add theme to quiz** (already available: halloween, christmas, summer)
2. **Create competition in database** (optional):
   ```typescript
   await prisma.competition.create({
     data: {
       theme: 'Halloween Design Contest',
       funnelTag: 'halloween-2025',
       prize: '$500',
       isActive: true,
     }
   });
   ```
3. **Route traffic** with campaign parameter
4. **System automatically**:
   - Applies campaign giveaway tier
   - Adds theme modifiers to prompts
   - Tracks campaign attribution
   - Enters designs in competition

---

## A/B Testing Opportunities

### Recommended Tests

1. **Quiz Length**
   - Test: 8 steps vs 5 steps (skip audience, theme, AI model)
   - Metric: Completion rate

2. **Discount Visibility**
   - Test: Show discount on step 1 vs only on result page
   - Metric: Drop-off rate per step

3. **Giveaway Presentation**
   - Test: "Free gift" vs specific item names
   - Metric: Click-through to offer page

4. **AI Model Step**
   - Test: Show AI model step vs auto-select based on vibe
   - Metric: User engagement & satisfaction

5. **Product Recommendation**
   - Test: Quiz-selected vs most popular default
   - Metric: Conversion rate

---

## Technical Implementation Notes

### Type Safety

All quiz answers are strongly typed:

```typescript
export type QuizAnswers = {
  audience?: 'mens' | 'womens' | 'kids' | 'babies';
  styleType?: 'classic-tee' | 'v-neck' | 'triblend' | ...;
  theme?: 'halloween' | 'everyday' | 'christmas' | ...;
  aiModel?: 'flux-dev' | 'lora-normal' | ...;
  // ... more fields
};
```

### Backwards Compatibility

The system maintains backwards compatibility with old quiz:
- `clothingType` field still passed for legacy systems
- Old URLs still work (default to men's classic tee)
- Existing offer page integration unchanged

### Performance

- Product selection is instant (no API calls)
- SKU map lookup is O(1)
- Prompt generation is synchronous
- No external dependencies

---

## Metrics to Track

### Quiz Funnel Metrics

| Step | Metric | Target |
|------|--------|--------|
| Step 1 | Audience selection rate | >95% |
| Step 2 | Style type selection rate | >90% |
| Step 3 | Theme selection rate | >85% |
| Step 4 | AI model selection rate | >80% |
| Step 5 | Vibe selection rate | >75% |
| Step 6 | Color selection rate | >70% |
| Step 7 | Location selection rate | >65% |
| Step 8 | Design personality completion | >60% |
| **Overall** | **Quiz completion rate** | **>60%** |
| Result → Offer | Click-through rate | >40% |

### Product Distribution

Track which products are most selected:
- Most popular audience
- Most popular style type
- Most popular theme
- Most popular AI model

### Giveaway Impact

- Conversion rate by giveaway tier
- Email capture rate with 35% vs 30% discount
- Bundle uptake (2+ items)

---

## Troubleshooting

### Common Issues

**Issue:** User doesn't see options for their audience
- **Check:** Verify audience is set before step 2
- **Fix:** Ensure audience state persists across steps

**Issue:** Wrong product selected
- **Check:** Verify SKU map includes audience + styleType combo
- **Fix:** Add missing SKU to `PRODUCT_SKU_MAP`

**Issue:** Prompt doesn't include theme
- **Check:** Ensure theme answer is captured
- **Fix:** Verify `THEME_MODIFIERS` includes the theme

**Issue:** Giveaway tier incorrect
- **Check:** Context values passed to `determineGiveawayTier()`
- **Fix:** Update logic in `StyleResult.tsx`

---

## Future Enhancements

### Phase 2
- [ ] Add color selector from actual product colors
- [ ] Show product preview on result page
- [ ] Email capture step with bonus discount
- [ ] Save quiz results for logged-in users
- [ ] Quiz analytics dashboard

### Phase 3
- [ ] Dynamic question order based on traffic source
- [ ] Personalized product recommendations using ML
- [ ] A/B testing framework built-in
- [ ] Multi-language support
- [ ] Voice-guided quiz for accessibility

---

## Contact & Support

For questions about the quiz system:
1. Review this guide
2. Check `STYLE_QUIZ_FUNNEL.md` for overall funnel architecture
3. Inspect `/apps/web/lib/quiz-product-selector.ts` for selection logic
4. Test in development: `http://localhost:3000/quiz`

---

**Last Updated:** 2025-01-22
**Version:** 2.0
**Status:** Production Ready ✅
