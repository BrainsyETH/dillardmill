import { NextRequest, NextResponse } from "next/server";
import { rejectCrossSite } from "@/lib/admin/guard";
import { requireAdmin } from "@/lib/admin/require";
import { verifyHuman } from "@/lib/security/turnstile";
import { eventsPublished } from "./config";
import { eventInquirySchema } from "./input";
import { receiveEventInquiry } from "./service";
export async function handleEventInquiry(request: NextRequest, admin = false) {
  if (!admin && !eventsPublished())
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (admin) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;
  const raw = await request.text();
  if (raw.length > 16000)
    return NextResponse.json(
      { error: "Your message is too long." },
      { status: 413 },
    );
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Please check your details." },
      { status: 400 },
    );
  }
  const parsed = eventInquirySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message || "Please check your details.",
      },
      { status: 400 },
    );
  if (!admin) {
    const human = await verifyHuman(body.turnstileToken, "inquiry");
    if (human) return human;
  }
  try {
    const result = await receiveEventInquiry(parsed.data, !admin);
    // Public guests do not need the admin record identifier.
    return NextResponse.json(
      result.ok ? (admin ? result : { ok: true }) : result,
      { status: result.ok ? 200 : result.status },
    );
  } catch (error) {
    console.error(
      "Event inquiry could not be saved",
      error instanceof Error ? error.message : "Database error",
    );
    return NextResponse.json(
      {
        error:
          "We couldn’t save your inquiry. Please try again or call (314) 843-4321.",
      },
      { status: 503 },
    );
  }
}
