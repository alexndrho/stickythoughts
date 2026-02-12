-- DropIndex
DROP INDEX "Letter_authorId_deletedAt_createdAt_idx";

-- DropIndex
DROP INDEX "Letter_deletedAt_createdAt_idx";

-- DropIndex
DROP INDEX "LetterReply_deletedAt_createdAt_idx";

-- DropIndex
DROP INDEX "LetterReply_letterId_deletedAt_createdAt_idx";

-- DropIndex
DROP INDEX "Thought_deletedAt_createdAt_idx";

-- CreateIndex
CREATE INDEX "Letter_deletedAt_createdAt_id_idx" ON "Letter"("deletedAt", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Letter_authorId_deletedAt_createdAt_id_idx" ON "Letter"("authorId", "deletedAt", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "LetterReply_deletedAt_createdAt_id_idx" ON "LetterReply"("deletedAt", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "LetterReply_letterId_deletedAt_createdAt_id_idx" ON "LetterReply"("letterId", "deletedAt", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Thought_deletedAt_createdAt_id_idx" ON "Thought"("deletedAt", "createdAt" DESC, "id" DESC);
