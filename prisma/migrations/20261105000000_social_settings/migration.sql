-- CreateTable
CREATE TABLE "SocialSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "facebookUrl" TEXT,
    "facebookVisible" BOOLEAN NOT NULL DEFAULT false,
    "instagramUrl" TEXT,
    "instagramVisible" BOOLEAN NOT NULL DEFAULT false,
    "linkedinUrl" TEXT,
    "linkedinVisible" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" TEXT NOT NULL DEFAULT '529841681263',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialSettings_pkey" PRIMARY KEY ("id")
);


-- Fila inicial (id = 1): redes vacías y ocultas, número actual de la web.
INSERT INTO "SocialSettings" ("id", "whatsappNumber", "updatedAt") VALUES (1, '529841681263', NOW());
