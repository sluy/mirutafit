import { getTranslations } from "next-intl/server";
import { listTaxonomies } from "@/lib/taxonomy";
import TaxonomyManager from "@/components/admin/content/TaxonomyManager";

export default async function TagsPage() {
  const t = await getTranslations("admin.content.tags");
  const terms = await listTaxonomies("tag");

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>
      <TaxonomyManager kind="tag" terms={terms} />
    </div>
  );
}
