-- AlterTable
ALTER TABLE "Tour" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "duration" DROP DEFAULT;

-- CreateTable
CREATE TABLE "TourImage" (
    "id" SERIAL NOT NULL,
    "tourId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "TourImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TourImage_tourId_position_idx" ON "TourImage"("tourId", "position");

-- AddForeignKey
ALTER TABLE "TourImage" ADD CONSTRAINT "TourImage_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data: la portada actual de cada tour pasa a ser su primera foto (REQ-23). No borra ni cambia nada de "Tour".
INSERT INTO "TourImage" ("tourId", "filename", "position")
SELECT "id", regexp_replace("img", '^.*/', ''), 0
FROM "Tour" WHERE "img" IS NOT NULL AND btrim("img") <> '';
