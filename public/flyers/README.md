# Flyers

Print pieces for the cabins. Each flyer is authored as a self-contained HTML
file sized to a physical sheet, then rendered to PDF with headless Chromium.

## safety-flyer

Single 8.5×11 sheet for the cabins: 911 plus the property address, the hospital
and the walk-in clinic with driving directions, and where to find the first aid
kit and fire extinguisher.

The address sits next to the 911 line on purpose — that is the thing a guest has
to read aloud to a dispatcher, so it should not be at the bottom of the page.

Driving directions and the hospital/clinic phone numbers were carried over
verbatim from the previous version of this flyer. They have not been
re-verified against a routing service; check them if the roads or the clinic
change.

The GPS line comes from `PROPERTY_CENTER` in `src/lib/map/map-units.ts`, which
exists to center the property map — it is not a surveyed point and has not been
confirmed as the right spot to give an emergency responder. Verify it.

The air ambulance card deliberately carries **no phone number**. Air Evac
Lifeteam 18 is based at 35629 Hwy 72 in Salem, the same address as the hospital,
and its listed number is an administrative line. A number on a guest safety
sheet invites someone to call it instead of 911 during an emergency, which would
delay dispatch. Keep the card pointing at 911.

**The photo is a placeholder.** `bathhouse-first-aid.jpg` is a generated gray
box, not the real courtyard photo. Drop the real image in at that filename and
re-render — the frame is `object-fit: cover` at 3.55in × 3.0in, so a landscape
or squarish crop centered on the FIRST AID box works best.

Note that the current photo of that spot shows a "Bath House" sign, while the
flyer copy says "Hippy Showers". Confirm which name guests will be looking for.

## river-pickup-flyer

Single 8.5×11 sheet listing the three outfitters that offer door-to-door pickup
at the property: Lucky Clover, Garrison's, and Huzzah Valley. It follows the
layout of the laminated card already in the cabins — olive header band, one card
per outfitter with phone / website / address, and a "Plan Your Float" block
carrying the QR code.

Both flyers render the same way (Chromium takes the page size from the `@page` rule, so no
flags beyond `--no-pdf-header-footer` are needed):

```bash
chromium --headless --disable-gpu --no-sandbox \
  --print-to-pdf=river-pickup-flyer.pdf --no-pdf-header-footer \
  file://$PWD/river-pickup-flyer.html
```

The PNG is a 200 DPI raster of that PDF, for screen sharing and email.

### The QR code

The QR is inlined as an SVG path — no external image, no generator service — and
encodes `https://dillardmill.com/floating`. That short URL is served by a
redirect in `next.config.ts` pointing at `/the-area/floating-outfitters`. **Do
not remove that redirect**: the QR is printed and laminated, so the URL has to
keep resolving.

To regenerate the QR after a URL change (`pip install segno`):

```bash
python3 -c "import segno; segno.make('https://dillardmill.com/floating', error='m').save('qr.svg', kind='svg', scale=1, border=0, dark='#2f3a28', light=None, xmldecl=False)"
```

Then paste the `<path>` into the `.qr` block and update the `viewBox` to match
the new module count. Always confirm the printed code still scans by decoding it
back out of the rendered PDF rather than trusting the source SVG:

```bash
python3 -c "
import pypdfium2 as pdfium, numpy as np, cv2
a = np.array(pdfium.PdfDocument('river-pickup-flyer.pdf')[0].render(scale=300/72).to_pil().convert('RGB'))[:, :, ::-1]
print(cv2.QRCodeDetector().detectAndDecodeMulti(a)[1])"
```

### Editing notes

The sheet is a fixed 11in with `overflow: hidden`, so anything that overflows is
silently clipped rather than flowing to a second page. The page uses plain block
flow on purpose — an earlier flex version let the footer be shrunk into that clip.
After changing copy, re-render and confirm the PDF is one page and the footer is
fully visible.

Do not screenshot the HTML to check the layout — the headless viewport truncates
below ~980px and makes a correct page look clipped. Render the PDF and inspect
that instead.

### Content sourcing

Phone numbers, websites, and addresses for Lucky Clover and Garrison's are
carried over from the existing laminated cabin card. Huzzah Valley was added from
the resort's published contact details. Two numbers diverge from
`src/lib/data/outfitters.ts`, which has not been reconciled:

- Huzzah Valley: the data file has `(573) 786-2225`; the resort publishes
  `573-786-8412` (and `800-367-4516`).
- Lucky Clover: the data file has no phone; the cabin card uses
  `(573) 775-2419`, while the resort's own listings publish `888-404-9154`.

Verify before reprinting.
