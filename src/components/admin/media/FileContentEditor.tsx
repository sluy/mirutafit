"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Dialog from "@/components/ui/Dialog";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Spinner } from "@/components/ui/Spinner";
import {
  readFileContentAction,
  saveFileContentAction,
} from "@/app/admin/media/actions";
import type { MediaFileDTO } from "./types";

export default function FileContentEditor({
  file,
  open,
  onClose,
}: {
  file: MediaFileDTO;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin.media");
  const tc = useTranslations("common");
  const router = useRouter();

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isHtml = file.mimeType === "text/html";

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    readFileContentAction(file.id)
      .then((r) => setContent(r.content ?? ""))
      .finally(() => setLoading(false));
  }, [open, file.id]);

  const save = async () => {
    if (content === null) return;
    setSaving(true);
    const { ok } = await saveFileContentAction(file.id, content);
    setSaving(false);
    if (ok) {
      toast.success(t("contentSaved"));
      router.refresh();
      onClose();
    } else {
      toast.error(t("error"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("editTitle")} maxWidth="max-w-4xl">
      {loading || content === null ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size={32} />
        </div>
      ) : isHtml ? (
        <RichTextEditor value={content} onChange={setContent} />
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          spellCheck={false}
          className="w-full rounded-xl border border-ink/10 bg-gray-50 p-4 font-mono text-sm text-ink focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      )}

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
          onClick={save}
          disabled={saving || loading}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 disabled:opacity-60"
        >
          {saving ? "…" : tc("save")}
        </button>
      </div>
    </Dialog>
  );
}
