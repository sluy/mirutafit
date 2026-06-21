"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { setUserPassword } from "@/lib/account-password";
import { sendMail } from "@/lib/mailer";
import { getSmtpSettings } from "@/lib/settings";

export async function updateUserProfileAction(
  userId: string,
  data: {
    name: string;
    firstName: string;
    lastName: string;
    country: string;
    phone: string;
  },
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      country: data.country || null,
      phone: data.phone || null,
    },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Generate a random temporary password, set it on the user's account,
 * and email them a notification with the new password.
 */
export async function resetUserPasswordAction(
  userId: string,
): Promise<{ ok: boolean; tempPassword?: string; error?: string }> {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user) return { ok: false, error: "User not found." };

  // Generate a 12-char random password (letters + digits + symbols)
  const tempPassword = crypto.randomBytes(9).toString("base64url").slice(0, 12);

  const updated = await setUserPassword(userId, tempPassword);
  if (!updated) {
    return { ok: false, error: "User has no password credential to reset." };
  }

  // Send notification email
  const smtp = await getSmtpSettings();
  if (smtp.host && smtp.fromEmail) {
    const subject = "Your MiRutaFit password was reset";
    const body = [
      `Hi ${user.name || "there"},`,
      "",
      "An administrator has reset your password.",
      "",
      `Your temporary password is: ${tempPassword}`,
      "",
      "Please sign in and change it from your account settings as soon as possible.",
      "",
      "— MiRutaFit",
    ].join("\n");

    await sendMail(smtp, user.email, subject, body);
  }

  revalidatePath("/admin/users");
  return { ok: true, tempPassword };
}
