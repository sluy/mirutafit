import { randomInt, createHash } from "node:crypto";
import { prisma } from "./prisma";
import { getCodePolicy, getSmtpSettings, type CodePolicy } from "./settings";
import { sendMail } from "./mailer";

/**
 * Reusable one-time verification-code module.
 *
 * Generate a code (per the admin-configured policy), deliver it (e.g. by
 * email), and later verify what the user typed. Codes are stored hashed.
 *
 * Used today for password recovery; reuse it anywhere you need "send a code,
 * then check it" (email verification, sensitive actions, etc.) by picking a
 * unique `purpose` string.
 */

// Excludes visually ambiguous characters (0/O, 1/I/l) for usability.
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUMBERS = "23456789";
const SYMBOLS = "!@#$%*?";

export type VerifyResult =
  | "ok"
  | "invalid"
  | "expired"
  | "too_many_attempts"
  | "not_found";

function buildCharset(policy: CodePolicy): string {
  let charset = "";
  if (policy.useLetters) charset += LETTERS;
  if (policy.useNumbers) charset += NUMBERS;
  if (policy.useSymbols) charset += SYMBOLS;
  // Never end up with an empty alphabet.
  return charset || NUMBERS;
}

function generateCode(policy: CodePolicy): string {
  const charset = buildCharset(policy);
  const length = Math.min(Math.max(policy.length, 4), 12);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += charset[randomInt(charset.length)];
  }
  return code;
}

// Hash bound to identifier+purpose so a code can't be replayed elsewhere.
function hashCode(code: string, identifier: string, purpose: string): string {
  return createHash("sha256")
    .update(`${purpose}:${identifier.toLowerCase()}:${code}`)
    .digest("hex");
}

/**
 * Create and store a new code, invalidating any previous unused codes for the
 * same identifier + purpose. Returns the plaintext code (to deliver) plus how
 * long it's valid.
 */
export async function createVerificationCode({
  identifier,
  purpose,
}: {
  identifier: string;
  purpose: string;
}): Promise<{ code: string; expiresAt: Date; expiryMinutes: number }> {
  const policy = await getCodePolicy();
  const code = generateCode(policy);
  const expiresAt = new Date(Date.now() + policy.expiryMinutes * 60_000);

  // Burn older outstanding codes so only the latest one works.
  await prisma.verificationCode.updateMany({
    where: { identifier, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  await prisma.verificationCode.create({
    data: {
      identifier,
      purpose,
      codeHash: hashCode(code, identifier, purpose),
      expiresAt,
    },
  });

  return { code, expiresAt, expiryMinutes: policy.expiryMinutes };
}

/**
 * Check a code. By default a correct code is consumed (single use). Pass
 * `consume: false` to only validate it (e.g. an intermediate "is this code
 * right?" step) without burning it.
 */
export async function verifyVerificationCode({
  identifier,
  purpose,
  code,
  consume = true,
}: {
  identifier: string;
  purpose: string;
  code: string;
  consume?: boolean;
}): Promise<VerifyResult> {
  const policy = await getCodePolicy();
  const record = await prisma.verificationCode.findFirst({
    where: { identifier, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return "not_found";
  if (record.expiresAt.getTime() < Date.now()) return "expired";
  if (record.attempts >= policy.maxAttempts) return "too_many_attempts";

  const matches = record.codeHash === hashCode(code, identifier, purpose);
  if (!matches) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return "invalid";
  }

  if (consume) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
  }

  return "ok";
}

/**
 * Convenience: create a code and email it using the saved SMTP settings.
 * `render(code, expiryMinutes)` builds the (localized) email body so callers
 * stay in control of the wording.
 */
export async function sendEmailCode({
  to,
  purpose,
  subject,
  render,
}: {
  to: string;
  purpose: string;
  subject: string;
  render: (code: string, expiryMinutes: number) => string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { code, expiryMinutes } = await createVerificationCode({
    identifier: to,
    purpose,
  });
  const smtp = await getSmtpSettings();
  return sendMail(smtp, to, subject, render(code, expiryMinutes));
}
