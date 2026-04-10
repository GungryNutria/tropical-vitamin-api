-- CreateTable (Category is new, not a rename)
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "adminName" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_adminName_key" ON "Category"("adminName");
CREATE INDEX "Category_adminName_idx" ON "Category"("adminName");

-- CreateIndex
CREATE INDEX "CategoryTranslation_languageId_idx" ON "CategoryTranslation"("languageId");
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_languageId_key" ON "CategoryTranslation"("categoryId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");
CREATE INDEX "Language_code_idx" ON "Language"("code");

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Alter Tour (add categoryId and duration)
ALTER TABLE "Tour" ADD COLUMN "categoryId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Tour" ADD COLUMN "duration" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "Tour" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex for Tour
CREATE INDEX "Tour_categoryId_idx" ON "Tour"("categoryId");
CREATE INDEX "Tour_isActive_idx" ON "Tour"("isActive");

-- AddForeignKey for Tour
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Alter TourTranslation
ALTER TABLE "TourTranslation" DROP COLUMN "category";
ALTER TABLE "TourTranslation" DROP COLUMN "duration";
ALTER TABLE "TourTranslation" DROP COLUMN "language";
ALTER TABLE "TourTranslation" ADD COLUMN "languageId" INTEGER NOT NULL DEFAULT 1;

-- Drop old unique constraint
DROP INDEX IF EXISTS "TourTranslation_tourId_language_key";

-- CreateIndex for TourTranslation
CREATE INDEX "TourTranslation_languageId_idx" ON "TourTranslation"("languageId");
CREATE UNIQUE INDEX "TourTranslation_tourId_languageId_key" ON "TourTranslation"("tourId", "languageId");

-- AddForeignKey for TourTranslation
ALTER TABLE "TourTranslation" ADD CONSTRAINT "TourTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;