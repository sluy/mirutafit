import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth-guard";
import { HeartIcon, ArrowRightIcon } from "@/components/icons";
import AccountTabs from "@/components/account/AccountTabs";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  const t = await getTranslations("account");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
              <HeartIcon width={16} height={16} />
            </span>
            Mi<span className="text-brand">Ruta</span>Fit
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-ink/60 transition-colors hover:text-brand">
            <ArrowRightIcon width={15} height={15} />
            {t("title")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>

        <div className="mt-8">
          <AccountTabs />
          <div className="pt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
