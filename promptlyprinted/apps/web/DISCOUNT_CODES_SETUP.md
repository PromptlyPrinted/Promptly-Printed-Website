# Discount Codes Setup Guide

## Overview
Your website now automatically generates and distributes 10% discount codes to newsletter subscribers. Here's how it all works:

## How It Works

### 1. User Flow

#### New Subscriber
1. User signs up for newsletter on your website
2. System automatically:
   - **Checks if they already subscribed** (looks for existing discount code in Stripe)
   - If new: Creates a unique discount code (e.g., `WELCOME-JOHN-X7K9`)
   - Subscribes user to Beehiiv newsletter
   - Sends discount code to Beehiiv as a custom field
   - Displays the discount code to the user immediately
3. User receives welcome email from Beehiiv with their unique discount code
4. User applies their unique code at checkout

#### Already Subscribed
1. User tries to sign up again with same email
2. System detects they already have a code:
   - **Finds their existing discount code** from Stripe records
   - Shows blue "Already subscribed!" message
   - **Displays their original discount code** (in case they lost it)
   - Does NOT create a new code
   - Does NOT send duplicate to Beehiiv
3. User can still use their original code at checkout

### 2. Discount Code Details
- **Code Format**: `WELCOME-[NAME]-[RANDOM]` (e.g., `WELCOME-JOHN-X7K9`)
- **Uniqueness**: Every subscriber gets their own unique code
- **Discount**: 10% off
- **Max Redemptions**: 1 (code expires after single use)
- **Valid for**: All products
- **Automatically created**: Yes (unique code created for each subscriber via Stripe API)

## Setup Instructions

### Step 1: Verify Stripe Configuration
Your discount codes are managed through Stripe. The system automatically creates:
- **One base coupon** (`NEWSLETTER_WELCOME`) that defines the 10% discount
- **Unique promotion codes** for each subscriber (e.g., `WELCOME-JOHN-X7K9`)

To verify:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Coupons**
3. You should see `NEWSLETTER_WELCOME` coupon (10% off, once duration)
4. Navigate to **Products** → **Promotion Codes** to see individual codes

If you want to manually create the base coupon first:
```
Name: Newsletter Welcome Discount - 10% Off
ID: NEWSLETTER_WELCOME
Type: Percentage
Percent off: 10%
Duration: Once
```

### Step 2: ✅ Promotion Codes Already Enabled
Your checkout is already configured to accept promotion codes!

The checkout API (`/api/checkout/route.ts`) includes:
```typescript
allow_promotion_codes: true
```

This means customers will see a **"Add promotion code"** link on the Stripe checkout page where they can enter their unique discount code (e.g., `WELCOME-JOHN-X7K9`).

**No additional setup needed!** The codes will work automatically.

### Step 3: Configure Beehiiv Welcome Email

#### Option A: Include in Beehiiv Custom Fields
The discount code is automatically sent to Beehiiv as a custom field called `discount_code`.

To use it in your email:
1. Go to Beehiiv Dashboard
2. Navigate to **Emails** → **Automations** → **Welcome Email**
3. Edit your welcome email template
4. Use the custom field variable: `{{discount_code}}`

Example email template:
```html
<h2>Welcome! 🎉</h2>

<p>Thanks for joining our community! Here's your exclusive welcome gift:</p>

<div style="background: #f0fdf4; border: 2px dashed #10b981; padding: 20px; border-radius: 8px; text-align: center;">
  <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Discount Code:</p>
  <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #059669; font-family: monospace;">
    {{discount_code}}
  </p>
  <p style="margin: 0; font-size: 12px; color: #6b7280;">Use at checkout for 10% off!</p>
</div>

<p>Plus, download your free eBook: <a href="YOUR_EBOOK_LINK">Mastering AI Picture Prompts</a></p>

<a href="https://yoursite.com/design" style="background: #16C1A8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
  Start Designing →
</a>
```

#### Option B: Manual Entry (Not Recommended)
If custom fields don't work in your Beehiiv plan, you'll need to manually send each subscriber their unique code. This is not scalable and defeats the purpose of automation.

### Step 4: Create the AI Prompts eBook

You promised subscribers a free eBook called **"Mastering AI Picture Prompts"**. Here are your options:

#### Quick Option: Use Canva or Google Docs
1. Create a simple PDF guide with:
   - 10-20 pages
   - AI prompt tips and examples
   - Before/after examples of good vs bad prompts
   - Prompt formulas for different styles
   - Examples specific to apparel design

2. Host it on:
   - Google Drive (set to "Anyone with the link can view")
   - Dropbox
   - Your website: `/public/downloads/ai-prompts-ebook.pdf`

3. Add download link to Beehiiv welcome email

#### Better Option: Create a Landing Page
Create a simple download page at `/ebook` with:
- Brief description
- Preview images
- Download button
- Optional email gate (since they already subscribed)

## Testing

