# Credit System UI Components - Usage Guide

## 🎨 Overview

Complete set of React components for displaying and managing credits in your AI image generation platform.

---

## 📦 Components Created

### 1. `<CreditBalance />` - Display User Credits
**Location:** `/components/credits/CreditBalance.tsx`

Shows current credit balance with warnings, guest limits, and buy buttons.

#### Props
```typescript
{
  onBuyCredits?: () => void;      // Called when "Buy Credits" is clicked
  showDetails?: boolean;          // Show lifetime stats (default: false)
  compact?: boolean;              // Compact mode for headers (default: false)
}
```

#### Usage Examples

**In Header (Compact):**
```tsx
<CreditBalance
  compact
  onBuyCredits={() => setShowModal(true)}
/>
```

**In Sidebar (Full Details):**
```tsx
<CreditBalance
  showDetails
  onBuyCredits={() => setShowModal(true)}
/>
```

#### Features
- ✅ Auto-fetches credit info from `/api/credits`
- ✅ Different views for authenticated vs guest users
- ✅ Color-coded warnings (green/yellow/red)
- ✅ Welcome credits indicator
- ✅ Guest limit countdown
- ✅ Sign-up prompts for guests

---

### 2. `<CreditPacksModal />` - Purchase Credits
**Location:** `/components/credits/CreditPacksModal.tsx`

Full-screen modal displaying all available credit packs for purchase.

#### Props
```typescript
{
  isOpen: boolean;                // Modal visibility
  onClose: () => void;            // Close handler
  onPurchase?: (packId: string) => void;  // Purchase handler
}
```

#### Usage
```tsx
const [showModal, setShowModal] = useState(false);

<CreditPacksModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onPurchase={(packId) => {
    // Implement Stripe/Square checkout here
    initiateCheckout(packId);
  }}
/>
```

#### Features
- ✅ Auto-fetches packs from `/api/credit-packs`
- ✅ Highlights "Most Popular" pack
- ✅ Shows bonus credits
- ✅ Displays price per credit
- ✅ Savings calculator
- ✅ Model cost reference chart
- ✅ Responsive grid layout

---

### 3. `<GenerationCostIndicator />` - Show Generation Cost
**Location:** `/components/credits/GenerationCostIndicator.tsx`

Displays the credit cost for a specific AI model before generation.

#### Props
```typescript
{
  modelName: string;              // 'flux-dev', 'nano-banana', etc.
  currentBalance?: number;        // User's current credit balance
  isGuest?: boolean;              // Is this a guest user?
  guestRemaining?: number;        // Guest generations left
  compact?: boolean;              // Compact badge mode
}
```

#### Usage Examples

**Full Indicator (Before Generation):**
```tsx
<GenerationCostIndicator
  modelName="flux-dev"
  currentBalance={userCredits.balance}
  isGuest={!session}
  guestRemaining={guestInfo.remaining}
/>
```

**Compact Badge:**
```tsx
<GenerationCostIndicator
  modelName="nano-banana-pro"
  currentBalance={50}
  compact
/>
```

#### Visual States
- 🟢 **Green** - Sufficient credits
- 🟡 **Yellow** - Low balance (<10 credits)
- 🔴 **Red** - Insufficient credits
- 🔵 **Blue** - Guest user (free)

---

### 4. `<ModelRecommendation />` - AI Model Selector
**Location:** `/components/credits/ModelRecommendation.tsx`

Interactive model selection with credit-based recommendations.

#### Props
```typescript
{
  selectedModel?: string;         // Currently selected model
  onModelSelect: (modelId: string) => void;  // Selection handler
  currentBalance?: number;        // User's credits
  isGuest?: boolean;              // Guest status
  showCosts?: boolean;            // Display credit costs (default: true)
}
```

#### Usage
```tsx
const [selectedModel, setSelectedModel] = useState('flux-dev');

<ModelRecommendation
  selectedModel={selectedModel}
  onModelSelect={setSelectedModel}
  currentBalance={userCredits.balance}
  isGuest={!session}
/>
```

#### Features
- ✅ Smart recommendations based on balance
- ✅ Visual tiers (Budget/Standard/Premium)
- ✅ Disables unaffordable models
- ✅ Shows "RECOMMENDED" badge
- ✅ Displays model capabilities
- ✅ Credit cost per model

---

## 🚀 Integration Guide

### Step 1: Add to Header/Navigation

```tsx
// app/components/header.tsx
import { CreditBalance } from '@/components/credits/CreditBalance';
import { useState } from 'react';

export function Header() {
  const [showPurchase, setShowPurchase] = useState(false);

  return (
    <header>
      {/* ... other header content ... */}

      <CreditBalance
        compact
        onBuyCredits={() => setShowPurchase(true)}
      />

      <CreditPacksModal
        isOpen={showPurchase}
        onClose={() => setShowPurchase(false)}
        onPurchase={handleCheckout}
      />
    </header>
  );
}
```

---

### Step 2: Add to Design Studio

