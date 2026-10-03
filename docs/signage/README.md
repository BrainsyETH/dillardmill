# Guest-hub directional sign (18" × 42", engraved + hand-colored)

| File | Use |
| --- | --- |
| `sign-engrave.svg` | True-scale vector, in inches. Load it into LightBurn, Glowforge, VCarve and similar programs. It's outlines only, all one line weight (0.06"), with hidden lines already removed so nothing engraves twice. Every area is a closed shape you can color in. |
| `sign-colored.png` | An example of the colored-in sign, using an Ozark palette. |
| `sign-tiles.pdf` | The same art split across 15 Letter pages, for hand transfer. Print at 100% (check the 1" bar), then tape the pages together using the overlaps. |
| `build_sign.py` | Regenerates all three files (`pip install fonttools shapely cairosvg pypdf`). |

**Engraving tips:** score or line-engrave the outlines; don't fill-engrave them. Seal the wood before coloring so paint or stain doesn't bleed along the grain.

**Mounting:** the arrows are calculated from the coordinates in `src/lib/map/map-units.ts`, measured from the Hippy Showers / courtyard. Mount the sign so a reader faces **north**.

**Check on site:** walk each arrow before engraving. The *Ponds & Trails* plank has no arrow yet because the map doesn't record where they are.

Fonts: Alfa Slab One and Zilla Slab (SIL Open Font License), in `fonts/`.
