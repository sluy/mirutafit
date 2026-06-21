import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth-guard";
import { createMediaFile } from "@/lib/media";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const files = form.getAll("files");
  const folderId = (form.get("folderId") as string) || null;
  const isPublic = form.get("isPublic") !== "false"; // default to public

  const created: string[] = [];
  for (const f of files) {
    if (!(f instanceof File)) continue;
    const buffer = Buffer.from(await f.arrayBuffer());
    const rec = await createMediaFile({
      buffer,
      originalName: f.name,
      displayName: f.name,
      mimeType: f.type || "application/octet-stream",
      folderId,
      isPublic,
    });
    created.push(rec.id);
  }

  return NextResponse.json({ ok: true, count: created.length });
}
