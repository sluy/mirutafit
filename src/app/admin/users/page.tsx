import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guard";
import UsersTable from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const t = await getTranslations("admin.users");
  const me = await getSessionUser();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      banned: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      country: true,
      phone: true,
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role ?? "user",
    banned: Boolean(u.banned),
    createdAt: u.createdAt.toISOString(),
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    country: u.country ?? "",
    phone: u.phone ?? "",
  }));

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>

      <UsersTable users={rows} currentUserId={me?.id ?? ""} />
    </div>
  );
}
