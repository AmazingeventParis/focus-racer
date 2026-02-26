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

-- CreateIndex
CREATE UNIQUE INDEX "GuestEventFollower_unsubscribeToken_key" ON "GuestEventFollower"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "GuestEventFollower_eventId_idx" ON "GuestEventFollower"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "GuestEventFollower_email_eventId_key" ON "GuestEventFollower"("email", "eventId");

-- AddForeignKey
ALTER TABLE "GuestEventFollower" ADD CONSTRAINT "GuestEventFollower_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
