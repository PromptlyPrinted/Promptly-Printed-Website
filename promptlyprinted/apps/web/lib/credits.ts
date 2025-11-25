/**
 * Credit Management System
 * Handles all credit-related operations for AI image generation
 */

import { prisma } from '@repo/database';
import { CreditTransactionType, GenerationStatus } from '@repo/database';
import {
  MODEL_CREDIT_COSTS,
  mapModelNameToEnum,
  GUEST_DAILY_LIMIT,
  WELCOME_CREDITS,
  MONTHLY_CREDITS,
  TSHIRT_PURCHASE_BONUS,
} from './credits-shared';

export {
  MODEL_CREDIT_COSTS,
  mapModelNameToEnum,
  GUEST_DAILY_LIMIT,
  WELCOME_CREDITS,
  MONTHLY_CREDITS,
  TSHIRT_PURCHASE_BONUS,
};

/**
 * Get or create user credits record
 * Automatically checks and applies monthly reset if needed
 */
export async function getUserCredits(userId: string) {
  let userCredits = await prisma.userCredits.findUnique({
    where: { userId },
  });

  if (!userCredits) {
    // Create new credits record with welcome bonus
    userCredits = await prisma.userCredits.create({
      data: {
        userId,
        credits: MONTHLY_CREDITS,
        monthlyCredits: MONTHLY_CREDITS,
        monthlyCreditsUsed: 0,
        lastMonthlyReset: new Date(),
        welcomeCredits: WELCOME_CREDITS,
        welcomeCreditsUsed: 0,
        lifetimeCredits: MONTHLY_CREDITS,
        lifetimeSpent: 0,
      },
    });

    // Record the initial monthly credits transaction
    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: MONTHLY_CREDITS,
        balance: MONTHLY_CREDITS,
        type: 'MONTHLY_RESET',
        reason: 'Initial monthly credit allocation',
      },
    });
  } else {
    // Check if monthly reset is needed
    const now = new Date();
    const lastReset = new Date(userCredits.lastMonthlyReset);

    // Check if we're in a different month
    const needsReset = now.getMonth() !== lastReset.getMonth() ||
                       now.getFullYear() !== lastReset.getFullYear();

    if (needsReset) {
      userCredits = await resetMonthlyCredits(userId);
    }
  }

  return userCredits;
}

/**
 * Reset monthly credits for a user
 */
