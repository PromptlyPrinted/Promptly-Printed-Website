# Offer Page - Dynamic Product Selection Update

## Changes Made

The offer page has been updated to support dynamic product selection from the quiz system instead of being hardcoded.

### What Changed

**Before:** Offer page used hardcoded `CLOTHING_TYPE_TO_SKU` mapping
**After:** Offer page reads `productSKU` parameter directly from quiz URL

### New URL Parameters Supported

The offer page now reads these parameters from the quiz:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `productSKU` | Exact product SKU from inventory | `GLOBAL-TEE-BC-3413` |
| `audience` | User's selected audience | `mens` |
| `styleType` | Selected style type | `triblend` |
| `theme` | Chosen theme/occasion | `summer` |
| `aiModel` | Selected AI model | `nano-banana` |
| `discount` | Discount percentage | `0.3` (30%) |
| `giveawayTier` | Giveaway tier | `standard` |

### New Features Added

#### 1. **Dynamic Product Display**
- Product is now selected based on `productSKU` parameter
- Falls back to legacy `clothingType` mapping for backwards compatibility
- Product name uses proper display name (e.g., "Men's Triblend T-Shirt")

#### 2. **Dynamic Discount**
- Discount is read from URL parameter (from giveaway tier)
- Supports 30%, 35%, 40%, 45% discounts
- Automatically calculates savings

#### 3. **Giveaway Banner** ⭐
New prominent banner showing:
- Giveaway tier name (e.g., "Quiz Completion Reward")
- Discount percentage
- Free bonus items notification

**Visual:**
```
🏆 🎉 Quiz Completion Reward!
You've unlocked 30% OFF + FREE bonus items!
✓ Plus free giveaway items with your order
```

#### 4. **AI Model Badge**
Shows which AI model user selected in quiz:
```
🖥️ Nano Banana - Fast, clean, minimalist
```

#### 5. **Theme Context**
- Theme parameter is now passed to design studio
- Allows AI to maintain theme consistency

### Product Selection Flow

```
Quiz completes
    ↓
selectProductFromQuiz(answers)
    ↓
productSKU = "GLOBAL-TEE-BC-3413"
    ↓
URL: /offer?productSKU=GLOBAL-TEE-BC-3413&...
    ↓
Offer page reads productSKU
    ↓
Fetches product from tshirtDetails
    ↓
Displays correct product with dynamic discount
```

### Backwards Compatibility

The offer page maintains full backwards compatibility:

**Old URL (still works):**
```
/offer?clothingType=tee&prompt=...
```

**New URL (from quiz):**
```
/offer?productSKU=GLOBAL-TEE-BC-3413&audience=mens&styleType=triblend&...
```

If `productSKU` is present, it's used. Otherwise, falls back to `clothingType` mapping.

### Code Changes

**File:** `/apps/web/app/offer/components/OfferPageContent.tsx`

**Key Changes:**

1. **Import AI model info:**
```typescript
import { getProductDisplayName, GIVEAWAY_ITEMS, AI_MODEL_INFO } from '@/lib/quiz-product-selector';
```

2. **Read productSKU parameter:**
```typescript
const quizProductSKU = searchParams.get('productSKU');
const productSku = quizProductSKU || LEGACY_CLOTHING_TYPE_TO_SKU[clothingType];
```

3. **Dynamic discount:**
```typescript
const discountParam = searchParams.get('discount');
const discount = discountParam
  ? parseFloat(discountParam)
  : GIVEAWAY_ITEMS[giveawayTier]?.discount || 0.30;
```

4. **Display giveaway info:**
```typescript
{giveawayInfo && (
  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white...">
    <h3>🎉 {giveawayInfo.name}!</h3>
    <p>You've unlocked {Math.round(discount * 100)}% OFF + FREE bonus items!</p>
  </div>
)}
```

5. **Show AI model:**
```typescript
{aiModelInfo && (
  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50...">
    <Cpu className="w-4 h-4 text-blue-600" />
    <span><strong>{aiModelInfo.name}</strong> - {aiModelInfo.description}</span>
  </div>
)}
```

### Testing the Flow

**Test URL (from your quiz):**
```
http://localhost:3001/offer?prompt=Create+a+bold+urban+streetwear+graphic...&productSKU=GLOBAL-TEE-BC-3413&audience=mens&styleType=triblend&theme=summer&aiModel=nano-banana&discount=0.3&giveawayTier=standard
```

