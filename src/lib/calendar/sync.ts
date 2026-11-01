// Inbound calendar sync: mirror each unit's Airbnb / Hipcamp / VRBO iCal
// export into external_bookings. Each successful fetch REPLACES the stored
// set for (unit, source), so cancellations and date changes on Airbnb free
// the dates here on the next sync. A failed fetch keeps the last good data.

import { sql } from "../db/client";
import { parseICalFeed } from "./ical";
import {
  CALENDAR_SOURCES,
  getAllBookableUnits,
  type BookableUnit,
  type CalendarSource,
} from "@/lib/booking/units";

const FETCH_TIMEOUT_MS = 8000;

export interface SyncResult {
  unit: string;
  source: CalendarSource;
  success: boolean;
  count?: number;
  error?: string;
}

async function fetchFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PineValley-CalendarSync/1.0 (+https://dillardmill.com)",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  const body = await response.text();
  if (!body.includes("BEGIN:VCALENDAR"))
    throw new Error("Response is not an iCalendar feed");
  return body;
}

export async function syncUnitSource(
  unit: Pick<BookableUnit, "_id" | "name">,
  source: CalendarSource,
  url: string,
): Promise<SyncResult> {
  await sql`
    INSERT INTO calendar_sync_status (unit_id, source, last_attempt_at)
    VALUES (${unit._id}, ${source}, now())
    ON CONFLICT (unit_id, source) DO UPDATE SET last_attempt_at = now()
  `;
  try {
    // A channel may re-export an imported website block. Do not make it a
    // new external reservation that would survive the original cancellation.
    const events = parseICalFeed(await fetchFeed(url)).filter(
      (e) => !e.uid?.endsWith("@dillardmill.com"),
    );
    await sql.transaction([
      sql`DELETE FROM external_bookings WHERE unit_id = ${unit._id} AND source = ${source}`,
      ...events.map(
        (e) => sql`
          INSERT INTO external_bookings (unit_id, check_in, check_out, source, external_id, summary)
          VALUES (${unit._id}, ${e.checkIn}, ${e.checkOut}, ${source}, ${e.uid}, ${e.summary})
        `,
      ),
      sql`
        UPDATE calendar_sync_status
        SET last_success_at = now(), last_error = NULL, event_count = ${events.length}
        WHERE unit_id = ${unit._id} AND source = ${source}
      `,
    ]);
    return { unit: unit.name, source, success: true, count: events.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sql`
      UPDATE calendar_sync_status SET last_error = ${message}
      WHERE unit_id = ${unit._id} AND source = ${source}
    `;
    console.error(`Calendar sync failed: ${unit.name} / ${source}: ${message}`);
    return { unit: unit.name, source, success: false, error: message };
  }
}

/** Sync every configured feed of one unit. */
export async function syncUnit(unit: BookableUnit): Promise<SyncResult[]> {
  const jobs = CALENDAR_SOURCES.flatMap((source) => {
    const url = unit.icalUrls[source];
    return url ? [syncUnitSource(unit, source, url)] : [];
  });
  return Promise.all(jobs);
}

/**
 * Sync a unit only if its last successful sync is older than maxAgeMinutes.
 * Used when a guest opens the calendar so availability is never far behind
 * Airbnb even if the scheduled job runs rarely.
 */
export async function syncUnitIfStale(
  unit: BookableUnit,
  maxAgeMinutes: number,
) {
  const configured = CALENDAR_SOURCES.filter((s) => unit.icalUrls[s]);
  if (configured.length === 0) return [];
  const rows = await sql`
    SELECT source FROM calendar_sync_status
    WHERE unit_id = ${unit._id}
      AND last_success_at > now() - make_interval(mins => ${maxAgeMinutes})
  `;
  const freshSources = new Set(rows.map((r) => r.source as string));
  const stale = configured.filter((s) => !freshSources.has(s));
  return Promise.all(
    stale.map((s) => syncUnitSource(unit, s, unit.icalUrls[s]!)),
  );
}

export async function syncAllExternalCalendars(): Promise<SyncResult[]> {
  const units = await getAllBookableUnits();
  const results = await Promise.all(units.map(syncUnit));
  return results.flat();
}

export interface SyncStatusRow {
  unit_id: string;
  source: CalendarSource;
  last_attempt_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  event_count: number | null;
}

export async function getSyncStatus(): Promise<SyncStatusRow[]> {
  return (await sql`SELECT * FROM calendar_sync_status ORDER BY unit_id, source`) as SyncStatusRow[];
}