```tsx
// app/design/[productSku]/page.tsx
import { CreditBalance } from '@/components/credits/CreditBalance';
import { ModelRecommendation } from '@/components/credits/ModelRecommendation';
import { GenerationCostIndicator } from '@/components/credits/GenerationCostIndicator';
import { useState, useEffect } from 'react';

export default function DesignStudio() {
  const [selectedModel, setSelectedModel] = useState('flux-dev');
  const [creditInfo, setCreditInfo] = useState(null);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    const res = await fetch('/api/credits');
    const data = await res.json();
    setCreditInfo(data);
  };

  const handleGenerate = async () => {
    // Show cost before generating
    const cost = MODEL_CREDIT_COSTS[selectedModel];

    if (!creditInfo.authenticated && creditInfo.guest.remaining === 0) {
      alert('Daily limit reached! Sign up to continue.');
      return;
    }

    if (creditInfo.authenticated && creditInfo.credits.balance < cost) {
      setShowPurchaseModal(true);
      return;
    }

    // Make generation request
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        models: [...],
        aiModel: selectedModel,
      }),
    });

    if (res.status === 402) {
      // Insufficient credits
      setShowPurchaseModal(true);
      return;
    }

    if (res.status === 429) {
      // Guest limit
      window.location.href = '/signup';
      return;
    }

    const result = await res.json();

    // Update balance display
    fetchCredits();

    // Show generated image
    displayImage(result.data);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar */}
      <div className="col-span-3">
        <CreditBalance showDetails onBuyCredits={() => setShowPurchaseModal(true)} />
      </div>

      {/* Main Area */}
      <div className="col-span-9">
        <ModelRecommendation
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          currentBalance={creditInfo?.credits?.balance}
          isGuest={!creditInfo?.authenticated}
        />

        <textarea placeholder="Enter prompt..." />

        <GenerationCostIndicator
          modelName={selectedModel}
          currentBalance={creditInfo?.credits?.balance}
          isGuest={!creditInfo?.authenticated}
          guestRemaining={creditInfo?.guest?.remaining}
        />

        <button onClick={handleGenerate}>
          Generate Image
        </button>
      </div>
    </div>
  );
}
```

---

### Step 3: Add to Quiz Results

```tsx
// app/quiz/components/StyleResult.tsx
import { ModelRecommendation } from '@/components/credits/ModelRecommendation';

export function StyleResult({ answers }) {
  const [selectedModel, setSelectedModel] = useState('flux-dev');
  const [creditInfo, setCreditInfo] = useState(null);

  // Fetch credits
  useEffect(() => {
    fetch('/api/credits').then(r => r.json()).then(setCreditInfo);
  }, []);

  return (
    <div>
      {/* ... quiz result content ... */}

      {/* Add model selection before generating */}
      <ModelRecommendation
        selectedModel={selectedModel}
        onModelSelect={setSelectedModel}
        currentBalance={creditInfo?.credits?.balance}
        isGuest={!creditInfo?.authenticated}
      />

      <button onClick={() => generateWithModel(selectedModel)}>
        See My Design
      </button>
    </div>
  );
}
```

---

## 🎯 User Flows

### Guest User Flow
```
1. User visits site (0/3 used)
   → Shows: "3 free generations remaining"

2. Generates first image (1/3 used)
   → Shows: "2 free generations remaining"
   → Hint: "Sign up to get 50 credits!"

3. Generates second image (2/3 used)
   → Shows: "1 free generation remaining"
   → Warning: "Last free generation!"

4. Generates third image (3/3 used)
   → Shows: "0 free generations remaining"
   → Prompt: "Sign up to get 50 credits now!"

5. Tries to generate 4th
   → Error: "Daily limit reached"
   → Big sign-up CTA with benefits
```

### New User Flow
```
1. Signs up
   → Automatically receives 50 credits
   → Welcome message shown

2. Selects model for first generation
   → Sees cost indicator: "Flux Dev: 1 credit"
   → Balance shown: "49 remaining after generation"

3. Generates image
   → Credits deducted
   → New balance: 49 credits

4. Uses multiple models
   → Premium models cost 2 credits
   → Budget models cost 0.5 credits
   → Smart recommendations based on balance

5. Balance runs low (<10)
   → Yellow warning shown
   → "Buy More Credits" button prominent

6. Balance insufficient
   → Red error shown
   → Can't generate until purchase
   → Modal auto-opens with pack options
```

---

## 💰 Credit Pack Display

The modal automatically displays packs with:
- ✅ **Name** and **description**
- ✅ **Base credits** + **bonus credits**
- ✅ **Total credits** calculated
- ✅ **Price** in USD
- ✅ **Price per credit**
- ✅ **Savings percentage**
- ✅ **Popular badge** for best value
- ✅ **Tier badges** (PRO, ENTERPRISE, etc.)

---

## 🔧 Customization

### Change Colors
All components use Tailwind classes. Update colors in `tailwind.config.js`:

