import { NextRequest, NextResponse } from "next/server";
import {
  getBookableUnit,
  CALENDAR_SOURCES,
  type CalendarSource,
} from "@/lib/booking/units";
import { getUnavailableRanges } from "@/lib/db/availability";
import { buildICalFeed } from "@/lib/calendar/ical";
import { addDays, todayAtProperty } from "@/lib/booking/dates";
import { getInventoryUnits } from "@/lib/booking/inventory";

export const dynamic = "force-dynamic";

// Outbound calendar that Airbnb (or Hipcamp/VRBO) imports:
//   /calendar/<unit-slug>.ics?token=<CALENDAR_FEED_TOKEN>&for=airbnb
// Contains direct bookings (requested + confirmed), owner blocks, and
// reservations from the *other* channels. `for=airbnb` leaves out Airbnb's
// own reservations so they are not echoed back to Airbnb.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const match = /^([a-z0-9-]+)\.ics$/.exec(file);
  if (!match) return new NextResponse("Not found", { status: 404 });

  const expectedToken = process.env.CALENDAR_FEED_TOKEN;
  if (
    expectedToken &&
    request.nextUrl.searchParams.get("token") !== expectedToken
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const unit = await getBookableUnit(match[1]);
  if (!unit) return new NextResponse("Not found", { status: 404 });

  const forChannel = request.nextUrl.searchParams.get(
    "for",
  ) as CalendarSource | null;
  const exclude =
    forChannel && CALENDAR_SOURCES.includes(forChannel) ? forChannel : null;

  const from = addDays(todayAtProperty(), -30);
  const inventory = await getInventoryUnits(unit);
  const ranges = await getUnavailableRanges(
    unit._id,
    from,
    addDays(from, 730),
    inventory.map((u) => u._id),
  );
  const events = ranges
    .filter((r) => r.source !== exclude || r.unitId !== unit._id)
    .map((r) => ({
      uid: `${r.unitId}-${r.source}-${r.ref}@dillardmill.com`,
      start: r.start,
      end: r.end,
      summary:
        r.source === "direct" ? "Reserved — dillardmill.com" : "Not available",
    }));

  return new NextResponse(buildICalFeed(`${unit.name} — Pine Valley`, events), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
