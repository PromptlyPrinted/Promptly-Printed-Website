# Theme Funnel System Guide

## Overview
The quiz funnel system is designed to be theme-agnostic. You can create unlimited themed funnels (Halloween, Black Friday, Christmas, etc.) that all redirect to the same design system with personalized prompts.

---

## 🎯 Architecture

```
/halloween-2025/quiz        → Redirects to → /design/[sku]?campaign=halloween-2025
/black-friday-2024/quiz     → Redirects to → /design/[sku]?campaign=black-friday-2024
/christmas-2024/quiz        → Redirects to → /design/[sku]?campaign=christmas-2024
```

All funnels use:
- Same ProductDetail component
- Same AI generation
- Same cart/checkout
- **Different prompts & questions**

---

## 📋 Creating a New Theme Funnel

### **1. Duplicate the Base Quiz**

```bash
# Copy Halloween funnel as template
cp -r apps/web/app/halloween-2025 apps/web/app/black-friday-2024
```

### **2. Update Quiz Questions**

Edit `/black-friday-2024/quiz/page.tsx`:

**Halloween Questions:**
```tsx
{
  question: "What's your Halloween vibe?",
  options: [
    { id: 'dark-spooky', label: 'Spooky & Dark', icon: '🦇' },
    { id: 'cute-playful', label: 'Cute & Playful', icon: '👻' },
  ]
}
```

**Black Friday Questions:**
```tsx
{
  question: "What's your shopping style?",
  options: [
    { id: 'deal-hunter', label: 'Deal Hunter', description: 'I want maximum value', icon: '💰' },
    { id: 'trendsetter', label: 'Trendsetter', description: 'Latest styles only', icon: '🔥' },
    { id: 'gift-giver', label: 'Gift Giver', description: 'Shopping for others', icon: '🎁' },
    { id: 'bulk-buyer', label: 'Bulk Buyer', description: 'Stocking up', icon: '📦' },
  ]
}
```

### **3. Update Prompt Generation**

Edit `/black-friday-2024/quiz/components/QuizResults.tsx`:

**Halloween Prompt Map:**
```tsx
const styleMap = {
  'dark-spooky': 'gothic horror with dark shadows',
  'cute-playful': 'friendly cartoon style',
};
```

**Black Friday Prompt Map:**
```tsx
const styleMap = {
  'deal-hunter': 'bold text-heavy design with price tags and sale graphics',
  'trendsetter': 'modern streetwear aesthetic with clean typography',
  'gift-giver': 'festive and giftable design with ribbons and bows',
  'bulk-buyer': 'classic versatile design for everyday wear',
};
```

### **4. Update Campaign Name**

In `QuizResults.tsx`, change the campaign parameter:

```tsx
const params = new URLSearchParams({
  prompt: designPrompt,
  campaign: 'black-friday-2024', // ← Change this
  ...(answers.email && { email: answers.email }),
});
```

### **5. Update Landing Page**

Edit `/black-friday-2024/page.tsx` metadata:

```tsx
export const metadata: Metadata = {
  title: 'Black Friday 2024 - Up to 70% Off Custom Apparel | Promptly Printed',
  description: 'Shop our biggest sale of the year! Design custom t-shirts, hoodies, and more with AI. Limited time Black Friday deals.',
  keywords: [
    'black friday custom t-shirts',
    'cyber monday deals apparel',
    'custom clothing sale',
    'ai-designed merch discount',
  ],
};
```

### **6. Update Hero Component**

Edit `/black-friday-2024/components/HeroOffer.tsx`:

**Change colors:**
```tsx
// Halloween: Purple/Orange
className="bg-gradient-to-r from-orange-500 to-purple-600"

// Black Friday: Red/Black
className="bg-gradient-to-r from-red-600 to-black"
```

**Change copy:**
```tsx
<h1>
  Get <span className="text-red-500">70% Off</span> Custom Apparel
  <br />
  Black Friday Only
</h1>
<p>
  Design with AI, save big, ship fast. Limited quantities available.
</p>
```

---

## 🎨 Example: Black Friday Quiz Flow

### **Question 1: Shopping Style**
```tsx
{
  question: "What's your Black Friday shopping style?",
  options: [
    { id: 'deal-hunter', label: 'Deal Hunter', icon: '💰' },
    { id: 'trendsetter', label: 'Trendsetter', icon: '🔥' },
    { id: 'gift-giver', label: 'Gift Giver', icon: '🎁' },
    { id: 'bulk-buyer', label: 'Bulk Buyer', icon: '📦' },
  ]
}
```

### **Question 2: Design Vibe**
```tsx
{
  question: "What design style are you after?",
  options: [
    { id: 'minimalist', label: 'Minimalist', icon: '⚪' },
    { id: 'bold-graphic', label: 'Bold Graphic', icon: '💥' },
    { id: 'vintage', label: 'Vintage', icon: '📻' },
    { id: 'streetwear', label: 'Streetwear', icon: '👟' },
  ]
}
```

### **Question 3: Product Type**
```tsx
{
  question: "What are you shopping for?",
  options: [
    { id: 'hoodie', label: 'Hoodie', icon: '🧥' },
    { id: 'tee', label: 'T-Shirt', icon: '👕' },
    { id: 'crewneck', label: 'Crewneck', icon: '👚' },
    { id: 'bundle', label: 'Bundle Pack', icon: '🎁' },
  ]
}
```

