import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { rejectCrossSite } from "@/lib/admin/guard";
import { requireAdmin } from "@/lib/admin/require";
import { eventActionSchema } from "@/lib/events/input";
import { EventConflict, updateEvent } from "@/lib/events/service";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  let actor;
  try {
    actor = (await requireAdmin()).identity;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success)
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  const raw = await request.text();
  if (raw.length > 24000)
    return NextResponse.json(
      { error: "The update is too long." },
      { status: 413 },
    );
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Check your details." }, { status: 400 });
  }
  const parsed = eventActionSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message },
      { status: 400 },
    );
  try {
    await updateEvent(id, parsed.data, actor);
    for (const path of [
      "/admin/events",
      `/admin/events/${id}`,
      "/admin/calendar",
      "/lodging",
    ])
      revalidatePath(path);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof EventConflict)
      return NextResponse.json({ error: error.message }, { status: 409 });
    console.error(
      "Event update failed",
      error instanceof Error ? error.message : "Database error",
    );
    return NextResponse.json(
      { error: "The event could not be updated. Reload and try again." },
      { status: 503 },
    );
  }
}
