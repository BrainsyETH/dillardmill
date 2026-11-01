import { Resend } from "resend";
import type { BookingRow } from "@/lib/db/bookings";
import { formatCents } from "@/lib/booking/pricing";
import type { GuestMessageInput } from "@/lib/inquiries";

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY)
      throw new Error("RESEND_API_KEY is not configured");
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM = "Pine Valley <bookings@dillardmill.com>";
const ADMIN = () => process.env.ADMIN_EMAIL || "pinevalley@dillardmill.com";
const SITE = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "https://dillardmill.com";

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function prettyDate(iso: string) {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function stayTable(b: BookingRow) {
  const rows: [string, string][] = [
    ["Confirmation #", b.confirmation_code],
    ["Stay", b.unit_name],
    ["Check-in", prettyDate(b.check_in)],
    ["Check-out", prettyDate(b.check_out)],
    ["Nights", String(b.num_nights)],
    [
      "Guests",
      String(b.num_guests) +
        (b.num_pets ? ` + ${b.num_pets} pet${b.num_pets > 1 ? "s" : ""}` : ""),
    ],
    ["Total", formatCents(b.total_amount)],
  ];
  return `<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="color:#6F8291">${escapeHtml(k)}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`,
    )
    .join("")}</table>`;
}

export function layout(title: string, body: string) {
  return `<div style="font-family:Georgia,serif;color:#3A2A1E;max-width:560px;margin:auto">
    <h1 style="font-size:22px">${escapeHtml(title)}</h1>${body}
    <p style="margin-top:24px;color:#6F8291;font-size:13px">Pine Valley at Dillard Mill · 126 Dillard Mill Road, Davisville, MO 65456 · (314) 843-4321</p>
  </div>`;
}

export async function send(
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
) {
  try {
    const result = await getResend().emails.send({
      from: FROM,
      to,
      subject,
      html,
      replyTo,
    });
    if (result.error) throw new Error(result.error.message);
    return true;
  } catch (error) {
    // Email failure must never undo a booking state change.
    console.error(`Email "${subject}" to ${to} failed:`, error);
    return false;
  }
}

export function sendGuestMessageNotification(m: GuestMessageInput) {
  return send(
    ADMIN(),
    `${m.kind === "inquiry" ? "Stay inquiry" : "Guest message"} — ${m.name}`,
    layout(
      m.kind === "inquiry" ? "New stay inquiry" : "New guest message",
      `<p>${escapeHtml(m.name)} · ${escapeHtml(m.email)} · ${escapeHtml(m.phone || "")}</p>
       ${m.unitSlug ? `<p>Stay: ${escapeHtml(m.unitSlug)}</p>` : ""}
       ${m.checkIn ? `<p>${escapeHtml(m.checkIn)} → ${escapeHtml(m.checkOut)}</p>` : ""}
       ${m.guests ? `<p>${m.guests} guests</p>` : ""}
       <p style="white-space:pre-wrap">${escapeHtml(m.message)}</p>
       <p><a href="${SITE()}/admin/inquiries">View guest messages</a></p>`,
    ),
    m.email,
  );
}

export function sendRequestReceived(b: BookingRow, responseHours: number) {
  return send(
    b.guest_email,
    `Booking request received — ${b.unit_name}`,
    layout(
      "We received your booking request",
      `<p>Hi ${escapeHtml(b.guest_name)},</p>
       <p>Thanks for choosing Pine Valley. Your card has been <strong>authorized but not charged</strong>.
       We'll review your request and reply within ${responseHours} hours. You're only charged once we confirm.</p>
       ${stayTable(b)}
       <p><a href="${SITE()}/booking/confirmation/${encodeURIComponent(b.confirmation_code)}">View your request</a></p>`,
    ),
    ADMIN(),
  );
}

export function sendOwnerNewRequest(b: BookingRow, syncNote: string) {
  return send(
    ADMIN(),
    `Action needed: booking request for ${b.unit_name} (${b.check_in} → ${b.check_out})`,
    layout(
      "New booking request",
      `<p><strong>${escapeHtml(b.guest_name)}</strong> · ${escapeHtml(b.guest_email)} · ${escapeHtml(b.guest_phone ?? "")}</p>
       ${stayTable(b)}
       ${b.special_requests ? `<p><em>Message:</em> ${escapeHtml(b.special_requests)}</p>` : ""}
       <p style="color:#9C5A3C">${escapeHtml(syncNote)}</p>
       <p>Check the Airbnb calendar for these dates, then approve or decline before
       ${b.expires_at ? escapeHtml(new Date(b.expires_at).toLocaleString("en-US", { timeZone: "America/Chicago" })) : "the deadline"} (Central).
       After that the request is declined automatically and the card hold released.</p>
       <p><a href="${SITE()}/admin/bookings?focus=${encodeURIComponent(b.id)}">Review in admin →</a></p>`,
    ),
    b.guest_email,
  );
}

export function sendBookingConfirmed(
  b: BookingRow,
  checkInTime: string | null,
  checkOutTime: string | null,
) {
  return send(
    b.guest_email,
    `Your stay is confirmed — ${b.unit_name}`,
    layout(
      "Your Pine Valley stay is confirmed!",
      `<p>Hi ${escapeHtml(b.guest_name)},</p>
       <p>Great news — we've confirmed your booking and charged ${escapeHtml(formatCents(b.total_amount))} to your card.</p>
       ${stayTable(b)}
       ${checkInTime || checkOutTime ? `<p>Check-in ${escapeHtml(checkInTime ?? "")} · Check-out ${escapeHtml(checkOutTime ?? "")}</p>` : ""}
       <p>We'll send arrival instructions before your stay. Questions? Just reply to this email.</p>`,
    ),
    ADMIN(),
  );
}

export function sendRequestDeclined(
  b: BookingRow,
  reason: "declined" | "expired",
  note?: string | null,
) {
  return send(
    b.guest_email,
    `About your booking request — ${b.unit_name}`,
    layout(
      reason === "expired"
        ? "Your booking request has expired"
        : "We couldn't confirm your request",
      `<p>Hi ${escapeHtml(b.guest_name)},</p>
       <p>${
         reason === "expired"
           ? "We weren't able to respond to your request in time, so it has been released."
           : "Unfortunately we can't host you for these dates."
       }
       The hold on your card has been released and <strong>you have not been charged</strong>.
       Depending on your bank, the pending hold can take a few days to disappear.</p>
       ${note ? `<p>${escapeHtml(note)}</p>` : ""}
       ${stayTable(b)}
       <p><a href="${SITE()}/lodging">See other dates and stays</a></p>`,
    ),
    ADMIN(),
  );
}

export function sendBookingCancelled(
  b: BookingRow,
  refundCents: number,
  note?: string | null,
) {
  return send(
    b.guest_email,
    `Booking cancelled — ${b.unit_name}`,
    layout(
      "Your booking has been cancelled",
      `<p>Hi ${escapeHtml(b.guest_name)},</p>
       <p>Your booking ${escapeHtml(b.confirmation_code)} has been cancelled.
       ${refundCents > 0 ? `A refund of <strong>${escapeHtml(formatCents(refundCents))}</strong> has been issued to your card; it usually appears within 5–10 business days.` : "No refund was issued under the cancellation policy."}</p>
       ${note ? `<p>${escapeHtml(note)}</p>` : ""}
       ${stayTable(b)}`,
    ),
    ADMIN(),
  );
}
