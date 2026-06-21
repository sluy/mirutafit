"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import {
  getNavbarConfig,
  saveNavbarConfig,
  getFooterConfig,
  saveFooterConfig,
} from "@/lib/settings";
import type { NavbarConfig, FooterConfig } from "@/widgets/types";

export async function loadNavbarConfigAction(): Promise<NavbarConfig> {
  await requireAdmin();
  return getNavbarConfig();
}

export async function saveNavbarConfigAction(
  config: NavbarConfig,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await saveNavbarConfig(config);
  revalidatePath("/", "layout"); // navbar shows on all pages
  return { ok: true };
}

export async function loadFooterConfigAction(): Promise<FooterConfig> {
  await requireAdmin();
  return getFooterConfig();
}

export async function saveFooterConfigAction(
  config: FooterConfig,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await saveFooterConfig(config);
  revalidatePath("/", "layout"); // footer shows on all pages
  return { ok: true };
}
