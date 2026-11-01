// Everything that makes a night unavailable for a unit: direct bookings that
// hold dates, owner blocks, and reservations imported from other channels.

import { sql } from "./client";
import { dbDate as iso } from "@/lib/booking/dates";

export type UnavailableSource =
  | "direct"
  | "block"
  | "airbnb"
  | "hipcamp"
  | "vrbo";

export interface UnavailableRange {
  unitId: string;
  start: string; // first night
  end: string; // exclusive
  source: UnavailableSource;
  ref: string; // stable id for feeds
  label?: string | null;
}

export async function getUnavailableRanges(
  unitId: string,
  from: string,
  to: string,
  relatedUnitIds: string[] = [unitId],
  excludeBookingId: string | null = null,
): Promise<UnavailableRange[]> {
  const rows = await sql`
    SELECT check_in AS start, check_out AS "end", 'direct' AS source,
           id::text AS ref, NULL AS label, unit_id
      FROM bookings
     WHERE unit_id = ANY(${relatedUnitIds}::text[])
       AND (${excludeBookingId}::uuid IS NULL OR id <> ${excludeBookingId}::uuid)
       AND booking_status IN ('pending_payment', 'requested', 'confirmed')
       AND check_in < ${to} AND check_out > ${from}
    UNION ALL
    SELECT start_date, end_date, 'block', id::text, note, unit_id
      FROM calendar_blocks
     WHERE unit_id = ANY(${relatedUnitIds}::text[]) AND start_date < ${to} AND end_date > ${from}
    UNION ALL
    SELECT check_in, check_out, source, COALESCE(external_id, id::text), summary, unit_id
      FROM external_bookings
     WHERE unit_id = ANY(${relatedUnitIds}::text[]) AND check_in < ${to} AND check_out > ${from}
    ORDER BY 1
  `;
  return rows.map((r) => ({
    unitId: String(r.unit_id),
    start: iso(r.start),
    end: iso(r.end),
    source: r.source as UnavailableSource,
    ref: String(r.ref),
    label: (r.label as string | null) ?? null,
  }));
}

/** True when no booking, block, or imported reservation touches these nights. */
export async function isRangeFree(
  unitId: string,
  checkIn: string,
  checkOut: string,
  relatedUnitIds?: string[],
  excludeBookingId?: string,
) {
  const ranges = await getUnavailableRanges(
    unitId,
    checkIn,
    checkOut,
    relatedUnitIds,
    excludeBookingId,
  );
  return ranges.length === 0;
}

// --- Owner blocks -----------------------------------------------------------

export interface CalendarBlock {
  id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  note: string | null;
}

export async function listBlocks(): Promise<CalendarBlock[]> {
  const rows = await sql`
    SELECT id, unit_id, start_date, end_date, note FROM calendar_blocks
    WHERE end_date >= CURRENT_DATE ORDER BY start_date
  `;
  return rows.map((r) => ({
    ...(r as CalendarBlock),
    start_date: iso(r.start_date),
    end_date: iso(r.end_date),
  }));
}

export async function createBlock(
  unitId: string,
  start: string,
  end: string,
  note: string | null,
) {
  await sql`
    INSERT INTO calendar_blocks (unit_id, start_date, end_date, note)
    VALUES (${unitId}, ${start}, ${end}, ${note})
  `;
}

export async function deleteBlock(id: string) {
  await sql`DELETE FROM calendar_blocks WHERE id = ${id}`;
}
