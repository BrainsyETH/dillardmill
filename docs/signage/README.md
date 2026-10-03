# Guest-hub directional sign (18" × 42", wood-burned)

| File | Use |
| --- | --- |
| `sign-preview.png` | Mockup of the finished sign |
| `sign-template.svg` | True-scale outline (inches). Letters are outlines: trace, then fill with the burner. Red text marks notes, not burn lines. |
| `sign-tiles.pdf` | The template split across 15 US-Letter pages. Print at 100% (check the 1" bar), trim, tape together with the 0.25" overlaps, then transfer with graphite paper. |
| `build_sign.py` | Regenerates all three (`pip install fonttools cairosvg pypdf`). |

**Mounting:** arrows are calculated from the map coordinates in `src/lib/map/map-units.ts`, measured from the Hippy Showers / courtyard. Mount the sign so a reader faces **north** (the sign face points south) and the compass "N" matches true north.

**Check on site before burning:** each arrow against the real path, the Mill (¼ mi) and creek (½ mi by trail) distances, and the direction for Ponds · Trails · Fire Rings, which the map doesn't record.

Fonts: Rye and Zilla Slab (SIL Open Font License), in `fonts/`.
