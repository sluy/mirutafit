import { requireAdmin } from "@/lib/auth-guard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side gate: only signed-in, non-banned admins get past here.
  const user = await requireAdmin();

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar userName={user.email} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-8 sm:px-6 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
