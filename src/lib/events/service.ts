import { sql } from "@/lib/db/client";
import { dbDate } from "@/lib/booking/dates";
import { getAllBookableUnits } from "@/lib/booking/units";
import { syncUnit } from "@/lib/calendar/sync";
import {
  acknowledgeEventInquiry,
  notifyEventOwner,
  remindEventHold,
} from "./email";
import type { EventAction, EventInquiry } from "./input";

export async function receiveEventInquiry(input: EventInquiry, notify = true) {
  const existing =
    await sql`SELECT id FROM guest_messages WHERE submission_id = ${input.submissionId}`;
  if (existing.length) return { ok: true as const, id: String(existing[0].id) };
  const recent =
    await sql`SELECT count(*)::int AS count FROM guest_messages WHERE email = ${input.email} AND created_at > now() - interval '1 hour'`;
  if (notify && Number(recent[0]?.count) >= 5)
    return {
      ok: false as const,
      status: 429,
      error:
        "We have your recent inquiries. Please call if you need us sooner.",
    };
  const rows = await sql`
    INSERT INTO guest_messages(submission_id, kind, name, email, phone, unit_slug, guests, message,
      event_type, event_origin, event_date, date_flexibility, overnight_guests, package_id, budget, referral_source)
    VALUES (${input.submissionId}, 'event', ${input.name}, ${input.email}, ${input.phone || null}, 'book-the-farm', ${input.guests}, ${input.message},
      ${input.eventType}, ${notify ? "website" : "owner"}, ${input.eventDate || null}, ${input.dateFlexibility || null}, ${input.overnightGuests ?? null}, ${input.packageId || null}, ${input.budget || null}, ${input.referralSource || null})
    ON CONFLICT (submission_id) DO NOTHING RETURNING id
  `;
  const id =
    rows[0]?.id ||
    (
      await sql`SELECT id FROM guest_messages WHERE submission_id = ${input.submissionId}`
    )[0].id;
  if (rows.length && notify) {
    const [owner, guest] = await Promise.all([
      notifyEventOwner(input, String(id)),
      acknowledgeEventInquiry(input),
    ]);
    // Delivery failure never loses a durable inquiry or invites a duplicate.
    try {
      await sql`UPDATE guest_messages SET owner_notified = ${owner}, guest_notified = ${guest} WHERE id = ${id}`;
    } catch (error) {
      console.error(
        "Event delivery status could not be saved",
        error instanceof Error ? error.message : "Database error",
      );
    }
  }
  return { ok: true as const, id: String(id) };
}

export interface EventLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_type: string;
  event_origin: "website" | "owner";
  event_date: string | null;
  date_flexibility: string | null;
  guests: number;
  overnight_guests: number | null;
  package_id: string | null;
  budget: string | null;
  referral_source: string | null;
  message: string;
  event_stage: "new" | "replied" | "tour" | "closed";
  assigned_to: string | null;
  follow_up_on: string | null;
  admin_notes: string | null;
  owner_notified: boolean;
  guest_notified: boolean;
}
export interface EventReservation {
  id: string;
  message_id: string;
  start_date: string;
  end_date: string;
  status: "held" | "confirmed" | "released" | "expired";
  expires_at: string | null;
}
function lead(r: Record<string, unknown>): EventLead {
  return {
    ...r,
    event_date: r.event_date ? dbDate(r.event_date) : null,
    follow_up_on: r.follow_up_on ? dbDate(r.follow_up_on) : null,
  } as unknown as EventLead;
}
function reservation(r: Record<string, unknown>): EventReservation {
  return {
    ...r,
    start_date: dbDate(r.start_date),
    end_date: dbDate(r.end_date),
    expires_at: r.expires_at
      ? new Date(String(r.expires_at)).toISOString()
      : null,
  } as unknown as EventReservation;
}
export async function expireEventHolds() {
  const rows =
    await sql`UPDATE event_reservations SET status = 'expired', updated_at = now(), updated_by = 'expiry'
    WHERE status = 'held' AND expires_at <= now() RETURNING id`;
  return rows.length;
}
export async function listEventLeads() {
  await expireEventHolds();
  const rows =
    await sql`SELECT m.*, e.status AS reservation_status, e.expires_at
    FROM guest_messages m LEFT JOIN event_reservations e ON e.message_id = m.id AND e.status IN ('held', 'confirmed')
    WHERE m.kind = 'event' ORDER BY m.created_at DESC LIMIT 200`;
  return rows.map((r) => ({
    ...lead(r),
    reservation_status: r.reservation_status as string | null,
  }));
}
export async function getEventLead(id: string) {
  await expireEventHolds();
  const [rows, reservations] = await Promise.all([
    sql`SELECT * FROM guest_messages WHERE id = ${id} AND kind = 'event'`,
    sql`SELECT * FROM event_reservations WHERE message_id = ${id} ORDER BY created_at DESC`,
  ]);
  return rows.length
    ? { lead: lead(rows[0]), reservations: reservations.map(reservation) }
    : null;
}

