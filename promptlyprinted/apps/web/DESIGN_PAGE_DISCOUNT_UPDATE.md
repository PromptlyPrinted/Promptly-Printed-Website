# Design/Product Page - Discount Integration

## Overview

The design/product detail page now fully supports dynamic discounts from the quiz funnel. Discounts are applied to both the displayed price and the cart price.

## Changes Made

### 1. **ProductDetail Component** (`/app/products/[category]/[productName]/components/ProductDetail.tsx`)

#### Added Discount Parameter Reading
```typescript
const discountFromUrl = searchParams.get('discount'); // Get discount from quiz/offer
const giveawayTierFromUrl = searchParams.get('giveawayTier'); // Get giveaway tier

// Parse discount (0.3 = 30% off)
const discountPercent = discountFromUrl ? parseFloat(discountFromUrl) : 0;
```

#### Updated Price Display

**Without Discount (Normal):**
```
Men's Tank Top
$69.00
```

**With Discount (Quiz Funnel):**
```
Men's Tank Top
$48.30  [$69.00]
[Save 30% OFF] (orange/red badge)
```

**Visual Updates:**
- ✅ Large green discounted price ($48.30)
- ✅ Strikethrough original price ($69.00)
- ✅ Prominent "Save 30% OFF" badge
- ✅ Shows both converted and USD prices

#### Updated Cart Price Calculation

```typescript
// Calculate final price with discount
const basePrice = product.pricing?.[0]?.amount || product.price || 0;
const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent) : basePrice;

const itemToAdd = {
  price: finalPrice, // Apply discount to cart price
  originalPrice: basePrice, // Store original for reference
  discount: discountPercent > 0 ? Math.round(discountPercent * 100) : undefined,
  // ... other fields
};
```

**Key Features:**
- Cart receives discounted price automatically
- Original price stored for potential display in cart
- Discount percentage stored for cart badge display

---

### 2. **DesignProductDetail Component** (`/app/design/[productSku]/components/DesignProductDetail.tsx`)

#### Added Header Discount Display

**Without Discount:**
```
Design Your Men's Tank Top
Starting from £69.00
```

**With Discount:**
```
Design Your Men's Tank Top
Sale Price £48.30 [£69.00] [-30%]
```

**Visual Elements:**
- Green sale price
- Strikethrough original price
- Red badge showing discount percentage

#### URL Parameter Preservation

When users switch products using the navigation, all parameters are preserved:
```typescript
const params = new URLSearchParams(searchParams.toString());
router.push(`/design/${slug}?${params.toString()}`);
```

This ensures:
- Discount persists when switching products
- All quiz data (theme, AI model, etc.) maintained
- Seamless experience throughout design process

---

## Complete Flow

### Quiz → Offer → Design → Cart

```
1. Quiz Completion
   ↓
   productSKU=TT-GIL-64200
   discount=0.3 (30%)
   giveawayTier=standard

2. Offer Page
   ↓
   Shows: $48.30 (30% off $69.00)
   Giveaway banner displayed

3. Click "Start Designing"
   ↓
   URL: /design/TT-GIL-64200?discount=0.3&...

4. Design Page Header
   ↓
   Shows: "Sale Price £48.30 [£69.00] [-30%]"

5. Product Detail Section
   ↓
   Shows: Large green "$48.30" with strikethrough "$69.00"
   Badge: "Save 30% OFF"

6. Add to Cart
   ↓
   Cart price: $48.30 (discounted)
   Original price: $69.00 (stored)
   Discount: 30% (stored)

7. Checkout
   ↓
   Discount already applied to item price
   Free giveaway items can be added based on tier
```

---

## Price Display Examples

### Example 1: Men's Tank Top (30% discount)

**Original Price:** $69.00
**Discount:** 30% (0.3)
**Sale Price:** $48.30

**Header Display:**
```
Sale Price £41.39 [£59.10] [-30%]
```

**Main Price Display:**
```
$48.30   [$69.00]
[Save 30% OFF]
```

### Example 2: Men's Triblend (35% discount - Campaign)

**Original Price:** $70.00
**Discount:** 35% (0.35)
**Sale Price:** $45.50

**Header Display:**
```
Sale Price £38.98 [£59.97] [-35%]
```

**Main Price Display:**
```
$45.50   [$70.00]
[Save 35% OFF]
```

### Example 3: Women's Hoodie (40% discount - First Purchase)

**Original Price:** $75.99
**Discount:** 40% (0.4)
**Sale Price:** $45.59

**Header Display:**
```
Sale Price £39.05 [£65.08] [-40%]
```

**Main Price Display:**
```
$45.59   [$75.99]
[Save 40% OFF]
```

---

## URL Parameter Support

The design page now reads these parameters:

| Parameter | Purpose | Example | Effect |
|-----------|---------|---------|--------|
| `discount` | Discount percentage | `0.3` | 30% off displayed and cart price |
| `giveawayTier` | Giveaway tier | `standard` | For future checkout integration |
| `prompt` | Pre-filled AI prompt | `Create a...` | Auto-fills prompt field |
| `campaign` | Campaign context | `halloween-2025` | Theme context |
| `source` | Traffic source | `style-quiz` | Analytics tracking |
| `color` | Pre-selected color | `Heather Grey` | Auto-selects color |
| `size` | Pre-selected size | `L` | Auto-selects size |
| `audience` | User audience | `mens` | Tracking |
| `styleType` | Style type | `tank-top` | Tracking |
| `theme` | Design theme | `halloween` | Tracking |
| `aiModel` | AI model | `nano-banana` | Tracking |

