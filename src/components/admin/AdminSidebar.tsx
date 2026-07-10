"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/lib/auth-client";
import { WIDGET_TYPE_KEYS } from "@/widgets/meta";
import {
  GridIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  HeartIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ImageIcon,
  GlobeIcon,
  MenuIcon,
  CloseIcon,
  BlocksIcon,
  FileIcon,
  MailIcon,
  QuoteIcon,
  ClipboardListIcon,
} from "@/components/icons";

type Leaf = { href: string; key: string; exact?: boolean; tkey?: string };
type Item =
  | { type: "link"; href: string; key: string; exact?: boolean; Icon: typeof GridIcon }
  | { type: "group"; key: string; Icon: typeof GridIcon; children: Leaf[] };

const nav: Item[] = [
  { type: "link", href: "/admin", key: "dashboard", Icon: GridIcon, exact: true },
  {
    type: "group",
    key: "site",
    Icon: GlobeIcon,
    children: [
      { href: "/admin/site/layout", key: "siteLayout" },
      { href: "/admin/site/general", key: "siteGeneral" },
      { href: "/admin/site/social", key: "siteSocial" },
    ],
  },
  {
    type: "group",
    key: "widgets",
    Icon: BlocksIcon,
    children: WIDGET_TYPE_KEYS.map((k) => ({
      href: `/admin/widgets/${k}`,
      key: k,
      tkey: `widgets.types.${k}`,
    })),
  },
  { type: "link", href: "/admin/media", key: "media", Icon: ImageIcon, exact: false },
  {
    type: "group",
    key: "content",
    Icon: FileIcon,
    children: [
      { href: "/admin/content/articles", key: "contentArticles" },
      { href: "/admin/content/categories", key: "contentCategories" },
      { href: "/admin/content/tags", key: "contentTags" },
    ],
  },
  {
    type: "group",
    key: "contact",
    Icon: MailIcon,
    children: [
      { href: "/admin/contact/messages", key: "contactMessages" },
      { href: "/admin/contact/settings", key: "contactSettings" },
    ],
  },
  {
    type: "link",
    href: "/admin/community/comments",
    key: "community",
    Icon: QuoteIcon,
    exact: false,
  },
  {
    type: "link",
    href: "/admin/surveys",
    key: "surveys",
    Icon: ClipboardListIcon,
    exact: false,
  },
  {
    type: "group",
    key: "users",
    Icon: UsersIcon,
    children: [
      { href: "/admin/users", key: "usersList", exact: true },
      { href: "/admin/users/settings", key: "usersSettings" },
    ],
  },
  {
    type: "group",
    key: "system",
    Icon: SettingsIcon,
    children: [
      { href: "/admin/system/email", key: "systemEmail" },
      { href: "/admin/system/codes", key: "systemCodes" },
      { href: "/admin/system/languages", key: "systemLanguages" },
      { href: "/admin/system/maintenance", key: "systemMaintenance" },
    ],
  },
];

function matches(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminSidebar({ userName }: { userName: string }) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
        <div className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
            <HeartIcon width={16} height={16} />
          </span>
          <span>Mi<span className="text-brand">Ruta</span>Fit</span>
        </div>
        {/* Close button (mobile only) */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink lg:hidden"
        >
          <CloseIcon width={18} height={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin p-4">
        {nav.map((item) =>
          item.type === "link" ? (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                matches(pathname, item.href, item.exact)
                  ? "bg-brand text-white shadow-md shadow-brand/25"
                  : "text-ink/70 hover:bg-brand/10 hover:text-brand"
              }`}
            >
              <item.Icon width={18} height={18} />
              {t(`nav.${item.key}`)}
            </Link>
          ) : (
            <NavGroup key={item.key} item={item} pathname={pathname} t={t} />
          ),
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-ink/10 p-4">
        <p className="truncate px-2 pb-2 text-xs text-ink/40">{userName}</p>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink/60 transition-colors hover:text-brand"
        >
          <ArrowRightIcon width={16} height={16} />
          {t("backToSite")}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink/60 transition-colors hover:text-red-600"
        >
          <LogOutIcon width={16} height={16} />
          {t("logout")}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-ink/10 bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-white">
            <HeartIcon width={14} height={14} />
          </span>
          <span>Mi<span className="text-brand">Ruta</span>Fit</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-xl text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
          aria-label="Open menu"
        >
          <MenuIcon width={20} height={20} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-ink/10 bg-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="animate-sidebar-in fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

function NavGroup({
  item,
  pathname,
  t,
}: {
  item: Extract<Item, { type: "group" }>;
  pathname: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const hasActiveChild = item.children.some((c) => matches(pathname, c.href, c.exact));
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
          hasActiveChild ? "text-brand" : "text-ink/70 hover:bg-brand/10 hover:text-brand"
        }`}
      >
        <item.Icon width={18} height={18} />
        <span className="flex-1 text-left">{t(`nav.${item.key}`)}</span>
        <ChevronDownIcon
          width={16}
          height={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-1 space-y-1 pl-5">
          {item.children.map((c) => {
            const active = matches(pathname, c.href, c.exact);
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`flex items-center gap-2 rounded-lg border-l-2 px-4 py-2 text-sm transition-colors ${
                  active
                    ? "border-brand bg-brand/10 font-medium text-brand"
                    : "border-ink/10 text-ink/60 hover:border-brand hover:text-brand"
                }`}
              >
                {c.tkey ? t(c.tkey) : t(`nav.${c.key}`)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
