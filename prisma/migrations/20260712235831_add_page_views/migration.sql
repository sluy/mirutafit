-- CreateTable
CREATE TABLE "page_view" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_view_pkey" PRIMARY KEY ("key")
);
