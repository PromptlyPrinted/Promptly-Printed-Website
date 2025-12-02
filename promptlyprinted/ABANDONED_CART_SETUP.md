# Abandoned Cart Email Setup Guide

## Overview

The abandoned cart email system sends automated recovery emails to customers who add items to their cart but don't complete checkout. The system includes three email sequences with increasing incentives.

## Email Sequence

### 1. First Reminder (1 hour after cart abandonment)
- **Subject**: "⏰ Your Cart is Waiting! Complete Your Order"
- **Content**: Friendly reminder about items left in cart
- **No discount** - just a gentle nudge

### 2. Follow-up Email (24 hours after cart abandonment)
- **Subject**: "🎁 10% OFF Your Order - Your Cart is Still Waiting!"
- **Content**: Reminder with **10% discount code**
- **Incentive**: First-time discount offer

### 3. Final Reminder (72 hours after cart abandonment)
- **Subject**: "⏳ Last Chance! Your 10% Discount Expires Soon"
- **Content**: Urgent final reminder
- **Incentive**: Same 10% discount with expiration warning

## Implementation

### Email Functions

The abandoned cart email functions are located in `/apps/web/lib/email.ts`:

```typescript
// Send first reminder (1 hour)
await sendAbandonedCartEmail({
  to: 'customer@example.com',
  firstName: 'John',
  cartItems: [
    {
      name: 'Custom T-Shirt Design',
      imageUrl: 'https://cdn.promptlyprinted.com/...',
      price: 29.99
    }
  ],
  cartTotal: 29.99,
  checkoutUrl: 'https://promptlyprinted.com/checkout/abc123'
});

// Send follow-up with discount (24 hours)
await sendAbandonedCartFollowup({
  to: 'customer@example.com',
  firstName: 'John',
  cartItems: [...],
  cartTotal: 29.99,
  checkoutUrl: 'https://promptlyprinted.com/checkout/abc123',
  discountCode: 'CART10'
});

// Send final reminder (72 hours)
await sendAbandonedCartFinalReminder({
  to: 'customer@example.com',
  firstName: 'John',
  cartItems: [...],
  cartTotal: 29.99,
  checkoutUrl: 'https://promptlyprinted.com/checkout/abc123',
  discountCode: 'CART10'
});
```

### Setting Up Automated Triggers

You'll need to set up a cron job or scheduled task to trigger these emails. Here are the recommended approaches:

#### Option 1: Vercel Cron Jobs (Recommended)

Create `/apps/web/app/api/cron/abandoned-cart/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  sendAbandonedCartEmail, 
  sendAbandonedCartFollowup, 
  sendAbandonedCartFinalReminder 
} from '@/lib/email';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

  // Find abandoned carts
  const abandonedCarts = await prisma.cart.findMany({
    where: {
      updatedAt: {
        gte: threeDaysAgo,
        lte: oneHourAgo
      },
      // Add conditions to check if cart hasn't been converted to order
      // and user has email
    },
    include: {
      user: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });

  const results = {
    firstReminders: 0,
    followups: 0,
    finalReminders: 0
  };

  for (const cart of abandonedCarts) {
    if (!cart.user?.email) continue;

    const hoursSinceUpdate = (now.getTime() - cart.updatedAt.getTime()) / (1000 * 60 * 60);
    
    const cartItems = cart.items.map(item => ({
      name: item.product.name,
      imageUrl: item.imageUrl || item.product.imageUrls.cover,
      price: item.product.price || 0
    }));

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const checkoutUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/${cart.id}`;

    // Send appropriate email based on time elapsed
    if (hoursSinceUpdate >= 72 && hoursSinceUpdate < 96) {
      // Final reminder (72-96 hours)
      await sendAbandonedCartFinalReminder({
        to: cart.user.email,
        firstName: cart.user.firstName,
        cartItems,
        cartTotal,
        checkoutUrl,
        discountCode: 'CART10'
      });
      results.finalReminders++;
    } else if (hoursSinceUpdate >= 24 && hoursSinceUpdate < 48) {
      // Follow-up (24-48 hours)
      await sendAbandonedCartFollowup({
        to: cart.user.email,
        firstName: cart.user.firstName,
        cartItems,
        cartTotal,
        checkoutUrl,
        discountCode: 'CART10'
      });
      results.followups++;
    } else if (hoursSinceUpdate >= 1 && hoursSinceUpdate < 2) {
      // First reminder (1-2 hours)
      await sendAbandonedCartEmail({
        to: cart.user.email,
        firstName: cart.user.firstName,
        cartItems,
        cartTotal,
        checkoutUrl
      });
      results.firstReminders++;
    }
  }

  return NextResponse.json(results);
}
```

Then add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/abandoned-cart",
      "schedule": "0 * * * *"
    }
  ]
}
```

#### Option 2: External Cron Service

Use a service like:
- **Cron-job.org**
- **EasyCron**
- **AWS EventBridge**

Point them to your API endpoint with the cron secret header.

### Environment Variables

Add to `.env`:

```bash
# Abandoned Cart Settings
CRON_SECRET=your-random-secret-here
ABANDONED_CART_DISCOUNT_CODE=CART10
ABANDONED_CART_DISCOUNT_PERCENT=10
```

## Tracking Cart Abandonment

You'll need to track when carts are created/updated. Add to your cart update logic:

```typescript
// When user adds to cart
await prisma.cart.update({
  where: { id: cartId },
  data: {
    updatedAt: new Date(),
    // Store user email if guest checkout
    guestEmail: email
  }
});
```

## Email Templates

The email templates are already implemented in `/apps/web/lib/email.ts` with:

- ✅ Responsive HTML design
- ✅ Product images and details
- ✅ Cart total with discount calculations
- ✅ Prominent CTA buttons
- ✅ UTM tracking parameters
- ✅ Plain text fallback

## Testing

Test the emails manually:

```typescript
// In a test API route or script
import { sendAbandonedCartEmail } from '@/lib/email';

await sendAbandonedCartEmail({
  to: 'your-test-email@example.com',
  firstName: 'Test',
  cartItems: [
    {
      name: 'Men\'s Classic T-Shirt',
      imageUrl: 'https://cdn.promptlyprinted.com/products/mens-tee.jpg',
      price: 29.99
    }
  ],
  cartTotal: 29.99,
  checkoutUrl: 'https://promptlyprinted.com/checkout/test123'
});
```

## Discount Code Setup

Create the `CART10` discount code in your payment system (Square, Stripe, etc.):

1. **Square Dashboard**: 
   - Go to Items → Discounts
   - Create "CART10" with 10% off
   - Set expiration if desired

2. **Apply in Checkout**:
   - The checkout URL includes `?discount=CART10`
   - Your checkout page should auto-apply this code

## Best Practices

1. **Don't spam**: Only send to carts with real intent (e.g., minimum cart value)
2. **Respect opt-outs**: Check user email preferences
3. **Track conversions**: Monitor which email in the sequence converts best
4. **A/B test**: Try different subject lines and discount amounts
5. **Mobile optimize**: Ensure emails look great on mobile devices

## Monitoring

Track these metrics:
- Email open rates
- Click-through rates
- Conversion rates per email
- Revenue recovered
- Unsubscribe rates

## Future Enhancements

Consider adding:
- Personalized product recommendations
- Dynamic discount amounts based on cart value
- SMS notifications for high-value carts
- Browser push notifications
- Retargeting ads integration
