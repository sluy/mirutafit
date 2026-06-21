"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserIcon, ShieldIcon } from "@/components/icons";

const tabs = [
  { href: "/account", key: "profile", Icon: UserIcon, exact: true },
  { href: "/account/security", key: "security", Icon: ShieldIcon, exact: false },
] as const;

export default function AccountTabs() {
  const t = useTranslations("account.nav");
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-ink/10">
      {tabs.map(({ href, key, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "border-brand text-brand"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            <Icon width={16} height={16} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
