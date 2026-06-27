"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlobeIcon } from "@/components/icons";
import type { LocaleOption } from "../types";
import { setLocaleAction } from "./actions";

export default function LanguageSwitcher({
  options,
  current,
}: {
  options: LocaleOption[];
  current: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const choose = async (code: string) => {
    setOpen(false);
    if (code === current) return;
    setBusy(true);
    await setLocaleAction(code);
    router.refresh();
    setBusy(false);
  };

  const curLabel = (current || options[0]?.code || "").toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:text-brand disabled:opacity-60"
      >
        <GlobeIcon width={16} height={16} />
        {curLabel}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-ink/10 bg-white text-ink shadow-2xl">
            {options.map((o) => (
              <button
                key={o.code}
                type="button"
                onClick={() => choose(o.code)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-brand/10 ${
                  o.code === current ? "font-semibold text-brand" : "text-ink/80"
                }`}
              >
                {o.label}
                <span className="text-xs text-ink/40">{o.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
