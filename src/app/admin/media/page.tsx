import { prisma } from "@/lib/prisma";
import FileManager from "@/components/admin/media/FileManager";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder } = await searchParams;
  const folderId = folder ?? null;

  const [folders, files, current] = await Promise.all([
    prisma.mediaFolder.findMany({
      where: { parentId: folderId },
      orderBy: { name: "asc" },
    }),
    prisma.mediaFile.findMany({
      where: { folderId },
      orderBy: { createdAt: "desc" },
    }),
    folderId
      ? prisma.mediaFolder.findUnique({ where: { id: folderId } })
      : Promise.resolve(null),
  ]);

  // Build the breadcrumb by walking up the parent chain.
  const breadcrumb: { id: string; name: string }[] = [];
  let node = current;
  while (node) {
    breadcrumb.unshift({ id: node.id, name: node.name });
    node = node.parentId
      ? await prisma.mediaFolder.findUnique({ where: { id: node.parentId } })
      : null;
  }

  return (
    <FileManager
      folderId={folderId}
      breadcrumb={breadcrumb}
      folders={folders.map((f) => ({ id: f.id, name: f.name }))}
      files={files.map((f) => ({
        id: f.id,
        name: f.name,
        fileName: f.fileName,
        mimeType: f.mimeType,
        size: f.size,
        isPublic: f.isPublic,
        width: f.width,
        height: f.height,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      }))}
    />
  );
}
