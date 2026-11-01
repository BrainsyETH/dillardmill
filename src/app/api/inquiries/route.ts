import { NextRequest, NextResponse } from "next/server";
import { messageSchema, receiveGuestMessage } from "@/lib/inquiries";
import { verifyHuman } from "@/lib/security/turnstile";
import { rejectCrossSite } from "@/lib/admin/guard";

export async function POST(request: NextRequest) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const raw = await request.text();
  if (raw.length > 16000)
    return NextResponse.json(
      { error: "Your message is too long." },
      { status: 413 },
    );
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Please check your message." },
      { status: 400 },
    );
  }
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Please check your details.",
      },
      { status: 400 },
    );
  const human = await verifyHuman(
    (body as Record<string, unknown>).turnstileToken,
    "inquiry",
  );
  if (human) return human;
  try {
    const result = await receiveGuestMessage(parsed.data);
    return NextResponse.json(result, {
      status: result.ok ? 200 : result.status,
    });
  } catch (error) {
    console.error(
      "Guest message could not be saved",
      error instanceof Error ? error.message : "Storage error",
    );
    return NextResponse.json(
      {
        error:
          "We couldn’t save your message. Please try again, or call (314) 843-4321.",
      },
      { status: 503 },
    );
  }
}
