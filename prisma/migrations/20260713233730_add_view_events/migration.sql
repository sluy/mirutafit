-- CreateTable
CREATE TABLE "view_event" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "countryCode" TEXT NOT NULL DEFAULT '',
    "region" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "userAgent" TEXT NOT NULL DEFAULT '',
    "referer" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "view_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "view_event_key_createdAt_idx" ON "view_event"("key", "createdAt");