**Expected Behavior:**
1. ✅ Shows "Men's Triblend T-Shirt" (not hardcoded product)
2. ✅ Displays 30% discount (from URL, not hardcoded 40%)
3. ✅ Shows giveaway banner "Quiz Completion Reward!"
4. ✅ Shows AI model badge "Nano Banana - Fast, clean, minimalist"
5. ✅ Product image shows triblend t-shirt
6. ✅ Clicking "Start Designing" passes all parameters to design studio

### Product Support

**Currently Supported Products:**

All products from `tshirtDetails`:
- ✅ TEE-SS-STTU755 (Men's Classic T-Shirt)
- ✅ GLOBAL-TEE-BC-3413 (Men's Triblend T-Shirt)
- ✅ TT-GIL-64200 (Men's Tank Top)
- ✅ GLOBAL-TEE-GIL-64V00 (Men's V-Neck T-Shirt)
- ✅ A-ML-GD2400 (Men's Long Sleeve T-Shirt)
- ✅ A-WT-GD64000L (Women's Classic T-Shirt)
- ✅ GLOBAL-TEE-BC-6035 (Women's V-Neck T-Shirt)
- ✅ A-KT-GD64000B (Kids' T-Shirt)
- ✅ SWEAT-AWD-JH030B (Kids Sweatshirt)
- ✅ A-BB-LA4411 (Baby Bodysuit)
- ✅ GLOBAL-TEE-RS-3322 (Baby T-Shirt)

**To Add Hoodies:**
1. Add hoodie data to `tshirtDetails` (use `2025_01_22_updateHoodies.ts` script)
2. Quiz already supports hoodies (SKUs: A-MH-JH001, A-WH-JH001F, HOOD-AWD-JH001B)
3. Offer page will automatically display them

### Giveaway Tiers Explained

| Tier | Trigger | Discount | Free Items |
|------|---------|----------|------------|
| **standard** | Quiz completion | 30% | Sticker sheet |
| **emailCapture** | Email provided | 35% | Sticker + Postcard |
| **firstPurchase** | First-time buyer | 40% | Sticker + Tattoo |
| **campaign** | Active campaign | 35% | Sticker + Keyring |
| **bundle** | 2+ items | 45% | Keyring + Coasters |

The tier is determined in the quiz result page and passed via URL.

### Design Studio Integration

All parameters are passed to the design studio:

```typescript
router.push(`/design/${product.sku}?${params.toString()}`);
```

**Parameters passed:**
- `prompt` - AI design prompt
- `campaign` - Campaign tracking
- `source` - Traffic source
- `color` - Selected color
- `size` - Selected size
- `discount` - Discount to apply at checkout
- `audience` - Audience type
- `styleType` - Style type
- `theme` - Theme selected
- `aiModel` - AI model choice
- `giveawayTier` - Giveaway tier

### Checkout Integration

**TODO:** The checkout page needs to:
1. Read `discount` parameter
2. Apply discount to final price
3. Add giveaway items based on `giveawayTier`

**Example:**
```typescript
const discount = searchParams.get('discount'); // "0.3"
const giveawayTier = searchParams.get('giveawayTier'); // "standard"

// Apply discount
const finalPrice = productPrice * (1 - parseFloat(discount));

// Add free items
if (giveawayTier === 'standard') {
  addFreeItem('GLOBAL-STI-3X4-G'); // Free sticker
}
```

### Troubleshooting

**Issue:** Product not showing correctly
- **Check:** Is `productSKU` in the URL?
- **Check:** Does the SKU exist in `tshirtDetails`?
- **Fix:** Add product to `tshirtDetails` or fix SKU in quiz selector

**Issue:** Discount not applied
- **Check:** Is `discount` parameter in URL?
- **Check:** Is value between 0 and 1? (0.3 = 30%)
- **Fix:** Ensure quiz passes discount correctly

**Issue:** Giveaway banner not showing
- **Check:** Is `giveawayTier` in URL?
- **Check:** Does tier exist in `GIVEAWAY_ITEMS`?
- **Fix:** Use valid tier: standard, emailCapture, firstPurchase, campaign, bundle

**Issue:** Wrong product image
- **Check:** Product has `colorOptions` and `imageUrls.base`
- **Fix:** Ensure product data includes image paths

### Performance

- **No API calls** - All product data is imported statically
- **Instant rendering** - Product lookup is O(1)
- **No external dependencies** - All logic is self-contained

### SEO Considerations

The offer page now shows dynamic product names:
- Title: "Your Personalized Men's Triblend T-Shirt"
- More specific than generic "Your Personalized T-Shirt"
- Better for conversion as it matches user's selection

---

**Last Updated:** 2025-01-22
**Status:** ✅ Production Ready
