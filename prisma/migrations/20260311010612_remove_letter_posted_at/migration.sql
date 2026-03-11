/*
  Warnings:

  - You are about to drop the column `postedAt` on the `Letter` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Letter_status_deletedAt_postedAt_id_idx";

-- AlterTable
ALTER TABLE "Letter" DROP COLUMN "postedAt";
