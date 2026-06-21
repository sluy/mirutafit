"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Dialog from "@/components/ui/Dialog";
import { Tooltip } from "@/components/ui/Tooltip";
import { inputClass } from "@/components/ui/Field";
import {
  LinkIcon,
  TrashIcon,
  RotateCcwIcon,
  RotateCwIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  CropIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from "@/components/icons";
import { mediaUrl, formatBytes, fileVersion, type MediaFileDTO } from "./types";
import {
  renameFileAction,
  deleteFileAction,
  setFilePublicAction,
  transformImageAction,
} from "@/app/admin/media/actions";
import type { ImageTransform } from "@/lib/media";
import FileContentEditor from "./FileContentEditor";
import ImageCropDialog from "./ImageCropDialog";

function isEditableText(mimeType: string) {
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "image/svg+xml"
  );
}

/* eslint-disable @next/next/no-img-element */

export default function FileDetailsDialog({
  file,
  open,
  onClose,
}: {
  file: MediaFileDTO;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin.media");
  const router = useRouter();

  const [name, setName] = useState(file.name);
  const [isPublic, setIsPublic] = useState(file.isPublic);
  const [version, setVersion] = useState(() => fileVersion(file.updatedAt));
  const [busy, setBusy] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);

  const isImg = file.mimeType.startsWith("image/") && file.mimeType !== "image/svg+xml";
  const isVid = file.mimeType.startsWith("video/");
  const isText = isEditableText(file.mimeType);
  const src = mediaUrl(file.fileName, { v: version });

  const saveName = async () => {
    if (!name.trim() || name === file.name) return;
    await renameFileAction(file.id, name);
    toast.success(t("saved"));
    router.refresh();
  };

  const toggleVisibility = async () => {
    const next = !isPublic;
    setIsPublic(next);
    await setFilePublicAction(file.id, next);
    toast.success(t("saved"));
    router.refresh();
  };

  const transform = async (op: ImageTransform) => {
    setBusy(true);
    await transformImageAction(file.id, op);
    setBusy(false);
    setVersion(Date.now());
    toast.success(t("saved"));
    router.refresh();
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${mediaUrl(file.fileName)}`);
    toast.success(t("urlCopied"));
  };

  const remove = async () => {
    if (!confirm(t("confirmDeleteFile"))) return;
    await deleteFileAction(file.id);
    toast.success(t("saved"));
    onClose();
    router.refresh();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} title={t("details")} maxWidth="max-w-2xl">
        <div className="space-y-6">
          {/* Preview + info */}
          <div className="grid gap-6 sm:grid-cols-[1.1fr_1fr]">
            {/* Preview */}
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-ink/5 bg-ink/5">
              {isImg ? (
                <img src={src} alt={file.name} className="max-h-full max-w-full object-contain" />
              ) : isVid ? (
                <video src={src} controls className="max-h-full max-w-full rounded-lg" />
              ) : (
                <a href={src} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand hover:underline">
                  {t("open")}
                </a>
              )}
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <label htmlFor="file-name" className="mb-1.5 block text-sm font-medium text-ink/70">
                  {t("name")}
                </label>
                <input
                  id="file-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveName}
                  className={inputClass()}
                />
              </div>

              <dl className="space-y-1.5 text-sm">
                <Row label={t("size")} value={formatBytes(file.size)} />
                {file.width && file.height ? (
                  <Row label={t("dimensions")} value={`${file.width} × ${file.height}`} />
                ) : null}
                <Row label={t("uploadedAt")} value={new Date(file.createdAt).toLocaleString()} />
                <Row label={t("updatedAt")} value={new Date(file.updatedAt).toLocaleString()} />
              </dl>

              {/* Visibility */}
              <button
                type="button"
                onClick={toggleVisibility}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-ink/10 px-4 py-2.5 text-left text-sm transition-colors hover:border-brand/40"
              >
                <span>
                  <span className="font-medium text-ink">{isPublic ? t("public") : t("private")}</span>
                  <span className="block text-xs text-ink/40">
                    {isPublic ? t("publicHint") : t("privateHint")}
                  </span>
                </span>
                <span
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    isPublic ? "bg-brand" : "bg-ink/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          {/* Edit tools */}
          {(isImg || isText) && (
            <div className="border-t border-ink/10 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
                {isImg ? t("editImage") : t("editContent")}
              </p>
              {isImg ? (
                <div className="flex flex-wrap gap-2">
                  <ToolButton label={t("rotateLeft")} onClick={() => transform("rotateLeft")} disabled={busy}>
                    <RotateCcwIcon width={17} height={17} />
                  </ToolButton>
                  <ToolButton label={t("rotateRight")} onClick={() => transform("rotateRight")} disabled={busy}>
                    <RotateCwIcon width={17} height={17} />
                  </ToolButton>
                  <ToolButton label={t("flipH")} onClick={() => transform("flipH")} disabled={busy}>
                    <FlipHorizontalIcon width={17} height={17} />
                  </ToolButton>
                  <ToolButton label={t("flipV")} onClick={() => transform("flipV")} disabled={busy}>
                    <FlipVerticalIcon width={17} height={17} />
                  </ToolButton>
                  <ToolButton label={t("crop")} onClick={() => setCropOpen(true)} disabled={busy}>
                    <CropIcon width={17} height={17} />
                  </ToolButton>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setContentOpen(true)}
                  className="rounded-xl border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-brand hover:text-brand"
                >
                  {t("editContent")}
                </button>
              )}
            </div>
          )}

          {/* Bottom action bar (icon only) */}
          <div className="flex items-center justify-between border-t border-ink/10 pt-4">
            <div className="flex gap-2">
              <ToolButton label={t("copyUrl")} onClick={copyUrl}>
                <LinkIcon width={17} height={17} />
              </ToolButton>
              <ToolLink label={t("openNewTab")} href={src}>
                <ExternalLinkIcon width={17} height={17} />
              </ToolLink>
              <ToolLink label={t("download")} href={src} download={file.name}>
                <DownloadIcon width={17} height={17} />
              </ToolLink>
            </div>
            <ToolButton label={t("delete")} onClick={remove} danger>
              <TrashIcon width={17} height={17} />
            </ToolButton>
          </div>
        </div>
      </Dialog>

      {isImg && (
        <ImageCropDialog
          file={file}
          open={cropOpen}
          onClose={() => setCropOpen(false)}
          onCropped={() => setVersion(Date.now())}
        />
      )}
      {isText && (
        <FileContentEditor
          file={file}
          open={contentOpen}
          onClose={() => setContentOpen(false)}
        />
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink/50">{label}</dt>
      <dd className="truncate text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`grid h-10 w-10 place-items-center rounded-lg border transition-colors disabled:opacity-50 ${
          danger
            ? "border-red-200 text-red-600 hover:bg-red-50"
            : "border-ink/10 text-ink/60 hover:border-brand hover:text-brand"
        }`}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function ToolLink({
  label,
  href,
  download,
  children,
}: {
  label: string;
  href: string;
  download?: string;
  children: ReactNode;
}) {
  const extra = download
    ? { download }
    : { target: "_blank", rel: "noreferrer" as const };
  return (
    <Tooltip label={label}>
      <a
        href={href}
        {...extra}
        aria-label={label}
        className="grid h-10 w-10 place-items-center rounded-lg border border-ink/10 text-ink/60 transition-colors hover:border-brand hover:text-brand"
      >
        {children}
      </a>
    </Tooltip>
  );
}
