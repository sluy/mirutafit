"use client";

import { useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Dialog from "@/components/ui/Dialog";
import { Field, inputClass } from "@/components/ui/Field";
import {
  FolderIcon,
  FolderPlusIcon,
  UploadIcon,
  MoreVerticalIcon,
} from "@/components/icons";
import { FileThumb } from "./FileThumb";
import FileDetailsDialog from "./FileDetailsDialog";
import { formatBytes, type MediaFileDTO, type MediaFolderDTO } from "./types";
import {
  createFolderAction,
  renameFolderAction,
  deleteFolderAction,
} from "@/app/admin/media/actions";

export default function FileManager({
  folderId,
  breadcrumb,
  folders,
  files,
}: {
  folderId: string | null;
  breadcrumb: { id: string; name: string }[];
  folders: MediaFolderDTO[];
  files: MediaFileDTO[];
}) {
  const t = useTranslations("admin.media");
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<MediaFileDTO | null>(null);
  // Keep dialog file in sync with refreshed server data (size, dimensions…)
  const activeFile = selected
    ? files.find((f) => f.id === selected.id) ?? selected
    : null;
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [renameFolder, setRenameFolder] = useState<MediaFolderDTO | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  async function uploadFiles(list: FileList | File[]) {
    const arr = Array.from(list);
    if (arr.length === 0) return;
    const form = new FormData();
    arr.forEach((f) => form.append("files", f));
    if (folderId) form.append("folderId", folderId);

    setUploading(true);
    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        toast.success(t("uploaded", { count: data.count }));
        router.refresh();
      } else {
        toast.error(t("uploadError"));
      }
    } catch {
      toast.error(t("uploadError"));
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
          {/* Breadcrumb */}
          <nav className="mt-1 flex flex-wrap items-center gap-1 text-sm text-ink/50">
            <Link href="/admin/media" className="hover:text-brand">
              {t("root")}
            </Link>
            {breadcrumb.map((c) => (
              <span key={c.id} className="flex items-center gap-1">
                <span>/</span>
                <Link href={`/admin/media?folder=${c.id}`} className="hover:text-brand">
                  {c.name}
                </Link>
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNewFolderOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-brand hover:text-brand"
          >
            <FolderPlusIcon width={16} height={16} />
            {t("newFolder")}
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 disabled:opacity-60"
          >
            <UploadIcon width={16} height={16} />
            {uploading ? t("uploading") : t("upload")}
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Body */}
      <div
        className={`min-h-[50vh] rounded-3xl border-2 border-dashed p-5 transition-colors ${
          dragging ? "border-brand bg-brand/5" : "border-transparent"
        }`}
      >
        {folders.length === 0 && files.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center text-ink/40">
            <UploadIcon width={40} height={40} />
            <p className="mt-3">{t("dropHere")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {/* Folders */}
            {folders.map((folder) => (
              <div key={folder.id} className="group relative">
                <Link
                  href={`/admin/media?folder=${folder.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <FolderIcon width={28} height={28} className="shrink-0 text-brand" />
                  <span className="truncate text-sm font-medium text-ink">{folder.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuId(menuId === folder.id ? null : folder.id)}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg text-ink/40 opacity-0 transition hover:bg-ink/5 group-hover:opacity-100"
                >
                  <MoreVerticalIcon width={16} height={16} />
                </button>
                {menuId === folder.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                    <div className="absolute right-2 top-10 z-20 w-36 overflow-hidden rounded-xl border border-ink/10 bg-white py-1 text-sm shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuId(null);
                          setRenameFolder(folder);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-brand/10 hover:text-brand"
                      >
                        {t("rename")}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setMenuId(null);
                          if (!confirm(t("confirmDeleteFolder"))) return;
                          await deleteFolderAction(folder.id);
                          toast.success(t("saved"));
                          router.refresh();
                        }}
                        className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Files */}
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setSelected(file)}
                className="group overflow-hidden rounded-2xl border border-ink/5 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-ink/5">
                  <FileThumb file={file} className="h-full w-full" />
                  {!file.isPublic && (
                    <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {t("private")}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                  <p className="text-xs text-ink/40">{formatBytes(file.size)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* File details */}
      {activeFile && (
        <FileDetailsDialog
          file={activeFile}
          open={!!activeFile}
          onClose={() => setSelected(null)}
        />
      )}

      {/* New folder dialog */}
      <NameDialog
        open={newFolderOpen}
        title={t("newFolder")}
        label={t("folderName")}
        submitLabel={t("create")}
        onClose={() => setNewFolderOpen(false)}
        onSubmit={async (name) => {
          const { ok } = await createFolderAction(name, folderId);
          if (ok) {
            toast.success(t("saved"));
            router.refresh();
          }
          return ok;
        }}
      />

      {/* Rename folder dialog */}
      <NameDialog
        open={!!renameFolder}
        title={t("rename")}
        label={t("name")}
        submitLabel={t("rename")}
        initialValue={renameFolder?.name ?? ""}
        onClose={() => setRenameFolder(null)}
        onSubmit={async (name) => {
          if (!renameFolder) return false;
          const { ok } = await renameFolderAction(renameFolder.id, name);
          if (ok) {
            toast.success(t("saved"));
            router.refresh();
          }
          return ok;
        }}
      />
    </div>
  );
}

/** Small reusable single-input dialog (create / rename). */
function NameDialog({
  open,
  title,
  label,
  submitLabel,
  initialValue = "",
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  label: string;
  submitLabel: string;
  initialValue?: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<boolean>;
}) {
  const tc = useTranslations("common");
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);

  // Keep the input in sync when the dialog is (re)opened with a new value.
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setValue(initialValue);
  }

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!value.trim()) return;
          setBusy(true);
          const ok = await onSubmit(value.trim());
          setBusy(false);
          if (ok) onClose();
        }}
      >
        <Field label={label} htmlFor="name-dialog">
          <input
            id="name-dialog"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass()}
          />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-ink/5"
          >
            {tc("cancel")}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 disabled:opacity-60"
          >
            {busy ? "…" : submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
