"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Dialog from "@/components/ui/Dialog";
import { FolderIcon, UploadIcon, ImageIcon } from "@/components/icons";

/* eslint-disable @next/next/no-img-element */

type MediaFile = {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  isPublic: boolean;
  updatedAt: string;
};

type MediaFolder = {
  id: string;
  name: string;
};

/**
 * Reusable media picker component.
 *
 * Opens a dialog showing the media library. The admin can browse folders,
 * pick an existing file, or upload a new one. Returns the public URL
 * `/media/<fileName>` to the parent.
 *
 * Props:
 * - `value` — current URL (e.g. "/media/abc123.webp") or empty
 * - `onChange(url)` — called when a file is selected
 * - `accept` — MIME filter for upload input (default: "image/*")
 * - `label` — optional label text
 */
export default function MediaPicker({
  value,
  onChange,
  accept = "image/*",
  label,
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  hint?: string;
}) {
  const t = useTranslations("admin.mediaPicker");
  const [open, setOpen] = useState(false);

  const handleSelect = (file: MediaFile) => {
    onChange(`/media/${file.fileName}`);
    setOpen(false);
  };

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-sm font-medium text-ink/70">{label}</p>
      )}

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink/10 bg-gray-50">
          {value ? (
            <img
              src={`${value}${value.includes("?") ? "&" : "?"}thumb=1`}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon width={20} height={20} className="text-ink/20" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-brand hover:text-brand"
          >
            <ImageIcon width={15} height={15} />
            {value ? t("change") : t("choose")}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
            >
              {t("remove")}
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <MediaPickerDialog
          open={open}
          onClose={() => setOpen(false)}
          onSelect={handleSelect}
          accept={accept}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Media picker dialog                                               */
/* ------------------------------------------------------------------ */

function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  accept,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
  accept: string;
}) {
  const t = useTranslations("admin.mediaPicker");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: t("root") },
  ]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async (folder: string | null) => {
    setLoading(true);
    try {
      const url = `/api/media/list${folder ? `?folder=${folder}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setFolders(data.folders ?? []);
      setFiles(data.files ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(folderId);
  }, [folderId, load]);

  const openFolder = (folder: MediaFolder) => {
    setFolderStack((s) => [...s, { id: folder.id, name: folder.name }]);
    setFolderId(folder.id);
  };

  const goBack = (index: number) => {
    const target = folderStack[index];
    setFolderStack((s) => s.slice(0, index + 1));
    setFolderId(target.id);
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    const form = new FormData();
    for (const f of fileList) {
      form.append("files", f);
    }
    if (folderId) form.append("folderId", folderId);
    form.append("isPublic", "true");
    try {
      await fetch("/api/media/upload", { method: "POST", body: form });
      await load(folderId);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  // Filter images only
  const imageFiles = files.filter((f) => f.mimeType.startsWith("image/"));

  return (
    <Dialog open={open} onClose={onClose} title={t("title")} maxWidth="max-w-3xl">
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center gap-1 text-sm">
        {folderStack.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-ink/20">/</span>}
            <button
              type="button"
              onClick={() => goBack(i)}
              className={`rounded px-1.5 py-0.5 transition-colors ${
                i === folderStack.length - 1
                  ? "font-medium text-ink"
                  : "text-ink/50 hover:text-brand"
              }`}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
        </div>
      ) : (
        <>
          {/* Folders */}
          {folders.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => openFolder(f)}
                  className="flex items-center gap-2 rounded-xl border border-ink/10 bg-gray-50 px-3 py-2.5 text-left text-sm font-medium text-ink/70 transition-colors hover:border-brand hover:text-brand"
                >
                  <FolderIcon width={16} height={16} className="shrink-0 text-brand/60" />
                  <span className="truncate">{f.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Files grid */}
          {imageFiles.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
              {imageFiles.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onSelect(f)}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-ink/10 bg-gray-50 transition-all hover:border-brand hover:ring-2 hover:ring-brand/30"
                  title={f.name}
                >
                  <img
                    src={`/media/${f.fileName}?thumb=1&v=${new Date(f.updatedAt).getTime()}`}
                    alt={f.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-[10px] font-medium text-white">{f.name}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : folders.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink/40">
              {t("empty")}
            </div>
          ) : null}
        </>
      )}

      {/* Upload button */}
      <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-4">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-ink/20 px-4 py-2 text-sm font-medium text-ink/60 transition-colors hover:border-brand hover:text-brand">
          <UploadIcon width={15} height={15} />
          {uploading ? "…" : t("upload")}
          <input
            type="file"
            accept={accept}
            multiple
            hidden
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-5 py-2 text-sm font-medium text-ink/50 hover:bg-ink/5"
        >
          {t("cancel")}
        </button>
      </div>
    </Dialog>
  );
}
