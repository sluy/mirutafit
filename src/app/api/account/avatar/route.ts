import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { getSessionUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { writePublicUpload, deletePublicUpload } from "@/lib/media-storage";

// User avatar upload. Goes to the PUBLIC /uploads folder (not the admin Media
// library). Any signed-in user can update their own avatar.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
  const current = await prisma.user.findUnique({ where: { id: user.id } });
  if (current?.image?.startsWith("/uploads/")) {
    await deletePublicUpload(current.image);
  }
  await prisma.user.update({ where: { id: user.id }, data: { image: url } });

  return NextResponse.json({ ok: true, url });
}
