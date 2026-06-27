-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL DEFAULT '#10b981',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT NOT NULL DEFAULT 'community',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comment_status_idx" ON "comment"("status");

-- CreateIndex
CREATE INDEX "comment_createdAt_idx" ON "comment"("createdAt");
