-- CreateTable
CREATE TABLE "media_folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_file" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "width" INTEGER,
    "height" INTEGER,
    "folderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_folder_parentId_idx" ON "media_folder"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "media_file_fileName_key" ON "media_file"("fileName");

-- CreateIndex
CREATE INDEX "media_file_folderId_idx" ON "media_file"("folderId");

-- AddForeignKey
ALTER TABLE "media_folder" ADD CONSTRAINT "media_folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "media_folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_file" ADD CONSTRAINT "media_file_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "media_folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
