-- CreateEnum
CREATE TYPE "ThoughtPattern" AS ENUM ('PLAIN', 'LINED', 'GRID', 'DOTS');

-- AlterTable
ALTER TABLE "Thought" ADD COLUMN     "pattern" "ThoughtPattern" NOT NULL DEFAULT 'PLAIN';
