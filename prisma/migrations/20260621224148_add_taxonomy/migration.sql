-- CreateTable
CREATE TABLE "taxonomy" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxonomy_translation" (
    "id" TEXT NOT NULL,
    "taxonomyId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "taxonomy_translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "taxonomy_kind_idx" ON "taxonomy"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomy_kind_key_key" ON "taxonomy"("kind", "key");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomy_translation_taxonomyId_locale_key" ON "taxonomy_translation"("taxonomyId", "locale");

-- AddForeignKey
ALTER TABLE "taxonomy_translation" ADD CONSTRAINT "taxonomy_translation_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
