"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { PageLayout } from "@/widgets/types";

export async function savePageLayoutAction(
  slug: string,
  layout: PageLayout,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await prisma.page.update({
    where: { slug },
    data: { layout: layout as unknown as Prisma.InputJsonValue },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/site/layout");
  return { ok: true };
}
