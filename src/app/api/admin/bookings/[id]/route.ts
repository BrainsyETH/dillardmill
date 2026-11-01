import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rejectCrossSite } from "@/lib/admin/guard";
import {
  approveBooking,
  cancelBooking,
  declineBooking,
} from "@/lib/booking/service";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    calendarsCheckedManually: z.boolean().optional(),
    confirmedBlockKeys: z.array(z.string().max(300)).max(100).optional(),
  }),
  z.object({
    action: z.literal("decline"),
    note: z.string().max(1000).optional(),
  }),
  z.object({
    action: z.literal("cancel"),
    refundCents: z.number().int().min(0),
    note: z.string().max(1000).optional(),
  }),
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const body = parsed.data;
  try {
    const result =
      body.action === "approve"
        ? await approveBooking(id, {
            calendarsCheckedManually: body.calendarsCheckedManually,
            confirmedBlockKeys: body.confirmedBlockKeys,
          })
        : body.action === "decline"
          ? await declineBooking(id, body.note)
          : await cancelBooking(id, body.refundCents, body.note);
    if (!result.ok)
      return NextResponse.json(
        { error: result.error, code: result.code, blocks: result.blocks },
        { status: result.status },
      );
    return NextResponse.json({
      ok: true,
      status: result.booking.booking_status,
    });
  } catch (error) {
    console.error(`Admin ${body.action} failed:`, error);
    return NextResponse.json(
      { error: "Action failed; nothing was changed. Try again." },
      { status: 500 },
    );
  }
}
