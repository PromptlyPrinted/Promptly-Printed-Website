import { PrismaClient } from '@prisma/client';

enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

const prisma = new PrismaClient();

async function createDiscountCode() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: tsx scripts/create-discount-code.ts <code> <type> <value> [options]

Arguments:
  code         Discount code (e.g., WELCOME10)
  type         PERCENTAGE or FIXED_AMOUNT
  value        Discount value (e.g., 10 for 10% or 10 for £10)

Options:
  --min-order <amount>        Minimum order amount required
  --max-uses <number>         Maximum total uses
  --max-uses-per-user <number> Maximum uses per user
  --starts-at <date>          Start date (ISO format)
  --expires-at <date>         Expiry date (ISO format)
  --inactive                  Create as inactive

Examples:
  # 10% off, no restrictions
  tsx scripts/create-discount-code.ts WELCOME10 PERCENTAGE 10

  # £15 off orders over £50, max 100 uses
  tsx scripts/create-discount-code.ts SAVE15 FIXED_AMOUNT 15 --min-order 50 --max-uses 100

  # 20% off, one use per user, expires in 30 days
  tsx scripts/create-discount-code.ts FLASH20 PERCENTAGE 20 --max-uses-per-user 1 --expires-at "2025-12-31T23:59:59Z"
    `);
    process.exit(0);
  }

  const [code, typeStr, valueStr, ...options] = args;

  if (!code || !typeStr || !valueStr) {
    console.error('Error: code, type, and value are required');
    process.exit(1);
  }

  const type = typeStr.toUpperCase() as 'PERCENTAGE' | 'FIXED_AMOUNT';
  if (type !== 'PERCENTAGE' && type !== 'FIXED_AMOUNT') {
    console.error('Error: type must be PERCENTAGE or FIXED_AMOUNT');
    process.exit(1);
  }

  const value = parseFloat(valueStr);
  if (isNaN(value) || value <= 0) {
    console.error('Error: value must be a positive number');
    process.exit(1);
  }

  // Parse options
  const getOption = (flag: string): string | undefined => {
    const index = options.indexOf(flag);
    return index !== -1 && options[index + 1] ? options[index + 1] : undefined;
  };

  const minOrderAmount = getOption('--min-order')
    ? parseFloat(getOption('--min-order')!)
    : undefined;
  const maxUses = getOption('--max-uses')
    ? parseInt(getOption('--max-uses')!)
    : undefined;
  const maxUsesPerUser = getOption('--max-uses-per-user')
    ? parseInt(getOption('--max-uses-per-user')!)
    : undefined;
  const startsAt = getOption('--starts-at')
    ? new Date(getOption('--starts-at')!)
    : undefined;
  const expiresAt = getOption('--expires-at')
    ? new Date(getOption('--expires-at')!)
    : undefined;
  const isActive = !options.includes('--inactive');

  try {
    const discountCode = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        type: type as DiscountType,
        value,
        minOrderAmount,
        maxUses,
        maxUsesPerUser,
        startsAt,
        expiresAt,
        isActive,
        metadata: {
          createdBy: 'script',
          createdAt: new Date().toISOString(),
        },
      },
    });

    console.log('\n✅ Discount code created successfully!\n');
    console.log('Code:', discountCode.code);
    console.log('Type:', discountCode.type);
    console.log('Value:', discountCode.value);
    console.log('Active:', discountCode.isActive);
    if (minOrderAmount) console.log('Min Order Amount:', `£${minOrderAmount}`);
    if (maxUses) console.log('Max Uses:', maxUses);
    if (maxUsesPerUser) console.log('Max Uses Per User:', maxUsesPerUser);
    if (startsAt) console.log('Starts At:', startsAt.toISOString());
    if (expiresAt) console.log('Expires At:', expiresAt.toISOString());
    console.log('');
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error(`Error: Discount code '${code.toUpperCase()}' already exists`);
    } else {
      console.error('Error creating discount code:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDiscountCode();
