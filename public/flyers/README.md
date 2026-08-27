# Flyers

Print pieces for the cabins. Each flyer is authored as a self-contained HTML
file sized to a physical sheet, then rendered to PDF with headless Chromium.

## river-pickup-flyer

Single 8.5×11 sheet listing the three river resorts that will pick guests up at
the property: Lucky Clover, Garrison's, and Huzzah Valley. Uses the brand
palette from `docs/BRAND-COLORS.md`.

Rendering to PDF (Chromium's page size comes from the `@page` rule, so no flags
beyond `--no-pdf-header-footer` are needed):

```bash
chromium --headless --disable-gpu --no-sandbox \
  --print-to-pdf=river-pickup-flyer.pdf --no-pdf-header-footer \
  file://$PWD/river-pickup-flyer.html
```

The PNG is a 200 DPI raster of that PDF, for screen sharing and for the booking
confirmation email.

### Editing notes

The sheet is a fixed 11in tall with `overflow: hidden`, so anything that
overflows is silently clipped rather than flowing to a second page. `.page > *`
is pinned to `flex: none` to keep the footer from being flex-shrunk into that
clip. After changing copy, re-render and confirm the PDF is still one page and
the footer block is fully visible.

Do not screenshot the HTML to check the layout — the headless viewport truncates
below ~980px and makes a correct page look clipped. Render the PDF and inspect
that instead.

### Content sourcing

Rivers, craft, and phone numbers were confirmed against each resort's own site
and the Steelville/Missouri tourism listings, not copied from
`src/lib/data/outfitters.ts`. Two known divergences from that file:

- Huzzah Valley: the data file has `(573) 786-2225`; the resort publishes
  `573-786-8412` / `800-367-4516`.
- Lucky Clover: the data file has no phone; the resort publishes `888-404-9154`.

Verify before reprinting, and reconcile the data file separately.
