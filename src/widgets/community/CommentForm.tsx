"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { submitCommentAction } from "./actions";

export default function CommentForm({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const t = useTranslations("widgets.community");
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [feedback, setFeedback] = useState<"approved" | "pending" | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || message.trim().length < 2) return;
    setSending(true);
    try {
      const res = await submitCommentAction({ name, message, website });
      if (res.ok) {
        setFeedback(res.pending ? "pending" : "approved");
        setName("");
        setMessage("");
        if (!res.pending) router.refresh(); // approved → show it on the wall now
        setTimeout(() => setFeedback(null), 6000);
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40";

  return (
    <div className="h-fit rounded-3xl bg-ink p-7 text-white lg:sticky lg:top-28">
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-white/60">{subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Honeypot */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-sm text-white/70">{t("name")}</label>
          <input
            id="c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="c-msg" className="mb-1.5 block text-sm text-white/70">{t("message")}</label>
          <textarea
            id="c-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={t("messagePlaceholder")}
            className={`${inputCls} resize-none`}
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-full bg-brand py-3 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {sending ? t("sending") : t("submit")}
        </button>
        {feedback === "approved" && (
          <p className="text-center text-sm text-brand-light">{t("successApproved")}</p>
        )}
        {feedback === "pending" && (
          <p className="text-center text-sm text-brand-light">{t("successPending")}</p>
        )}
      </form>
    </div>
  );
}
