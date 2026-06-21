import sharp from "sharp";
import { prisma } from "./prisma";
import {
  makeStoredName,
  writeMedia,
  readMedia,
  deleteMedia,
} from "./media-storage";

export function isImage(mimeType: string) {
  return mimeType.startsWith("image/") && mimeType !== "image/svg+xml";
}
export function isVideo(mimeType: string) {
  return mimeType.startsWith("video/");
}

/** Persist an uploaded buffer to disk + DB. */
export async function createMediaFile(input: {
  buffer: Buffer;
  originalName: string;
  displayName: string;
  mimeType: string;
  folderId: string | null;
  isPublic: boolean;
}) {
  const fileName = makeStoredName(input.originalName);

  let width: number | null = null;
  let height: number | null = null;
  if (isImage(input.mimeType)) {
    try {
      const meta = await sharp(input.buffer).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    } catch {
      // not a readable image — leave dimensions null
    }
  }

  await writeMedia(fileName, input.buffer);

  return prisma.mediaFile.create({
    data: {
      name: input.displayName,
      fileName,
      mimeType: input.mimeType,
      size: input.buffer.length,
      isPublic: input.isPublic,
      width,
      height,
      folderId: input.folderId,
    },
  });
}

export async function deleteMediaFileById(id: string) {
  const file = await prisma.mediaFile.findUnique({ where: { id } });
  if (!file) return;
  await deleteMedia(file.fileName);
  await prisma.mediaFile.delete({ where: { id } });
}

/** Resize an image buffer to a thumbnail (used by the /media route). */
export async function makeThumbnail(buffer: Buffer, size = 400): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // respect EXIF orientation
    .resize(size, size, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();
}

export function isEditableText(mimeType: string) {
  return mimeType.startsWith("text/") || mimeType === "application/json" || mimeType === "image/svg+xml";
}

/** Read a text-like stored file as a UTF-8 string. */
export async function readStoredText(id: string): Promise<string | null> {
  const file = await prisma.mediaFile.findUnique({ where: { id } });
  if (!file) return null;
  const buf = await readMedia(file.fileName);
  return buf.toString("utf8");
}

/** Overwrite a text-like stored file with new content. */
export async function writeStoredText(id: string, content: string): Promise<void> {
  const file = await prisma.mediaFile.findUnique({ where: { id } });
  if (!file) return;
  const buf = Buffer.from(content, "utf8");
  await writeMedia(file.fileName, buf);
  await prisma.mediaFile.update({ where: { id }, data: { size: buf.length } });
}

/** Crop a stored image. Crop is given in fractions (0..1) of the image. */
export async function cropStoredImage(
  id: string,
  crop: { x: number; y: number; width: number; height: number },
): Promise<void> {
  const file = await prisma.mediaFile.findUnique({ where: { id } });
  if (!file || !isImage(file.mimeType)) return;

  const input = await readMedia(file.fileName);
  const meta = await sharp(input).metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  const left = Math.max(0, Math.round(crop.x * W));
  const top = Math.max(0, Math.round(crop.y * H));
  const width = Math.max(1, Math.min(W - left, Math.round(crop.width * W)));
  const height = Math.max(1, Math.min(H - top, Math.round(crop.height * H)));

  const out = await sharp(input).extract({ left, top, width, height }).toBuffer();
  await writeMedia(file.fileName, out);

  const m2 = await sharp(out).metadata();
  await prisma.mediaFile.update({
    where: { id },
    data: { size: out.length, width: m2.width ?? null, height: m2.height ?? null },
  });
}

export type ImageTransform = "rotateLeft" | "rotateRight" | "flipH" | "flipV";

/** Apply a simple, lossless-ish transform to a stored image and re-save it. */
export async function transformStoredImage(id: string, op: ImageTransform) {
  const file = await prisma.mediaFile.findUnique({ where: { id } });
  if (!file || !isImage(file.mimeType)) return;

  const input = await readMedia(file.fileName);
  let pipeline = sharp(input);
  if (op === "rotateLeft") pipeline = pipeline.rotate(-90);
  if (op === "rotateRight") pipeline = pipeline.rotate(90);
  if (op === "flipH") pipeline = pipeline.flop();
  if (op === "flipV") pipeline = pipeline.flip();

  const output = await pipeline.toBuffer();
  await writeMedia(file.fileName, output);

  const meta = await sharp(output).metadata();
  await prisma.mediaFile.update({
    where: { id },
    data: { size: output.length, width: meta.width ?? null, height: meta.height ?? null },
  });
}
