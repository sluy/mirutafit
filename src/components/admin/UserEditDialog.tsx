"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Dialog from "@/components/ui/Dialog";
import { Field, inputClass } from "@/components/ui/Field";
import { UploadIcon } from "@/components/icons";
import { updateUserProfileAction } from "@/app/admin/users/actions";

/* eslint-disable @next/next/no-img-element */

type UserRow = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
};

export default function UserEditDialog({
  user,
  open,
  onClose,
}: {
  user: UserRow;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin.users");
  const tc = useTranslations("common");
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [country, setCountry] = useState(user.country);
  const [phone, setPhone] = useState(user.phone);
  const [saving, setSaving] = useState(false);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState(user.image ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fallback = (user.name || user.email).charAt(0).toUpperCase();

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/avatar`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(`${data.url}?v=${Date.now()}`);
        toast.success(t("avatarUpdated"));
        router.refresh();
      } else {
        toast.error(t("avatarError"));
      }
    } catch {
      toast.error(t("avatarError"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { ok } = await updateUserProfileAction(user.id, {
        name,
        firstName,
        lastName,
        country,
        phone,
      });
      if (ok) {
        toast.success(t("saved"));
        router.refresh();
        onClose();
      } else {
        toast.error(t("errorSave"));
      }
    } catch {
      toast.error(t("errorSave"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("editProfileTitle")} maxWidth="max-w-lg" onSubmit={save}>
      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-xl font-bold text-white">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              fallback
            )}
          </span>
          <div>
            <p className="text-sm font-medium text-ink/70">{t("avatarLabel")}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
            >
              <UploadIcon width={14} height={14} />
              {uploadingAvatar ? "…" : t("changeAvatar")}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) uploadAvatar(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <Field label={t("colEmail")} htmlFor="edit-email">
          <input
            id="edit-email"
            value={user.email}
            disabled
            className={`${inputClass()} opacity-60`}
          />
        </Field>

        {/* Display name */}
        <Field label={t("nameLabel")} htmlFor="edit-name">
          <input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass()}
          />
        </Field>

        {/* First / Last */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("firstNameLabel")} htmlFor="edit-firstName">
            <input
              id="edit-firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass()}
            />
          </Field>
          <Field label={t("lastNameLabel")} htmlFor="edit-lastName">
            <input
              id="edit-lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass()}
            />
          </Field>
        </div>

        {/* Country / Phone */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("countryLabel")} htmlFor="edit-country">
            <input
              id="edit-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={inputClass()}
            />
          </Field>
          <Field label={t("phoneLabel")} htmlFor="edit-phone">
            <input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass()}
            />
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-2">
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
          disabled={saving || !name.trim()}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 disabled:opacity-60"
        >
          {saving ? "…" : tc("save")}
        </button>
      </div>
    </Dialog>
  );
}
