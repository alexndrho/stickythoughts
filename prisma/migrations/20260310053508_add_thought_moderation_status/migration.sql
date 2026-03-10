-- AlterTable
ALTER TABLE "Thought" ADD COLUMN     "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "statusSetById" TEXT;

-- Backfill existing thoughts as approved
UPDATE "Thought" SET "status" = 'APPROVED';

-- CreateIndex
CREATE INDEX "Thought_status_deletedAt_createdAt_id_idx" ON "Thought"("status", "deletedAt", "createdAt" DESC, "id" DESC);

-- AddForeignKey
ALTER TABLE "Thought" ADD CONSTRAINT "Thought_statusSetById_fkey" FOREIGN KEY ("statusSetById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