### **Question 4: Quantity**
```tsx
{
  question: "How many pieces?",
  options: [
    { id: 'single', label: 'Just 1', icon: '1️⃣' },
    { id: 'few', label: '2-5 pieces', icon: '📦' },
    { id: 'bulk', label: '6+ pieces', icon: '🏪' },
  ]
}
```

### **Generated Prompt Example**

**Answers:** Deal Hunter + Bold Graphic + Hoodie
**Generated Prompt:**
```
"Shopping for maximum value. Create a bold text-heavy design with price tags
and sale graphics for a hoodie. Include eye-catching colors, strong typography,
and commercial appeal. Optimize for print with high contrast."
```

---

## 🎁 Example: Christmas Quiz Flow

### **Question 1: Holiday Mood**
```tsx
{
  question: "What's your holiday mood?",
  options: [
    { id: 'cozy-classic', label: 'Cozy & Classic', icon: '🎄' },
    { id: 'funny-festive', label: 'Funny & Festive', icon: '😂' },
    { id: 'elegant-winter', label: 'Elegant Winter', icon: '❄️' },
    { id: 'ugly-sweater', label: 'Ugly Sweater Vibes', icon: '🦌' },
  ]
}
```

### **Question 2: Recipients**
```tsx
{
  question: "Who's this for?",
  options: [
    { id: 'self', label: 'Myself', icon: '🎁' },
    { id: 'family', label: 'Family Matching', icon: '👨‍👩‍👧‍👦' },
    { id: 'gifts', label: 'Holiday Gifts', icon: '🎅' },
    { id: 'party', label: 'Office Party', icon: '🎉' },
  ]
}
```

---

## 📊 Campaign Tracking

The `campaign` parameter flows through your entire system:

### **1. Analytics**
Track which campaigns drive conversions:
```tsx
// In your analytics
trackEvent('quiz_completed', {
  campaign: 'black-friday-2024',
  product_selected: 'hoodie',
  style: 'deal-hunter'
});
```

### **2. Discounts**
Apply campaign-specific discounts:
```tsx
// In checkout
if (campaign === 'black-friday-2024') {
  discount = 0.70; // 70% off
} else if (campaign === 'halloween-2025') {
  discount = 0.10; // 10% off
}
```

### **3. Email Campaigns**
Segment users by campaign:
```tsx
// When capturing email
saveEmailToList({
  email: answers.email,
  campaign: 'black-friday-2024',
  tags: ['black-friday-shopper', 'quiz-completed']
});
```

---

## 🎯 Campaign-Specific Landing Pages

Each theme can have its own landing page structure:

```
/halloween-2025
  ├─ quiz/          (Quiz funnel)
  ├─ components/
  │   ├─ HeroOffer.tsx          (Spooky themed)
  │   ├─ ProductShowcase.tsx
  │   └─ FAQ.tsx
  └─ page.tsx

/black-friday-2024
  ├─ quiz/          (Quiz funnel)
  ├─ components/
  │   ├─ HeroOffer.tsx          (Sale themed)
  │   ├─ DealsCountdown.tsx
  │   └─ FAQ.tsx
  └─ page.tsx
```

---

## 🚀 Quick Start: New Theme Checklist

- [ ] **Copy base folder**: `cp -r halloween-2025 [theme-name]`
- [ ] **Update metadata**: Title, description, keywords
- [ ] **Rewrite quiz questions**: 4 themed questions
- [ ] **Update prompt mapping**: Style → prompt text
- [ ] **Change campaign name**: In QuizResults.tsx
- [ ] **Update colors**: Theme-appropriate palette
- [ ] **Customize hero**: Headline, CTA, imagery
- [ ] **Set up tracking**: Analytics events
- [ ] **Test full flow**: Quiz → Design → Checkout

---

## 💡 Best Practices

### **1. Keep Quiz Short**
- 4-5 questions max
- Multiple choice only
- Visual icons for engagement

### **2. Match Brand Voice**
- Halloween: Playful, spooky, fun
- Black Friday: Urgent, deal-focused
- Christmas: Warm, festive, generous

### **3. Optimize Prompts**
The better your prompt mapping, the better the AI results:

**Bad:**
```tsx
'deal-hunter': 'sale design'
```

**Good:**
```tsx
'deal-hunter': 'bold text-heavy design with price tags, sale graphics,
eye-catching colors, and commercial appeal optimized for print'
```

### **4. A/B Test**
- Test different question sets
- Compare prompt variations
- Track completion rates per theme

---

## 🎨 Theme Color Palettes

### Halloween
- Primary: `#FF8A26` (Orange)
- Secondary: `#8B5CF6` (Purple)
- Background: `#1a0b2e`

### Black Friday
- Primary: `#DC2626` (Red)
- Secondary: `#000000` (Black)
- Accent: `#FCD34D` (Gold)

### Christmas
- Primary: `#16A34A` (Green)
- Secondary: `#DC2626` (Red)
- Accent: `#FFFFFF` (Snow White)

### Valentine's Day
- Primary: `#EC4899` (Pink)
- Secondary: `#DC2626` (Red)
- Accent: `#FFF1F2` (Soft Pink)

---

## 📈 Success Metrics by Theme

Track these KPIs per campaign:

- **Quiz Completion Rate**: % who finish quiz
- **Email Capture Rate**: % who provide email
- **Design Generation Rate**: % who generate design
- **Conversion Rate**: % who purchase
- **Average Order Value**: Per campaign
- **Product Preference**: Which products per theme

---

**You now have a scalable system for unlimited themed funnels! Each theme has its own personality but shares the same powerful design infrastructure.** 🎨
