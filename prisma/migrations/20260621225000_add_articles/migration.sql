-- CreateTable
CREATE TABLE "article" (
    "id" TEXT NOT NULL,
    "coverImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_translation" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticleTaxonomies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArticleTaxonomies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "article_status_idx" ON "article"("status");

-- CreateIndex
CREATE UNIQUE INDEX "article_translation_articleId_locale_key" ON "article_translation"("articleId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "article_translation_locale_slug_key" ON "article_translation"("locale", "slug");

-- CreateIndex
CREATE INDEX "_ArticleTaxonomies_B_index" ON "_ArticleTaxonomies"("B");

-- AddForeignKey
ALTER TABLE "article_translation" ADD CONSTRAINT "article_translation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleTaxonomies" ADD CONSTRAINT "_ArticleTaxonomies_A_fkey" FOREIGN KEY ("A") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleTaxonomies" ADD CONSTRAINT "_ArticleTaxonomies_B_fkey" FOREIGN KEY ("B") REFERENCES "taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
