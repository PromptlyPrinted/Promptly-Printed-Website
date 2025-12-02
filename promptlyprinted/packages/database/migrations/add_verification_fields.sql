-- Add purchase verification and referral tracking to CompetitionEntry
ALTER TABLE "CompetitionEntry" ADD COLUMN IF NOT EXISTS "orderId" INTEGER;
ALTER TABLE "CompetitionEntry" ADD COLUMN IF NOT EXISTS "purchaseVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "CompetitionEntry" ADD COLUMN IF NOT EXISTS "wearingPhotoUrl" TEXT;
ALTER TABLE "CompetitionEntry" ADD COLUMN IF NOT EXISTS "wearingPhotoVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "CompetitionEntry" ADD COLUMN IF NOT EXISTS "socialFollowVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "CompetitionEntry" ADD COLUMN IF NOT EXISTS "socialPlatform" TEXT; -- 'instagram', 'facebook', 'twitter', 'tiktok'
ALTER TABLE "CompetitionEntry" ADD COLUMN IF NOT EXISTS "socialUsername" TEXT;
ALTER TABLE "CompetitionEntry" ADD COLUMN IF NOT EXISTS "referralCode" TEXT UNIQUE;

-- Create referral tracking table
CREATE TABLE IF NOT EXISTS "Referral" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "referrerId" TEXT NOT NULL,
  "referredUserId" TEXT,
  "referredEmail" TEXT,
  "orderId" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  "pointsAwarded" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Referral_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE SET NULL,
  CONSTRAINT "Referral_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "Referral_referrerId_idx" ON "Referral"("referrerId");
CREATE INDEX IF NOT EXISTS "Referral_referredUserId_idx" ON "Referral"("referredUserId");
CREATE INDEX IF NOT EXISTS "Referral_status_idx" ON "Referral"("status");

-- Add referral tracking to Order metadata
COMMENT ON COLUMN "Order"."metadata" IS 'Can include referralCode for tracking';

-- Add points awarded tracking to PointHistory
ALTER TABLE "PointHistory" ADD COLUMN IF NOT EXISTS "referralId" TEXT;
ALTER TABLE "PointHistory" ADD COLUMN IF NOT EXISTS "verificationProof" TEXT; -- URL to proof image/screenshot
