# Flyers

Print pieces for the cabins. Each is a self-contained HTML file sized to a
physical sheet, rendered to PDF and PNG by `./render.sh`.

```bash
./render.sh           # all flyers
./render.sh safety    # just matching ones
```

The PNG is a 200 DPI raster of the PDF, for email and screen.

## Editing notes

Each sheet is a fixed 11in with `overflow: hidden`, so content that grows too
tall is clipped rather than flowing to page two. `render.sh` fails if a flyer
renders to more than one page — that check is the guard against silent
clipping. The pages use block flow, not flex: an earlier flex version let the
footer get shrunk into the clip.

Don't screenshot the HTML to check layout. The headless viewport truncates
below ~980px and makes a correct page look broken. Inspect the PDF.

## safety-flyer

911 and the property address, the hospital and walk-in clinic with directions,
and where the first aid kit is.

The address sits beside the 911 line because that's what you read to a
dispatcher.

Carried over unverified from the previous version of this flyer: the driving
directions and both phone numbers.

The GPS line comes from `PROPERTY_CENTER` in `src/lib/map/map-units.ts`, which
exists to center a map — not surveyed, and not confirmed as a good point to
give a responder.

The air ambulance card has no phone number on purpose. Air Evac Lifeteam 18 is
based at 35629 Hwy 72 in Salem, the same address as the hospital, and its listed
number is administrative. A number here invites a call instead of 911.

**The photo is a placeholder** — `bathhouse-first-aid.jpg` is a generated gray
box. Drop the real image in at that filename and re-run `render.sh`. The frame
is `object-fit: cover` at 4.0 × 2.55in, so a landscape crop centered on the
FIRST AID box works best.

The photo of that spot shows a "Bath House" sign; the flyer says "Hippy
Showers". Unresolved.

## river-pickup-flyer

The three outfitters that offer door-to-door pickup: Lucky Clover, Garrison's,
Huzzah Valley. Follows the layout of the laminated card already in the cabins.

### The QR code

Inlined as an SVG path, encoding `https://dillardmill.com/floating`. That short
URL is served by a redirect in `next.config.ts` to `/the-area/floating-outfitters`.
**Keep that redirect** — the code is printed and laminated.

To regenerate after a URL change (`pip install segno`):

```bash
python3 -c "import segno; segno.make('https://dillardmill.com/floating', error='m').save('qr.svg', kind='svg', scale=1, border=0, dark='#2f3a28', light=None, xmldecl=False)"
```

Paste the `<path>` into the `.qr` block and match the `viewBox` to the new module
count. Then confirm it still scans by decoding the rendered PDF, not the source
SVG:

```bash
python3 -c "
import pypdfium2 as pdfium, numpy as np, cv2
a = np.array(pdfium.PdfDocument('river-pickup-flyer.pdf')[0].render(scale=300/72).to_pil().convert('RGB'))[:, :, ::-1]
print(cv2.QRCodeDetector().detectAndDecodeMulti(a)[1])"
```

### Phone numbers

Lucky Clover and Garrison's come from the existing laminated card; Huzzah Valley
from the resort's published details. Two diverge from
`src/lib/data/outfitters.ts`, unreconciled:

- Huzzah Valley — data file has `(573) 786-2225`; resort publishes `573-786-8412`.
- Lucky Clover — data file has none; card uses `(573) 775-2419`, resort listings
  publish `888-404-9154`.

Verify before reprinting.
