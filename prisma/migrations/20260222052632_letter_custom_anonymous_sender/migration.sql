/*
  Warnings:

  - You are about to drop the column `isAnonymous` on the `Letter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Letter" ADD COLUMN "anonymousFrom" TEXT;

UPDATE "Letter"
SET "anonymousFrom" = 'Anonymous'
WHERE "isAnonymous" = true
  AND ("anonymousFrom" IS NULL OR "anonymousFrom" = '');

ALTER TABLE "Letter" DROP COLUMN "isAnonymous";
