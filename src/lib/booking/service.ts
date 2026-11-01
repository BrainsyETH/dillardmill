// Request-to-book orchestration. Every path that changes a booking's status
// goes through here so payment and calendar state cannot drift apart.

import { z } from "zod";
import { quoteStay, type Quote } from "./pricing";
import { todayAtProperty } from "./dates";
import { getBookableUnit, getBookingSettings } from "./units";
import { getInventoryUnits } from "./inventory";
import {
  getBookingById,
  holdBooking,
  listExpiredRequests,
  markFailed,
  markRequested,
  recordRefund,
  releaseStaleHolds,
  setPaymentStatus,
  transitionBooking,
  type BookingRow,
} from "@/lib/db/bookings";
import { getUnavailableRanges, isRangeFree } from "@/lib/db/availability";
import { isEchoOf } from "@/lib/calendar/ical";
import { syncUnit } from "@/lib/calendar/sync";
import {
  authorizeCard,
  capturePayment,
  refundPayment,
  voidPayment,
} from "@/lib/square/payments";
import { squareErrorMessage } from "@/lib/square/client";
import {
  sendBookingCancelled,
  sendBookingConfirmed,
  sendOwnerNewRequest,
  sendRequestDeclined,
  sendRequestReceived,
} from "@/lib/email/resend";

export const bookingRequestSchema = z.object({
  unitSlug: z.string().min(1).max(100),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().int(),
  pets: z.number().int().default(0),
  guestName: z.string().trim().min(2).max(120),
  guestEmail: z.string().trim().toLowerCase().email().max(200),
  guestPhone: z.string().trim().min(7).max(40),
  specialRequests: z.string().trim().max(2000).optional().nullable(),
  acceptedPolicies: z.literal(true),
  sourceId: z.string().min(1),
  verificationToken: z.string().optional(),
  idempotencyKey: z.string().uuid(),
  expectedTotalCents: z.number().int(),
});
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export interface GuestPolicies {
  cancellationPolicy: string | null;
  houseRules: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  requestResponseHours: number;
}

export type ServiceResult<T> =
  | ({ ok: true } & T)
  | { ok: false; status: number; code: string; error: string; quote?: Quote };

export async function getQuote(
  unitSlug: string,
  req: { checkIn: string; checkOut: string; guests: number; pets: number },
): Promise<
  ServiceResult<{ quote: Quote; available: boolean; policies: GuestPolicies }>
> {
  const unit = await getBookableUnit(unitSlug);
  if (!unit || !unit.available)
    return {
      ok: false,
      status: 404,
      code: "not_found",
      error: "Stay not found.",
    };
  const settings = await getBookingSettings();
  const result = quoteStay(unit, req, settings.taxRates, todayAtProperty());
  if (!result.ok)
    return { ok: false, status: 422, code: result.code, error: result.error };
  const inventory = await getInventoryUnits(unit);
  const available = await isRangeFree(
    unit._id,
    req.checkIn,
    req.checkOut,
    inventory.map((u) => u._id),
  );
  return {
    ok: true,
    quote: result.quote,
    available,
    policies: {
      cancellationPolicy: settings.cancellationPolicy,
      houseRules: settings.houseRules,
      checkInTime: settings.checkInTime,
      checkOutTime: settings.checkOutTime,
      requestResponseHours: settings.requestResponseHours,
    },
  };
}

