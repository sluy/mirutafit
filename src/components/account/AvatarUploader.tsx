"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { UploadIcon } from "@/components/icons";

/* eslint-disable @next/next/no-img-element */

export default function AvatarUploader({
  initialImage,
  fallback,
}: {
  initialImage: string | null;
  fallback: string;
}) {
  const t = useTranslations("account.profile");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState(initialImage);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/account/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        setImage(`${data.url}?v=${Date.now()}`); // cache-bust
        toast.success(t("avatarUpdated"));
        router.refresh();
      } else {
        toast.error(t("avatarError"));
      }
    } catch {
      toast.error(t("avatarError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 flex items-center gap-5">
      <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-2xl font-bold text-white">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          fallback
        )}
      </span>
      <div>
        <p className="text-sm font-medium text-ink/70">{t("avatar")}</p>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="mt-1.5 inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
        >
          <UploadIcon width={15} height={15} />
          {busy ? "…" : t("changeAvatar")}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) upload(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
