import { notFound } from "next/navigation";
import { getArticleForEdit } from "@/lib/articles";
import { listTaxonomies } from "@/lib/taxonomy";
import ArticleEditorScreen from "@/components/admin/content/ArticleEditorScreen";

export default async function ArticleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleForEdit(id);
  if (!article) notFound();

  const [categories, tags] = await Promise.all([
    listTaxonomies("category"),
    listTaxonomies("tag"),
  ]);

  return (
    <ArticleEditorScreen article={article} categories={categories} tags={tags} />
  );
}