---

## Visual Design

### Discount Badge Styling

```tsx
<div className="inline-flex items-center gap-2 px-3 py-1.5
  bg-gradient-to-r from-orange-500 to-red-500
  text-white rounded-full text-sm font-semibold shadow-lg">
  <svg>...</svg>
  <span>Save {Math.round(discountPercent * 100)}% OFF</span>
</div>
```

**Colors:**
- Gradient: Orange → Red
- Text: White
- Shadow: Large shadow for prominence
- Icon: Sparkle/star icon

### Price Display Hierarchy

**Discounted Price:**
- Font size: 3xl (1.875rem)
- Color: Green-600
- Weight: Bold

**Original Price:**
- Font size: lg (1.125rem)
- Color: Gray-400
- Decoration: Line-through
- Weight: Semibold

**Currency Info:**
- Font size: xs (0.75rem)
- Color: Gray-500
- Shows both converted and USD

---

## Cart Integration

### Item Structure

When an item is added to cart with a discount:

```typescript
{
  id: "TT-GIL-64200-L-Heather Grey",
  productId: "TT-GIL-64200",
  name: "Men's Tank Top",
  price: 48.30,              // Discounted price ✅
  originalPrice: 69.00,       // Original price
  discount: 30,               // Discount percentage
  quantity: 1,
  size: "L",
  color: "Heather Grey",
  imageUrl: "...",
  assets: []
}
```

### Cart Display (Future Enhancement)

The cart can now show:
```
Men's Tank Top - Size L, Heather Grey
$48.30  [$69.00]  [30% OFF]
```

---

## Testing Your URL

**Your Example URL:**
```
http://localhost:3001/design/TT-GIL-64200?
  prompt=Create+a+futuristic+tech-inspired...&
  discount=0.3&
  audience=mens&
  styleType=tank-top&
  theme=halloween&
  aiModel=nano-banana&
  giveawayTier=standard&
  color=Heather+Grey&
  size=L
```

**Expected Results:**
1. ✅ Header shows: "Sale Price £41.39 [£59.10] [-30%]"
2. ✅ Main price shows: Large green "$48.30" with strikethrough "$69.00"
3. ✅ Badge shows: "Save 30% OFF" in orange/red
4. ✅ Color "Heather Grey" is pre-selected
5. ✅ Size "L" is pre-selected
6. ✅ AI prompt is pre-filled
7. ✅ When added to cart: Price = $48.30 (not $69.00)

---

## Backward Compatibility

**Without discount parameter:**
- Price displays normally
- No discount badge shown
- Cart receives full price
- Everything works as before

**Example:**
```
http://localhost:3001/design/TT-GIL-64200
```
Shows regular price of $69.00 with no discount.

---

## Next Steps

### Immediate
- ✅ Discount displayed on design page header
- ✅ Discount displayed in product detail
- ✅ Discount applied to cart price
- ✅ Parameters preserved when switching products

### Future Enhancements (TODO)

1. **Cart Page Updates**
   - Display discount badge in cart
   - Show original price strikethrough
   - Calculate total savings

2. **Checkout Page Integration**
   - Apply giveaway items based on `giveawayTier`
   - Show discount summary
   - Display free items

3. **Analytics Tracking**
   - Track which discounts convert best
   - Monitor discount tier usage
   - A/B test discount percentages

4. **Email Confirmation**
   - Show discount applied in order email
   - Highlight savings
   - Mention free items received

---

## Troubleshooting

### Issue: Discount not showing
**Check:**
- Is `discount` parameter in URL?
- Is value between 0 and 1? (0.3 = 30%)
- Check browser console for errors

**Fix:**
```typescript
// Verify discount parameter
const discountFromUrl = searchParams.get('discount');
console.log('Discount from URL:', discountFromUrl);
console.log('Parsed discount:', parseFloat(discountFromUrl || '0'));
```

### Issue: Wrong price in cart
**Check:**
- Is `finalPrice` calculated correctly?
- Is discount applied before `addItem()`?

**Fix:**
```typescript
const basePrice = product.pricing?.[0]?.amount || product.price || 0;
const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent) : basePrice;
console.log('Base:', basePrice, 'Final:', finalPrice, 'Discount:', discountPercent);
```

### Issue: Discount badge not visible
**Check:**
- Is `discountPercent > 0`?
- Check Tailwind CSS is loading properly

**Fix:**
```typescript
{discountPercent > 0 && (
  <div className="...">Save {Math.round(discountPercent * 100)}% OFF</div>
)}
```

### Issue: Currency conversion with discount
**Check:**
- Is discount applied BEFORE currency conversion?
- Ensure `getConvertedPrice()` receives discounted amount

**Correct Order:**
```typescript
const basePrice = product.pricing?.[0]?.amount;
const discountedPrice = basePrice * (1 - discountPercent);
const convertedPrice = getConvertedPrice(discountedPrice);
```

---

## Performance Notes

- **No API Calls** - Discount calculation is pure math
- **Instant Rendering** - No loading states needed
- **Lightweight** - Adds minimal JavaScript
- **SEO Friendly** - Discount shown in rendered HTML

---

**Last Updated:** 2025-01-22
**Status:** ✅ Production Ready
**Breaking Changes:** None (fully backward compatible)
