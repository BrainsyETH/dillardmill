# Squarespace → Next.js Migration Audit

> **Current state lives elsewhere.** Sections 1–4 record the audit of
> 31 October 2026 and are kept for history; some findings (Sanity, the
> original booking flow) no longer apply. For how the site works now see
> [BOOKING-ENGINE.md](BOOKING-ENGINE.md) and
> [GUEST-EXPERIENCE.md](GUEST-EXPERIENCE.md); decisions are in §5.

**Audited:** 2026-10-31, against `main` @ `26db600`
**Goal:** replace dillardmill.com (Squarespace) with this Next.js site with full
content and image parity, plus a direct-booking calendar and checkout that stays
in sync with Airbnb.


## 1. What could and could not be verified

| Item | Status |
| --- | --- |
| Live dillardmill.com crawl (pages, copy, images) | **Not done.** The audit environment's network policy blocks `dillardmill.com`. Needs the host allowed (plus `images.squarespace-cdn.com`, `static1.squarespace.com`) or a Squarespace XML export dropped into `migration/`. |
| Sanity content actually loaded (units, photos, reviews, posts) | **Unverified.** No Sanity credentials available. Every unit page, the photo gallery, reviews, and the home page read from Sanity; if the dataset is empty they render empty or 404. |
| Neon database tables exist | **Unverified.** No `DATABASE_URL` available. |
| Code typechecks | Yes (`tsc --noEmit` passes). |
| Lint | 46 errors, 5 warnings (mostly `no-explicit-any`). |

## 2. Content parity: what the new site has

Routes mirror Squarespace URLs (see `SEO-URL-MIGRATION-COMPLETE.md`):

| Route | Content source | State |
| --- | --- | --- |
| `/` | Sanity (units, reviews) + hard-coded copy | Built |
| `/lodging` | Sanity | Built |
| `/cozycottage`, `/airstream`, `/sebastian`, `/book-the-farm` | Sanity `rentalUnit` by slug | Built; **404s if the unit is missing or `available` is false** |
| `/photos` | Sanity — **only images attached to rental units** | Partial: no property, event, wedding, or area galleries |
| `/reviews` | Sanity | Built |
| `/our-place`, `/dillardmill`, `/trails`, `/the-area` | Hard-coded copy | Built — copy was written fresh, **not confirmed to match** the live pages |
| `/the-area/floating-outfitters` | `src/lib/data/outfitters.ts` | Built (new; not on live site) |
| `/map` | Neon map markers + Mapbox | Built (new) |
| `/thoughts` | **Placeholder** ("Blog posts will be displayed here once migrated") | **Missing.** No `/thoughts/[slug]` route, so every live blog-post URL would 404. |
| `/contact`, `/booking-request` | Forms → Neon | Built |

Images: nothing from Squarespace is in the repo. All imagery is expected in
Sanity (`cdn.sanity.io`); `next.config.ts` allows only that host.

`migration/pine-valley-data.json` holds a hand-built summary of the four units
(capacity, beds, amenities, Airbnb/Hipcamp listing URLs). There is no
Squarespace export in the repo, and `parse-squarespace-xml.mjs` has never been
run against one.

**Parity work still required once the live site is reachable:** a full page and
image inventory of dillardmill.com, a page-by-page copy diff, migration of every
image into Sanity, blog posts with their original slugs, and 301 redirects for
any URL that changes (including Squarespace's `/s/` file links and
`?format=` variants).

## 3. Booking, calendar, and checkout: defects found

The booking flow exists end to end on paper (date picker → guest details →
Square card form → booking row → confirmation email), but it is **not safe to
take real payments** in its current state.

### Critical

1. **The client sets the price.** `BookingForm` computes the total in the
   browser and sends `amount` to `/api/booking/process-payment`, which charges
   whatever it receives. `/api/booking/create` then stores the client-sent
   totals. Anyone can book any stay for $0.01.
2. **No outbound calendar for Airbnb.** The site imports Airbnb/Hipcamp/VRBO
   iCal feeds but publishes none. Airbnb cannot see direct bookings, so the
   same dates stay open on Airbnb → guaranteed double bookings.
3. **Final availability check ignores Airbnb.** `/api/booking/create` calls
   `checkAvailability` (internal bookings only), not
   `checkAvailabilityWithExternal`. The date picker greys out Airbnb dates, but
   a stale page or a direct API call books over them.
4. **Charge happens before the booking is secured.** The card is charged, then
   the booking is inserted. If the insert fails or the dates were taken in the
   meantime, the guest is charged with no booking and no automatic refund. No
   database constraint prevents two simultaneous bookings for the same dates.
5. **Admin is public.** `/admin`, `/admin/bookings`, and `/admin/calendar`
   render guest names, emails, and phone numbers with no authentication.
   `PUT /api/admin/map-markers` accepts writes from anyone.

### High

6. **Airbnb cancellations never free dates.** Sync only deletes rows whose
   `check_out` is in the past; a reservation cancelled on Airbnb stays blocked
   on the site forever. Changed dates leave the old row behind too (upsert key
   is `unit_id, check_in, source`).
