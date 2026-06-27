"use client";

import { useState, type FormEvent, type CSSProperties } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { CheckIcon, MailIcon, PhoneIcon, ArrowRightIcon } from "@/components/icons";
import { resolveText, resolveList } from "../i18n";
import type { ContactConfig, ContactWidgetMode } from "../types";
import { submitContactMessageAction } from "./actions";

/** Frontend render for the Contact widget: a banner + form with two modes. */
export default function ContactWidget({ config }: { config: ContactConfig }) {
  const t = useTranslations("widgets.contact");
  const locale = useLocale();
  const [mode, setMode] = useState<ContactWidgetMode>(config.defaultMode ?? "person");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const content = config[mode];
  const eyebrow = resolveText(config.eyebrow, locale);
  const heading = resolveText(config.heading, locale);
  const subtitle = resolveText(config.subtitle, locale);
  const badge = resolveText(content.badge, locale);
  const bannerTitle = resolveText(content.bannerTitle, locale);
  const bannerText = resolveText(content.bannerText, locale);
  const placeholder = resolveText(content.placeholder, locale);
  const points = resolveList(content.points, locale);
  const topics = resolveList(content.topics, locale);

  const style: CSSProperties = {};
  if (config.bg && config.bg !== "transparent") style.backgroundColor = config.bg;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Capture the form node now — React nulls `e.currentTarget` after the await.
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    setSending(true);
    try {
      const res = await submitContactMessageAction({
        mode,
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        topic: String(fd.get("topic") ?? ""),
        subject: String(fd.get("subject") ?? ""),
        message: String(fd.get("message") ?? ""),
        website: String(fd.get("website") ?? ""), // honeypot
      });
      if (res.ok) {
        setSent(true);
        formEl.reset();
        setTimeout(() => setSent(false), 5000);
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <section style={style} className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>
          )}
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">{heading}</h2>
          {subtitle && <p className="mt-3 text-ink/60">{subtitle}</p>}
        </div>

        {/* Mode switch */}
        {config.allowModeToggle && (
          <div className="mx-auto mt-8 flex max-w-md rounded-full bg-ink/5 p-1.5">
            {(["person", "brand"] as ContactWidgetMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                  mode === m ? "bg-brand text-white shadow-lg shadow-brand/25" : "text-ink/60 hover:text-ink"
                }`}
              >
                {resolveText(config[m].toggleLabel, locale)}
              </button>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
          {/* Dynamic banner */}
          <div
            className={`relative flex flex-col justify-between overflow-hidden rounded-3xl p-8 text-white transition-colors duration-500 ${
              mode === "person"
                ? "bg-gradient-to-br from-brand to-brand-dark"
                : "bg-gradient-to-br from-ink to-ink-soft"
            }`}
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              {badge && (
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{badge}</span>
              )}
              <h3 className="mt-5 font-display text-2xl font-bold leading-tight">{bannerTitle}</h3>
              <p className="mt-3 leading-relaxed text-white/80">{bannerText}</p>
              {points.length > 0 && (
                <ul className="mt-7 space-y-3">
                  {points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-sm">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20">
                        <CheckIcon width={12} height={12} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {config.showContactInfo && (config.contactEmail || config.contactPhone) && (
              <div className="relative mt-8 space-y-2 border-t border-white/15 pt-6 text-sm text-white/80">
                {config.contactEmail && (
                  <a href={`mailto:${config.contactEmail}`} className="flex items-center gap-2">
                    <MailIcon width={16} height={16} /> {config.contactEmail}
                  </a>
                )}
                {config.contactPhone && (
                  <a href={`tel:${config.contactPhone.replace(/\s+/g, "")}`} className="flex items-center gap-2">
                    <PhoneIcon width={16} height={16} /> {config.contactPhone}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-3xl border border-ink/5 bg-white p-8 shadow-sm">
            {/* Honeypot (hidden from users) */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("name")} htmlFor="name">
                <input id="name" name="name" required placeholder={t("namePlaceholder")} className={inputCls} />
              </Field>
              <Field label={t("email")} htmlFor="email">
                <input id="email" name="email" type="email" required placeholder="correo@ejemplo.com" className={inputCls} />
              </Field>
              <Field label={t("phone")} htmlFor="phone">
                <input id="phone" name="phone" type="tel" placeholder="+58 ..." className={inputCls} />
              </Field>
              <Field label={t("topic")} htmlFor="topic">
                <select id="topic" name="topic" className={inputCls} defaultValue="">
                  <option value="">{t("topicPlaceholder")}</option>
                  {topics.map((tp) => (
                    <option key={tp} value={tp}>{tp}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field label={t("subject")} htmlFor="subject">
                <input id="subject" name="subject" required placeholder={t("subjectPlaceholder")} className={inputCls} />
              </Field>
            </div>

            <div className="mt-5">
              <Field label={t("message")} htmlFor="message">
                <textarea id="message" name="message" required rows={5} placeholder={placeholder} className={`${inputCls} resize-none`} />
              </Field>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.01] disabled:opacity-60 sm:w-auto sm:px-10"
            >
              {sending ? t("sending") : t("submit")}
              <ArrowRightIcon className="transition-transform group-hover:translate-x-1" width={18} height={18} />
            </button>

            {sent && (
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-brand">
                <CheckIcon width={16} height={16} />
                {t("success")}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink/10 bg-gray-50 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink/70">{label}</label>
      {children}
    </div>
  );
}
