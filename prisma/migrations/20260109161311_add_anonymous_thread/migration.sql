-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "isAnonymous" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "ThreadComment" ADD COLUMN     "isAnonymous" BOOLEAN DEFAULT false;
