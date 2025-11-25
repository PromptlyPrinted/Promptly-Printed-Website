# Square Checkout Integration - Setup Guide

## ✅ Implementation Complete

Your credit system now has **full Square payment integration** for purchasing credits!

---

## 🔧 What's Been Built

### API Endpoints
1. **`POST /api/checkout/credits`** - Create Square checkout session
2. **`POST /api/webhooks/square/credits`** - Handle payment webhooks
3. **`GET /api/webhooks/square/credits`** - Webhook verification

### Pages
1. **`/checkout/credits/success`** - Payment success page
2. **`/checkout/credits/cancelled`** - Cancelled checkout page

### Updated Components
- **`<CreditPacksModal />`** - Now redirects to Square checkout

---

## 🚀 Setup Instructions

### Step 1: Get Square Credentials

1. **Sign up for Square:**
   - Go to: https://squareup.com/signup
   - Complete business verification

2. **Access Developer Dashboard:**
   - Go to: https://developer.squareup.com/apps
   - Create new application or select existing one

3. **Get Credentials:**
   Navigate to your app and get:
   - **Access Token** (Sandbox & Production)
   - **Location ID**
   - **Webhook Signature Key**

---

### Step 2: Add Environment Variables

Add to `.env.local`:

```bash
# Square Configuration
SQUARE_ACCESS_TOKEN=your_access_token_here
SQUARE_ENVIRONMENT=sandbox  # or "production"
SQUARE_LOCATION_ID=your_location_id_here
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key_here

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Change for production
SUPPORT_EMAIL=support@promptlyprinted.com
```

#### How to Find These:

**Access Token:**
- Dashboard → Credentials → Access Token
- Sandbox: Use "Sandbox Access Token"
- Production: Use "Production Access Token"

**Location ID:**
- Dashboard → Locations
- Copy the Location ID
- Or use API: `GET /v2/locations`

**Webhook Signature Key:**
- Dashboard → Webhooks
- Create webhook (see Step 3)
- Copy signature key after creation

---

### Step 3: Configure Square Webhooks

1. **Go to Webhook Settings:**
   - Dashboard → Webhooks → Subscribe to events

2. **Create New Webhook:**
   ```
   URL: https://yourdomain.com/api/webhooks/square/credits
   Events to Subscribe:
   - payment.updated
   - order.updated
   ```

3. **Test Webhook Connection:**
   ```bash
   curl https://yourdomain.com/api/webhooks/square/credits
   # Should return: { "message": "Square webhook endpoint...", "status": "active" }
   ```

4. **Copy Signature Key:**
   - After creating webhook, copy the signature key
   - Add to `.env.local` as `SQUARE_WEBHOOK_SIGNATURE_KEY`

---

### Step 4: Test in Sandbox Mode

1. **Use Sandbox Credentials:**
   ```bash
   SQUARE_ENVIRONMENT=sandbox
   SQUARE_ACCESS_TOKEN=EAAAl... # Sandbox token
   ```

2. **Test Purchase Flow:**
   ```bash
   # Start dev server
   pnpm dev

   # Visit demo
   http://localhost:3000/credits-demo

   # Click "Buy Now" on any pack
   # Use Square's test card: 4111 1111 1111 1111
   ```

3. **Square Test Cards:**
   ```
   Success: 4111 1111 1111 1111
   Decline: 4000 0000 0000 0002
   CVV: Any 3 digits
   ZIP: Any 5 digits
   Expiry: Any future date
   ```

---

### Step 5: Test Webhook Locally

Since Square webhooks need a public URL, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)

# Update Square webhook URL to:
https://abc123.ngrok.io/api/webhooks/square/credits

# Make a test purchase
# Check your terminal for webhook logs
```

---

### Step 6: Deploy to Production

1. **Update Environment Variables:**
   ```bash
   SQUARE_ENVIRONMENT=production
   SQUARE_ACCESS_TOKEN=your_production_token
   NEXT_PUBLIC_BASE_URL=https://promptlyprinted.com
   ```

2. **Update Square Webhook URL:**
   ```
   https://promptlyprinted.com/api/webhooks/square/credits
   ```

3. **Test End-to-End:**
   - Make real purchase with small amount
   - Verify credits added
   - Check webhook logs

---

## 💳 Payment Flow

### User Journey
```
1. User clicks "Buy Now" on credit pack
   ↓
2. POST /api/checkout/credits { packId }
   ↓
3. Square checkout session created
   → Order stored in DB (status: PENDING)
   ↓
4. User redirected to Square checkout page
   ↓
5. User completes payment
   ↓
6. Square sends webhook to /api/webhooks/square/credits
   ↓
7. Webhook handler:
   → Verifies signature
   → Finds order in DB
   → Adds credits to user account
   → Updates order status to COMPLETED
   ↓
8. User redirected to /checkout/credits/success
   ↓
