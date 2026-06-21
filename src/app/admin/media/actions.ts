"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  deleteMediaFileById,
  transformStoredImage,
  readStoredText,
  writeStoredText,
  cropStoredImage,
  type ImageTransform,
} from "@/lib/media";
import { deleteMedia } from "@/lib/media-storage";

async function done() {
  revalidatePath("/admin/media");
}

// ── Folders ──
export async function createFolderAction(name: string, parentId: string | null) {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false };
  await prisma.mediaFolder.create({ data: { name: trimmed, parentId } });
  await done();
  return { ok: true };
}

export async function renameFolderAction(id: string, name: string) {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false };
  await prisma.mediaFolder.update({ where: { id }, data: { name: trimmed } });
  await done();
  return { ok: true };
}

export async function deleteFolderAction(id: string) {
  await requireAdmin();
  // Remove files inside (and their blobs) first, then the folder tree.
  const files = await prisma.mediaFile.findMany({ where: { folderId: id } });
  await Promise.all(files.map((f) => deleteMedia(f.fileName)));
  await prisma.mediaFolder.delete({ where: { id } }); // cascades subfolders
  await done();
  return { ok: true };
}

// ── Files ──
export async function renameFileAction(id: string, name: string) {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false };
  await prisma.mediaFile.update({ where: { id }, data: { name: trimmed } });
  await done();
  return { ok: true };
}

export async function deleteFileAction(id: string) {
  await requireAdmin();
  await deleteMediaFileById(id);
  await done();
  return { ok: true };
}

export async function setFilePublicAction(id: string, isPublic: boolean) {
  await requireAdmin();
  await prisma.mediaFile.update({ where: { id }, data: { isPublic } });
  await done();
  return { ok: true };
}

export async function transformImageAction(id: string, op: ImageTransform) {
  await requireAdmin();
  await transformStoredImage(id, op);
  await done();
  return { ok: true };
}

export async function readFileContentAction(id: string): Promise<{ content: string | null }> {
  await requireAdmin();
  return { content: await readStoredText(id) };
}

export async function saveFileContentAction(id: string, content: string) {
  await requireAdmin();
  await writeStoredText(id, content);
  await done();
  return { ok: true };
}

export async function cropImageAction(
  id: string,
  crop: { x: number; y: number; width: number; height: number },
) {
  await requireAdmin();
  await cropStoredImage(id, crop);
  await done();
  return { ok: true };
}
