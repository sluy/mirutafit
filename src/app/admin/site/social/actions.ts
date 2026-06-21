"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { saveSocialLinks, type SocialLink } from "@/lib/settings";

export async function saveSocialLinksAction(
  links: SocialLink[],
): Promise<{ ok: boolean }> {
  await requireAdmin();
  // Filter out empty values
  const clean = links.filter((l) => l.value.trim());
  await saveSocialLinks(clean);
  revalidatePath("/", "layout");
  return { ok: true };
}
