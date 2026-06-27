"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSession, signOut } from "@/lib/auth-client";
import LanguageSwitcher from "@/widgets/navbar/LanguageSwitcher";
import type {
  NavbarConfig,
  MenuCategory,
  ResolvedNavItem,
  NavZone,
  LocaleOption,
} from "@/widgets/types";
import {
  MenuIcon,
  CloseIcon,
  UserIcon,
  HeartIcon,
  GridIcon,
  ShieldIcon,
  LogOutIcon,
} from "./icons";

function isAdminRole(role?: string | null) {
  return !!role && role.split(",").map((r) => r.trim()).includes("admin");
}

/** Either an in-page anchor ("#…") or an app route ("/…"). */
function NavItem({
  href,
  label,
  onClick,
  className,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  if (href.startsWith("#")) {
    // Native fragment scrolling is unreliable with a fixed navbar, so scroll
    // the target into view ourselves (falls back to default if it's absent).
    const onAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      const el = document.getElementById(href.slice(1));
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", href);
      }
      onClick?.();
    };
    return (
      <a href={href} onClick={onAnchorClick} className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={className}>
      {label}
    </Link>
  );
}

export default function Navbar({
  config,
  categories,
  items,
  brandZone = "left",
  localeOptions = [],
  currentLocale = "",
}: {
  config: NavbarConfig;
  categories?: MenuCategory[];
  items?: ResolvedNavItem[];
  brandZone?: NavZone;
  localeOptions?: LocaleOption[];
  currentLocale?: string;
}) {
  // Legacy navbars only show the dynamic category menu (no hard-coded links).
  const navLinks =
    categories && categories.length > 0
      ? categories.map((c) => ({ label: c.label, href: c.href }))
      : [];
  const tc = useTranslations("common");
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const admin = isAdminRole(user?.role as string | undefined);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    await signOut();
    toast.success(tc("loggedOut"));
    router.push("/");
    router.refresh();
  };

  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();
  const avatarNode = user?.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.image} alt="" className="h-full w-full object-cover" />
  ) : (
    initial
  );

  // Color/background driven by config at the top, fixed white when scrolled.
  const barStyle: CSSProperties = scrolled
    ? {
        backgroundColor: config.scrolledBg ?? "#ffffff",
        color: config.scrolledText ?? "var(--color-ink)",
      }
    : {
        backgroundColor: config.topBg === "transparent" ? "transparent" : config.topBg,
        color: config.topText,
      };

  const userMenuItems = (
    <>
      <Link href="/account" onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/80 transition-colors hover:bg-brand/10 hover:text-brand">
        <UserIcon width={16} height={16} />
        {tc("account")}
      </Link>
      <Link href="/account/security" onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/80 transition-colors hover:bg-brand/10 hover:text-brand">
        <ShieldIcon width={16} height={16} />
        {tc("security")}
      </Link>
      {admin && (
        <Link href="/admin" onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/80 transition-colors hover:bg-brand/10 hover:text-brand">
          <GridIcon width={16} height={16} />
          {tc("administrator")}
        </Link>
      )}
      <div className="my-1 border-t border-ink/10" />
      <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50">
        <LogOutIcon width={16} height={16} />
        {tc("logout")}
      </button>
    </>
  );

  const brand = (
    <Link
      href="/"
      className={`flex items-center gap-2 font-display font-extrabold tracking-tight transition-all ${scrolled ? "py-3 text-xl" : "py-4 text-2xl"}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
        <HeartIcon width={18} height={18} />
      </span>
      <span>Mi<span className="text-brand">Ruta</span>Fit</span>
    </Link>
  );

  // ── New composed navbar (zones + items) ──
  if (items && items.length > 0) {
    const desktopAuth = user ? (
      <div className="relative hidden sm:block">
        <button
          type="button"
          onClick={() => setUserMenuOpen((v) => !v)}
          aria-label={tc("account")}
          className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-brand text-sm font-bold text-white ring-2 transition hover:scale-105 ${scrolled ? "ring-ink/10" : "ring-white/40"}`}
        >
          {avatarNode}
        </button>
        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-3 w-64 overflow-hidden rounded-2xl border border-ink/10 bg-white text-ink shadow-2xl">
              <div className="flex items-center gap-3 border-b border-ink/10 bg-gray-50 px-4 py-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-base font-bold text-white">{avatarNode}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name || "—"}</p>
                  <p className="truncate text-xs text-ink/50">{user.email}</p>
                </div>
              </div>
              <div className="py-1.5">{userMenuItems}</div>
            </div>
          </>
        )}
      </div>
    ) : (
      <Link href="/login" className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-brand sm:flex">
        <UserIcon width={16} height={16} />
        {tc("login")}
      </Link>
    );

    const renderDesktop = (item: ResolvedNavItem) => {
      if (item.kind === "auth") return <span key={item.id}>{desktopAuth}</span>;
      if (item.kind === "language")
        return (
          <span key={item.id} className="hidden sm:block">
            <LanguageSwitcher options={localeOptions} current={currentLocale} />
          </span>
        );
      const isButton = item.style === "button" || item.kind === "support";
      const cls = isButton
        ? "hidden items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 lg:inline-flex"
        : "relative hidden text-sm font-medium transition-colors hover:text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-brand after:transition-all hover:after:w-full lg:inline-block";
      return <NavItem key={item.id} href={item.href} label={item.label} className={cls} />;
    };

    const zone = (z: NavZone) => items.filter((i) => i.zone === z).map(renderDesktop);
    const mobileLinks = items.filter((i) => i.kind !== "auth");

    return (
      <header className="relative z-50">
        <div style={barStyle} className={`transition-all duration-500 ${scrolled ? "shadow-lg shadow-ink/5 backdrop-blur-md" : ""}`}>
          <nav className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex flex-1 items-center gap-6">
                {config.showBrand && brandZone === "left" && brand}
                {zone("left")}
              </div>
              <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
                {config.showBrand && brandZone === "center" && brand}
                {zone("center")}
              </div>
              <div className="flex flex-1 items-center justify-end gap-3">
                {zone("right")}
                {config.showBrand && brandZone === "right" && brand}
                <button type="button" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-lg lg:hidden">
                  {menuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        <div className={`overflow-hidden bg-white text-ink shadow-xl transition-all duration-300 lg:hidden ${menuOpen ? "max-h-[34rem] opacity-100" : "max-h-0 opacity-0"}`}>
          <ul className="flex flex-col gap-1 px-4 py-4">
            {mobileLinks.map((item) =>
              item.kind === "language" ? (
                <li key={item.id} className="px-3 py-1.5">
                  <LanguageSwitcher options={localeOptions} current={currentLocale} />
                </li>
              ) : (
                <li key={item.id}>
                  <NavItem href={item.href} label={item.label} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-brand/10 hover:text-brand" />
                </li>
              ),
            )}
            {user ? (
              <li className="mt-2 border-t border-ink/10 pt-3">
                <div className="flex items-center gap-3 px-3 pb-2">
                  <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-brand text-sm font-bold text-white">{avatarNode}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name || "—"}</p>
                    <p className="truncate text-xs text-ink/50">{user.email}</p>
                  </div>
                </div>
                <div className="[&_a]:rounded-lg [&_button]:rounded-lg">{userMenuItems}</div>
              </li>
            ) : (
              <li className="mt-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-medium">
                  <UserIcon width={16} height={16} />
                  {tc("login")}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </header>
    );
  }

  return (
    // Positioning (fixed vs flow) is handled by the page renderer's pinned
    // stack, so the navbar itself is always a normal block.
    <header className="relative z-50">
      {/* ── Main bar ── */}
      <div
        style={barStyle}
        className={`transition-all duration-500 ${scrolled ? "shadow-lg shadow-ink/5 backdrop-blur-md" : ""}`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          {config.showBrand ? brand : <span />}

          <ul className="hidden items-center gap-7 text-sm font-medium lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavItem
                  href={link.href}
                  label={link.label}
                  className="relative transition-colors hover:text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-brand after:transition-all hover:after:w-full"
                />
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label={tc("account")}
                  className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-brand text-sm font-bold text-white ring-2 transition hover:scale-105 ${scrolled ? "ring-ink/10" : "ring-white/40"}`}
                >
                  {avatarNode}
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-3 w-64 overflow-hidden rounded-2xl border border-ink/10 bg-white text-ink shadow-2xl">
                      <div className="flex items-center gap-3 border-b border-ink/10 bg-gray-50 px-4 py-4">
                        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-base font-bold text-white">
                          {avatarNode}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{user.name || "—"}</p>
                          <p className="truncate text-xs text-ink/50">{user.email}</p>
                        </div>
                      </div>
                      <div className="py-1.5">{userMenuItems}</div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-brand sm:flex">
                <UserIcon width={16} height={16} />
                {tc("login")}
              </Link>
            )}

            <a href="#apoyo" className="hidden items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 sm:flex">
              <HeartIcon width={16} height={16} />
              {tc("support")}
            </a>

            <button type="button" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-lg lg:hidden">
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile menu ── */}
      <div className={`overflow-hidden bg-white text-ink shadow-xl transition-all duration-300 lg:hidden ${menuOpen ? "max-h-[34rem] opacity-100" : "max-h-0 opacity-0"}`}>
        <ul className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <NavItem
                href={link.href}
                label={link.label}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-brand/10 hover:text-brand"
              />
            </li>
          ))}
          {user ? (
            <li className="mt-2 border-t border-ink/10 pt-3">
              <div className="flex items-center gap-3 px-3 pb-2">
                <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-brand text-sm font-bold text-white">{avatarNode}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name || "—"}</p>
                  <p className="truncate text-xs text-ink/50">{user.email}</p>
                </div>
              </div>
              <div className="[&_a]:rounded-lg [&_button]:rounded-lg">{userMenuItems}</div>
            </li>
          ) : (
            <li className="mt-2 flex gap-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-medium">
                <UserIcon width={16} height={16} />
                {tc("login")}
              </Link>
              <a href="#apoyo" onClick={() => setMenuOpen(false)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white">
                <HeartIcon width={16} height={16} />
                {tc("support")}
              </a>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
