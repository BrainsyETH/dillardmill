import { NextRequest, NextResponse } from "next/server";
import { getBookableUnit } from "@/lib/booking/units";
import { getInventoryUnits } from "@/lib/booking/inventory";
import { getUnavailableRanges } from "@/lib/db/availability";
import { syncUnitIfStale } from "@/lib/calendar/sync";
import { addDays, isIsoDate, todayAtProperty } from "@/lib/booking/dates";

export const dynamic = "force-dynamic";

// Unavailable date ranges for one unit, for the guest calendar. Returns only
// start/end dates — never sources, names, or booking details.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const slug = params.get("unit");
  const today = todayAtProperty();
  const from = isIsoDate(params.get("from")) ? params.get("from")! : today;
  const to = isIsoDate(params.get("to"))
    ? params.get("to")!
    : addDays(from, 366);
  if (!slug)
    return NextResponse.json({ error: "unit is required" }, { status: 400 });

  try {
    const unit = await getBookableUnit(slug);
    if (!unit)
      return NextResponse.json({ error: "Unknown unit" }, { status: 404 });

    // Keep the calendar close to Airbnb even if the scheduled sync is slow.
    const inventory = await getInventoryUnits(unit);
    await Promise.all(inventory.map((u) => syncUnitIfStale(u, 15))).catch((e) =>
      console.error("Lazy sync failed", e),
    );

    const ranges = await getUnavailableRanges(
      unit._id,
      from,
      to,
      inventory.map((u) => u._id),
    );
    return NextResponse.json(
      {
        minStay: unit.minStay ?? 1,
        ranges: ranges.map(({ start, end }) => ({ start, end })),
      },
      { headers: { "Cache-Control": "private, max-age=60" } },
    );
  } catch (error) {
    console.error("Booked dates error:", error);
    return NextResponse.json(
      { error: "Failed to load availability" },
      { status: 500 },
    );
  }
}
