import { escapeHtml, layout, send } from "@/lib/email/resend";
import { eventTypes, packageName } from "./content";
import { tourBookingUrl } from "./config";
import type { EventInquiry } from "./input";
const site = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "https://dillardmill.com").replace(
    /\/$/,
    "",
  );
const owner = () => process.env.ADMIN_EMAIL || "pinevalley@dillardmill.com";
export function notifyEventOwner(input: EventInquiry, id: string) {
  return send(
    owner(),
    `Event inquiry — ${input.name}`,
    layout(
      "New event inquiry",
      `<p>${escapeHtml(input.name)} · ${escapeHtml(input.email)}</p><p>${escapeHtml(eventTypes[input.eventType])} · ${input.guests} guests · ${escapeHtml(input.eventDate || input.dateFlexibility)}</p><p>${escapeHtml(input.message)}</p><p><a href="${site()}/admin/events/${id}">Open inquiry</a></p>`,
    ),
    input.email,
  );
}
export function acknowledgeEventInquiry(input: EventInquiry) {
  const tour = tourBookingUrl();
  return send(
    input.email,
    "Your event at Pine Valley",
    layout(
      "Thanks for getting in touch.",
      `<p>Hi ${escapeHtml(input.name)},</p><p>We have your ${escapeHtml(eventTypes[input.eventType].toLowerCase())} inquiry${input.eventDate ? ` for ${escapeHtml(input.eventDate)}` : ""}. We’ll reply with availability and next steps. Your dates are not held yet.</p><p>${input.packageId ? `${escapeHtml(packageName(input.packageId))} · ` : ""}${input.guests} event guests${input.overnightGuests != null ? ` · ${input.overnightGuests} staying overnight` : ""}</p>${input.eventType === "wedding" ? `<p><a href="${site()}/weddings/brochure">Download the wedding brochure</a></p>` : `<p><a href="${site()}/events">See the event spaces</a></p>`}${tour ? `<p><a href="${escapeHtml(tour)}">Book a tour</a></p>` : "<p>Reply to this email if you’d like to arrange a visit.</p>"}`,
    ),
    owner(),
  );
}
export function remindEventHold(event: {
  name: string;
  id: string;
  expires_at: string;
}) {
  const until = new Date(event.expires_at).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  });
  return send(
    owner(),
    `Date hold ending — ${event.name}`,
    layout(
      "An event hold ends soon",
      `<p>The hold for ${escapeHtml(event.name)} ends ${escapeHtml(until)} Central. Unconfirmed dates reopen automatically.</p><p><a href="${site()}/admin/events/${event.id}">Review the hold</a></p><p>If you release it, remove any matching blocks from Airbnb and your other listings too.</p>`,
    ),
  );
}
