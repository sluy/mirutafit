import { after } from "next/server";
import { getPublishedStaticPage } from "@/lib/static-pages";
import { getMaintenanceSettings } from "@/lib/settings";
import { getSessionUser, isAdmin } from "@/lib/auth-guard";
import { recordView } from "@/lib/views";
import { notifyView, visitorFromHeaders } from "@/lib/notify";

// Always hit the DB — pages are edited from the admin and must reflect instantly.
export const dynamic = "force-dynamic";

/**
 * Serves an admin-authored static page verbatim at /static/<slug>.
 * This is a route handler (not a page), so the response never passes through the
 * site's root layout, i18n or maintenance gate — it is a fully standalone page.
 * A page can opt into the maintenance gate via its `respectMaintenance` flag.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const page = await getPublishedStaticPage(slug);
  if (!page) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // Optional maintenance gate (admins always see the real page).
  if (page.respectMaintenance) {
    const m = await getMaintenanceSettings();
    if (m.enabled && !isAdmin(await getSessionUser())) {
      return new Response(maintenanceHtml(m.title, m.message), {
        status: 503,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-robots-tag": "noindex",
          "retry-after": "3600",
        },
      });
    }
  }

  // Count the visit + notify (if this page opted in) after the response is sent.
  const visitor = visitorFromHeaders(req.headers);
  after(async () => {
    await recordView(`page:${slug}`);
    await notifyView(`page:${slug}`, visitor);
  });

  return new Response(page.html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal standalone maintenance notice, matching MaintenanceScreen's look. */
function maintenanceHtml(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<style>
  :root { --brand: #10b981; --ink: #0f1620; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center; padding: 24px;
    background: var(--ink); color: #fff;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
  .badge { width: 64px; height: 64px; border-radius: 16px; background: var(--brand);
    display: grid; place-items: center; margin-bottom: 24px; }
  .brand { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
  .brand span { color: var(--brand); }
  h1 { font-size: clamp(28px, 5vw, 40px); font-weight: 800; max-width: 640px; margin: 16px 0 0; }
  p { margin: 16px 0 0; max-width: 520px; color: rgba(255,255,255,.7);
    line-height: 1.6; white-space: pre-wrap; }
</style>
</head>
<body>
  <div class="badge">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M12 21s-7-4.35-9.5-8.5C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 7C19 16.65 12 21 12 21z"/></svg>
  </div>
  <div class="brand">Mi<span>Ruta</span>Fit</div>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(message)}</p>
</body>
</html>`;
}
