"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MailIcon, PhoneIcon, TrashIcon, CheckIcon } from "@/components/icons";
import type { ContactInboxFilter, ContactMessageItem } from "@/lib/contact";
import {
  markContactReadAction,
  markAllContactReadAction,
  deleteContactMessageAction,
} from "@/app/admin/contact/actions";

const FILTERS: ContactInboxFilter[] = ["all", "unread", "read"];

export default function ContactInbox({
  messages,
  filter,
  unread,
}: {
  messages: ContactMessageItem[];
  filter: ContactInboxFilter;
  unread: number;
}) {
  const t = useTranslations("admin.contact");
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const expand = async (m: ContactMessageItem) => {
    const next = openId === m.id ? null : m.id;
    setOpenId(next);
    // Opening an unread message marks it read.
    if (next === m.id && !m.isRead) {
      await markContactReadAction(m.id, true);
      router.refresh();
    }
  };

  const toggleRead = async (m: ContactMessageItem) => {
    setBusy(true);
    await markContactReadAction(m.id, !m.isRead);
    router.refresh();
    setBusy(false);
  };

  const remove = async (m: ContactMessageItem) => {
    if (!confirm(t("confirmDelete"))) return;
    setBusy(true);
    const { ok } = await deleteContactMessageAction(m.id);
    if (ok) {
      toast.success(t("deleted"));
      router.refresh();
    } else toast.error(t("error"));
    setBusy(false);
  };

  const markAll = async () => {
    setBusy(true);
    await markAllContactReadAction();
    toast.success(t("allRead"));
    router.refresh();
    setBusy(false);
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full bg-ink/5 p-1">
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={f === "all" ? "/admin/contact/messages" : `/admin/contact/messages?filter=${f}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f ? "bg-white text-brand shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
            >
              {t(`filter_${f}`)}
              {f === "unread" && unread > 0 && (
                <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>
              )}
            </Link>
          ))}
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            disabled={busy}
            className="rounded-full border border-ink/10 px-4 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
          >
            {t("markAllRead")}
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <p className="rounded-2xl border border-ink/5 bg-white p-12 text-center text-sm text-ink/40 shadow-sm">
          {t("empty")}
        </p>
      ) : (
        <div className="space-y-2">
          {messages.map((m) => {
            const open = openId === m.id;
            return (
              <div
                key={m.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${
                  m.isRead ? "border-ink/5" : "border-brand/30 bg-brand/[0.02]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => expand(m)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  {!m.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      m.mode === "brand" ? "bg-ink/10 text-ink/70" : "bg-brand/10 text-brand"
                    }`}
                  >
                    {m.mode === "brand" ? t("modeBrand") : t("modePerson")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate ${m.isRead ? "text-ink/80" : "font-semibold text-ink"}`}>
                      {m.subject}
                    </span>
                    <span className="block truncate text-xs text-ink/50">
                      {m.name} · {m.email}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-ink/40">{fmt(m.createdAt)}</span>
                </button>

                {open && (
                  <div className="border-t border-ink/10 px-5 py-4">
                    <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink/60">
                      <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 hover:text-brand">
                        <MailIcon width={13} height={13} /> {m.email}
                      </a>
                      {m.phone && (
                        <a href={`tel:${m.phone.replace(/\s+/g, "")}`} className="flex items-center gap-1.5 hover:text-brand">
                          <PhoneIcon width={13} height={13} /> {m.phone}
                        </a>
                      )}
                      {m.topic && <span className="text-ink/50">{t("topic")}: {m.topic}</span>}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{m.message}</p>
                    {m.readAt && (
                      <p className="mt-3 text-[11px] text-ink/35">{t("readAt")}: {fmt(m.readAt)}</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRead(m)}
                        disabled={busy}
                        className="flex items-center gap-1.5 rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink/60 transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
                      >
                        <CheckIcon width={13} height={13} />
                        {m.isRead ? t("markUnread") : t("markRead")}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(m)}
                        disabled={busy}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                      >
                        <TrashIcon width={13} height={13} />
                        {t("delete")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