export async function requestBooking(
  input: BookingRequestInput,
): Promise<ServiceResult<{ confirmationCode: string }>> {
  const unit = await getBookableUnit(input.unitSlug);
  if (!unit || !unit.available || !unit.directBookingEnabled) {
    return {
      ok: false,
      status: 404,
      code: "not_bookable",
      error: "This stay is not accepting online requests.",
    };
  }
  const settings = await getBookingSettings();
  const priced = quoteStay(unit, input, settings.taxRates, todayAtProperty());
  if (!priced.ok)
    return { ok: false, status: 422, code: priced.code, error: priced.error };
  const quote = priced.quote;
  if (quote.totalCents !== input.expectedTotalCents) {
    return {
      ok: false,
      status: 409,
      code: "price_changed",
      error:
        "The price for these dates has changed. Please review the new total.",
      quote,
    };
  }

  // Pull the latest Airbnb/Hipcamp/VRBO calendars before holding the dates.
  await releaseStaleHolds();
  const inventory = await getInventoryUnits(unit);
  const syncResults = (await Promise.all(inventory.map(syncUnit))).flat();
  const failedSyncs = syncResults
    .filter((r) => !r.success)
    .map((r) => r.source);
  const syncNote =
    syncResults.length === 0
      ? "No external calendars are configured for this unit — check Airbnb manually."
      : failedSyncs.length
        ? `Warning: could not refresh ${failedSyncs.join(", ")} calendar just now — check it manually before approving.`
        : `Calendars (${syncResults.map((r) => r.source).join(", ")}) were refreshed at request time and showed these dates open.`;

  if (
    !(await isRangeFree(
      unit._id,
      quote.checkIn,
      quote.checkOut,
      inventory.map((u) => u._id),
    ))
  ) {
    return {
      ok: false,
      status: 409,
      code: "dates_taken",
      error:
        "Sorry — those dates were just booked. Please choose different dates.",
    };
  }

  const hold = await holdBooking({
    unitId: unit._id,
    unitSlug: unit.slug,
    unitName: unit.name,
    quote,
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    guestPhone: input.guestPhone,
    specialRequests: input.specialRequests,
  });
  if (!hold.ok) {
    return {
      ok: false,
      status: 409,
      code: "dates_taken",
      error:
        "Sorry — those dates were just booked. Please choose different dates.",
    };
  }
  const booking = hold.booking;

  let paymentId: string;
  try {
    paymentId = await authorizeCard({
      sourceId: input.sourceId,
      verificationToken: input.verificationToken,
      amountCents: quote.totalCents,
      idempotencyKey: input.idempotencyKey,
      holdHours: settings.requestResponseHours + 24,
      referenceId: booking.confirmation_code,
      buyerEmail: input.guestEmail,
      note: `${unit.name} ${quote.checkIn} → ${quote.checkOut} (${booking.confirmation_code})`,
    });
  } catch (error) {
    const message = squareErrorMessage(error);
    await markFailed(booking.id, message);
    return {
      ok: false,
      status: 402,
      code: "payment_failed",
      error: `Your card could not be authorized: ${message}`,
    };
  }

  const expiresAt = new Date(
    Date.now() + settings.requestResponseHours * 3600_000,
  );
  const requested = await markRequested(booking.id, paymentId, expiresAt);
  if (!requested) {
    await voidPayment(paymentId).catch((e) =>
      console.error("Void after lost hold failed", e),
    );
    return {
      ok: false,
      status: 409,
      code: "hold_lost",
      error:
        "Your request timed out. Your card was not charged; please try again.",
    };
  }

  await Promise.all([
    sendRequestReceived(requested, settings.requestResponseHours),
    sendOwnerNewRequest(requested, syncNote),
  ]);
  return { ok: true, confirmationCode: requested.confirmation_code };
}

type AdminResult = ServiceResult<{ booking: BookingRow }>;
const notFound: AdminResult = {
  ok: false,
  status: 404,
  code: "not_found",
  error: "Booking not found.",
};
const wrongState = (b: BookingRow): AdminResult => ({
  ok: false,
  status: 409,
  code: "wrong_state",
  error: `This booking is ${b.booking_status}; refresh the page.`,
});

