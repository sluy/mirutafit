"use client";

import { useEffect } from "react";

/**
 * Fires a one-time (per browser session) view beacon for `viewKey`.
 * Render it on any public page you want to count:
 *   <ViewCounter viewKey="page:home" />
 *   <ViewCounter viewKey={`article:${id}`} />
 */
export default function ViewCounter({ viewKey }: { viewKey: string }) {
  useEffect(() => {
    const storageKey = `viewed:${viewKey}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // sessionStorage unavailable — count anyway
    }
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // `ref` is where the visitor came from (traffic source) — the beacon's own
      // Referer header would just be this page, so we send document.referrer.
      body: JSON.stringify({ key: viewKey, ref: document.referrer || "" }),
      keepalive: true,
    }).catch(() => {});
  }, [viewKey]);

  return null;
}
