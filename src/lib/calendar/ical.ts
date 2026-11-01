// iCalendar parsing (Airbnb/Hipcamp/VRBO imports) and generation (our
// outbound feeds that Airbnb imports). Pure functions — no I/O.

import ICAL from 'ical.js';
import { PROPERTY_TIMEZONE, addDays, isIsoDate } from '@/lib/booking/dates';

export interface ImportedEvent {
  uid: string | null;
  checkIn: string;
  checkOut: string;
  summary: string | null;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Calendar date of an ICAL.Time without letting the server timezone shift it. */
function toIsoDate(time: ICAL.Time): string {
  if (time.isDate) return `${time.year}-${pad(time.month)}-${pad(time.day)}`;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PROPERTY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(time.toJSDate());
}

export function parseICalFeed(icalData: string): ImportedEvent[] {
  const comp = new ICAL.Component(ICAL.parse(icalData));
  const events: ImportedEvent[] = [];
  const seen = new Set<string>();

  for (const vevent of comp.getAllSubcomponents('vevent')) {
    const status = String(vevent.getFirstPropertyValue('status') ?? '').toUpperCase();
    if (status === 'CANCELLED') continue;

    const event = new ICAL.Event(vevent);
    if (!event.startDate) continue;

    const checkIn = toIsoDate(event.startDate);
    let checkOut = event.endDate ? toIsoDate(event.endDate) : addDays(checkIn, 1);
    // A timed event ending on its start day still occupies that night.
    if (checkOut <= checkIn) checkOut = addDays(checkIn, 1);
    if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) continue;

    const key = `${checkIn}|${checkOut}|${event.uid ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    events.push({
      uid: event.uid || null,
      checkIn,
      checkOut,
      summary: event.summary || null,
    });
  }
  return events.sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1));
}

export interface ExportEvent {
  uid: string;
  start: string; // first night
  end: string; // check-out (exclusive)
  summary: string;
}

function escapeText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

const compact = (iso: string) => iso.replace(/-/g, '');

/** RFC 5545 feed of all-day blocks. Contains no guest details. */
export function buildICalFeed(calendarName: string, events: ExportEvent[], now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pine Valley at Dillard Mill//Direct Bookings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];
  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(e.start)}`,
      `DTEND;VALUE=DATE:${compact(e.end)}`,
      `SUMMARY:${escapeText(e.summary)}`,
      'TRANSP:OPAQUE',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

export type ImportedKind = "reservation" | "block";

/**
 * Real reservation, or a block? Platforms export both. Airbnb uses
 * "Reserved" for bookings and "Airbnb (Not available)" for anything blocked —
 * including dates it blocked because it imported *our* calendar. Blocks are
 * never passed on to other platforms (that is how echo loops start).
 * Unknown summaries count as reservations: safer to over-block here.
 */
export function classifyImportedEvent(summary: string | null | undefined): ImportedKind {
  return /not available|unavailable|blocked|closed/i.test(summary ?? "") ? "block" : "reservation";
}

/**
 * A block that sits entirely inside a pending website request's own dates is
 * almost certainly that request coming back from a platform that imported
 * our calendar. It must not stop the owner approving the request.
 */
export function isEchoOf(
  block: { start: string; end: string; kind?: ImportedKind },
  stay: { checkIn: string; checkOut: string },
): boolean {
  return block.kind === "block" && block.start >= stay.checkIn && block.end <= stay.checkOut;
}
