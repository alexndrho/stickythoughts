-- AlterTable
ALTER TABLE "Thought" ADD COLUMN     "highlightedAt" TIMESTAMP(3),
ADD COLUMN     "highlightedById" TEXT;

-- AddForeignKey
ALTER TABLE "Thought" ADD CONSTRAINT "Thought_highlightedById_fkey" FOREIGN KEY ("highlightedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
