"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Dialog from "@/components/ui/Dialog";
import { sendTestEmailAction } from "@/app/admin/system/email/actions";

const inputCls =
  "w-full rounded-xl border border-ink/10 bg-gray-50 px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30";

export default function TestEmailDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin.settings");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const result = await sendTestEmailAction({
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
      });
      if (result.ok) {
        toast.success(t("testSent"));
        onClose();
        // Reset form for next use
        setTo("");
        setSubject("");
        setBody("");
      } else {
        setError(result.error);
      }
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} title={t("testTitle")}>
      <p className="mb-5 text-sm text-ink/60">{t("testDesc")}</p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">{t("testError")}</p>
          <p className="mt-1 font-mono text-xs break-all">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="test-to" className="mb-1.5 block text-sm font-medium text-ink/70">
            {t("testTo")}
          </label>
          <input
            id="test-to"
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="correo@ejemplo.com"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="test-subject" className="mb-1.5 block text-sm font-medium text-ink/70">
            {t("testSubject")}
          </label>
          <input
            id="test-subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("testSubjectPlaceholder")}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="test-body" className="mb-1.5 block text-sm font-medium text-ink/70">
            {t("testBody")}
          </label>
          <textarea
            id="test-body"
            required
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("testBodyPlaceholder")}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={handleClose}
            disabled={sending}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-ink/5 disabled:opacity-60"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] disabled:opacity-60"
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
                </svg>
                {t("testSending")}
              </span>
            ) : (
              t("testSend")
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
