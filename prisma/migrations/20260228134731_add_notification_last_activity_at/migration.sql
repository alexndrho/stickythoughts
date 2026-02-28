-- DropIndex
DROP INDEX "Notification_userId_updatedAt_idx";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Notification_userId_lastActivityAt_idx" ON "Notification"("userId", "lastActivityAt" DESC);
