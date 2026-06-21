import { getTranslations } from "next-intl/server";
import { getCodePolicy } from "@/lib/settings";
import CodePolicyForm from "@/components/admin/CodePolicyForm";

export default async function AdminCodesPage() {
  const t = await getTranslations("admin.codePolicy");
  const policy = await getCodePolicy();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>

      <CodePolicyForm initial={policy} />
    </div>
  );
}
