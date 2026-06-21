import { getSessionUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/account/ProfileForm";
import AvatarUploader from "@/components/account/AvatarUploader";

export default async function AccountProfilePage() {
  const sessionUser = await getSessionUser();
  const u = await prisma.user.findUnique({
    where: { id: sessionUser!.id },
    select: {
      name: true,
      email: true,
      image: true,
      firstName: true,
      lastName: true,
      country: true,
      phone: true,
    },
  });

  const fallback = (u?.name || u?.email || "?").charAt(0).toUpperCase();

  return (
    <div>
      <AvatarUploader initialImage={u?.image ?? null} fallback={fallback} />
      <ProfileForm
        initial={{
          name: u?.name ?? "",
          email: u?.email ?? "",
          firstName: u?.firstName ?? "",
          lastName: u?.lastName ?? "",
          country: u?.country ?? "",
          phone: u?.phone ?? "",
        }}
      />
    </div>
  );
}
