-- Rename column to preserve existing values.
ALTER TABLE "Letter"
RENAME COLUMN "contentUpdatedAt" TO "bodyUpdatedAt";
