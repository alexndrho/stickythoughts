/*
  Warnings:

  - You are about to drop the column `title` on the `Letter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Letter" ADD COLUMN "recipient" TEXT;

UPDATE "Letter"
SET "recipient" = 'Unknown'
WHERE "recipient" IS NULL;

ALTER TABLE "Letter" ALTER COLUMN "recipient" SET NOT NULL;

ALTER TABLE "Letter" DROP COLUMN "title";