export async function getEventBlocks(start: string, end: string) {
  const rows =
    await sql`SELECT unit_id, source, check_in, check_out FROM external_bookings
    WHERE kind = 'block' AND check_in < ${end} AND check_out > ${start} ORDER BY unit_id, check_in`;
  return rows.map((r) => ({
    key: `${r.unit_id}|${r.source}|${dbDate(r.check_in)}|${dbDate(r.check_out)}`,
    unit: String(r.unit_id),
    source: String(r.source),
    start: dbDate(r.check_in),
    end: dbDate(r.check_out),
  }));
}
export class EventConflict extends Error {}
export async function updateEvent(
  id: string,
  action: EventAction,
  actor: string,
) {
  await expireEventHolds();
  if (
    !(
      await sql`SELECT id FROM guest_messages WHERE id = ${id} AND kind = 'event'`
    ).length
  )
    throw new EventConflict("Event inquiry not found.");
  if (action.action === "update") {
    const rows =
      await sql`UPDATE guest_messages SET event_stage = ${action.stage}, assigned_to = ${action.assignedTo || null},
      follow_up_on = ${action.followUpOn || null}, admin_notes = ${action.notes || null}
      WHERE id = ${id} AND (${action.stage} <> 'closed' OR NOT EXISTS
        (SELECT 1 FROM event_reservations WHERE message_id = ${id} AND status IN ('held', 'confirmed'))) RETURNING id`;
    if (!rows.length)
      throw new EventConflict(
        "Release the reserved dates before closing this inquiry.",
      );
    return;
  }
  if (action.action === "hold" || action.action === "confirm") {
    const units = await getAllBookableUnits();
    const synced = (await Promise.all(units.map(syncUnit))).flat();
    if (synced.some((s) => !s.success))
      throw new EventConflict(
        "A connected calendar could not be refreshed. Try again after checking its calendar link.",
      );
  }
  try {
    if (action.action === "hold") {
      // Reap expired holds above before inserting under the one-active index.
      await sql`INSERT INTO event_reservations(message_id, start_date, end_date, expires_at, created_by, updated_by)
        VALUES (${id}, ${action.start}, ${action.end}, (${action.expiresOn}::date + interval '1 day') AT TIME ZONE 'America/Chicago', ${actor}, ${actor})`;
      await sql`UPDATE guest_messages SET event_stage = 'replied' WHERE id = ${id} AND event_stage = 'closed'`;
      return;
    }
    let changed;
    if (action.action === "extend") {
      changed =
        await sql`UPDATE event_reservations SET expires_at = (${action.expiresOn}::date + interval '1 day') AT TIME ZONE 'America/Chicago',
        reminder_sent_at = NULL, reminder_claimed_at = NULL, updated_at = now(), updated_by = ${actor}
        WHERE id = ${action.reservationId} AND message_id = ${id} AND status = 'held' AND expires_at > now() RETURNING id`;
    } else if (action.action === "confirm") {
      changed =
        await sql`UPDATE event_reservations SET status = 'confirmed', reviewed_external_blocks = ${action.externalBlockKeys}::text[], expires_at = NULL, updated_at = now(), updated_by = ${actor}
        WHERE id = ${action.reservationId} AND message_id = ${id} AND status = 'held' AND expires_at > now() RETURNING id`;
    } else {
      changed =
        await sql`UPDATE event_reservations SET status = 'released', updated_at = now(), updated_by = ${actor}
        WHERE id = ${action.reservationId} AND message_id = ${id} AND status IN ('held', 'confirmed') RETURNING id`;
    }
    if (!changed.length)
      throw new EventConflict(
        "This reservation changed or expired. Reload the event before trying again.",
      );
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "23P01" || code === "23505")
      throw new EventConflict(
        "These dates overlap a booking, date hold, or calendar block. Review the calendar before trying again.",
      );
    throw error;
  }
}
export async function processEventHolds() {
  const expired = await expireEventHolds();
  const claimed =
    await sql`UPDATE event_reservations SET reminder_claimed_at = now()
    WHERE id IN (SELECT id FROM event_reservations WHERE status = 'held' AND expires_at > now() AND expires_at <= now() + interval '24 hours'
      AND reminder_sent_at IS NULL AND (reminder_claimed_at IS NULL OR reminder_claimed_at < now() - interval '15 minutes')
      FOR UPDATE SKIP LOCKED) RETURNING id, message_id, expires_at`;
  let reminded = 0;
  for (const r of claimed) {
    const [m] =
      await sql`SELECT name FROM guest_messages WHERE id = ${r.message_id}`;
    const sent = await remindEventHold({
      name: String(m.name),
      id: String(r.message_id),
      expires_at: String(r.expires_at),
    });
    await sql`UPDATE event_reservations SET reminder_sent_at = CASE WHEN ${sent} THEN now() ELSE NULL END, reminder_claimed_at = NULL
      WHERE id = ${r.id} AND expires_at = ${r.expires_at} AND status = 'held'`;
    if (sent) reminded++;
  }
  return { expired, reminded };
}
