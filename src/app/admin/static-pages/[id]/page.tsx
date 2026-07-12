import { notFound } from "next/navigation";
import { getStaticPageForEdit } from "@/lib/static-pages";
import StaticPageEditor from "@/components/admin/static-pages/StaticPageEditor";

export default async function EditStaticPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getStaticPageForEdit(id);
  if (!page) notFound();
  return <StaticPageEditor page={page} />;
}
