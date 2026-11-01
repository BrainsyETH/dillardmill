// Direct-booking persistence.
//
// Lifecycle (request-to-book):
//   pending_payment ─┬─ card authorized ─→ requested ─┬─ owner approves (capture) ─→ confirmed ─→ cancelled (refund)
//                    └─ auth fails ─────→ failed      ├─ owner declines (void) ───→ declined
//                                                     └─ no response (void) ─────→ expired
//
// pending_payment, requested and confirmed hold the dates; the
// bookings_no_overlap exclusion constraint (db/migrations/001) makes a
// double booking impossible at the database level.

import { randomInt } from 'node:crypto';
import { sql } from './client';
import type { Quote } from '@/lib/booking/pricing';
import { dbDate } from '@/lib/booking/dates';

export type BookingStatus =
  | 'pending_payment'
  | 'requested'
  | 'confirmed'
  | 'declined'
  | 'expired'
  | 'cancelled'
  | 'completed'
  | 'failed';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'voided'
  | 'refunded'
  | 'partially_refunded'
  | 'failed';

export const ACTIVE_STATUSES: BookingStatus[] = ['pending_payment', 'requested', 'confirmed'];

export interface BookingRow {
  id: string;
  created_at: string;
  updated_at: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  unit_id: string;
  unit_slug: string | null;
  unit_name: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  num_pets: number;
  num_nights: number;
  base_price: number;
  cleaning_fee: number;
  tax_amount: number;
  total_amount: number;
  quote: Quote | null;
  payment_id: string | null;
  payment_status: PaymentStatus;
  payment_method: string | null;
  booking_status: BookingStatus;
  special_requests: string | null;
  confirmation_code: string;
  policies_accepted_at: string | null;
  expires_at: string | null;
  decided_at: string | null;
  decision_note: string | null;
  refund_id: string | null;
  refunded_amount: number;
}

/** Normalize a raw row: DATE columns as 'YYYY-MM-DD', counters as numbers. */
function row(r: Record<string, unknown> | undefined): BookingRow | undefined {
  if (!r) return undefined;
  return {
    ...(r as unknown as BookingRow),
    check_in: dbDate(r.check_in),
    check_out: dbDate(r.check_out),
  };
}
const rows = (rs: Record<string, unknown>[]) => rs.map((r) => row(r)!);

// Unambiguous characters (no 0/O, 1/I/L).
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generateConfirmationCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `PV-${code}`;
}

/** Postgres exclusion-constraint violation: the dates were taken. */
function isOverlapError(error: unknown): boolean {
  const e = error as { code?: string; constraint?: string; message?: string };
  return e?.code === '23P01' || /bookings_no_overlap/.test(e?.message ?? '');
}

export interface HoldInput {
  unitId: string;
  unitSlug: string;
  unitName: string;
  quote: Quote;
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  specialRequests?: string | null;
}

export type HoldResult = { ok: true; booking: BookingRow } | { ok: false; reason: 'dates_taken' };

/** Reserve the dates before touching the card. */
export async function holdBooking(input: HoldInput): Promise<HoldResult> {
  const q = input.quote;
  try {
    const inserted = await sql`
      INSERT INTO bookings (
        guest_name, guest_email, guest_phone,
        unit_id, unit_slug, unit_name,
        check_in, check_out, num_guests, num_pets, num_nights,
        base_price, cleaning_fee, tax_amount, total_amount, quote,
        payment_status, payment_method, booking_status,
        special_requests, confirmation_code, policies_accepted_at
      ) VALUES (
        ${input.guestName}, ${input.guestEmail}, ${input.guestPhone ?? null},
        ${input.unitId}, ${input.unitSlug}, ${input.unitName},
        ${q.checkIn}, ${q.checkOut}, ${q.guests}, ${q.pets}, ${q.numNights},
        ${q.lodgingCents}, ${q.cleaningCents}, ${q.taxCents}, ${q.totalCents}, ${JSON.stringify(q)},
        'pending', 'square', 'pending_payment',
        ${input.specialRequests ?? null}, ${generateConfirmationCode()}, now()
      )
      RETURNING *
    `;
    return { ok: true, booking: row(inserted[0])! };
  } catch (error) {
    if (isOverlapError(error)) return { ok: false, reason: 'dates_taken' };
    throw error;
  }
}

