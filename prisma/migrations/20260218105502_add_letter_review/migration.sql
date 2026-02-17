-- CreateEnum
CREATE TYPE "LetterStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Letter" ADD COLUMN     "contentUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "postedAt" TIMESTAMP(3),
ADD COLUMN     "status" "LetterStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "statusSetById" TEXT,
ALTER COLUMN "authorId" DROP NOT NULL;

-- Backfill existing letters as APPROVED.
-- This UPDATE only affects existing letters; new letters still default to PENDING.
UPDATE "Letter"
SET "status" = 'APPROVED'
WHERE "status" = 'PENDING';

-- Backfill posted timestamp for existing approved letters.
UPDATE "Letter"
SET "postedAt" = "createdAt"
WHERE "status" = 'APPROVED' AND "postedAt" IS NULL;

-- CreateIndex
CREATE INDEX "Letter_status_deletedAt_createdAt_id_idx" ON "Letter"("status", "deletedAt", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Letter_status_deletedAt_postedAt_id_idx" ON "Letter"("status", "deletedAt", "postedAt" DESC, "id" DESC);

-- AddForeignKey
ALTER TABLE "Letter" ADD CONSTRAINT "Letter_statusSetById_fkey" FOREIGN KEY ("statusSetById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
