"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { saveTelegramSettings, type TelegramSettings } from "@/lib/settings";
import { sendTelegramMessageWith } from "@/lib/telegram";

/** Save the Telegram bot credentials (see docs/notifications.md). */
export async function saveTelegramAction(
  settings: TelegramSettings,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await saveTelegramSettings({
    enabled: settings.enabled,
    botToken: settings.botToken.trim(),
    chatId: settings.chatId.trim(),
  });
  return { ok: true };
}

/**
 * Send a test message with the entered (not necessarily saved) credentials so
 * the admin can verify the bot before saving.
 */
export async function testTelegramAction(
  botToken: string,
  chatId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  return sendTelegramMessageWith(
    botToken.trim(),
    chatId.trim(),
    "✅ <b>MiRutaFit</b> — notificación de prueba. El bot está configurado correctamente.",
  );
}