```js
colors: {
  primary: {
    DEFAULT: '#16C1A8',  // Your brand color
    dark: '#0D2C45',     // Secondary brand color
  }
}
```

### Modify Credit Costs
Update `/lib/credits.ts`:

```typescript
export const MODEL_CREDIT_COSTS: Record<string, number> = {
  'flux-dev': 1,
  'nano-banana': 0.5,
  'nano-banana-pro': 2,
  // Add your custom models here
};
```

### Adjust Guest Limits
Update `/lib/credits.ts`:

```typescript
export const GUEST_DAILY_LIMIT = 5;  // Change from 3 to 5
```

### Modify Welcome Credits
Update `/lib/credits.ts`:

```typescript
export const WELCOME_CREDITS = 100;  // Change from 50 to 100
```

---

## 📱 Responsive Design

All components are fully responsive:
- ✅ **Mobile-first** design
- ✅ **Touch-friendly** buttons
- ✅ **Adaptive layouts** (stacks on mobile, grid on desktop)
- ✅ **Readable text** at all screen sizes

---

## 🎨 Styling Guide

### Component States
- **Default:** Gray borders, white background
- **Selected:** Teal borders, teal tinted background
- **Warning:** Yellow borders, yellow background
- **Error:** Red borders, red background
- **Success:** Green borders, green background

### Icons Used
- `Coins` - Credit balance
- `Sparkles` - AI generation, premium features
- `Zap` - Fast/budget options
- `TrendingUp` - Standard tier
- `Crown` - Premium tier
- `AlertCircle` - Warnings/errors
- `Check` - Confirmation/included features

---

## 🧪 Testing

### View Demo Page
Visit `/credits-demo` to see all components in action with interactive examples.

### Test API Endpoints
```bash
# Check credit balance
curl http://localhost:3000/api/credits

# View credit packs
curl http://localhost:3000/api/credit-packs

# Test generation (will check credits)
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","models":[...],"aiModel":"flux-dev"}'
```

---

## ✅ Checklist for Implementation

### Phase 1: Basic Display
- [ ] Add `<CreditBalance compact />` to header
- [ ] Add `<CreditBalance showDetails />` to user dashboard
- [ ] Test with authenticated and guest users

### Phase 2: Model Selection
- [ ] Add `<ModelRecommendation />` to design studio
- [ ] Add `<GenerationCostIndicator />` before generate button
- [ ] Test model selection and cost display

### Phase 3: Purchase Flow
- [ ] Add `<CreditPacksModal />` to main layout
- [ ] Implement Stripe/Square checkout handler
- [ ] Test purchase flow end-to-end

### Phase 4: Error Handling
- [ ] Handle 402 (Insufficient Credits) responses
- [ ] Handle 429 (Guest Limit) responses
- [ ] Show appropriate error messages and CTAs

### Phase 5: Polish
- [ ] Add loading states
- [ ] Add success toasts
- [ ] Test on mobile devices
- [ ] Optimize performance

---

## 🚀 Next Steps

### Immediate
1. Copy components to your project
2. Add `<CreditBalance compact />` to header
3. Test with real user data

### Short Term
1. Integrate Stripe/Square for purchases
2. Add credit purchase success flow
3. Implement email receipts

### Long Term
1. Add subscription plans
2. Implement referral credits
3. Create admin dashboard for credit management
4. Add usage analytics

---

## 📚 API Reference

### GET /api/credits
Returns credit balance and usage stats.

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "credits": {
    "balance": 45,
    "welcomeCreditsRemaining": 30,
    "lifetimeCredits": 50,
    "lifetimeSpent": 5
  },
  "usage": {
    "totalGenerations": 5
  }
}
```

**Response (Guest):**
```json
{
  "authenticated": false,
  "guest": {
    "remaining": 2,
    "total": 3,
    "resetsIn": 18,
    "resetsAt": "2025-11-26T06:00:00Z"
  },
  "signupOffer": {
    "credits": 50,
    "message": "Sign up for free!"
  }
}
```

### GET /api/credit-packs
Returns available credit packs.

**Response:**
```json
{
  "packs": [
    {
      "id": "clx123",
      "name": "Creator Pack",
      "credits": 100,
      "bonusCredits": 10,
      "totalCredits": 110,
      "price": 14.99,
      "pricePerCredit": 0.136,
      "savings": 10,
      "isPopular": true
    }
  ]
}
```

---

## 💡 Pro Tips

1. **Always show credit cost BEFORE generation** - Users should never be surprised
2. **Make purchase easy** - One-click from error state to purchase modal
3. **Highlight best value** - "Most Popular" badge drives conversions
4. **Guest-to-signup funnel** - Make benefits clear at each step
5. **Low credit warnings** - Alert users before they run out completely

---

## 🎉 You're Ready!

All components are production-ready. Visit `/credits-demo` to see them in action, then integrate into your design studio!

**Questions?** Check `CREDIT_SYSTEM_IMPLEMENTATION.md` for backend details.
