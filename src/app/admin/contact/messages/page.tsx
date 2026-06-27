import { getTranslations } from "next-intl/server";
import {
  listContactMessages,
  getUnreadContactCount,
  type ContactInboxFilter,
} from "@/lib/contact";
import ContactInbox from "@/components/admin/contact/ContactInbox";

export default async function ContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: raw } = await searchParams;
  const filter: ContactInboxFilter =
    raw === "unread" ? "unread" : raw === "read" ? "read" : "all";

  const t = await getTranslations("admin.contact");
  const [messages, unread] = await Promise.all([
    listContactMessages(filter),
    getUnreadContactCount(),
  ]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>
      <ContactInbox messages={messages} filter={filter} unread={unread} />
    </div>
  );
}
