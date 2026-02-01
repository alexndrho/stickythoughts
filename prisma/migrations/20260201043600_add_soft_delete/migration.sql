-- DropIndex
DROP INDEX "Thought_createdAt_idx";

-- DropIndex
DROP INDEX "Thread_authorId_title_key";

-- DropIndex
DROP INDEX "Thread_createdAt_idx";

-- DropIndex
DROP INDEX "ThreadComment_createdAt_idx";

-- AlterTable
ALTER TABLE "Thought" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- AlterTable
ALTER TABLE "ThreadComment" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- CreateIndex
CREATE INDEX "Thought_deletedAt_createdAt_idx" ON "Thought"("deletedAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Thread_deletedAt_createdAt_idx" ON "Thread"("deletedAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Thread_authorId_deletedAt_createdAt_idx" ON "Thread"("authorId", "deletedAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ThreadComment_deletedAt_createdAt_idx" ON "ThreadComment"("deletedAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ThreadComment_threadId_deletedAt_createdAt_idx" ON "ThreadComment"("threadId", "deletedAt", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Thought" ADD CONSTRAINT "Thought_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadComment" ADD CONSTRAINT "ThreadComment_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
