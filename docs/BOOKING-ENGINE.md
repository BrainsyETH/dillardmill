# Running Pine Valley: booking, calendars and admin

How guests book on dillardmill.com, how the owner manages stays, prices and
calendars, and how to set everything up. The guest-facing design and the
content imported from the old site are described in
[GUEST-EXPERIENCE.md](GUEST-EXPERIENCE.md).

## Architecture

| Piece | Service | Notes |
| --- | --- | --- |
| Website, API, scheduled jobs | **Vercel (Pro plan)** | Hobby is non-commercial only. Pro also allows the 15-minute calendar job. |
| Stays, prices, taxes, policies, bookings, calendars, messages | **Neon Postgres** | Schema in `db/migrations/`; edited in `/admin`. |
| Descriptions, photos, journal posts | **Files in this repo** | `src/lib/content/` and `public/images/`. Changes ship with a deploy. |
| Card holds, charges, refunds | **Square** | |
| Booking emails | **Resend**, from `bookings@dillardmill.com` | Replies go to the Google Workspace inbox. |
| Owner email and admin sign-in | **Google Workspace** | `/admin` accepts "Sign in with Google" for `ADMIN_EMAILS`. |
| Bot protection | **Cloudflare Turnstile** | On booking requests and inquiries. |

There is no CMS. Business data the booking engine depends on lives in the
same database as the bookings, so a price quote is one query and no
third-party service can be stale or down at checkout.

## Owner admin (`/admin`)

| Screen | What it does |
| --- | --- |
| **Booking requests** | Approve (charges the card), decline (releases the hold), cancel a confirmed stay with any refund. |
| **Guest messages** | Contact-form messages and stay inquiries, saved even if the email notification failed. |
| **Stays & pricing** | Per stay: nightly price, seasonal prices, cleaning fee, minimum nights, guest and pet limits and fees, shown/hidden, online requests on/off, whole-property flag (the Farm), other-platform links. |
| **Booking settings** | Taxes, cancellation policy, house rules, check-in/out times, hours to respond to a request. |
| **Calendars and blocked dates** | Block dates, see what is booked, see calendar-link status. |

Changes to stays and settings appear on the website within a minute.

A stay's **web address** (e.g. `cozy-cottage`) is fixed when it is created:
its photos, description and page route are keyed to it. New stays start
hidden with online requests off; add their photos and description to
`src/lib/content/property.ts` and `photos.json`.

Online requests can only be switched on once a stay has a nightly price
(enforced by the database too).

**Whole property.** Changing a stay's whole-property flag re-checks its
existing bookings in the same save. If that would make active bookings
overlap, the save is refused and the clashing stays and dates are named.

**Removing a calendar link** clears that platform's imported dates and sync
status in the same save, so nothing lingers with no way to refresh it. Tick
*keep its upcoming dates as blocks* to turn them into owner blocks instead.
Adding or replacing a link imports it straight away.

## How a booking works (request to book)

A guest picks dates, sees a price computed by the server, enters details,
accepts the cancellation policy and house rules, passes the Turnstile check,
and enters a card. The card is **authorized, not charged**, and the dates are
held. The owner gets an email and decides in **Booking requests**:

| Owner action | Card | Dates | Guest email |
| --- | --- | --- | --- |
| Approve | Charged | Booked | Confirmation |
| Decline | Hold released | Freed | "Couldn't confirm" |
| No response within *Hours to respond* (default 24) | Hold released automatically | Freed | "Request expired" |
| Cancel a confirmed stay | Refund any amount you choose | Freed | Cancellation + refund amount |

Square also releases the hold on its own 24 hours after the response window.
Card holds last at most 7 days, so the window is capped at 144 hours.

**Price.** Only `src/lib/booking/pricing.ts` computes money: seasonal nightly
prices (the season that starts later wins where they overlap), extra-guest
fee per night above *Guests included in price*, pet fee per pet per stay,
cleaning fee, then each tax applied to that subtotal. The browser shows the
server's quote; a request is rejected if the total changed in between.

**No double bookings on the website.** Two active bookings can never share a
night of the same stay, and the whole-property listing can never overlap any
other stay. Both are Postgres exclusion constraints, not just app checks.

