-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PHOTOGRAPHER', 'ORGANIZER', 'AGENCY', 'CLUB', 'FEDERATION', 'ADMIN', 'RUNNER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('RUNNING', 'TRAIL', 'TRIATHLON', 'CYCLING', 'SWIMMING', 'OBSTACLE', 'OTHER');

-- CreateEnum
CREATE TYPE "PackType" AS ENUM ('SINGLE', 'PACK_5', 'PACK_10', 'ALL_INCLUSIVE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'DELIVERED', 'REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "GdprRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GdprRequestType" AS ENUM ('DELETION', 'ACCESS', 'RECTIFICATION');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'DEDUCTION', 'REFUND', 'ADMIN_GRANT');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "MessageCategory" AS ENUM ('BILLING', 'SORTING', 'GDPR', 'ACCOUNT', 'TECHNICAL', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "HordeMemberStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('GROUP', 'DM');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'LOVE', 'FIRE', 'WOW');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PHOTOS_AVAILABLE', 'PURCHASE_REMINDER', 'SORTING_REMINDER', 'WEEKLY_STATS', 'STREAK_AT_RISK', 'BADGE_EARNED', 'LEVEL_UP', 'REFERRAL_COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PHOTOGRAPHER',
    "phone" TEXT,
    "avatar" TEXT,
    "company" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" TIMESTAMP(3),
    "stripeAccountId" TEXT,
    "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "portfolio" TEXT,
    "location" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "referralSource" TEXT,
    "acceptedCguAt" TIMESTAMP(3),
    "newsletterOptIn" BOOLEAN NOT NULL DEFAULT false,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionPlan" TEXT,
    "subscriptionStartedAt" TIMESTAMP(3),
    "subscriptionEndsAt" TIMESTAMP(3),
    "subscriptionCancelRequestedAt" TIMESTAMP(3),
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "sportifId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "faceImagePath" TEXT,
    "referralCode" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "sportType" "SportType" NOT NULL DEFAULT 'RUNNING',
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "coverImage" TEXT,
    "primaryColor" TEXT,
    "bannerImage" TEXT,
    "logoImage" TEXT,
    "userId" TEXT NOT NULL,
    "faceClusteredAt" TIMESTAMP(3),
    "uploadStartedAt" TIMESTAMP(3),
    "processingStartedAt" TIMESTAMP(3),
    "uploadCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "webPath" TEXT,
    "s3Key" TEXT,
    "thumbnailPath" TEXT,
    "eventId" TEXT NOT NULL,
    "qualityScore" DOUBLE PRECISION,
    "isBlurry" BOOLEAN NOT NULL DEFAULT false,
    "autoEdited" BOOLEAN NOT NULL DEFAULT false,
    "labels" TEXT,
    "faceIndexed" BOOLEAN NOT NULL DEFAULT false,
    "ocrProvider" TEXT,
    "processedAt" TIMESTAMP(3),
    "creditDeducted" BOOLEAN NOT NULL DEFAULT false,
    "creditRefunded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibNumber" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'ocr',

    CONSTRAINT "BibNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoFace" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "faceId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "boundingBox" TEXT,
    "cropPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoFace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StartListEntry" (
    "id" TEXT NOT NULL,
    "bibNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "eventId" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "StartListEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricePack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PackType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "PricePack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestEmail" TEXT,
    "guestName" TEXT,
    "eventId" TEXT NOT NULL,
    "packId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stripeFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "photographerPayout" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stripeTransferId" TEXT,
    "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "transferredAt" TIMESTAMP(3),
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "downloadToken" TEXT,
    "downloadExpiresAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GdprRequest" (
    "id" TEXT NOT NULL,
    "type" "GdprRequestType" NOT NULL DEFAULT 'DELETION',
    "status" "GdprRequestStatus" NOT NULL DEFAULT 'PENDING',
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bibNumber" TEXT,
    "eventId" TEXT,
    "reason" TEXT,
    "adminNote" TEXT,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "photosDeleted" INTEGER NOT NULL DEFAULT 0,
    "facesDeleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GdprRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GdprAuditLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GdprAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "photoId" TEXT,
    "eventId" TEXT,
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sportType" "SportType" NOT NULL DEFAULT 'RUNNING',
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventLocation" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "ListingStatus" NOT NULL DEFAULT 'OPEN',
    "creatorId" TEXT NOT NULL,
    "requirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceApplication" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "photographerId" TEXT NOT NULL,
    "message" TEXT,
    "proposedRate" DOUBLE PRECISION,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "recipientId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" "MessageCategory" NOT NULL DEFAULT 'OTHER',
    "status" "MessageStatus" NOT NULL DEFAULT 'OPEN',
    "eventId" TEXT,
    "orderId" TEXT,
    "adminReply" TEXT,
    "repliedBy" TEXT,
    "repliedAt" TIMESTAMP(3),
    "readByUser" BOOLEAN NOT NULL DEFAULT true,
    "readByRecipient" BOOLEAN NOT NULL DEFAULT true,
    "replies" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "watermarkPath" TEXT,
    "watermarkOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceReview" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "listingId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Horde" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Ma Horde',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Horde_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HordeMember" (
    "id" TEXT NOT NULL,
    "hordeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "HordeMemberStatus" NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),

    CONSTRAINT "HordeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HordeConversation" (
    "id" TEXT NOT NULL,
    "hordeId" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL,
    "name" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HordeConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HordeConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HordeConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HordeMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HordeMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "bibNumber" TEXT NOT NULL,
    "photoCount" INTEGER NOT NULL DEFAULT 0,
    "lastNotifiedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "eventId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "GuestEventFollower" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "eventId" TEXT NOT NULL,
    "bibNumber" TEXT,
    "unsubscribeToken" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestEventFollower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'android',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photosAvailable" BOOLEAN NOT NULL DEFAULT true,
    "eventPublished" BOOLEAN NOT NULL DEFAULT true,
    "supportReply" BOOLEAN NOT NULL DEFAULT true,
    "badgeEarned" BOOLEAN NOT NULL DEFAULT true,
    "streakAtRisk" BOOLEAN NOT NULL DEFAULT true,
    "purchaseReminder" BOOLEAN NOT NULL DEFAULT true,
    "sortingReminder" BOOLEAN NOT NULL DEFAULT true,
    "stripeOnboarded" BOOLEAN NOT NULL DEFAULT true,
    "newSupportMessage" BOOLEAN NOT NULL DEFAULT true,
    "newSale" BOOLEAN NOT NULL DEFAULT true,
    "newFollower" BOOLEAN NOT NULL DEFAULT true,
    "lowCredits" BOOLEAN NOT NULL DEFAULT true,
    "productUpdates" BOOLEAN NOT NULL DEFAULT true,
    "referralCompleted" BOOLEAN NOT NULL DEFAULT true,
    "newsletter" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_sportifId_key" ON "User"("sportifId");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Photo_eventId_idx" ON "Photo"("eventId");

-- CreateIndex
CREATE INDEX "Photo_ocrProvider_idx" ON "Photo"("ocrProvider");

-- CreateIndex
CREATE INDEX "Photo_faceIndexed_idx" ON "Photo"("faceIndexed");

-- CreateIndex
CREATE INDEX "Photo_processedAt_idx" ON "Photo"("processedAt");

-- CreateIndex
CREATE INDEX "BibNumber_number_idx" ON "BibNumber"("number");

-- CreateIndex
CREATE INDEX "BibNumber_photoId_idx" ON "BibNumber"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "BibNumber_photoId_number_key" ON "BibNumber"("photoId", "number");

-- CreateIndex
CREATE INDEX "PhotoFace_photoId_idx" ON "PhotoFace"("photoId");

-- CreateIndex
CREATE INDEX "PhotoFace_faceId_idx" ON "PhotoFace"("faceId");

-- CreateIndex
CREATE INDEX "StartListEntry_eventId_idx" ON "StartListEntry"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "StartListEntry_eventId_bibNumber_key" ON "StartListEntry"("eventId", "bibNumber");

-- CreateIndex
CREATE INDEX "PricePack_eventId_idx" ON "PricePack"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_downloadToken_key" ON "Order"("downloadToken");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_eventId_idx" ON "Order"("eventId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_downloadToken_idx" ON "Order"("downloadToken");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_photoId_idx" ON "OrderItem"("photoId");

-- CreateIndex
CREATE INDEX "GdprRequest_email_idx" ON "GdprRequest"("email");

-- CreateIndex
CREATE INDEX "GdprRequest_status_idx" ON "GdprRequest"("status");

-- CreateIndex
CREATE INDEX "GdprAuditLog_requestId_idx" ON "GdprAuditLog"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_stripeSessionId_key" ON "CreditTransaction"("stripeSessionId");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "MarketplaceListing_creatorId_idx" ON "MarketplaceListing"("creatorId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_status_idx" ON "MarketplaceListing"("status");

-- CreateIndex
CREATE INDEX "MarketplaceListing_sportType_idx" ON "MarketplaceListing"("sportType");

-- CreateIndex
CREATE INDEX "MarketplaceListing_eventDate_idx" ON "MarketplaceListing"("eventDate");

-- CreateIndex
CREATE INDEX "MarketplaceApplication_listingId_idx" ON "MarketplaceApplication"("listingId");

-- CreateIndex
CREATE INDEX "MarketplaceApplication_photographerId_idx" ON "MarketplaceApplication"("photographerId");

-- CreateIndex
CREATE INDEX "MarketplaceApplication_status_idx" ON "MarketplaceApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceApplication_listingId_photographerId_key" ON "MarketplaceApplication"("listingId", "photographerId");

-- CreateIndex
CREATE INDEX "SupportMessage_userId_idx" ON "SupportMessage"("userId");

-- CreateIndex
CREATE INDEX "SupportMessage_recipientId_idx" ON "SupportMessage"("recipientId");

-- CreateIndex
CREATE INDEX "SupportMessage_status_idx" ON "SupportMessage"("status");

-- CreateIndex
CREATE INDEX "SupportMessage_category_idx" ON "SupportMessage"("category");

-- CreateIndex
CREATE INDEX "SupportMessage_createdAt_idx" ON "SupportMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "MarketplaceReview_authorId_idx" ON "MarketplaceReview"("authorId");

-- CreateIndex
CREATE INDEX "MarketplaceReview_targetId_idx" ON "MarketplaceReview"("targetId");

-- CreateIndex
CREATE INDEX "EventFavorite_userId_idx" ON "EventFavorite"("userId");

-- CreateIndex
CREATE INDEX "EventFavorite_eventId_idx" ON "EventFavorite"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventFavorite_userId_eventId_key" ON "EventFavorite"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Horde_ownerId_key" ON "Horde"("ownerId");

-- CreateIndex
CREATE INDEX "HordeMember_userId_idx" ON "HordeMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HordeMember_hordeId_userId_key" ON "HordeMember"("hordeId", "userId");

-- CreateIndex
CREATE INDEX "HordeConversation_hordeId_idx" ON "HordeConversation"("hordeId");

-- CreateIndex
CREATE INDEX "HordeConversationParticipant_userId_idx" ON "HordeConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HordeConversationParticipant_conversationId_userId_key" ON "HordeConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "HordeMessage_conversationId_createdAt_idx" ON "HordeMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "PhotoAlert_userId_idx" ON "PhotoAlert"("userId");

-- CreateIndex
CREATE INDEX "PhotoAlert_eventId_bibNumber_idx" ON "PhotoAlert"("eventId", "bibNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoAlert_userId_eventId_bibNumber_key" ON "PhotoAlert"("userId", "eventId", "bibNumber");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_eventId_idx" ON "Notification"("eventId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "UserStreak_nextDeadline_idx" ON "UserStreak"("nextDeadline");

-- CreateIndex
CREATE UNIQUE INDEX "UserStreak_userId_streakType_key" ON "UserStreak"("userId", "streakType");

-- CreateIndex
CREATE INDEX "PhotoReaction_photoId_idx" ON "PhotoReaction"("photoId");

-- CreateIndex
CREATE INDEX "PhotoReaction_userId_idx" ON "PhotoReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoReaction_userId_photoId_type_key" ON "PhotoReaction"("userId", "photoId", "type");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");

-- CreateIndex
CREATE INDEX "Referral_referralCode_idx" ON "Referral"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "ShareEvent_shareToken_key" ON "ShareEvent"("shareToken");

-- CreateIndex
CREATE INDEX "ShareEvent_shareToken_idx" ON "ShareEvent"("shareToken");

-- CreateIndex
CREATE INDEX "ShareEvent_photoId_idx" ON "ShareEvent"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditReward_userId_actionKey_key" ON "CreditReward"("userId", "actionKey");

-- CreateIndex
CREATE INDEX "SmartAlert_userId_read_idx" ON "SmartAlert"("userId", "read");

-- CreateIndex
CREATE INDEX "SmartAlert_scheduledAt_idx" ON "SmartAlert"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "WrappedRecap_userId_year_role_key" ON "WrappedRecap"("userId", "year", "role");

-- CreateIndex
CREATE UNIQUE INDEX "GuestEventFollower_unsubscribeToken_key" ON "GuestEventFollower"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "GuestEventFollower_eventId_idx" ON "GuestEventFollower"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "GuestEventFollower_email_eventId_key" ON "GuestEventFollower"("email", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_token_key" ON "DeviceToken"("token");

-- CreateIndex
CREATE INDEX "DeviceToken_userId_idx" ON "DeviceToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibNumber" ADD CONSTRAINT "BibNumber_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoFace" ADD CONSTRAINT "PhotoFace_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StartListEntry" ADD CONSTRAINT "StartListEntry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricePack" ADD CONSTRAINT "PricePack_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PricePack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GdprAuditLog" ADD CONSTRAINT "GdprAuditLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "GdprRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceApplication" ADD CONSTRAINT "MarketplaceApplication_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceApplication" ADD CONSTRAINT "MarketplaceApplication_photographerId_fkey" FOREIGN KEY ("photographerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceReview" ADD CONSTRAINT "MarketplaceReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceReview" ADD CONSTRAINT "MarketplaceReview_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFavorite" ADD CONSTRAINT "EventFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFavorite" ADD CONSTRAINT "EventFavorite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horde" ADD CONSTRAINT "Horde_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HordeMember" ADD CONSTRAINT "HordeMember_hordeId_fkey" FOREIGN KEY ("hordeId") REFERENCES "Horde"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HordeMember" ADD CONSTRAINT "HordeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HordeConversation" ADD CONSTRAINT "HordeConversation_hordeId_fkey" FOREIGN KEY ("hordeId") REFERENCES "Horde"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HordeConversation" ADD CONSTRAINT "HordeConversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HordeConversationParticipant" ADD CONSTRAINT "HordeConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "HordeConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HordeConversationParticipant" ADD CONSTRAINT "HordeConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HordeMessage" ADD CONSTRAINT "HordeMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "HordeConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HordeMessage" ADD CONSTRAINT "HordeMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoAlert" ADD CONSTRAINT "PhotoAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoAlert" ADD CONSTRAINT "PhotoAlert_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoReaction" ADD CONSTRAINT "PhotoReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoReaction" ADD CONSTRAINT "PhotoReaction_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditReward" ADD CONSTRAINT "CreditReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartAlert" ADD CONSTRAINT "SmartAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrappedRecap" ADD CONSTRAINT "WrappedRecap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestEventFollower" ADD CONSTRAINT "GuestEventFollower_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

