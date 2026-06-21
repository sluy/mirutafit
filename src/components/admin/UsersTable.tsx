"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { MoreVerticalIcon } from "@/components/icons";
import { resetUserPasswordAction } from "@/app/admin/users/actions";
import UserEditDialog from "./UserEditDialog";

/* eslint-disable @next/next/no-img-element */

type Row = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
  createdAt: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
};

function isAdminRole(role: string) {
  return role
    .split(",")
    .map((r) => r.trim())
    .includes("admin");
}

export default function UsersTable({
  users,
  currentUserId,
}: {
  users: Row[];
  currentUserId: string;
}) {
  const t = useTranslations("admin.users");
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Row | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function run(
    id: string,
    action: () => Promise<{ error?: unknown }>,
    successMsg: string,
  ) {
    setMenuId(null);
    setBusyId(id);
    const { error } = await action();
    setBusyId(null);
    if (error) {
      toast.error(t("errorGeneric"));
      return;
    }
    toast.success(successMsg);
    router.refresh();
  }

  const toggleAdmin = (u: Row) =>
    run(
      u.id,
      () =>
        authClient.admin.setRole({
          userId: u.id,
          role: isAdminRole(u.role) ? "user" : "admin",
        }),
      t("roleUpdated"),
    );

  const toggleBan = (u: Row) => {
    if (!u.banned && !confirm(t("confirmBan"))) return;
    setMenuId(null);
    run(
      u.id,
      () =>
        u.banned
          ? authClient.admin.unbanUser({ userId: u.id })
          : authClient.admin.banUser({ userId: u.id }),
      u.banned ? t("userUnbanned") : t("userBanned"),
    );
  };

  const resetPassword = async (u: Row) => {
    if (!confirm(t("confirmResetPassword"))) return;
    setMenuId(null);
    setBusyId(u.id);
    try {
      const result = await resetUserPasswordAction(u.id);
      if (result.ok && result.tempPassword) {
        setTempPassword(result.tempPassword);
        toast.success(t("passwordReset"));
      } else {
        toast.error(result.error ?? t("errorGeneric"));
      }
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setBusyId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-ink/5 bg-white p-10 text-center text-ink/50 shadow-sm">
        {t("empty")}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-gray-50 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-6 py-3 font-semibold">{t("colUser")}</th>
                <th className="px-6 py-3 font-semibold">{t("colRole")}</th>
                <th className="px-6 py-3 font-semibold">{t("colStatus")}</th>
                <th className="px-6 py-3 font-semibold">{t("colJoined")}</th>
                <th className="w-14 px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.map((u) => {
                const admin = isAdminRole(u.role);
                const isSelf = u.id === currentUserId;
                const busy = busyId === u.id;
                const menuOpen = menuId === u.id;
                return (
                  <tr key={u.id} className={busy ? "opacity-50" : ""}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          <img
                            src={u.image}
                            alt={u.name || u.email}
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 font-display font-bold text-brand">
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {u.name || "—"}
                            {isSelf && (
                              <span className="ml-2 text-xs font-normal text-ink/40">
                                ({t("you")})
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-ink/50">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          admin ? "bg-brand/15 text-brand" : "bg-ink/5 text-ink/60"
                        }`}
                      >
                        {admin ? t("roleAdmin") : t("roleUser")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.banned ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {u.banned ? t("statusBanned") : t("statusActive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink/50">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <UserMenu
                        user={u}
                        isSelf={isSelf}
                        admin={admin}
                        busy={busy}
                        open={menuOpen}
                        onToggle={() => setMenuId(menuOpen ? null : u.id)}
                        onClose={() => setMenuId(null)}
                        onEdit={() => { setMenuId(null); setEditUser(u); }}
                        onResetPassword={() => resetPassword(u)}
                        onToggleAdmin={() => toggleAdmin(u)}
                        onToggleBan={() => toggleBan(u)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit profile dialog */}
      {editUser && (
        <UserEditDialog
          user={editUser}
          open={!!editUser}
          onClose={() => setEditUser(null)}
        />
      )}

      {/* Temp password toast (copyable) */}
      {tempPassword && (
        <TempPasswordBanner
          password={tempPassword}
          onDismiss={() => setTempPassword(null)}
        />
      )}
    </>
  );
}

/**
 * A floating banner showing the temp password with a copy button.
 * Stays on screen until dismissed.
 */
function TempPasswordBanner({
  password,
  onDismiss,
}: {
  password: string;
  onDismiss: () => void;
}) {
  const t = useTranslations("admin.users");

  const copy = async () => {
    await navigator.clipboard.writeText(password);
    toast.success(t("copied"));
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-2xl border border-brand/20 bg-white px-6 py-4 shadow-2xl shadow-brand/10">
        <div>
          <p className="text-sm font-semibold text-ink">{t("tempPassword")}</p>
          <code className="mt-1 block rounded-lg bg-gray-100 px-3 py-1.5 font-mono text-sm text-brand">
            {password}
          </code>
          <p className="mt-1 text-xs text-ink/40">{t("tempPasswordHint")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105"
          >
            {t("copyPassword")}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg px-4 py-2 text-xs font-medium text-ink/50 transition-colors hover:bg-ink/5"
          >
            {t("dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Portal-based dropdown menu (escapes overflow-hidden parents)      */
/* ------------------------------------------------------------------ */

function UserMenu({
  user,
  isSelf,
  admin,
  busy,
  open,
  onToggle,
  onClose,
  onEdit,
  onResetPassword,
  onToggleAdmin,
  onToggleBan,
}: {
  user: Row;
  isSelf: boolean;
  admin: boolean;
  busy: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onToggleAdmin: () => void;
  onToggleBan: () => void;
}) {
  const t = useTranslations("admin.users");
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: rect.right - 192, // 192px = w-48
    });
  }, [open]);

  const itemBase =
    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-ink/70 hover:bg-brand/5 hover:text-brand";
  const itemDisabled =
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink/70";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={onToggle}
        disabled={busy}
        className="grid h-8 w-8 place-items-center rounded-lg text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-40"
      >
        <MoreVerticalIcon width={16} height={16} />
      </button>

      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            {/* Invisible backdrop */}
            <div className="fixed inset-0 z-[60]" onClick={onClose} />
            {/* Dropdown */}
            <div
              className="fixed z-[61] w-48 overflow-hidden rounded-xl border border-ink/10 bg-white py-1 text-sm shadow-xl animate-in fade-in zoom-in-95"
              style={{ top: pos.top, left: pos.left }}
            >
              {/* Edit profile */}
              <button type="button" onClick={onEdit} className={itemBase}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                {t("editProfile")}
              </button>

              {/* Reset password */}
              <button
                type="button"
                onClick={onResetPassword}
                disabled={isSelf}
                className={`${itemBase} ${itemDisabled}`}
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <rect width={18} height={11} x={3} y={11} rx={2} ry={2} />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {t("resetPassword")}
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-ink/5" />

              {/* Toggle admin */}
              <button
                type="button"
                onClick={onToggleAdmin}
                disabled={isSelf}
                className={`${itemBase} ${itemDisabled}`}
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {admin ? t("removeAdmin") : t("makeAdmin")}
              </button>

              {/* Ban / Unban */}
              <button
                type="button"
                onClick={onToggleBan}
                disabled={isSelf}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left disabled:cursor-not-allowed disabled:opacity-40 ${
                  user.banned
                    ? "text-emerald-700 hover:bg-emerald-50"
                    : "text-red-600 hover:bg-red-50"
                }`}
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx={12} cy={12} r={10} />
                  <path d="m4.93 4.93 14.14 14.14" />
                </svg>
                {user.banned ? t("unban") : t("ban")}
              </button>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