7. **No sync schedule.** There is no `vercel.json` cron; `node-cron` cannot run
   on Vercel. Nothing calls `/api/calendar/sync` automatically. Its `GET`
   handler is either unauthenticated (no `CRON_SECRET`) or always 401 (secret
   set), because it builds a request without the header.
8. **Pricing rules are partial.** `seasonalPricing` is shown on unit pages but
   ignored by checkout. `minStay` is not enforced server-side. Pet fee and
   extra-guest fee are client-only. No taxes (Missouri sales tax / lodging tax)
   are collected.
9. **Square environment keyed off `NODE_ENV`.** Vercel preview builds run with
   `NODE_ENV=production`, so previews would hit live Square.
10. **iCal date parsing via `toJSDate().toISOString()`** can shift all-day
    dates by one day depending on server timezone.
11. **Confirmation page exposes booking details** to anyone with the code;
    codes are short and partly time-derived.

### Missing for a usable booking product

- Cancellation / refund handling (admin action that refunds through Square and
  frees the dates on the outbound iCal).
- Owner notifications for new bookings beyond a single email; booking
  management (modify dates, block dates manually).
- Policies at checkout: cancellation policy, house rules, pet policy, check-in
  times — accepted before payment.
- Book the Farm / events: likely needs request-to-book with a quote, not
  instant checkout.

## 4. How Airbnb sync can work (constraint, not a choice)

Airbnb only offers its API to approved software partners. For an individual
host, the supported mechanism is **iCal in both directions**:

- **Import:** the site fetches each listing's Airbnb export URL
  (Airbnb → Listing → Availability → Connect calendars → Export) on a schedule.
- **Export:** the site publishes one `.ics` URL per unit containing direct
  bookings and manual blocks; that URL is pasted into Airbnb's "Import
  calendar".

Airbnb refreshes imported calendars on its own schedule (typically every few
hours) and that cannot be forced. **There is always a window where a direct
booking is not yet blocked on Airbnb.** Mitigations: sync inbound frequently
(e.g. every 15–30 min), re-check Airbnb immediately before charging, and either
accept the residual risk or use request-to-book / short holds. Prices, guest
counts, and listing content do not sync over iCal; the site keeps its own rates.

## 5. Migration plan

### Decisions

| Date | Decision |
| --- | --- |
| 2026-10-31 | Request-to-book (card authorized; owner approves within a set window), Square, taxes collected at checkout. |
| 2026-11-01 | Calendars: iCal hub-and-spoke ("Option A"), **managed by hand first**. Outbound feed off; optional read-only import per stay. Two-way sync can be switched on later (checklist in BOOKING-ENGINE.md); a channel manager is the next step if lag or price parity becomes a burden. |
| 2026-11-01 | **No CMS.** Sanity removed. Stays, prices, seasons, taxes and policies in Postgres, edited in `/admin`; descriptions, photos and journal as repo files. Owner photo uploads (Vercel Blob) later if wanted. |
| 2026-11-01 | Hosting on **Vercel Pro** (Hobby is non-commercial), **Neon** Postgres. |
| 2026-11-01 | Keep **Google Workspace** for email; `/admin` uses Google sign-in for `ADMIN_EMAILS`. DNS cutover must preserve Workspace mail records. |

### Status (2026-11-01)

- **Booking engine:** implemented; every §3 defect fixed. Not yet run against
  real Square, Neon, Resend, Turnstile, Google or platform calendar accounts.
- **Content parity:** 68 property photographs and 8 journal posts imported
  from the live site with source URLs (PR #32). Completeness against the live
  site still needs an owner check.
- **Remaining before launch:** the setup and end-to-end test in
  BOOKING-ENGINE.md, then the domain cutover.

### Original plan (31 October)

**Phase A — Booking engine**
Server-side pricing from Sanity (nightly/seasonal, cleaning, guests, pets,
taxes, min stay); booking created as a `pending` hold under a Postgres
exclusion constraint before charging; re-sync and re-check Airbnb before
payment; charge via Square with refund on failure; per-unit outbound `.ics`
feeds; inbound sync that mirrors the feed exactly (handles cancellations and
date changes); Vercel cron; admin authentication; admin cancel/refund and
manual date blocks; policy acceptance at checkout; tests for pricing,
overlap, and iCal round-trip.

**Phase B — Content parity (needs live-site access or a Squarespace export)**
Crawl and inventory every page and image; diff copy page by page; import all
images and text into Sanity; build the blog (`/thoughts/[slug]`) with original
slugs; extend the gallery beyond unit photos; redirect map for any URL that
changes; sitemap and metadata parity.

**Phase C — Cutover**
Populate production Sanity and Neon; configure Square production, Resend
domain, cron secret, and Airbnb iCal URLs in both directions; end-to-end test
with a real low-value booking and refund; DNS switch from Squarespace to
Vercel; monitor Search Console for 404s.
