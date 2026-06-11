-- CreateEnum
CREATE TYPE "XpActionType" AS ENUM ('PHOTO_PURCHASE', 'EVENT_FAVORITE', 'PROFILE_COMPLETE', 'FRIEND_ADDED', 'PHOTO_SHARED', 'PHOTO_REACTION', 'REFERRAL_COMPLETED', 'PHOTO_UPLOADED', 'EVENT_PUBLISHED', 'PHOTO_SOLD', 'BADGE_EARNED', 'STRIPE_CONNECTED', 'HIGH_OCR_RATE', 'EVENT_CREATED', 'START_LIST_IMPORTED', 'HIGH_COVERAGE', 'DAILY_LOGIN', 'STREAK_BONUS');

-- CreateEnum
CREATE TYPE "LeaderboardPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'LOVE', 'FIRE', 'WOW');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PHOTOS_AVAILABLE', 'PURCHASE_REMINDER', 'SORTING_REMINDER', 'WEEKLY_STATS', 'STREAK_AT_RISK', 'BADGE_EARNED', 'LEVEL_UP', 'REFERRAL_COMPLETED');

-- AlterTable: Add referralCode to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

-- AlterTable: Add latitude/longitude to Event
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "XpEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "XpActionType" NOT NULL,
    "xpAmount" INTEGER NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLevel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "levelName" TEXT NOT NULL DEFAULT 'Débutant',
    "currentLevelXp" INTEGER NOT NULL DEFAULT 0,
    "nextLevelXp" INTEGER NOT NULL DEFAULT 100,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" "LeaderboardPeriod" NOT NULL,
    "periodKey" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "category" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streakType" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3) NOT NULL,
    "nextDeadline" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoReaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT,
    "referralCode" TEXT NOT NULL,
    "refereeEmail" TEXT,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "referrerReward" INTEGER NOT NULL DEFAULT 0,
    "refereeReward" INTEGER NOT NULL DEFAULT 0,
    "completedAction" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "photoId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "platform" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rewardGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionKey" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmartAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WrappedRecap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL,
    "statsJson" TEXT NOT NULL,
    "cardImageS3" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WrappedRecap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "XpEvent_userId_idx" ON "XpEvent"("userId");
CREATE INDEX "XpEvent_userId_createdAt_idx" ON "XpEvent"("userId", "createdAt");
CREATE INDEX "XpEvent_createdAt_idx" ON "XpEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserLevel_userId_key" ON "UserLevel"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_userId_period_periodKey_category_key" ON "LeaderboardEntry"("userId", "period", "periodKey", "category");
CREATE INDEX "LeaderboardEntry_period_periodKey_category_score_idx" ON "LeaderboardEntry"("period", "periodKey", "category", "score");

-- CreateIndex
CREATE UNIQUE INDEX "UserStreak_userId_streakType_key" ON "UserStreak"("userId", "streakType");
CREATE INDEX "UserStreak_nextDeadline_idx" ON "UserStreak"("nextDeadline");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoReaction_userId_photoId_type_key" ON "PhotoReaction"("userId", "photoId", "type");
CREATE INDEX "PhotoReaction_photoId_idx" ON "PhotoReaction"("photoId");
CREATE INDEX "PhotoReaction_userId_idx" ON "PhotoReaction"("userId");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");
CREATE INDEX "Referral_referralCode_idx" ON "Referral"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "ShareEvent_shareToken_key" ON "ShareEvent"("shareToken");
CREATE INDEX "ShareEvent_shareToken_idx" ON "ShareEvent"("shareToken");
CREATE INDEX "ShareEvent_photoId_idx" ON "ShareEvent"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditReward_userId_actionKey_key" ON "CreditReward"("userId", "actionKey");

-- CreateIndex
CREATE INDEX "SmartAlert_userId_read_idx" ON "SmartAlert"("userId", "read");
CREATE INDEX "SmartAlert_scheduledAt_idx" ON "SmartAlert"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "WrappedRecap_userId_year_role_key" ON "WrappedRecap"("userId", "year", "role");

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLevel" ADD CONSTRAINT "UserLevel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoReaction" ADD CONSTRAINT "PhotoReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PhotoReaction" ADD CONSTRAINT "PhotoReaction_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditReward" ADD CONSTRAINT "CreditReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartAlert" ADD CONSTRAINT "SmartAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrappedRecap" ADD CONSTRAINT "WrappedRecap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
