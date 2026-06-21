"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Dialog from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { FolderIcon } from "@/components/icons";
import { FileThumb } from "./FileThumb";
import { formatBytes, type MediaFileDTO, type MediaFolderDTO } from "./types";

type Accept = "all" | "image" | "video";

/**
 * Reusable media picker. Drop it anywhere a section needs to pick an existing
 * file from the Media library (e.g. a banner background):
 *
 *   <MediaPicker open={open} accept="image"
 *     onClose={...} onSelect={(file) => setBg(file.fileName)} />
 */
export default function MediaPicker({
  open,
  onClose,
  onSelect,
  accept = "all",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (file: MediaFileDTO) => void;
  accept?: Accept;
}) {
  const t = useTranslations("admin.media");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [stack, setStack] = useState<MediaFolderDTO[]>([]);
  const [folders, setFolders] = useState<MediaFolderDTO[]>([]);
  const [files, setFiles] = useState<MediaFileDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset to the root each time the picker opens.
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setFolderId(null);
      setStack([]);
    }
  }

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/media/list${folderId ? `?folder=${folderId}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        setFolders(d.folders ?? []);
        setFiles(d.files ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, folderId]);

  const isAccepted = (f: MediaFileDTO) =>
    accept === "all" ||
    (accept === "image" && f.mimeType.startsWith("image/")) ||
    (accept === "video" && f.mimeType.startsWith("video/"));

  const enter = (folder: MediaFolderDTO) => {
    setStack((s) => [...s, folder]);
    setFolderId(folder.id);
  };
  const goTo = (index: number) => {
    if (index < 0) {
      setStack([]);
      setFolderId(null);
    } else {
      const ns = stack.slice(0, index + 1);
      setStack(ns);
      setFolderId(ns[ns.length - 1].id);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("pickTitle")} maxWidth="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-ink/50">
        <button type="button" onClick={() => goTo(-1)} className="hover:text-brand">
          {t("root")}
        </button>
        {stack.map((c, i) => (
          <span key={c.id} className="flex items-center gap-1">
            <span>/</span>
            <button type="button" onClick={() => goTo(i)} className="hover:text-brand">
              {c.name}
            </button>
          </span>
        ))}
      </nav>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size={32} />
        </div>
      ) : folders.length === 0 && files.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink/40">{t("empty")}</p>
      ) : (
        <div className="grid max-h-[55vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => enter(folder)}
              className="flex flex-col items-center gap-2 rounded-xl border border-ink/5 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <FolderIcon width={28} height={28} className="text-brand" />
              <span className="w-full truncate text-xs font-medium text-ink">{folder.name}</span>
            </button>
          ))}
          {files.map((file) => {
            const ok = isAccepted(file);
            return (
              <button
                key={file.id}
                type="button"
                disabled={!ok}
                onClick={() => {
                  onSelect(file);
                  onClose();
                }}
                className={`overflow-hidden rounded-xl border bg-white text-left shadow-sm transition ${
                  ok
                    ? "border-ink/5 hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
                    : "cursor-not-allowed border-ink/5 opacity-40"
                }`}
              >
                <div className="aspect-square overflow-hidden bg-ink/5">
                  <FileThumb file={file} className="h-full w-full" />
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-ink">{file.name}</p>
                  <p className="text-[10px] text-ink/40">{formatBytes(file.size)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Dialog>
  );
}