## Calendars: manual first

**Today the owner manages other platforms by hand.** The website never sends
its calendar anywhere (`CALENDAR_EXPORT_ENABLED` is off).

**Daily routine**

1. **You approve a website booking** → block those dates on Airbnb, Hipcamp
   and any other listing of that stay. For the Farm, block every listing.
2. **A guest books on Airbnb/Hipcamp** → block the dates in **Calendars**,
   unless that stay's calendar link is connected (below).
3. **Before approving any request**, glance at the other platforms.
   Request-to-book means a conflict never becomes a double booking: decline
   the website request and the Airbnb guest keeps their stay.

**Optional read-only import (recommended).** Paste a platform's *export*
calendar link into a stay's **Airbnb / Hipcamp / VRBO calendar link** (Airbnb:
listing → Availability → Connect calendars → Export calendar). The website
then reads that platform's bookings — every 15 minutes, when a guest opens
the calendar, before every request, and again before approval — so guests
can't request dates already taken there. It cannot change anything on the
platform and cannot cause sync loops. Leave a link blank to keep that
platform fully manual.

**At approval** the website re-imports the relevant calendars (all stays, for
the Farm) and re-checks the dates:

- A reservation on another platform, another website booking, or a block
  entered here always stops approval, naming the stay, platform and dates.
- An imported **block** ("Not available") is never decided automatically: it
  could be a genuine block or availability rule on the platform, or a block
  you placed for this request. Each one is listed and you approve only by
  confirming those exact blocks are for this request. If a different block
  appears before you confirm, you're asked again. The confirmation is
  recorded on the booking.
- If a calendar link can't be refreshed, the message names which stay and
  platform. You can tick *I checked those calendars by hand* and approve; that
  is recorded too.

### Turning on two-way sync later

The website can also publish a calendar per stay for platforms to import
(`/calendar/<stay>.ics?token=…&for=airbnb`). Built and tested, off by default.
Before switching it on:

1. Capture a real export from each connected platform and confirm how it
   labels reservations versus blocks. The importer treats summaries containing
   "not available", "unavailable", "blocked" or "closed" as **blocks** and
   everything else as **reservations** (`src/lib/calendar/ical.ts`).
2. Use hub-and-spoke only: each platform imports the website's link; never
   link platforms directly to each other.
3. Block dates in `/admin` only, not on platforms (a platform-side block is
   never passed on to other platforms).
4. Set `CALENDAR_FEED_TOKEN`, then `CALENDAR_EXPORT_ENABLED=true`, redeploy,
   and paste each stay's "for Airbnb" / "for Hipcamp" link from **Calendars**
   into that platform's *Import calendar*.

Rules the code already enforces so this is safe:

- Only website bookings, owner blocks and **real reservations** are ever
  published. Imported blocks are never forwarded — they are usually echoes of
  our own bookings, and forwarding them lets dates circulate between
  platforms indefinitely.
- A stay's own platform reservations are left out of that platform's feed.
- At approval, an imported block that is really our own request coming back
  still requires the owner's explicit confirmation (above); dates alone never
  decide it.

Platforms re-read imported calendars on their own schedule (Airbnb: roughly
every 1.5–3 hours). If that lag or keeping prices in sync becomes a burden, the
next step is a channel manager with an Airbnb API connection; see the
decision notes in `MIGRATION-AUDIT.md`.

## Setup

1. **Vercel Pro**, with the environment variables in `.env.example`.
2. **Database:** `DATABASE_URL=… npm run db:migrate`. Migrations are
   idempotent and recorded in `schema_migrations`. Migration 003 seeds the
   four published stays with no price and online requests off, and re-points
   any existing bookings, owner blocks and imported rows from old Sanity IDs
   to the new stays by web address. If any record can't be matched it stops
   with a message and changes nothing.
