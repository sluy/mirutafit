"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { inputClass } from "@/components/ui/Field";
import { CheckIcon, EyeOffIcon, EyeIcon, TrashIcon } from "@/components/icons";
import type { CommentFilter, CommentItem, CommentStatus } from "@/lib/community";
import {
  setCommentStatusAction,
  deleteCommentAction,
  createSeedCommentAction,
  setAutoApproveAction,
} from "@/app/admin/community/actions";

const FILTERS: CommentFilter[] = ["all", "pending", "approved", "hidden"];

export default function CommentModeration({
  comments,
  filter,
  pending,
  autoApprove,
}: {
  comments: CommentItem[];
  filter: CommentFilter;
  pending: number;
  autoApprove: boolean;
}) {
  const t = useTranslations("admin.community");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    await fn();
    router.refresh();
    setBusy(false);
  };

  const setStatus = (id: string, status: CommentStatus) =>
    run(() => setCommentStatusAction(id, status));

  const remove = (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    run(async () => {
      const { ok } = await deleteCommentAction(id);
      if (ok) toast.success(t("deleted"));
      else toast.error(t("error"));
    });
  };

  const toggleAuto = () =>
    run(async () => {
      await setAutoApproveAction(!autoApprove);
      toast.success(t("saved"));
    });

  const addSeed = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || message.trim().length < 2) return;
    setBusy(true);
    const { ok } = await createSeedCommentAction({ name, message });
    if (ok) {
      toast.success(t("added"));
      setName("");
      setMessage("");
      router.refresh();
    } else toast.error(t("error"));
    setBusy(false);
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      {/* Auto-approve toggle */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink/5 bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-ink">{t("autoApprove")}</p>
          <p className="text-xs text-ink/50">{autoApprove ? t("autoApproveOn") : t("autoApproveOff")}</p>
        </div>
        <button
          type="button"
          onClick={toggleAuto}
          disabled={busy}
          aria-pressed={autoApprove}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${autoApprove ? "bg-brand" : "bg-ink/20"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${autoApprove ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* Seed a comment */}
      <form onSubmit={addSeed} className="space-y-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-ink">{t("addTitle")}</p>
        <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} className={inputClass()} />
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("messagePlaceholder")} className={inputClass()} />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          + {t("add")}
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-1 rounded-full bg-ink/5 p-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/community/comments" : `/admin/community/comments?filter=${f}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? "bg-white text-brand shadow-sm" : "text-ink/60 hover:text-ink"
            }`}
          >
            {t(`filter_${f}`)}
            {f === "pending" && pending > 0 && (
              <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{pending}</span>
            )}
          </Link>
        ))}
      </div>

      {/* List */}
      {comments.length === 0 ? (
        <p className="rounded-2xl border border-ink/5 bg-white p-12 text-center text-sm text-ink/40 shadow-sm">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-2xl border border-ink/5 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-display font-bold text-white"
                  style={{ backgroundColor: c.avatarColor }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{c.name}</span>
                    <StatusBadge status={c.status} label={t(`status_${c.status}`)} />
                    {c.source === "admin" && (
                      <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/50">{t("seeded")}</span>
                    )}
                    <span className="text-xs text-ink/40">{fmt(c.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{c.message}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.status !== "approved" && (
                      <ActionBtn onClick={() => setStatus(c.id, "approved")} disabled={busy} icon={<CheckIcon width={13} height={13} />} label={t("approve")} tone="brand" />
                    )}
                    {c.status !== "hidden" && (
                      <ActionBtn onClick={() => setStatus(c.id, "hidden")} disabled={busy} icon={<EyeOffIcon width={13} height={13} />} label={t("hide")} />
                    )}
                    {c.status === "hidden" && (
                      <ActionBtn onClick={() => setStatus(c.id, "approved")} disabled={busy} icon={<EyeIcon width={13} height={13} />} label={t("unhide")} tone="brand" />
                    )}
                    <ActionBtn onClick={() => remove(c.id)} disabled={busy} icon={<TrashIcon width={13} height={13} />} label={t("delete")} tone="danger" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, label }: { status: CommentStatus; label: string }) {
  const cls =
    status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "pending"
        ? "bg-amber-100 text-amber-700"
        : "bg-ink/10 text-ink/50";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{label}</span>;
}

function ActionBtn({
  onClick,
  disabled,
  icon,
  label,
  tone,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  tone?: "brand" | "danger";
}) {
  const cls =
    tone === "danger"
      ? "border-red-200 text-red-600 hover:bg-red-50"
      : tone === "brand"
        ? "border-brand/30 text-brand hover:bg-brand/10"
        : "border-ink/10 text-ink/60 hover:border-brand hover:text-brand";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${cls}`}
    >
      {icon}
      {label}
    </button>
  );
}
