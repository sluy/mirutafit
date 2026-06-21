import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { readMedia } from "@/lib/media-storage";
import { isImage, makeThumbnail } from "@/lib/media";
import { getSessionUser, isAdmin } from "@/lib/auth-guard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileName: string }> },
) {
  const { fileName } = await params;

  const file = await prisma.mediaFile.findUnique({ where: { fileName } });
  if (!file) return new Response("Not found", { status: 404 });

  // Private files are only served to admins.
  if (!file.isPublic) {
    const user = await getSessionUser();
    if (!isAdmin(user)) return new Response("Not found", { status: 404 });
  }

  let data: Buffer;
  try {
    data = await readMedia(file.fileName);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  let contentType = file.mimeType;
  if (req.nextUrl.searchParams.get("thumb") && isImage(file.mimeType)) {
    data = await makeThumbnail(data, 400);
    contentType = "image/webp";
  }

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(data.length),
      "Cache-Control": file.isPublic
        ? "public, max-age=3600"
        : "private, no-store",
    },
  });
}
