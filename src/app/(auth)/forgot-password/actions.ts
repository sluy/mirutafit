"use server";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  sendEmailCode,
  verifyVerificationCode,
  type VerifyResult,
} from "@/lib/verification-codes";
import { setUserPassword } from "@/lib/account-password";

const PURPOSE = "password_reset";

function normalize(email: string) {
  return email.trim().toLowerCase();
}

export type RequestResetResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "send_failed"; detail?: string };

/** Step 1: look up the email and, if it exists, email a code. */
export async function requestResetAction(email: string): Promise<RequestResetResult> {
  const to = normalize(email);
  const user = await prisma.user.findUnique({ where: { email: to } });
  if (!user) return { ok: false, reason: "not_found" };

  const t = await getTranslations("auth.forgot.email");
  const result = await sendEmailCode({
    to,
    purpose: PURPOSE,
    subject: t("subject"),
    render: (code, minutes) => t("body", { code, minutes }),
  });

  if (!result.ok) return { ok: false, reason: "send_failed", detail: result.error };
  return { ok: true };
}

/** Step 2: check the code without consuming it (so step 3 can use it). */
export async function verifyResetCodeAction(
  email: string,
  code: string,
): Promise<{ status: VerifyResult }> {
  const status = await verifyVerificationCode({
    identifier: normalize(email),
    purpose: PURPOSE,
    code: code.trim(),
    consume: false,
  });
  return { status };
}

/** Step 3: re-check the code (consuming it) and set the new password. */
export async function resetPasswordAction(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ ok: boolean; status: VerifyResult }> {
  const to = normalize(email);
  const status = await verifyVerificationCode({
    identifier: to,
    purpose: PURPOSE,
    code: code.trim(),
    consume: true,
  });
  if (status !== "ok") return { ok: false, status };

  const user = await prisma.user.findUnique({ where: { email: to } });
  if (!user) return { ok: false, status: "not_found" };

  await setUserPassword(user.id, newPassword);
  return { ok: true, status: "ok" };
}
