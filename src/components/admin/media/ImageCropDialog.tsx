"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Dialog from "@/components/ui/Dialog";
import { cropImageAction } from "@/app/admin/media/actions";
import { mediaUrl, fileVersion, type MediaFileDTO } from "./types";

/* eslint-disable @next/next/no-img-element */

export default function ImageCropDialog({
  file,
  open,
  onClose,
  onCropped,
}: {
  file: MediaFileDTO;
  open: boolean;
  onClose: () => void;
  onCropped: () => void;
}) {
  const t = useTranslations("admin.media");
  const tc = useTranslations("common");
  const router = useRouter();

  const [crop, setCrop] = useState<Crop>();
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const apply = async () => {
    if (!crop || !crop.width || !crop.height) return;
    // We store the crop as percentages, so convert to fractions (0..1).
    const fractions =
      crop.unit === "%"
        ? { x: crop.x / 100, y: crop.y / 100, width: crop.width / 100, height: crop.height / 100 }
        : (() => {
            const img = imgRef.current!;
            return {
              x: crop.x / img.width,
              y: crop.y / img.height,
              width: crop.width / img.width,
              height: crop.height / img.height,
            };
          })();

    setBusy(true);
    const { ok } = await cropImageAction(file.id, fractions);
    setBusy(false);
    if (ok) {
      toast.success(t("saved"));
      router.refresh();
      onCropped();
      onClose();
    } else {
      toast.error(t("error"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("cropTitle")} maxWidth="max-w-2xl">
      <div className="flex justify-center bg-ink/5 p-2">
        <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)}>
          <img
            ref={imgRef}
            src={mediaUrl(file.fileName, { v: fileVersion(file.updatedAt) })}
            alt={file.name}
            className="max-h-[55vh] w-auto"
          />
        </ReactCrop>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-ink/5"
        >
          {tc("cancel")}
        </button>
        <button
          type="button"
          onClick={apply}
          disabled={busy || !crop?.width}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 disabled:opacity-60"
        >
          {busy ? "…" : t("applyCrop")}
        </button>
      </div>
    </Dialog>
  );
}