export async function markRequested(id: string, paymentId: string, expiresAt: Date) {
  const result = await sql`
    UPDATE bookings
    SET booking_status = 'requested', payment_status = 'authorized',
        payment_id = ${paymentId}, expires_at = ${expiresAt.toISOString()}, updated_at = now()
    WHERE id = ${id} AND booking_status = 'pending_payment'
    RETURNING *
  `;
  return row(result[0]);
}

export async function markFailed(id: string, note: string) {
  await sql`
    UPDATE bookings
    SET booking_status = 'failed', payment_status = 'failed',
        decision_note = ${note}, updated_at = now()
    WHERE id = ${id} AND booking_status = 'pending_payment'
  `;
}

/**
 * Move a booking from one status to another, only if it is still in the
 * expected status (guards against double clicks and races with the expiry job).
 */
export async function transitionBooking(
  id: string,
  from: BookingStatus,
  to: BookingStatus,
  paymentStatus: PaymentStatus,
  note?: string | null,
) {
  const rows = await sql`
    UPDATE bookings
    SET booking_status = ${to}, payment_status = ${paymentStatus},
        decided_at = now(), decision_note = COALESCE(${note ?? null}, decision_note),
        updated_at = now()
    WHERE id = ${id} AND booking_status = ${from}
    RETURNING *
  `;
  return row(rows[0]);
}

export async function setPaymentStatus(id: string, paymentStatus: PaymentStatus) {
  await sql`UPDATE bookings SET payment_status = ${paymentStatus}, updated_at = now() WHERE id = ${id}`;
}

export async function recordRefund(id: string, refundId: string, amountCents: number) {
  const rows = await sql`
    UPDATE bookings
    SET refund_id = ${refundId},
        refunded_amount = refunded_amount + ${amountCents},
        payment_status = CASE
          WHEN refunded_amount + ${amountCents} >= total_amount THEN 'refunded'
          ELSE 'partially_refunded' END,
        updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return row(rows[0]);
}

export async function getBookingById(id: string) {
  const rows = await sql`SELECT * FROM bookings WHERE id = ${id}`;
  return row(rows[0]);
}

export async function getBookingByConfirmation(code: string) {
  const rows = await sql`SELECT * FROM bookings WHERE confirmation_code = ${code}`;
  return row(rows[0]);
}

export async function listBookings(scope: 'action' | 'upcoming' | 'past' | 'all') {
  const result =
    scope === 'action'
      ? await sql`SELECT * FROM bookings WHERE booking_status = 'requested' ORDER BY expires_at ASC`
      : scope === 'upcoming'
        ? await sql`SELECT * FROM bookings WHERE check_out >= CURRENT_DATE
            AND booking_status IN ('requested', 'confirmed') ORDER BY check_in ASC`
        : scope === 'past'
          ? await sql`SELECT * FROM bookings WHERE check_out < CURRENT_DATE
              ORDER BY check_in DESC LIMIT 200`
          : await sql`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 200`;
  return rows(result);
}

/** Requests whose approval window has passed. */
export async function listExpiredRequests() {
  const result = await sql`
    SELECT * FROM bookings
    WHERE booking_status = 'requested' AND expires_at < now()
  `;
  return rows(result);
}

/** Holds abandoned mid-authorization (browser closed, function timeout). */
export async function releaseStaleHolds(olderThanMinutes = 15) {
  await sql`
    UPDATE bookings
    SET booking_status = 'failed', payment_status = 'failed',
        decision_note = 'Hold released: payment authorization never completed', updated_at = now()
    WHERE booking_status = 'pending_payment'
      AND created_at < now() - make_interval(mins => ${olderThanMinutes})
  `;
}