export async function resetMonthlyCredits(userId: string) {
  const userCredits = await prisma.userCredits.findUnique({
    where: { userId },
  });

  if (!userCredits) {
    throw new Error('User credits not found');
  }

  // Reset monthly credits
  const updated = await prisma.userCredits.update({
    where: { userId },
    data: {
      credits: MONTHLY_CREDITS,
      monthlyCredits: MONTHLY_CREDITS,
      monthlyCreditsUsed: 0,
      lastMonthlyReset: new Date(),
      lifetimeCredits: userCredits.lifetimeCredits + MONTHLY_CREDITS,
    },
  });

  // Record the reset transaction
  await prisma.creditTransaction.create({
    data: {
      userId,
      amount: MONTHLY_CREDITS,
      balance: updated.credits,
      type: 'MONTHLY_RESET',
      reason: `Monthly credit reset for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    },
  });

  return updated;
}

/**
 * Check if user has enough credits for a generation
 */
export async function hasEnoughCredits(userId: string, modelName: string): Promise<{
  hasCredits: boolean;
  currentBalance: number;
  required: number;
}> {
  const userCredits = await getUserCredits(userId);
  const required = MODEL_CREDIT_COSTS[modelName] || 1;

  return {
    hasCredits: userCredits.credits >= required,
    currentBalance: userCredits.credits,
    required,
  };
}

/**
 * Deduct credits for a generation
 */
export async function deductCredits(
  userId: string,
  modelName: string,
  reason: string,
  metadata?: any
): Promise<{ success: boolean; newBalance: number; deducted: number }> {
  const creditsToDeduct = MODEL_CREDIT_COSTS[modelName] || 1;

  const userCredits = await getUserCredits(userId);

  if (userCredits.credits < creditsToDeduct) {
    return {
      success: false,
      newBalance: userCredits.credits,
      deducted: 0,
    };
  }

  // Update user credits and track monthly usage
  const updated = await prisma.userCredits.update({
    where: { userId },
    data: {
      credits: userCredits.credits - creditsToDeduct,
      monthlyCreditsUsed: userCredits.monthlyCreditsUsed + creditsToDeduct,
      lifetimeSpent: userCredits.lifetimeSpent + creditsToDeduct,
    },
  });

  // Record transaction
  await prisma.creditTransaction.create({
    data: {
      userId,
      amount: -creditsToDeduct,
      balance: updated.credits,
      type: 'GENERATION_USED',
      reason,
      metadata,
    },
  });

  return {
    success: true,
    newBalance: updated.credits,
    deducted: creditsToDeduct,
  };
}

/**
 * Add credits to user account (purchase, promo, etc.)
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  reason: string,
  metadata?: any
): Promise<{ success: boolean; newBalance: number }> {
  const userCredits = await getUserCredits(userId);

  const updated = await prisma.userCredits.update({
    where: { userId },
    data: {
      credits: userCredits.credits + amount,
      lifetimeCredits: userCredits.lifetimeCredits + amount,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId,
      amount,
      balance: updated.credits,
      type,
      reason,
      metadata,
    },
  });

  return {
    success: true,
    newBalance: updated.credits,
  };
}

/**
 * Grant T-shirt purchase bonus credits
 * Called when a user successfully purchases a T-shirt
 */
export async function grantTshirtPurchaseBonus(
  userId: string,
  orderId: number,
  tshirtCount: number = 1
): Promise<{ success: boolean; creditsGranted: number; newBalance: number }> {
  const creditsToGrant = TSHIRT_PURCHASE_BONUS * tshirtCount;

  const result = await addCredits(
    userId,
    creditsToGrant,
    'TSHIRT_BONUS',
    `Bonus credits for purchasing ${tshirtCount} T-shirt${tshirtCount > 1 ? 's' : ''}`,
    {
      orderId,
      tshirtCount,
      creditsPerTshirt: TSHIRT_PURCHASE_BONUS,
    }
  );

  return {
    success: result.success,
    creditsGranted: creditsToGrant,
    newBalance: result.newBalance,
  };
}

/**
 * Check guest generation limit (3 per 24 hours)
 */
export async function checkGuestLimit(sessionId: string, ipAddress?: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetsAt: Date | null;
}> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find existing guest record
  const guestRecord = await prisma.guestGeneration.findUnique({
    where: { sessionId },
  });

  if (!guestRecord) {
    // No record, user is allowed
    return {
      allowed: true,
      remaining: GUEST_DAILY_LIMIT - 1, // After this generation
      resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  // Check if last generation was within 24 hours
  if (guestRecord.lastGenAt < twentyFourHoursAgo) {
    // Reset the counter - it's been 24+ hours
    return {
      allowed: true,
      remaining: GUEST_DAILY_LIMIT - 1,
      resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  // Within 24 hours - check count
  if (guestRecord.count >= GUEST_DAILY_LIMIT) {
    // Limit exceeded
    const resetsAt = new Date(guestRecord.lastGenAt.getTime() + 24 * 60 * 60 * 1000);
    return {
      allowed: false,
      remaining: 0,
      resetsAt,
    };
  }

  // Still has generations left
  return {
    allowed: true,
    remaining: GUEST_DAILY_LIMIT - guestRecord.count - 1,
    resetsAt: new Date(guestRecord.lastGenAt.getTime() + 24 * 60 * 60 * 1000),
  };
}

/**
 * Record a guest generation
 */
export async function recordGuestGeneration(sessionId: string, ipAddress?: string): Promise<void> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const existing = await prisma.guestGeneration.findUnique({
    where: { sessionId },
  });

  if (!existing) {
    // Create new record
    await prisma.guestGeneration.create({
      data: {
        sessionId,
        ipAddress,
        count: 1,
        lastGenAt: new Date(),
      },
    });
  } else if (existing.lastGenAt < twentyFourHoursAgo) {
    // Reset counter if 24+ hours have passed
    await prisma.guestGeneration.update({
      where: { sessionId },
      data: {
        count: 1,
        lastGenAt: new Date(),
        ipAddress,
      },
    });
  } else {
    // Increment counter
    await prisma.guestGeneration.update({
      where: { sessionId },
      data: {
        count: existing.count + 1,
        lastGenAt: new Date(),
        ipAddress,
      },
    });
  }
}

/**
 * Record an image generation in the database
 */
export async function recordImageGeneration(data: {
  userId?: string;
  sessionId?: string;
  prompt: string;
  aiModel: string;
  creditsUsed: number;
  status: GenerationStatus;
  imageUrl?: string;
  printReadyUrl?: string;
  errorMessage?: string;
  generationTimeMs?: number;
  metadata?: any;
}) {
  return await prisma.imageGeneration.create({
    data: {
      userId: data.userId || null,
      sessionId: data.sessionId || null,
      prompt: data.prompt,
      aiModel: mapModelNameToEnum(data.aiModel),
      creditsUsed: data.creditsUsed,
      status: data.status,
      imageUrl: data.imageUrl || null,
      printReadyUrl: data.printReadyUrl || null,
      errorMessage: data.errorMessage || null,
      generationTimeMs: data.generationTimeMs || null,
      metadata: data.metadata || null,
    },
  });
}

/**
 * Get user's credit balance and usage stats
 */
export async function getCreditStats(userId: string) {
  const userCredits = await getUserCredits(userId);

  const recentTransactions = await prisma.creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const totalGenerations = await prisma.imageGeneration.count({
    where: { userId },
  });

  return {
    balance: userCredits.credits,
    welcomeCreditsRemaining: userCredits.welcomeCredits - userCredits.welcomeCreditsUsed,
    lifetimeCredits: userCredits.lifetimeCredits,
    lifetimeSpent: userCredits.lifetimeSpent,
    totalGenerations,
    recentTransactions,
  };
}
