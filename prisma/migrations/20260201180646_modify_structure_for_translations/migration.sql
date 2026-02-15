/*
  Warnings:

  - You are about to drop the column `category` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Tour` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "duration",
DROP COLUMN "title";

-- CreateTable
CREATE TABLE "TourTranslation" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "tourId" INTEGER NOT NULL,

    CONSTRAINT "TourTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TourTranslation_tourId_language_key" ON "TourTranslation"("tourId", "language");

-- AddForeignKey
ALTER TABLE "TourTranslation" ADD CONSTRAINT "TourTranslation_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
