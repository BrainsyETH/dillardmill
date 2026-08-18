# Pine Valley — 2026 Hunting Season Campaign

Marketing pieces aimed at hunting parties for the **November firearms deer
portion (Nov 14–24, 2026)**, offering the four-building camp — TT Café, Cozy
Cottage, Tiny Cabin No. 1, Tiny Cabin No. 2 — as a single Friday-to-Sunday
package at **$2,000 for up to 10 guests**.

## Deliverables

| File | Format | Use |
|---|---|---|
| `PineValley-Hunting-2026.pdf` | 8.5 × 11 in, vector, fonts embedded | Print. Gun shops, feed stores, processors, counter handouts. |
| `PineValley-Hunting-2026-square.png` | 1080 × 1080 | Facebook / Instagram feed. |
| `PineValley-Hunting-2026-story.png` | 1080 × 1920 | Stories / Reels covers. |
| `ROUTED-GROUND.md` | — | The design philosophy the set is built on. |

The PDF is true vector with live text (13 embedded fonts), not a rasterised
image, so it stays sharp at any size and a printer can trim it without
resampling.

## Positioning

The offer is **basecamp, not outfitter**. Pine Valley is lodging; the hunting
happens on adjacent Mark Twain National Forest public ground. Every piece
states this outright — the print sheet carries the line *"Pine Valley is
lodging. The hunting is on the public ground next door."* Nothing in the set
implies private hunting rights on the 43 acres.

At $2,000 / 2 nights / 10 guests, this prices at **$100 per hunter per night**,
which is a premium position. The copy therefore sells comfort and the shared
commercial kitchen rather than value. There is no bargain language anywhere.

Capacity is advertised as **"sleeps up to 10"**. The four buildings actually
hold 14 beds, but the package caps at 10, so no piece prints a bed total that
a reader could add up to 14.

## Facts used — and their status

**Verified against MDC announcements (via news coverage — `mdc.mo.gov` is
blocked by this environment's network policy, so it was not read directly):**

- November firearms deer portion: **Nov 14–24, 2026**
- Archery: Sept 15 – Nov 13, resuming Nov 25
- Fall firearms turkey: Oct 1–31 · Early antlerless: Oct 9–11 · Early youth:
  Oct 24–25 · Late youth: Nov 27–29
- **Antler-point restriction dropped statewide for 2026**
- **Crawford County is not on the 2026 mandatory CWD sampling rotation**
  (MDC moved to a four-year county rotation)

> **Confirm the dates and both rule claims against the printed 2026 MDC Fall
> Deer & Turkey regulations booklet before sending this to press.** The two
> rule claims are the flyer's sharpest selling points and the most costly
> things to get wrong.

**Computed here:** legal shooting light for opening weekend — half an hour
before sunrise to half an hour after sunset, NOAA solar position for
37.7241 N / 91.2061 W, CST. Opening day (Sat Nov 14) is **06:14 – 17:24**.
Cross-checks against published central-Missouri sunrise/sunset for mid-November.
The sheet prints its own disclaimer directing hunters to current MDC regs.

## Open items

1. **Barn bathhouse in November.** Not yet confirmed whether it is heated and
   whether water stays on in freezing weather. The pieces therefore advertise
   **"two full baths"** — the TT Café and the Cozy Cottage — which is true
   regardless. The bathhouse is not mentioned. If it is winterised, that is a
   genuine selling point worth adding.
2. **"On the edge of the National Forest."** Chosen deliberately over
   "bordering" or "adjoining", which assert a shared boundary. If Pine Valley
   literally shares a boundary with Mark Twain National Forest, the stronger
   wording is available — confirm before switching.
3. **Photography.** `dillardmill.com` is unreachable from this environment
   (egress policy), so the only image available was
   `public/property-drone.PNG` at 1280 × 720. It is used as a duotone plate,
   sized so it never exceeds its real resolution. Interior shots of the TT
   Café kitchen and the Cottage would materially strengthen the set — drop
   them in `src/` and re-run.
4. **No game hanging pole or cold storage** is advertised, because neither was
   confirmed to exist. Both are cheap to add before November and are the first
   two questions a hunting party asks.
5. **Booking path.** The tiny cabins have no booking URL in
   `src/lib/map/map-units.ts`, and the existing "Book the Farm" Airbnb listing
   is the whole 20+ person property, not this four-unit subset. The pieces
   therefore drive to phone and direct booking.
6. **Domain.** The pieces print `dillardmill.com` (per `.env.example`).
   `src/app/sitemap.ts:4` uses `pinevalleylodging.com`. These should be
   reconciled.

## Rebuilding

```bash
cd marketing/hunting-2026/src
pip install reportlab pillow
python3 build_flyer.py     # -> print PDF + preview PNG
python3 build_social.py    # -> square + story PNGs
python3 sun.py             # -> recompute legal shooting light
```

Rendering goes through Chromium (`--print-to-pdf` for vector output,
`--screenshot` for the social cuts). `terrain.py` generates the contour bed:
a seeded scalar elevation field sampled on a grid, with iso-lines extracted by
marching squares, stitched into rings, decimated and corner-cut. The seed is
fixed, so all three pieces sit on the same ground.

To change price, dates, unit copy or the season calendar, edit the constants at
the top of `build_flyer.py` — they feed both the print sheet and the social
cuts.
