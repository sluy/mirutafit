import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Low-level file storage for the Media library.
 *
 * - Private/admin media lives outside `public/` and is streamed through the
 *   `/media/[fileName]` route (so we can enforce privacy).
 * - Public user uploads (e.g. avatars) live under `public/uploads` and are
 *   served statically by Next at `/uploads/...`.
 *
 * In production (Docker/EasyPanel) both directories should be mounted as
 * persistent volumes so files survive redeploys.
 */

export const MEDIA_DIR =
  process.env.MEDIA_DIR ?? path.join(process.cwd(), "storage", "media");

export const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function extFromName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  // keep it short + safe
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : "";
}

/** A unique on-disk file name: `<uuid><ext>`. */
export function makeStoredName(originalName: string): string {
  return `${randomUUID()}${extFromName(originalName)}`;
}

// ── Private media library ──────────────────────────────────────
export async function writeMedia(fileName: string, data: Buffer): Promise<void> {
  await mkdir(MEDIA_DIR, { recursive: true });
  await writeFile(path.join(MEDIA_DIR, fileName), data);
}

export async function readMedia(fileName: string): Promise<Buffer> {
  return readFile(path.join(MEDIA_DIR, fileName));
}

export async function deleteMedia(fileName: string): Promise<void> {
  try {
    await unlink(path.join(MEDIA_DIR, fileName));
  } catch {
    // already gone — ignore
  }
}

// ── Public uploads (served statically) ─────────────────────────
export async function writePublicUpload(
  subdir: string,
  fileName: string,
  data: Buffer,
): Promise<string> {
  const dir = path.join(UPLOADS_DIR, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), data);
  // Public URL served by Next from /public.
  return `/uploads/${subdir}/${fileName}`;
}

export async function deletePublicUpload(publicUrl: string): Promise<void> {
  if (!publicUrl.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", publicUrl.replace(/^\//, "")));
  } catch {
    // ignore
  }
}
