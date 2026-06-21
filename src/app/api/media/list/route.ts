import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

// Powers the reusable <MediaPicker>. Admin-only.
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const folderId = req.nextUrl.searchParams.get("folder") || null;

  const [folders, files] = await Promise.all([
    prisma.mediaFolder.findMany({
      where: { parentId: folderId },
      orderBy: { name: "asc" },
    }),
    prisma.mediaFile.findMany({
      where: { folderId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    folders: folders.map((f) => ({ id: f.id, name: f.name })),
    files: files.map((f) => ({
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
    })),
  });
}
