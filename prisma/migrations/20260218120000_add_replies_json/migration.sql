-- AlterTable
ALTER TABLE "SupportMessage" ADD COLUMN "replies" JSONB NOT NULL DEFAULT '[]';
