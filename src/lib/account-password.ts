import { hashPassword } from "better-auth/crypto";
import { prisma } from "./prisma";

/**
 * Set a user's email/password credential to a new password, using better-auth's
 * own hashing so the credential keeps working with normal sign-in.
 *
 * Returns true if a credential account was updated (false if the user has no
 * email/password credential, e.g. an OAuth-only account).
 */
export async function setUserPassword(
  userId: string,
  newPassword: string,
): Promise<boolean> {
  const hashed = await hashPassword(newPassword);
  const result = await prisma.account.updateMany({
    where: { userId, providerId: "credential" },
    data: { password: hashed },
  });
  return result.count > 0;
}
