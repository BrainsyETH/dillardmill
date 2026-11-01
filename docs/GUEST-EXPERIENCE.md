# Pine Valley guest experience — 31 October 2026

This implementation starts from booking-engine commit `14c87a1`. It keeps the real Pine Valley identity and gives guests a clear path from choosing a stay to sending an inquiry or a booking request.

## Design decisions

- The property's existing logo, real photographs, named stays, and practical details carry the design. No generated property photographs, gradients, floating badges, ornamental icon grids, or entrance animations.
- A quieter cream, forest, and brown palette; readable serif headings; straightforward links and buttons; photographs with captions.
- Accommodation facts come before promotional copy: capacity, actual bed configuration, and indoor versus outdoor or shared bathrooms.
- Book the Farm is a primary navigation destination and a separate group-planning page.
- The booking panel explains host approval, response time, and the card hold before payment. On phones, a bottom action jumps directly to the request panel. The calendar shows one month within the available width.

The references were [Dunton's cabin listings](https://www.duntondestinations.com/hot-springs/cabins/), [Canopy & Stars' accommodation pages](https://www.canopyandstars.co.uk/britain/england/sussex/downash-wood/the-cubby), and [Unyoked's date-and-guest search](https://bookings.unyoked.co/uk/stay). Their useful patterns are clear accommodation facts, strong property photography, and visible availability actions. Pine Valley's branding and content remain its own.

## Implemented

| Previous issue                                                 | Current behavior                                                                                                                                                                                                           |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contact form simulated success                                 | `/api/inquiries` validates and saves the message in Postgres, then attempts owner email. Success requires a durable saved message.                                                                                         |
| Inquiry links looped back to lodging                           | An actual inquiry form preserves the selected stay, dates, and group size. Individual stay pages also show the form inline when direct requests are disabled.                                                              |
| No place to recover missed inquiry emails                      | `/admin/inquiries` lists saved messages and flags failed notifications. Email is not the source of truth.                                                                                                                  |
| Guest search didn't filter; oversized groups silently shrank   | Search filters capacity, pets, and minimum nights. The booking form preserves an oversized incoming guest count and requires the guest to resolve it.                                                                      |
| Search displayed partial totals                                | Date searches use the fresh booking price calculator, including seasonal rates, guests, pets, cleaning, and configured taxes. Unknown availability is explicitly described as needing confirmation.                        |
| Gallery was placeholder UI                                     | Real property/CMS photographs, captions, filters, and an accessible native-dialog lightbox. Arrow keys, Escape, and focus restoration work. Stay links use current routes.                                                 |
| Farm and individual inventory were independent                 | Availability checks include related units. A Postgres range exclusion constraint prevents overlapping active direct Farm/individual reservations, including concurrent attempts. Independent individual stays can overlap. |
| Approval could overlook a new external conflict                | Approval re-syncs the relevant external calendars and checks the dates before capture. A failed configured feed or new conflict prevents charging.                                                                         |
| Bot protection missing                                         | Cloudflare Turnstile verifies action, hostname, and token server-side before guest message storage or booking authorization. Missing protection fails closed in production.                                                |
| Calendar embed depended on the old API                         | `/embed/availability?unit=cozy-cottage` uses the current calendar component and rules, passing selected dates to the stay page. This implements the intent of PR #26; do not merge its old implementation over this one.   |
| Journal posts would disappear                                  | All eight published posts were imported with their original paths, including dated paths. New CMS posts and CMS replacements are supported.                                                                                |
| Search engines pointed at another domain and nonexistent pages | Metadata, robots, sitemap, and legacy redirects use `dillardmill.com` or `NEXT_PUBLIC_SITE_URL`. Zero-price fallback offers are omitted.                                                                                   |

## Content and assets

- `src/lib/content/photos.json` records source URLs, source pages, captions, and local image paths. 68 property photographs came from the existing website. The selected homepage hero is the real courtyard, rather than an arbitrary featured room image. Images whose source filename identified them as ChatGPT-generated were excluded from the property import.
- `src/lib/content/property.ts` holds the published accommodation copy used when Sanity is unavailable. These display records have **no price and no online booking permission**. Actual checkout always requires fresh Sanity data and the database.
- A successful CMS response remains authoritative, including an intentionally empty or unavailable listing. CMS photographs take precedence on stay pages; marked featured photographs lead.
- `src/lib/content/journal.json` preserves eight articles and source URLs. Their 41 images are local. Imported HTML was reduced to text, basic formatting, links, and local images; scripts, iframes, styles, and executable attributes were removed. Original publication dates remain visible.
- Imported photography is served as WebP. Crimson Pro and Source Sans 3 are hosted locally, with their OFL licenses in `public/fonts`, so the production build no longer depends on contacting Google Fonts.
- Property facts follow the published site. Conflicting acreage claims and conflicting cottage bed counts were not combined into new marketing claims. The cottage's own page supplies the fallback full-bed-and-futon arrangement; explicit CMS bed configurations take precedence.
- Trail pages link to Missouri State Parks, the Forest Service map, and Council Bluff visitor information rather than naming invented property trails.

## Setup before accepting real requests

1. Apply **both** migrations with `npm run db:migrate`. Migration `002_guest_experience.sql` adds durable messages and Farm inventory protection.
   - Check historical bookings first: any existing whole-Farm rows must have `unit_slug = 'book-the-farm'` so the new constraint can identify them. Resolve existing active Farm/individual overlaps before migration. The migration intentionally fails rather than deleting a reservation to make a conflicting dataset fit.
   - The Farm currently includes every individual unit in this property. If separate inventory outside the Farm is added later, define explicit inventory membership before enabling its bookings.
2. Complete the original [booking-engine setup](BOOKING-ENGINE.md): Neon, Sanity, Square sandbox, Resend, admin password, calendar tokens, cancellation policy, house rules, and taxes.
3. Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, and `TURNSTILE_ALLOWED_HOSTNAMES`. Use exact hostnames for production and any preview. A preview needs its own permitted hostname; an unconfigured production build intentionally rejects submissions. Configure the widget in managed mode.
4. Use `directBookingEnabled` for each stay in Sanity. Leave the Farm off for inquiry-first handling unless its online price and policies have been explicitly configured. Display fallbacks are inquiry-only; this change does not overwrite any CMS switch.
5. Configure inbound calendars for **every** individual stay included in the Farm, including units not accepting direct online requests. Paste each website calendar link into the relevant external listing. Add the existing `SITE_URL` and `CRON_SECRET` repository secrets for the scheduled sync.
6. Test an inquiry, a pending request, approval/capture, decline/void, expiration, and cancellation/refund against the real sandbox accounts. Confirm owner and guest email delivery and both directions of calendar sync before production use.

An iCalendar connection is not a real-time channel manager. External platforms may still show old availability between refreshes. Check the external platform before approving. The importer ignores returned website events when the external platform preserves the `@dillardmill.com` UID; platforms that rewrite imported UIDs require a real-feed cancellation test to rule out calendar echoes. No claim of atomic inventory across Airbnb and the website is made.

## Verification

- 60 automated tests passed in **UTC and America/New_York**, including real PGlite/Postgres migrations and exclusion constraints, inquiry persistence and failure behavior, request lifecycle, Farm relationships, external changes before capture, feed privacy, and Turnstile rejection paths.
- Production build and TypeScript passed without account credentials. Public content renders from the published-content fallback; protected and payment services remain unavailable until configured.
- ESLint passed for changed TypeScript/TSX files, with four pre-existing unused-argument warnings in the payment mocks.
- Browser checks covered public pages at 390, 1024, and 1440 pixels, plus narrow-screen follow-up checks. The lightbox, mobile menu, guest-count filtering, prefilled inquiries, protected admin redirect, and submission error preservation were exercised.
- The real booking components were exercised at 320, 390, 1024, and 1440 pixels with simulated quote/calendar API responses and a simulated Square SDK. Checks covered one-month layout, step focus, policy acceptance, failure/retry, preserved guest counts, server-total submission, and navigation to the confirmation route. This is **not** a live Square integration test.

No real payment, production migration, live calendar configuration, or live email was performed in this session. The connected hosting account exposed no teams, so no hosted preview or production deployment was created through it.