export async function approveBooking(
  id: string,
  options: {
    /** Owner checked the other platforms by hand because a calendar link failed. */
    calendarsCheckedManually?: boolean;
  } = {},
): Promise<AdminResult> {
  const booking = await getBookingById(id);
  if (!booking) return notFound;
  if (booking.booking_status !== "requested") return wrongState(booking);
  if (
    booking.expires_at &&
    new Date(booking.expires_at).getTime() <= Date.now()
  ) {
    return {
      ok: false,
      status: 409,
      code: "expired",
      error: "This request has expired. Refresh the page.",
    };
  }
  const unit = booking.unit_slug
    ? await getBookableUnit(booking.unit_slug)
    : null;
  if (!unit)
    return {
      ok: false,
      status: 409,
      code: "missing_unit",
      error:
        "The stay could not be checked. Restore it under Stays & pricing before approving.",
    };
  const inventory = await getInventoryUnits(unit);
  const synced = (await Promise.all(inventory.map(syncUnit))).flat();
  const failed = synced.filter((result) => !result.success);
  if (failed.length && !options.calendarsCheckedManually) {
    return {
      ok: false,
      status: 503,
      code: "calendar_unavailable",
      error: `The ${[...new Set(failed.map((f) => f.source))].join(", ")} calendar could not be refreshed, so these dates couldn't be re-checked. No charge was made. Check that platform by hand, then choose "Approve anyway", or try again later.`,
    };
  }
  const conflicts = (
    await getUnavailableRanges(
      unit._id,
      booking.check_in,
      booking.check_out,
      inventory.map((u) => u._id),
      booking.id,
    )
  ).filter(
    // A platform that imported our calendar re-exports this very request as
    // a block. That echo is not a conflict.
    (r) => !isEchoOf(r, { checkIn: booking.check_in, checkOut: booking.check_out }),
  );
  if (conflicts.length) {
    return {
      ok: false,
      status: 409,
      code: "dates_taken",
      error:
        "These dates now conflict with another stay or owner block. The card has not been charged. Review the calendars before declining this request.",
    };
  }
  // Claim first so the expiry job cannot void the hold mid-capture.
  const claimed = await transitionBooking(
    id,
    "requested",
    "confirmed",
    "authorized",
    failed.length
      ? `Approved with ${[...new Set(failed.map((f) => f.source))].join(", ")} checked by hand (calendar link unavailable).`
      : null,
  );
  if (!claimed) return wrongState(booking);
  try {
    await capturePayment(claimed.payment_id!);
  } catch (error) {
    await transitionBooking(
      id,
      "confirmed",
      "requested",
      "authorized",
      `Capture failed: ${squareErrorMessage(error)}`,
    );
    return {
      ok: false,
      status: 402,
      code: "capture_failed",
      error: `Square could not capture the payment: ${squareErrorMessage(error)}`,
    };
  }
  await setPaymentStatus(id, "paid");
  const confirmed = { ...claimed, payment_status: "paid" as const };
  const settings = await getBookingSettings();
  await sendBookingConfirmed(
    confirmed,
    settings.checkInTime,
    settings.checkOutTime,
  );
  return { ok: true, booking: confirmed };
}

async function releaseRequest(
  id: string,
  to: "declined" | "expired",
  note?: string | null,
): Promise<AdminResult> {
  const booking = await getBookingById(id);
  if (!booking) return notFound;
  const claimed = await transitionBooking(
    id,
    "requested",
    to,
    "voided",
    note ?? null,
  );
  if (!claimed) return wrongState(booking);
  if (claimed.payment_id) {
    try {
      await voidPayment(claimed.payment_id);
    } catch (error) {
      // Square voids the hold automatically at its delay deadline anyway.
      console.error(
        `Void failed for ${claimed.confirmation_code}:`,
        squareErrorMessage(error),
      );
    }
  }
  await sendRequestDeclined(claimed, to, note);
  return { ok: true, booking: claimed };
}

export const declineBooking = (id: string, note?: string | null) =>
  releaseRequest(id, "declined", note);

export async function expireRequests() {
  const expired = await listExpiredRequests();
  const results = [];
  for (const b of expired) results.push(await releaseRequest(b.id, "expired"));
  await releaseStaleHolds();
  return { expired: results.filter((r) => r.ok).length };
}

export async function cancelBooking(
  id: string,
  refundCents: number,
  note?: string | null,
): Promise<AdminResult> {
  const booking = await getBookingById(id);
  if (!booking) return notFound;
  if (booking.booking_status !== "confirmed") return wrongState(booking);
  const refundable = booking.total_amount - booking.refunded_amount;
  if (
    !Number.isInteger(refundCents) ||
    refundCents < 0 ||
    refundCents > refundable
  ) {
    return {
      ok: false,
      status: 422,
      code: "bad_amount",
      error: `Refund must be between $0 and ${(refundable / 100).toFixed(2)}.`,
    };
  }
  if (refundCents > 0) {
    try {
      const refundId = await refundPayment({
        paymentId: booking.payment_id!,
        amountCents: refundCents,
        idempotencyKey: `cancel-${booking.id}`.slice(0, 45),
        reason: note || `Cancellation ${booking.confirmation_code}`,
      });
      await recordRefund(id, refundId, refundCents);
    } catch (error) {
      return {
        ok: false,
        status: 402,
        code: "refund_failed",
        error: `Refund failed, booking not cancelled: ${squareErrorMessage(error)}`,
      };
    }
  }
  const totalRefunded = booking.refunded_amount + refundCents;
  const paymentStatus =
    totalRefunded === 0
      ? booking.payment_status
      : totalRefunded >= booking.total_amount
        ? "refunded"
        : "partially_refunded";
  const cancelled = await transitionBooking(
    id,
    "confirmed",
    "cancelled",
    paymentStatus,
    note ?? null,
  );
  if (!cancelled) return wrongState(booking);
  await sendBookingCancelled(cancelled, refundCents, note);
  return { ok: true, booking: cancelled };
}
