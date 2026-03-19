-- CreateEnum
CREATE TYPE "ThoughtColor" AS ENUM ('yellow', 'blue', 'red', 'violet', 'green', 'pink');

-- AlterTable: convert existing text column to enum using a cast
ALTER TABLE "Thought" ALTER COLUMN "color" TYPE "ThoughtColor" USING "color"::"ThoughtColor";
