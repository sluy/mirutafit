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
      body: JSON.stringify({ key: viewKey }),
      keepalive: true,
    }).catch(() => {});
  }, [viewKey]);

  return null;
}
