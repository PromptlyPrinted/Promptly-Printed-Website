# Discount Code System

Your Square checkout now supports discount codes! Customers can apply discount codes at checkout to receive discounts on their orders.

## Features

- **Two discount types:**
  - `PERCENTAGE`: Percentage off the order (e.g., 10% off)
  - `FIXED_AMOUNT`: Fixed amount off the order (e.g., £15 off)

- **Flexible restrictions:**
  - Minimum order amount
  - Maximum total uses
  - Maximum uses per user
  - Start date (discount becomes available)
  - Expiry date
  - Active/inactive toggle

- **Usage tracking:**
  - Tracks how many times each code has been used
  - Records which users used which codes
  - Prevents over-use based on limits

## Creating Discount Codes

### Using the Script (Recommended)

Use the provided script to quickly create discount codes:

```bash
# Basic examples
tsx scripts/create-discount-code.ts WELCOME10 PERCENTAGE 10
tsx scripts/create-discount-code.ts SAVE15 FIXED_AMOUNT 15

# With options
tsx scripts/create-discount-code.ts FLASH20 PERCENTAGE 20 \
  --min-order 50 \
  --max-uses 100 \
  --max-uses-per-user 1 \
  --expires-at "2025-12-31T23:59:59Z"
```

**Script options:**
- `--min-order <amount>`: Minimum order amount required
- `--max-uses <number>`: Maximum total uses across all customers
- `--max-uses-per-user <number>`: Maximum uses per customer
- `--starts-at <date>`: Start date in ISO format
- `--expires-at <date>`: Expiry date in ISO format
- `--inactive`: Create the code as inactive

### Using the Admin API

You can also create discount codes via the API (requires admin authentication):

```bash
curl -X POST http://localhost:3000/api/admin/discount-codes \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "type": "PERCENTAGE",
    "value": 10,
    "minOrderAmount": 20,
    "maxUses": 100,
    "isActive": true
  }'
```

### Using Prisma Studio

```bash
pnpm --filter @repo/database exec prisma studio
```

Then navigate to the `DiscountCode` model and create records manually.

## Managing Discount Codes

### List All Discount Codes (Admin API)

```bash
# Get all discount codes
GET /api/admin/discount-codes

# Get only active codes
GET /api/admin/discount-codes?active=true
```

### Update a Discount Code (Admin API)

```bash
PATCH /api/admin/discount-codes
Content-Type: application/json

{
  "id": "discount-code-id",
  "isActive": false,
  "maxUses": 200
}
```

### Delete a Discount Code (Admin API)

```bash
DELETE /api/admin/discount-codes?id=discount-code-id
```

## Customer Usage

Customers can apply discount codes during checkout:

1. Add items to cart
2. Go to checkout
3. Enter discount code in the "Discount code" field
4. Click "Apply"
5. The discount will be validated and applied to the order total
6. Complete payment

The checkout page will show:
- Original subtotal
- Discount amount (if applied)
- Final total after discount

## Validation Rules

When a customer applies a discount code, the system validates:

1. ✅ Code exists and matches exactly (case-insensitive)
2. ✅ Code is active (`isActive = true`)
3. ✅ Current date is within the valid range (`startsAt` to `expiresAt`)
4. ✅ Order amount meets minimum requirement (`minOrderAmount`)
5. ✅ Total usage hasn't exceeded limit (`usedCount < maxUses`)
6. ✅ User hasn't exceeded per-user limit (`maxUsesPerUser`)

If any validation fails, an appropriate error message is shown to the customer.

## Database Schema

### DiscountCode Table

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Unique identifier |
| code | String (unique) | The discount code (stored in uppercase) |
| type | Enum | `PERCENTAGE` or `FIXED_AMOUNT` |
| value | Float | Discount value (10 = 10% or £10) |
| minOrderAmount | Float? | Minimum order amount required |
| maxUses | Int? | Maximum total uses (null = unlimited) |
| maxUsesPerUser | Int? | Maximum uses per user (null = unlimited) |
| usedCount | Int | Current usage count (default: 0) |
| startsAt | DateTime? | When the code becomes active |
| expiresAt | DateTime? | When the code expires |
| isActive | Boolean | Whether the code is active (default: true) |
| metadata | Json? | Additional data (e.g., campaign info) |

### DiscountUsage Table

Tracks each use of a discount code:

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Unique identifier |
| discountCodeId | String | Reference to DiscountCode |
| orderId | Int | Reference to Order |
| userId | String? | User who used the code (if logged in) |
| discountAmount | Float | Actual discount amount applied |
| createdAt | DateTime | When the code was used |

## Example Discount Scenarios

### Flash Sale (Limited Time, Limited Uses)
```bash
tsx scripts/create-discount-code.ts FLASH25 PERCENTAGE 25 \
  --max-uses 50 \
  --expires-at "2025-12-31T23:59:59Z"
```

### Welcome Discount (New Customers Only)
```bash
tsx scripts/create-discount-code.ts WELCOME10 PERCENTAGE 10 \
  --max-uses-per-user 1
```

### Free Shipping (Minimum Order)
```bash
tsx scripts/create-discount-code.ts FREESHIP FIXED_AMOUNT 5 \
  --min-order 30
```

### VIP Discount (Unlimited)
```bash
tsx scripts/create-discount-code.ts VIP15 PERCENTAGE 15
```

### Seasonal Sale (Future Start Date)
```bash
tsx scripts/create-discount-code.ts SUMMER20 PERCENTAGE 20 \
  --starts-at "2025-06-01T00:00:00Z" \
  --expires-at "2025-08-31T23:59:59Z"
```

## Testing

To test the discount code functionality:

1. Create a test discount code:
   ```bash
   tsx scripts/create-discount-code.ts TEST10 PERCENTAGE 10
   ```

2. Add items to your cart and go to checkout
3. Enter "TEST10" in the discount code field
4. Click "Apply"
5. Verify the discount is applied correctly
6. Complete the payment
7. Check the order in the database to confirm discount was recorded

## API Endpoints

### Public Endpoints

- `POST /api/checkout/validate-discount` - Validate a discount code
  - Request: `{ code: string, orderAmount: number }`
  - Response: `{ valid: boolean, discountCode?: {...}, error?: string }`

### Admin Endpoints (Requires Admin Role)

- `GET /api/admin/discount-codes` - List all discount codes
- `POST /api/admin/discount-codes` - Create a new discount code
- `PATCH /api/admin/discount-codes` - Update a discount code
- `DELETE /api/admin/discount-codes?id=<id>` - Delete a discount code

## Notes

- Discount codes are stored in uppercase for consistency
- User input is automatically converted to uppercase
- Discounts are applied to the order subtotal before payment
- The discount amount is stored with each order for record-keeping
- Usage tracking happens only after successful payment
- Guest users can use discount codes, but per-user limits only apply to logged-in users
- The system prevents double-counting by using database transactions
