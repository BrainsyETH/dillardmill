# Guest-hub directional sign (18" × 42", engraved + hand-colored)

`all-designs.png` shows the four options side by side. Each design has its own `-engrave.svg`, `-colored.png` and `-tiles.pdf`:

| Design | Idea |
| --- | --- |
| `design1-signpost` | An Ozark scene (bluff, pines, the Huzzah, a canoe) above ten arrow planks, each with an icon. |
| `design2-river-map` | The Huzzah winds down the board, and each destination is a stop on the river. |
| `design3-gristmill` | Dillard Mill on its stone foundation above the dam, with arrow boards nailed to a center post. |
| `design4-badge` | A round park-patch badge, two-column tiles, and a dogwood-branch footer. |

`build_sign.py` builds design 1 and holds the shared engine. `build_variants.py` builds designs 2–4.


| File | Use |
| --- | --- |
| `*-engrave.svg` | True-scale vector, in inches. Load it into LightBurn, Glowforge, VCarve and similar programs. It's outlines only, all one line weight (0.06"), with hidden lines already removed so nothing engraves twice. Every area is a closed shape you can color in. |
| `*-colored.png` | An example of the colored-in sign, using an Ozark palette. |
| `*-tiles.pdf` | The same art split across 15 Letter pages, for hand transfer. Print at 100% (check the 1" bar), then tape the pages together using the overlaps. |
| `build_sign.py`, `build_variants.py` | Regenerate the files (`pip install fonttools shapely cairosvg pypdf`). |

**Engraving tips:** score or line-engrave the outlines; don't fill-engrave them. Seal the wood before coloring so paint or stain doesn't bleed along the grain.

**Mounting:** the arrows are calculated from the coordinates in `src/lib/map/map-units.ts`, measured from the Hippy Showers / courtyard. Mount the sign so a reader faces **north**.

**Check on site:** walk each arrow before engraving. The *Ponds & Trails* sign has no arrow yet because the map doesn't record where they are.

Fonts: Alfa Slab One and Zilla Slab (SIL Open Font License), in `fonts/`.
