import { NextResponse, after, type NextRequest } from "next/server";
import { recordView, isValidViewKey } from "@/lib/views";
import { notifyView, visitorFromHeaders } from "@/lib/notify";

// Fire-and-forget view beacon from <ViewCounter>. Public (anonymous).
export async function POST(req: NextRequest) {
  let key: unknown;
  try {
    key = (await req.json())?.key;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof key !== "string" || !isValidViewKey(key)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await recordView(key);
  // Telegram notification (if the entity opted in) runs after the response.
  const visitor = visitorFromHeaders(req.headers);
  after(() => notifyView(key as string, visitor));
  return NextResponse.json({ ok: true });
}