3. **Admin sign-in:** set `ADMIN_SESSION_SECRET` and `ADMIN_EMAILS`. For
   Google sign-in create an OAuth client (Google Cloud console → APIs &
   Services → Credentials → OAuth client ID → Web application, in the
   Workspace's Google Cloud organization, consent screen *Internal*) with
   redirect URI `https://dillardmill.com/api/admin/google/callback`, and set
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. `ADMIN_PASSWORD` is an optional
   fallback; remove it once Google sign-in works.
4. **In `/admin`:** taxes and policies (**Booking settings**), then each
   stay's prices and limits (**Stays & pricing**), then switch on online
   requests stay by stay. Leave the Farm on inquiries unless its online price
   and policies are set.
5. **Square:** application ID, location ID, access token; set both
   `SQUARE_ENVIRONMENT` and `NEXT_PUBLIC_SQUARE_ENVIRONMENT` to `production`
   only after a full sandbox test (sandbox card `4111 1111 1111 1111`).
6. **Resend:** verify `dillardmill.com` (see DNS below).
7. **Turnstile:** site and secret keys, `TURNSTILE_ALLOWED_HOSTNAMES`.
8. **Scheduled job:** set `CRON_SECRET`; on Vercel Pro change the schedule in
   `vercel.json` to `*/15 * * * *` (or keep the daily Vercel job and add
   repository secrets `SITE_URL` and `CRON_SECRET` for the GitHub Actions
   schedule). It imports connected calendars and expires unanswered requests.
9. **Backups:** booking and payment records live in Neon; confirm the plan's
   restore window or add a scheduled `pg_dump` to storage you control.
10. **End-to-end test in sandbox:** request → approve → cancel with refund;
    request → decline; request → let it expire; an inquiry; email delivery to
    guest and owner.

## Domain cutover and Google Workspace email

dillardmill.com email runs on Google Workspace and must keep working when the
website moves from Squarespace to Vercel.

- Change **only the website records** (the apex `A` record and `www`
  `CNAME`, as Vercel's domain screen specifies). **Do not touch** the Google
  `MX` records, the SPF `TXT` record, the `google._domainkey` DKIM record, or
  `_dmarc`.
- Before switching, copy the full DNS zone from Squarespace so it can be
  restored. If you move the nameservers to Vercel instead, recreate every
  Google record there first.
- **Resend** adds its own records (a DKIM `TXT` at `resend._domainkey` and
  `MX`/SPF records on a `send.` subdomain). These sit alongside Google's and
  don't affect Workspace mail. If you have a root SPF record, don't merge
  Resend into it; the subdomain handles it.
- After cutover, send a test email to and from a Workspace address and make a
  sandbox booking request to confirm both mail paths.

## Local development

`npm run dev` with a `.env.local`. Without `DATABASE_URL` the public pages
render from the published content (no prices, inquiries only). For a local
database, run a Neon-compatible HTTP proxy and set `NEON_FETCH_ENDPOINT`
(ignored in production).

## Code map

| Concern | File |
| --- | --- |
| Pricing (pure) | `src/lib/booking/pricing.ts` |
| Calendar selection rules (pure) | `src/lib/booking/calendar.ts` |
| Request / approve / decline / expire / cancel | `src/lib/booking/service.ts` |
| Stays, seasons, taxes, settings (Postgres) | `src/lib/stays/repository.ts` |
| Booking-engine and page views of stays | `src/lib/booking/units.ts`, `src/lib/stays/queries.ts` |
| Admin form validation | `src/lib/stays/admin-input.ts` |
| Whole-property inventory | `src/lib/booking/inventory.ts` + trigger in migrations 002/003 |
| Booking rows & holds | `src/lib/db/bookings.ts` |
| Availability & owner blocks | `src/lib/db/availability.ts` |
| iCal parse / generate / classify (pure) | `src/lib/calendar/ical.ts` |
| Calendar import | `src/lib/calendar/sync.ts` |
| Calendar export (off by default) | `src/app/calendar/[file]/route.ts` |
| Square | `src/lib/square/payments.ts` |
| Admin sessions, Google sign-in | `src/lib/admin/session.ts`, `src/lib/admin/google.ts`, `src/proxy.ts` |

Tests: `npm test` covers pricing, calendar rules, iCal parsing and
classification, admin input validation, sessions and Google token checks, and
the full booking lifecycle against real Postgres (PGlite) with Square and
email mocked.
