-- Remove anonymous accounts before dropping anonymous-related columns.
-- Related records are removed via existing FK cascade rules.
DELETE FROM "user" WHERE "isAnonymous" = true;

/*
  Warnings:

  - You are about to drop the column `isAnonymous` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "isAnonymous";