### Test the Newsletter Signup
1. Go to your homepage
2. Scroll to "Your imagination deserves to be worn" section
3. Enter a test email (use Gmail's `+` trick: `yourname+test@gmail.com`)
4. You should see:
   - Success message
   - Discount code `WELCOME10` displayed immediately
5. Check your email for Beehiiv welcome message

### Test the Discount Code
1. Add a product to cart
2. Go to checkout
3. Look for "Promotion code" or "Discount code" field
4. Enter your unique code (e.g., `WELCOME-JOHN-X7K9`)
5. Verify 10% discount is applied
6. Try using the same code again - it should be rejected as already used

## Customization Options

### Change the Discount Percentage
Edit `/app/api/newsletter/subscribe/route.ts`:
```typescript
coupon = await stripe.coupons.create({
  id: 'WELCOME10',
  percent_off: 15, // Change to 15% or any percentage
  duration: 'once',
  name: 'Newsletter Welcome Discount - 15% Off',
});
```

### Change the Discount Code Format
Edit `/app/api/newsletter/subscribe/route.ts`:
```typescript
// Change the prefix or format
const uniqueCode = `SAVE10-${emailPrefix}-${randomSuffix}`;
// Or make it shorter
const uniqueCode = `${emailPrefix}${randomSuffix}`;
// Or add your brand
const uniqueCode = `PP10-${randomSuffix}`; // PromptlyPrinted 10% off
```

Don't forget to update the frontend copy (final-cta.tsx) to reflect the new format.

### Make it a Dollar Amount Instead of Percentage
```typescript
coupon = await stripe.coupons.create({
  id: 'WELCOME5',
  amount_off: 500, // $5 off (in cents)
  currency: 'usd',
  duration: 'once',
  name: 'Newsletter Welcome Discount - $5 Off',
});
```

### Make it Valid for Multiple Uses
```typescript
coupon = await stripe.coupons.create({
  id: 'WELCOME10',
  percent_off: 10,
  duration: 'forever', // Works on all orders forever
  // or
  duration: 'repeating',
  duration_in_months: 3, // Works for 3 months
  name: 'Newsletter Welcome Discount',
});
```

## Tracking & Analytics

### Monitor in Stripe
- **Base Coupon**: See total redemption count and revenue impact
  - Go to: Stripe Dashboard → Products → Coupons → NEWSLETTER_WELCOME
- **Individual Promotion Codes**: Track which specific codes were used and by whom
  - Go to: Stripe Dashboard → Products → Promotion Codes
  - Filter by metadata to see newsletter signups
- **Benefits of Unique Codes**:
  - Know exactly which subscribers converted
  - Prevent code sharing
  - Track ROI per subscriber
  - Prevent duplicate signups (same email can't get multiple codes)
  - Users can retrieve their code if they lose it

### Monitor in Beehiiv
- Track subscriber count by campaign
- See custom field data (discount codes assigned)
- Monitor email open rates and clicks

### Add to Your Analytics
The newsletter signup sends campaign tracking data:
- Campaign ID: `home-final-cta`
- Source: `website`
- Discount code: Stored in Beehiiv custom fields

## Duplicate Email Handling

The system prevents users from signing up multiple times to get multiple discount codes:

### How it Works
1. **Stripe Check**: Before creating a new code, system searches Stripe for existing promotion codes with same email
2. **Beehiiv Check**: If Beehiiv rejects the email as duplicate, system retrieves their existing code
3. **User-Friendly Response**: Shows blue "Already subscribed!" message with their original code

### What Users See
- **New signup**: Green success message with new unique code
- **Duplicate signup**: Blue "Already subscribed!" message with their existing code
- Both cases show the discount code, so users never lose access

### Benefits
- Prevents abuse (can't get multiple 10% codes)
- Users can retrieve lost codes by "signing up" again
- Reduces duplicate entries in Beehiiv
- Cleaner analytics (no duplicate subscribers)

## Troubleshooting

### "Promotion code not found" error
- Check if promotion codes are enabled in Stripe Checkout settings
- Verify the code exists in Stripe Dashboard
- Try creating the code manually first

### Discount code not showing in email
- Check if Beehiiv custom fields are enabled in your plan
- Verify the custom field name is `discount_code`
- Use hardcoded `WELCOME10` as fallback

### API errors when creating discount
- Check `STRIPE_SECRET_KEY` is set in `.env`
- Verify your Stripe account is in live mode (or test mode matches)
- Check Stripe API logs for detailed error messages

## Files Modified

- `/app/components/BeehiivEmailSignup.tsx` - Email signup component with discount display
- `/app/(home)/components/final-cta.tsx` - Homepage CTA with newsletter signup
- `/app/api/newsletter/subscribe/route.ts` - Handles subscription + discount generation
- `/app/api/newsletter/generate-discount/route.ts` - Standalone discount generator

## Next Steps

1. ✅ Set up Beehiiv environment variables (BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID)
2. ✅ Enable promotion codes in Stripe Checkout settings
3. ⏳ Create the AI Prompts eBook PDF
4. ⏳ Update Beehiiv welcome email with discount code and eBook link
5. ⏳ Test the complete flow with a real email
6. ⏳ Monitor first week of signups and redemptions

## Support

If you need help:
- Stripe: https://support.stripe.com
- Beehiiv: https://support.beehiiv.com
- Check browser console for API errors
- Check Stripe logs for payment/coupon errors
