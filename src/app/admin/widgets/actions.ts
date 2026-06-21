"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { WIDGET_META, isWidgetType } from "@/widgets/meta";

export async function createWidgetAction(
  type: string,
  name: string,
): Promise<{ ok: boolean; id: string | null }> {
  await requireAdmin();
  if (!isWidgetType(type)) return { ok: false, id: null };

  const widget = await prisma.widget.create({
    data: {
      type,
      name: name.trim() || "Untitled",
      config: WIDGET_META[type].defaultConfig as Prisma.InputJsonValue,
    },
  });
  revalidatePath("/admin/widgets");
  return { ok: true, id: widget.id };
}

export async function updateWidgetAction(
  id: string,
  name: string,
  config: unknown,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await prisma.widget.update({
    where: { id },
    data: { name: name.trim(), config: config as Prisma.InputJsonValue },
  });
  revalidatePath("/admin/widgets");
  revalidatePath("/", "layout"); // widget content shows on the front
  return { ok: true };
}

export async function deleteWidgetAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await prisma.widget.delete({ where: { id } });
  revalidatePath("/admin/widgets");
  revalidatePath("/", "layout");
  return { ok: true };
}
