-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'THOUGHT_PENDING_REVIEW';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "thoughtId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "Thought"("id") ON DELETE CASCADE ON UPDATE CASCADE;