9. Success page shows new balance
```

---

## 🔍 Testing Checklist

### Sandbox Testing
- [ ] Create checkout session
- [ ] Redirect to Square works
- [ ] Test card payment succeeds
- [ ] Webhook receives payment.updated event
- [ ] Credits added to user account
- [ ] Order status updated to COMPLETED
- [ ] Success page displays correct balance
- [ ] Cancel checkout redirects correctly

### Production Testing
- [ ] Real payment with small amount ($4.99)
- [ ] Credits delivered instantly
- [ ] Receipt email sent (if implemented)
- [ ] Refund test (optional)

---

## 🐛 Troubleshooting

### Checkout Not Creating
**Error:** `Failed to create checkout session`

**Solutions:**
1. Check access token is valid
2. Verify location ID is correct
3. Check Square environment (sandbox vs production)
4. Look at console logs for Square API errors

### Webhook Not Receiving Events
**Error:** Credits not added after payment

**Solutions:**
1. Verify webhook URL is correct
2. Check signature key matches
3. Use ngrok for local testing
4. Check Square webhook logs in dashboard
5. Look at server logs: `console.log` in webhook handler

### Credits Not Added
**Error:** Payment succeeded but no credits

**Solutions:**
1. Check webhook signature verification
2. Verify order metadata contains packId and credits
3. Look for errors in webhook handler logs
4. Check database order status
5. Manually check Square dashboard for payment status

### Signature Verification Fails
**Error:** `Invalid signature`

**Solutions:**
1. Verify `SQUARE_WEBHOOK_SIGNATURE_KEY` is correct
2. Check webhook is using POST request
3. Ensure raw body is used for signature verification
4. Re-create webhook in Square dashboard

---

## 📊 Database Records

### Order Table
When checkout is created:
```json
{
  "userId": "user_123",
  "status": "PENDING",
  "totalPrice": 14.99,
  "metadata": {
    "type": "credit_pack_purchase",
    "packId": "pack_id",
    "packName": "Creator Pack",
    "credits": 110,
    "squarePaymentLinkId": "link_id",
    "squareOrderId": "order_id"
  }
}
```

After payment completes:
```json
{
  "status": "COMPLETED",
  "metadata": {
    // ... previous metadata ...
    "squarePaymentId": "payment_id",
    "completedAt": "2025-11-25T12:00:00Z",
    "creditsAdded": 110,
    "newBalance": 160
  }
}
```

### CreditTransaction Table
```json
{
  "userId": "user_123",
  "amount": 110,
  "balance": 160,
  "type": "PURCHASE",
  "reason": "Purchased Creator Pack (110 credits)",
  "metadata": {
    "packId": "pack_id",
    "packName": "Creator Pack",
    "squarePaymentId": "payment_id",
    "squareOrderId": "order_id",
    "amountPaid": 1499,  // cents
    "currency": "USD"
  }
}
```

---

## 🔒 Security Features

✅ **Webhook Signature Verification**
- All webhooks verified with HMAC SHA-256
- Rejects invalid signatures
- Prevents replay attacks

✅ **Idempotency**
- Each checkout has unique key
- Duplicate webhooks ignored
- Safe to retry failed webhooks

✅ **Authentication Required**
- Only authenticated users can purchase
- User ID tracked in all transactions
- Guest users must sign up first

---

## 💰 Square Fees

### Transaction Fees
- **Online:** 2.9% + $0.30 per transaction
- **Invoices:** 3.3% + $0.30 per transaction

### Example Costs
```
Starter Pack ($4.99):
- Square Fee: $0.45
- Your Revenue: $4.54

Creator Pack ($14.99):
- Square Fee: $0.74
- Your Revenue: $14.25

Pro Pack ($29.99):
- Square Fee: $1.17
- Your Revenue: $28.82

Enterprise Pack ($49.99):
- Square Fee: $1.75
- Your Revenue: $48.24
```

---

## 📧 Email Receipts (TODO)

To send email receipts after purchase, add this function:

```typescript
// lib/email.ts
export async function sendCreditPurchaseReceipt(
  userId: string,
  packName: string,
  credits: number,
  newBalance: number
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) return;

  // Use your email provider (Resend, SendGrid, etc.)
  await sendEmail({
    to: user.email,
    subject: 'Credit Purchase Confirmation',
    template: 'credit-purchase',
    data: {
      name: user.name,
      packName,
      credits,
      newBalance,
    },
  });
}
```

Then uncomment the TODO in webhook handler:
```typescript
// In handlePaymentUpdated()
await sendCreditPurchaseReceipt(
  order.userId,
  packName,
  credits,
  result.newBalance
);
```

---

## 🚀 Going Live

### Pre-Launch Checklist
- [ ] Switch to production credentials
- [ ] Update webhook URL to production domain
- [ ] Test with real payment (small amount)
- [ ] Verify credits delivered
- [ ] Set up email receipts (optional)
- [ ] Configure refund policy
- [ ] Add support email
- [ ] Test on mobile devices
- [ ] Monitor webhook logs

### Post-Launch Monitoring
- Monitor Square dashboard for failed payments
- Check webhook delivery logs
- Track failed credit additions
- Monitor support emails
- Review transaction success rate

---

## 📈 Analytics to Track

### Payment Metrics
- Total revenue
- Average transaction value
- Most popular pack
- Conversion rate (view → purchase)
- Failed payment rate

### Credit Metrics
- Credits sold per day
- Credits used per day
- Average credits per user
- Welcome credits vs purchased

### User Metrics
- Guest → paid conversion
- Time to first purchase
- Repeat purchase rate
- Lifetime value per user

---

## 🎯 Next Steps (Optional Enhancements)

### Short Term
1. Add email receipts
2. Implement refund handling
3. Add purchase history page
4. Send low balance reminders

### Long Term
1. Subscription plans (monthly unlimited)
2. Bulk discounts for enterprises
3. Referral credit bonuses
4. Seasonal promotions
5. Gift credit codes

---

## 📞 Support

### Square Support
- Dashboard: https://squareup.com/dashboard
- Documentation: https://developer.squareup.com/docs
- Support: https://squareup.com/help

### Webhook Debugging
```bash
# Check webhook deliveries
Square Dashboard → Webhooks → View Logs

# Check failed webhooks
Look for 4xx/5xx responses

# Retry failed webhooks
Square Dashboard → Webhooks → Retry
```

---

## ✅ Summary

You now have:
- ✅ Full Square checkout integration
- ✅ Webhook handling for instant credit delivery
- ✅ Success/cancelled pages
- ✅ Database tracking
- ✅ Security features
- ✅ Error handling

**Ready to go live!** Just add your Square credentials and test. 🚀
