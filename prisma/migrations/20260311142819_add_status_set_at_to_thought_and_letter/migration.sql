-- AlterTable
ALTER TABLE "Letter" ADD COLUMN     "statusSetAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Thought" ADD COLUMN     "statusSetAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Letter_status_deletedAt_statusSetAt_idx" ON "Letter"("status", "deletedAt", "statusSetAt");

-- CreateIndex
CREATE INDEX "Thought_status_deletedAt_statusSetAt_idx" ON "Thought"("status", "deletedAt", "statusSetAt");
