# Direct Booking & Airbnb Sync

How guests book on dillardmill.com, how the calendar stays in step with
Airbnb, and how to set it up. Supersedes `BOOKING-SETUP.md` and
`BOOKING-SYSTEM-COMPLETE.md`.

## How it works

**Request to book.** A guest picks dates on a unit page, sees a price
computed by the server, enters their details, accepts the cancellation
policy and house rules, and enters a card. The card is **authorized, not
charged**, and the dates are held. The owner gets an email and approves or
declines in `/admin/bookings`:

| Owner action | Card | Dates | Guest email |
| --- | --- | --- | --- |
| Approve | Captured (charged) | Booked | Confirmation |
| Decline | Hold released | Freed | "Couldn't confirm" |
| No response within *Hours to Respond* (default 24) | Hold released automatically | Freed | "Request expired" |
| Cancel a confirmed stay | Refund any amount you choose | Freed | Cancellation + refund amount |

Square's own deadline releases the hold 24 hours after the response window as
a backstop. Card holds cannot exceed 7 days, so the response window is capped
at 144 hours.

**Price.** Only `src/lib/booking/pricing.ts` computes money: seasonal nightly
rates (most specific season wins), extra-guest fee per night above *Base
Guests*, pet fee per pet per stay, cleaning fee, then each tax in Site
Settings → *Taxes* applied to that subtotal. The browser shows the server's
quote; the request is rejected if the total changed in between.

**No double bookings.** Every night is held by at most one active booking —
enforced by a Postgres exclusion constraint (`bookings_no_overlap`), not just
application checks. Before holding dates, the request refreshes the unit's
Airbnb/Hipcamp/VRBO calendars and rejects dates taken there.

### Airbnb sync (iCal, both directions)

Airbnb offers its API only to approved software partners, so sync uses the
calendar links every host has:

- **Airbnb → website.** Each unit's *Airbnb iCal URL* (Content Studio) is
  imported every 15 minutes, whenever a guest opens that unit's calendar
  (if the last import is >15 min old), and immediately before every booking
  request. Each import replaces the stored set, so Airbnb cancellations and
  date changes free the dates. If Airbnb is unreachable the last good data is
  kept and the owner's request email says so.
- **Website → Airbnb.** Each unit publishes
  `/calendar/<unit-slug>.ics?token=…&for=airbnb` containing website requests
  and bookings, owner blocks, and Hipcamp/VRBO reservations (Airbnb's own are
  left out so they aren't echoed back). Paste it into Airbnb → Availability →
  Connect calendars → Import calendar. `/admin/calendar` shows the exact link.

**Remaining risk:** Airbnb refreshes imported calendars on its own schedule
(typically every few hours), so for a short window after a website request
the dates may still look open on Airbnb. Request-to-book contains this: check
the Airbnb calendar before approving (the request email reminds you).

## Setup checklist

1. **Environment variables** — see `.env.example`. Required for booking:
   `DATABASE_URL`, Sanity vars, all Square vars (`SQUARE_ENVIRONMENT` and
   `NEXT_PUBLIC_SQUARE_ENVIRONMENT` = `production` for live cards),
   `RESEND_API_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CRON_SECRET`,
   `CALENDAR_FEED_TOKEN`, `NEXT_PUBLIC_SITE_URL`.
2. **Database** — `DATABASE_URL=… npm run db:migrate` (idempotent; records
   applied files in `schema_migrations`).
3. **Content Studio → Site Settings** — Taxes, Cancellation Policy, House
   Rules, Check-in/out times, Hours to Respond.
4. **Content Studio → each Rental Unit** — base price, seasons, cleaning fee,
   base guests / extra-guest fee, pets, minimum stay, *Accept Booking Requests
   on the Website*, and the Airbnb (and Hipcamp/VRBO) iCal export URLs.
5. **Airbnb** — for each listing, import the "for Airbnb" link from
   `/admin/calendar`.
6. **Square** — create the application, copy the application ID, location ID
   and access token. Test in sandbox first (card `4111 1111 1111 1111`).
7. **Resend** — verify the `dillardmill.com` sending domain.
8. **15-minute sync** — Vercel's cron in `vercel.json` runs daily (the Hobby
   plan allows no more). For 15-minute sync add repository secrets
   `SITE_URL` and `CRON_SECRET` so `.github/workflows/calendar-sync.yml`
   runs, or on Vercel Pro change the schedule to `*/15 * * * *`.
9. **End-to-end test** in sandbox: request → approve → cancel with refund;
   request → decline; confirm the Airbnb import shows the website booking.

## Code map

| Concern | File |
| --- | --- |
| Pricing (pure) | `src/lib/booking/pricing.ts` |
| Calendar selection rules (pure) | `src/lib/booking/calendar.ts` |
| Lifecycle: request / approve / decline / expire / cancel | `src/lib/booking/service.ts` |
| Booking rows & holds | `src/lib/db/bookings.ts` |
| Availability & owner blocks | `src/lib/db/availability.ts` |
| iCal parse / generate (pure) | `src/lib/calendar/ical.ts` |
| Inbound sync | `src/lib/calendar/sync.ts` |
| Outbound feed | `src/app/calendar/[file]/route.ts` |
| Square authorize / capture / void / refund | `src/lib/square/payments.ts` |
| Admin auth (signed cookie, `src/proxy.ts`) | `src/lib/admin/session.ts` |
| Schema | `db/migrations/001_booking_engine.sql` |

Tests: `npm test` — pricing, calendar rules, iCal round-trip, and the full
booking lifecycle against real Postgres (PGlite) with Square/email mocked.
