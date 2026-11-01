# Weddings and events — built for a later release

Public weddings are **off by default**. This branch does not deploy or change production accounts.

## Review it

1. Run `npm run db:migrate` on a development/preview database. Migration 004 adds event inquiries, reservations and shared inventory protection. Apply it before deploying this version; the updated availability queries require it even while wedding publishing is off.
2. Sign in at `/admin`, then open **Events**.
3. **Preview the pages** opens `/admin/events/preview` without publishing. The preview form does not submit. The private brochure is at `/admin/events/brochure`.
4. **New event** records a phone/email inquiry without emailing the guest. Set follow-up details, then create a whole-property date hold with an explicit expiry.

## Public release

Set `EVENTS_PUBLISHED=true` and redeploy only when ready. This opens `/weddings`, `/events`, `/weddings/brochure` and the public inquiry endpoint, adds navigation, and adds both pages to the sitemap. With the switch false, these public endpoints return 404. Private previews remain protected by admin authentication.

Optional `EVENT_TOUR_URL` is an HTTPS tour booking URL. Without it, the page and guest email invite people to arrange a visit by email. There is no dummy scheduling button.

The confirmed package prices are $2,800 / $6,000 / $8,000. Each has a maximum of 100 event attendees. Overnight allowances remain distinct: the existing package descriptions provide 14, 28, and up to 50 with camping. The property has 28 indoor sleeping places. No rain backup is advertised. Dillard Mill ceremonies require a separate arrangement with Missouri State Parks.

Before public release, review the interpretation of package overnight allowances, approved photos, inclusions, event rules, deposit/payment/cancellation terms and insurance. Unspecified terms have not been invented or used to take payment. Wedding reservations are inquiry-only.

## Inquiry and follow-up

Public submissions are validated, protected with Turnstile, and saved in the existing `guest_messages` table. A repeated submission ID does not send duplicate email. Guest and owner delivery results are recorded independently; a delivery failure does not discard the inquiry. The guest receipt links to the wedding brochure and, when configured, the tour booking page. Generic events receive a link to the event page.

The existing Guest messages screen links event inquiries into Events. Events records contact details, separate event and overnight counts, date flexibility, package, optional budget/source, assignee, follow-up date and private notes. Progress is New, Replied, Tour scheduled or Closed; active Held/Booked reservations take precedence in the list. Leads with reserved dates must release them before closing.

## Holds and calendar behavior

A hold covers the whole property, including every individual lodging unit, from arrival/setup until departure. Departure is exclusive, like the lodging calendar: use the next day if you need that night for cleanup. The chosen hold-through date expires at the following midnight in America/Chicago.

The new `inventory_reservations` table mirrors active direct bookings and active event reservations. Postgres triggers keep it in the same transaction as its source record. A GiST exclusion constraint prevents an event and a lodging request from winning the same dates concurrently. The existing lodging constraints remain in place. Confirmation updates the same reservation without freeing its dates first.

Creating a hold refreshes all configured external calendars and refuses dates overlapping reservations or blocks. Confirmation refreshes again: external reservations always stop it; imported blocks require acknowledgement of the exact displayed stay/platform/date combinations. A newly discovered block requires another review. Failed imports prevent creating/confirming an event hold.

The owner must acknowledge checking all external listings and, to confirm an event, having arranged the contract and required payment separately. This does not create or verify a Square Invoice or contract.

**External listings remain manual.** Block every affected Airbnb/Hipcamp/etc. listing when holding an event. On release or expiry, remove those external blocks by hand too. Nothing silently enables outbound feeds. If calendar exports are enabled later, event reservations are included without guest names or notes.

Expired holds stop contributing to availability immediately. Booking writes reclaim their inventory even when cron is delayed. The existing scheduled endpoint updates their status and sends one owner reminder in the final 24 hours; failed reminders can retry. Confirmed events never expire. Keep the existing authenticated cron running for reminders and housekeeping.

## Brochure

The PDF is stored outside `public/` and served only through gated routes. `scripts/wedding-brochure.py` regenerates it from `src/lib/events/content.ts` and the existing courtyard photograph. It requires the repository's Node/TypeScript dependencies plus Python ReportLab/Pillow and DejaVu fonts. No build-time Python dependency is required; the finished PDF is committed.

## Validation

- 123 tests pass in UTC and America/New_York.
- TypeScript passes; the production build is verified with `npm run build -- --webpack`.
- The generated brochure was rendered and visually checked.

Tests cover inquiry limits, flexible dates, release gating, durable save and email failure, idempotency, overlapping/racing reservations, checkout boundaries, imported block acknowledgement, confirmation without an availability gap, expiry without cron, release, hold ownership, Central-time expiry and reminder retries. Existing booking tests also run against migration 004.

Live Square, Resend, Turnstile, Google and external-calendar accounts still need the launch sandbox checks described in BOOKING-ENGINE.md. The managed browser preview could not start the existing Next.js repository (`next: not found`); desktop/mobile visual verification remains outstanding.
