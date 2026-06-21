"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import SearchableSelect from "@/components/ui/SearchableSelect";
import PhoneInput from "@/components/ui/PhoneInput";
import { inputClass } from "@/components/ui/Field";
import {
  InstagramIcon,
  TiktokIcon,
  FacebookIcon,
  YoutubeIcon,
  WhatsappIcon,
  MailIcon,
  PhoneIcon,
  GlobeIcon,
  MapPinIcon,
} from "@/components/icons";
import { saveSocialLinksAction } from "@/app/admin/site/social/actions";
import type { SocialLink } from "@/lib/settings";

/* ------------------------------------------------------------------ */
/*  Social link type definitions                                      */
/* ------------------------------------------------------------------ */

type LinkTypeDef = {
  value: string;
  labelKey: string; // i18n key under admin.siteSocial.types.*
  icon: ReactNode;
  placeholder: string;
};

const LINK_TYPE_DEFS: LinkTypeDef[] = [
  { value: "instagram", labelKey: "instagram", icon: <InstagramIcon width={16} height={16} />, placeholder: "https://instagram.com/username" },
  { value: "tiktok", labelKey: "tiktok", icon: <TiktokIcon width={16} height={16} />, placeholder: "https://tiktok.com/@username" },
  { value: "facebook", labelKey: "facebook", icon: <FacebookIcon width={16} height={16} />, placeholder: "https://facebook.com/page" },
  { value: "twitter", labelKey: "twitter", icon: <span className="text-sm font-bold">𝕏</span>, placeholder: "https://x.com/username" },
  { value: "youtube", labelKey: "youtube", icon: <YoutubeIcon width={16} height={16} />, placeholder: "https://youtube.com/@channel" },
  { value: "whatsapp", labelKey: "whatsapp", icon: <WhatsappIcon width={16} height={16} />, placeholder: "https://wa.me/1234567890" },
  { value: "phone", labelKey: "phone", icon: <PhoneIcon width={16} height={16} />, placeholder: "+1 555 123 4567" },
  { value: "email", labelKey: "email", icon: <MailIcon width={16} height={16} />, placeholder: "contact@mirutafit.com" },
  { value: "website", labelKey: "website", icon: <GlobeIcon width={16} height={16} />, placeholder: "https://mirutafit.com" },
  { value: "address", labelKey: "address", icon: <MapPinIcon width={16} height={16} />, placeholder: "123 Main St, City, Country" },
];

/* ------------------------------------------------------------------ */
/*  Main editor component                                             */
/* ------------------------------------------------------------------ */

export default function SocialLinksEditor({
  initialLinks,
}: {
  initialLinks: SocialLink[];
}) {
  const t = useTranslations("admin.siteSocial");
  const tc = useTranslations("common");
  const router = useRouter();

  // Build translated options inside the component where t() is available
  const typeOptions = LINK_TYPE_DEFS.map((d) => ({
    value: d.value,
    label: t(`types.${d.labelKey}`),
    icon: d.icon,
  }));

  const getPlaceholder = (type: string) =>
    LINK_TYPE_DEFS.find((d) => d.value === type)?.placeholder ?? "";

  const [links, setLinks] = useState<SocialLink[]>(
    initialLinks.length > 0 ? initialLinks : [{ type: "instagram", value: "" }],
  );
  const [saving, setSaving] = useState(false);

  const addLink = () => {
    setLinks([...links, { type: "instagram", value: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: "type" | "value", val: string) => {
    setLinks(links.map((l, i) => (i === index ? { ...l, [field]: val } : l)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const { ok } = await saveSocialLinksAction(links);
      if (ok) {
        toast.success(t("saved"));
        router.refresh();
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm">
        <div className="border-b border-ink/5 bg-gray-50/80 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink">{t("linksSection")}</h2>
          <p className="mt-0.5 text-sm text-ink/50">{t("linksHint")}</p>
        </div>

        <div className="divide-y divide-ink/5">
          {links.map((link, i) => {
            return (
              <div key={i} className="flex items-start gap-3 p-4">
                {/* Type selector */}
                <div className="w-48 shrink-0">
                  <SearchableSelect
                    options={typeOptions}
                    value={link.type}
                    onChange={(v) => updateLink(i, "type", v)}
                    placeholder={t("selectType")}
                    searchPlaceholder={t("searchType")}
                  />
                </div>

                {/* Value input */}
                <div className="min-w-0 flex-1">
                  {link.type === "phone" ? (
                    <PhoneInput
                      value={link.value}
                      onChange={(v) => updateLink(i, "value", v)}
                      placeholder="555 123 4567"
                    />
                  ) : (
                    <input
                      value={link.value}
                      onChange={(e) => updateLink(i, "value", e.target.value)}
                      placeholder={getPlaceholder(link.type)}
                      className={inputClass()}
                      type={link.type === "email" ? "email" : "text"}
                    />
                  )}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="mt-3 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/30 transition-colors hover:bg-red-50 hover:text-red-500"
                  title={t("remove")}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Add row */}
        <div className="border-t border-ink/5 p-4">
          <button
            type="button"
            onClick={addLink}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-ink/20 px-5 py-2.5 text-sm font-medium text-ink/50 transition-colors hover:border-brand hover:text-brand"
          >
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M7 1v12M1 7h12" />
            </svg>
            {t("addLink")}
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "…" : tc("save")}
        </button>
      </div>
    </div>
  );
}
