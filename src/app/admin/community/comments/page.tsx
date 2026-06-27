import { getTranslations } from "next-intl/server";
import {
  listAdminComments,
  getPendingCommentCount,
  type CommentFilter,
} from "@/lib/community";
import { getCommunitySettings } from "@/lib/settings";
import CommentModeration from "@/components/admin/community/CommentModeration";

export default async function CommunityCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: raw } = await searchParams;
  const filter: CommentFilter =
    raw === "pending" ? "pending" : raw === "approved" ? "approved" : raw === "hidden" ? "hidden" : "all";

  const t = await getTranslations("admin.community");
  const [comments, pending, settings] = await Promise.all([
    listAdminComments(filter),
    getPendingCommentCount(),
    getCommunitySettings(),
  ]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>
      <CommentModeration
        comments={comments}
        filter={filter}
        pending={pending}
        autoApprove={settings.autoApprove}
      />
    </div>
  );
}
