-- Add adminTitle column to Tour
ALTER TABLE "Tour" ADD COLUMN "adminTitle" TEXT NOT NULL DEFAULT 'Tour';

-- Update existing tours with their Spanish titles as adminTitle
UPDATE "Tour" SET "adminTitle" = (
  SELECT "title" FROM "TourTranslation" 
  WHERE "TourTranslation"."tourId" = "Tour"."id" 
  AND "TourTranslation"."languageId" = 1 
  LIMIT 1
);

-- Remove default after data migration
ALTER TABLE "Tour" ALTER COLUMN "adminTitle" DROP DEFAULT;