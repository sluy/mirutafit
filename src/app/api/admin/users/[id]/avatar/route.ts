import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { writePublicUpload, deletePublicUpload } from "@/lib/media-storage";

// Admin avatar upload — lets an admin change any user's avatar.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id: userId } = await params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Normalize to a small square webp.
  const input = Buffer.from(await file.arrayBuffer());
  const output = await sharp(input)
    .rotate()
    .resize(256, 256, { fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();

  const url = await writePublicUpload("avatars", `${randomUUID()}.webp`, output);

  // Replace any previous uploaded avatar.
  if (user.image?.startsWith("/uploads/")) {
    await deletePublicUpload(user.image);
  }
  await prisma.user.update({ where: { id: userId }, data: { image: url } });

  return NextResponse.json({ ok: true, url });
}
