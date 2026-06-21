export type MediaFileDTO = {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  isPublic: boolean;
  width: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaFolderDTO = {
  id: string;
  name: string;
};

export function mediaUrl(
  fileName: string,
  opts?: { thumb?: boolean; v?: string | number },
) {
  const params = new URLSearchParams();
  if (opts?.thumb) params.set("thumb", "1");
  // Cache-buster: pass the file's updatedAt so edits (crop/rotate/flip) show
  // immediately instead of serving the browser-cached copy.
  if (opts?.v) params.set("v", String(opts.v));
  const qs = params.toString();
  return `/media/${fileName}${qs ? `?${qs}` : ""}`;
}

/** Cache-bust version derived from a file's updatedAt timestamp. */
export function fileVersion(updatedAt: string) {
  return new Date(updatedAt).getTime();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}
