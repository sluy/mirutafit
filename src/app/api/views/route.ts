import { NextResponse, after, type NextRequest } from "next/server";
import { recordView, recordVisitEvent, isValidViewKey } from "@/lib/views";
import { notifyView, visitorFromHeaders } from "@/lib/notify";
import { geolocate } from "@/lib/geo";

// Fire-and-forget view beacon from <ViewCounter>. Public (anonymous).
export async function POST(req: NextRequest) {
  let body: { key?: unknown; ref?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const key = body?.key;
  if (typeof key !== "string" || !isValidViewKey(key)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await recordView(key);

  // Telegram notification + detailed visit event run after the response.
  const visitor = visitorFromHeaders(req.headers);
  const ref = typeof body.ref === "string" ? body.ref : undefined;
  after(async () => {
    // Geolocate once, share with both the notification and the stored event.
    const geo = visitor.ip ? await geolocate(visitor.ip) : null;
    await notifyView(key, { ...visitor, referer: ref, geo });
    await recordVisitEvent(key, {
      ip: visitor.ip,
      userAgent: visitor.userAgent,
      referer: ref,
      countryCode: visitor.country,
      geo,
    });
  });
  return NextResponse.json({ ok: true });
}
