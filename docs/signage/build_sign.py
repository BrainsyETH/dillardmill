"""
Pine Valley guest-hub directional sign — 18" x 42" vertical board, wood-burned.

Generates (into this folder):
  sign-template.svg   true-scale line art (inches) for transfer + burning
  sign-preview.png    wood-tone mockup of the finished sign
  sign-tiles.pdf      the template tiled onto US-Letter pages to print + tape

Arrow directions are computed from the property coordinates in
src/lib/map/map-units.ts, measured from the hub (Hippy Showers / courtyard),
assuming the sign is mounted so a reader standing in front of it faces NORTH.

Usage:  pip install fonttools cairosvg pypdf
        python docs/signage/build_sign.py   (fonts: see FONT_DIR below)
"""
import math
import os
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.environ.get('FONT_DIR', os.path.join(HERE, 'fonts'))

W, H = 18.0, 42.0          # board, inches
INK = '#3A2A1E'            # brand espresso — reads as a burn mark
WOOD = '#D9C3A0'
NOTE = '#C0392B'           # template-only annotations (do NOT burn)

# ---------------------------------------------------------------- geography
HUB = (-91.2059, 37.7234)  # Hippy Showers / courtyard


def bearing(lng, lat):
    dx = (lng - HUB[0]) * math.cos(math.radians(HUB[1])) * 111320
    dy = (lat - HUB[1]) * 110540
    return (math.degrees(math.atan2(dx, dy)) + 360) % 360


B = {
    'mill': bearing(-91.2082, 37.7260),
    'creek': bearing(-91.2075, 37.7255),
    'cottage': bearing(-91.2068, 37.7248),
    'airstream': bearing(-91.2055, 37.7245),
    'sebastian': bearing(-91.2053, 37.7238),
    'argosy': bearing(-91.2049, 37.7233),   # Argosy + Sherman midpoint
    'tiny': bearing(-91.2056, 37.7231),     # Tiny Cabins 1 + 2 midpoint
    'cafe': bearing(-91.2064, 37.7235),
    'barn': bearing(-91.2054, 37.7231),
}

# ---------------------------------------------------------------- text → path
_fonts = {}


def font(name):
    if name not in _fonts:
        f = TTFont(os.path.join(FONT_DIR, name))
        # measure the real cap height from 'H' (some fonts misreport sCapHeight)
        from fontTools.pens.boundsPen import BoundsPen
        gs = f.getGlyphSet()
        bp = BoundsPen(gs)
        gs[f.getBestCmap()[ord('H')]].draw(bp)
        _fonts[name] = (f, gs, f['head'].unitsPerEm, bp.bounds[3])
    return _fonts[name]


def text_width(s, fname, cap):
    f, gs, upm, caph = font(fname)
    cmap = f.getBestCmap()
    k = cap / caph
    return sum(gs[cmap.get(ord(c), cmap[32])].width for c in s) * k


def text_d(s, fname, cap, x, y, anchor='middle', max_w=None, spacing=0.0):
    """SVG path data for string s; y = baseline, cap = cap height in inches."""
    f, gs, upm, caph = font(fname)
    cmap = f.getBestCmap()
    k = cap / caph
    w = text_width(s, fname, cap) + spacing * (len(s) - 1)
    sx = 1.0
    if max_w and w > max_w:
        sx = max_w / w
        w = max_w
    x0 = {'start': x, 'middle': x - w / 2, 'end': x - w}[anchor]
    pen = SVGPathPen(gs)
    cx = 0.0
    for c in s:
        g = gs[cmap.get(ord(c), cmap[32])]
        g.draw(TransformPen(pen, (k * sx, 0, 0, -k, x0 + cx, y)))
        cx += (g.width * k + spacing) * sx
    return pen.getCommands()


# ---------------------------------------------------------------- drawing
class Sign:
    def __init__(self, mode):
        self.mode = mode          # 'template' | 'preview'
        self.out = []

    def line(self, d, w=0.05, dash=None):
        dash = f' stroke-dasharray="{dash}"' if dash else ''
        self.out.append(f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{w}" '
                        f'stroke-linecap="round" stroke-linejoin="round"{dash}/>')

    def text(self, s, fname, cap, x, y, anchor='middle', max_w=None, spacing=0.0):
        d = text_d(s, fname, cap, x, y, anchor, max_w, spacing)
        if self.mode == 'template':   # outline only — trace, then fill with the burner
            self.out.append(f'<path d="{d}" fill="none" stroke="#000" stroke-width="0.02"/>')
        else:
            self.out.append(f'<path d="{d}" fill="{INK}"/>')

    def note(self, s, x, y, size=0.28, anchor='start'):
        if self.mode == 'template':
            self.out.append(f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" '
                            f'fill="{NOTE}" text-anchor="{anchor}" font-style="italic">{s}</text>')

    def circle(self, cx, cy, r, w=0.05):
        self.line(f'M{cx - r},{cy} a{r},{r} 0 1,0 {2 * r},0 a{r},{r} 0 1,0 {-2 * r},0', w)

    # -- pieces ---------------------------------------------------------
    def border(self):
        m, n = 0.45, 0.9   # margin, notch (dog-eared corners like an old plank)
        pts = [(m + n, m), (W - m - n, m), (W - m, m + n), (W - m, H - m - n),
               (W - m - n, H - m), (m + n, H - m), (m, H - m - n), (m, m + n)]
        self.line('M' + ' L'.join(f'{x},{y}' for x, y in pts) + ' Z', 0.07)
        m2 = m + 0.22
        pts = [(m2 + n - .1, m2), (W - m2 - n + .1, m2), (W - m2, m2 + n - .1),
               (W - m2, H - m2 - n + .1), (W - m2 - n + .1, H - m2), (m2 + n - .1, H - m2),
               (m2, H - m2 - n + .1), (m2, m2 + n - .1)]
        self.line('M' + ' L'.join(f'{x},{y}' for x, y in pts) + ' Z', 0.03)

    def waterwheel_compass(self, cx, cy):
        R_out, R_rim, R_hub = 3.85, 3.25, 1.3
        self.circle(cx, cy, R_out, 0.07)
        self.circle(cx, cy, R_rim, 0.05)
        self.circle(cx, cy, R_hub, 0.06)
        # 16 paddles outside the wheel
        for i in range(16):
            a = math.radians(i * 22.5 + 11.25)
            ca, sa = math.cos(a), math.sin(a)
            r1, r2, hw = R_out, R_out + 0.55, 0.28
            px, py = -sa * hw, ca * hw
            p = [(cx + ca * r1 + px, cy + sa * r1 + py), (cx + ca * r2 + px, cy + sa * r2 + py),
                 (cx + ca * r2 - px, cy + sa * r2 - py), (cx + ca * r1 - px, cy + sa * r1 - py)]
            self.line('M' + ' L'.join(f'{x:.3f},{y:.3f}' for x, y in p), 0.045)
        # 8 spokes on the diagonals, leaving N/E/S/W clear for letters
        for i in range(4):
            a = math.radians(45 + i * 90)
            ca, sa = math.cos(a), math.sin(a)
            for off in (-0.12, 0.12):
                ox, oy = -sa * off, ca * off
                self.line(f'M{cx + ca * R_hub + ox:.3f},{cy + sa * R_hub + oy:.3f} '
                          f'L{cx + ca * R_rim + ox:.3f},{cy + sa * R_rim + oy:.3f}', 0.04)
        # compass points
        for lab, ang in (('N', -90), ('E', 0), ('S', 90), ('W', 180)):
            a = math.radians(ang)
            r = 2.3
            self.text(lab, 'ZillaSlab-Bold.ttf', 0.62, cx + math.cos(a) * r,
                      cy + math.sin(a) * r + 0.31)
        # north pointer (a millstone-style diamond) between hub and N
        self.line(f'M{cx},{cy - R_hub - 0.05} L{cx - 0.22},{cy - R_hub - 0.35} '
                  f'L{cx},{cy - R_hub - 0.65} L{cx + 0.22},{cy - R_hub - 0.35} Z', 0.04)
        self.text('YOU ARE', 'ZillaSlab-Bold.ttf', 0.3, cx, cy - 0.05)
        self.text('HERE', 'ZillaSlab-Bold.ttf', 0.38, cx, cy + 0.55)

    def waves(self, y, x0, x1, amp=0.14, wl=0.9, skip=None):
        d, x, first = [], x0, True
        while x < x1 - 1e-6:
            nx = min(x + wl, x1)
            if skip and (skip[0] < nx and x < skip[1]):
                x, first = nx, True
                continue
            if first:
                d.append(f'M{x:.3f},{y}')
                first = False
            d.append(f'Q{x + wl / 4:.3f},{y - amp} {x + wl / 2:.3f},{y} '
                     f'T{nx:.3f},{y}')
            x = nx
        self.line(' '.join(d), 0.045)

    def section(self, label, y):
        cap = 0.42
        self.text(label, 'ZillaSlab-Bold.ttf', cap, W / 2, y, spacing=0.06)
        tw = text_width(label, 'ZillaSlab-Bold.ttf', cap) + 0.06 * len(label)
        yy = y - cap / 2
        self.line(f'M1.4,{yy} L{W / 2 - tw / 2 - 0.35},{yy}', 0.035)
        self.line(f'M{W / 2 + tw / 2 + 0.35},{yy} L{W - 1.4},{yy}', 0.035)
        for x in (W / 2 - tw / 2 - 0.2, W / 2 + tw / 2 + 0.2):   # little rivets
            self.circle(x, yy, 0.05, 0.04)

    def arrow_icon(self, cx, cy, r, brg):
        """Circle with an arrow rotated to the real-world bearing (0 = straight ahead)."""
        self.circle(cx, cy, r, 0.045)
        if brg is None:
            self.note('burn arrow on site', cx, cy + r + 0.32, 0.22, 'middle')
            self.line(f'M{cx - r * .45},{cy} L{cx + r * .45},{cy}', 0.03, '0.08 0.08')
            return
        a = math.radians(brg)
        ux, uy = math.sin(a), -math.cos(a)        # tip direction
        px, py = -uy, ux
        L = r * 0.72
        tip = (cx + ux * L, cy + uy * L)
        tail = (cx - ux * L, cy - uy * L)
        h = r * 0.42
        self.line(f'M{tail[0]:.3f},{tail[1]:.3f} L{tip[0]:.3f},{tip[1]:.3f}', 0.09)
        self.line(f'M{tip[0] - ux * h + px * h * .75:.3f},{tip[1] - uy * h + py * h * .75:.3f} '
                  f'L{tip[0]:.3f},{tip[1]:.3f} '
                  f'L{tip[0] - ux * h - px * h * .75:.3f},{tip[1] - uy * h - py * h * .75:.3f}', 0.09)

    def plank(self, y, h, brg, title, sub=None, big=False):
        """A signpost blade: pointed toward the side the destination is on."""
        x0, x1, pt = 1.15, W - 1.15, h * 0.48
        left = brg is not None and 180 < brg < 360
        if left:
            p = [(x0 + pt, y), (x1, y), (x1, y + h), (x0 + pt, y + h), (x0, y + h / 2)]
        else:
            p = [(x0, y), (x1 - pt, y), (x1, y + h / 2), (x1 - pt, y + h), (x0, y + h)]
        self.line('M' + ' L'.join(f'{a:.3f},{b:.3f}' for a, b in p) + ' Z', 0.06)
        # wood-grain end nails
        nail_x = x1 - 0.35 if left else x0 + 0.35
        for ny in (y + 0.3, y + h - 0.3):
            self.circle(nail_x, ny, 0.06, 0.04)
        r = h * 0.33
        icx = x0 + pt + r + 0.05 if left else x1 - pt - r - 0.05
        self.arrow_icon(icx, y + h / 2, r, brg)
        # text area between icon and flat end
        tx0 = icx + r + 0.3 if left else x0 + 0.6
        tx1 = x1 - 0.6 if left else icx - r - 0.3
        mid = (tx0 + tx1) / 2
        if sub:
            tcap = h * (0.36 if big else 0.4)
            self.text(title, 'ZillaSlab-Bold.ttf', tcap, mid, y + h * 0.5, max_w=tx1 - tx0)
            self.text(sub, 'ZillaSlab-SemiBold.ttf', h * 0.17, mid, y + h * 0.8,
                      max_w=tx1 - tx0, spacing=0.03)
        else:
            tcap = h * 0.42
            self.text(title, 'ZillaSlab-Bold.ttf', tcap, mid, y + h / 2 + tcap / 2,
                      max_w=tx1 - tx0)

    def ledger(self, y, left, right, cap=0.46):
        x0, x1 = 1.6, W - 1.6
        self.text(left, 'ZillaSlab-SemiBold.ttf', cap, x0, y, 'start')
        self.text(right, 'ZillaSlab-Bold.ttf', cap, x1, y, 'end')
        a = x0 + text_width(left, 'ZillaSlab-SemiBold.ttf', cap) + 0.25
        b = x1 - text_width(right, 'ZillaSlab-Bold.ttf', cap) - 0.25
        n = int((b - a) / 0.32)
        for i in range(n + 1):   # dot leaders
            self.circle(a + i * (b - a) / max(n, 1), y - 0.05, 0.035, 0.035)

    # -- layout --------------------------------------------------------
    def build(self):
        self.border()

        # Header
        self.text('PINE VALLEY', 'Rye-Regular.ttf', 1.35, W / 2, 2.75, max_w=15.4)
        self.text('AT DILLARD MILL', 'ZillaSlab-Bold.ttf', 0.48, W / 2, 3.65, spacing=0.12)
        wy = 8.55
        self.waterwheel_compass(W / 2, wy)
        # the wheel sits in the Huzzah
        self.waves(12.75, 1.3, W - 1.3, skip=(W / 2 - 4.0, W / 2 + 4.0))
        self.waves(13.2, 1.3, W - 1.3)
        self.text('ON THE HUZZAH', 'ZillaSlab-SemiBold.ttf', 0.3, 3.05, 12.35, spacing=0.05)
        self.text('DAVISVILLE, MO', 'ZillaSlab-SemiBold.ttf', 0.3, W - 3.05, 12.35, spacing=0.05)
        self.note('Mount facing SOUTH so "N" points north (reader looks north).', 1.2, 4.35, 0.26)

        # The Mill & the Creek
        self.section('THE MILL & THE CREEK', 14.35)
        self.plank(14.75, 2.45, B['mill'], 'DILLARD MILL', '1908 GRISTMILL  ·  ¼ MI', big=True)
        self.plank(17.45, 2.45, B['creek'], 'HUZZAH CREEK', 'SWIM · FISH · FLOAT  ·  ½ MI', big=True)
        self.note('Verify walking distances on site.', W - 1.2, 20.2, 0.24, 'end')

        # Stays
        self.section('PLACES TO STAY', 20.95)
        stays = [('COZY COTTAGE', 'cottage'), ('THE AIRSTREAM', 'airstream'),
                 ('THE SEBASTIAN', 'sebastian'), ('THE ARGOSY  ·  THE SHERMAN', 'argosy'),
                 ('TINY CABINS 1 & 2', 'tiny')]
        y = 21.35
        for name, key in stays:
            self.plank(y, 1.38, B[key], name)
            y += 1.53

        # Commons
        self.section('AROUND THE FARM', 29.55)
        self.plank(29.95, 1.38, B['cafe'], 'THE CAFÉ')
        self.plank(31.48, 1.38, B['barn'], 'BARN  ·  BATHHOUSE')
        self.plank(33.01, 1.38, None, 'PONDS · TRAILS · FIRE RINGS')

        # Farther afield
        self.section('FARTHER AFIELD  ·  BY CAR', 35.45)
        self.ledger(36.45, 'Huzzah float outfitters', '~30 MIN')
        self.ledger(37.4, 'Courtois Creek', '~30 MIN')
        self.ledger(38.35, 'Meramec River', '~40 MIN')
        self.ledger(39.3, 'Current River', '~1 HR')
        self.waves(39.85, 2.0, W - 2.0, amp=0.1, wl=0.7)
        self.text('MARK TWAIN NATIONAL FOREST — ALL AROUND YOU', 'ZillaSlab-Bold.ttf',
                  0.34, W / 2, 40.55, max_w=14.4)
        return self

    def svg(self, px_per_in=None):
        size = (f'width="{W}in" height="{H}in"' if px_per_in is None
                else f'width="{int(W * px_per_in)}" height="{int(H * px_per_in)}"')
        bg = ''
        if self.mode == 'preview':
            grain = ''.join(
                f'<path d="M0,{y:.2f} C6,{y + 0.25 * math.sin(y):.2f} 12,{y - 0.3 * math.cos(y):.2f} '
                f'18,{y + 0.1:.2f}" fill="none" stroke="#B8976A" stroke-opacity=".35" '
                f'stroke-width="{0.02 + 0.03 * ((i * 7) % 5) / 4:.3f}"/>'
                for i, y in enumerate([j * 0.55 + 0.2 * math.sin(j) for j in range(77)]))
            bg = (f'<rect width="{W}" height="{H}" fill="{WOOD}"/>{grain}')
        else:
            bg = f'<rect width="{W}" height="{H}" fill="#fff"/>'
        return (f'<svg xmlns="http://www.w3.org/2000/svg" {size} viewBox="0 0 {W} {H}">'
                f'{bg}{"".join(self.out)}</svg>')


def main():
    import cairosvg
    from pypdf import PdfWriter, PdfReader
    import io

    tmpl = Sign('template').build()
    with open(os.path.join(HERE, 'sign-template.svg'), 'w') as f:
        f.write(tmpl.svg())
    prev = Sign('preview').build()
    cairosvg.svg2png(bytestring=prev.svg(px_per_in=40).encode(),
                     write_to=os.path.join(HERE, 'sign-preview.png'))

    # Tile onto Letter pages: 7.5" x 10" print area per page, 0.25" overlap.
    tw, th, ov = 7.5, 10.0, 0.25
    body = ''.join(tmpl.out)
    writer = PdfWriter()
    cols = math.ceil((W - ov) / (tw - ov))
    rows = math.ceil((H - ov) / (th - ov))
    for r in range(rows):
        for c in range(cols):
            x, y = c * (tw - ov), r * (th - ov)
            label = f'Row {r + 1} / Col {c + 1}  —  tile {r * cols + c + 1} of {rows * cols}'
            page = (f'<svg xmlns="http://www.w3.org/2000/svg" width="8.5in" height="11in" '
                    f'viewBox="0 0 8.5 11"><rect width="8.5" height="11" fill="#fff"/>'
                    f'<svg x="0.5" y="0.5" width="{tw}" height="{th}" '
                    f'viewBox="{x} {y} {tw} {th}">{body}</svg>'
                    f'<rect x="0.5" y="0.5" width="{tw}" height="{th}" fill="none" '
                    f'stroke="#999" stroke-width="0.01" stroke-dasharray="0.1 0.1"/>'
                    f'<text x="0.5" y="10.85" font-family="sans-serif" font-size="0.18" '
                    f'fill="#666">{label}  ·  print at 100% / actual size  ·  '
                    f'overlap {ov}" on each edge</text>'
                    f'<path d="M8.0,10.6 h-1 M8.0,10.6 m-0.05,-0.05 v0.1" stroke="#000" '
                    f'stroke-width="0.01"/><text x="7.0" y="10.5" font-size="0.13" '
                    f'font-family="sans-serif">1 inch check</text></svg>')
            buf = io.BytesIO()
            cairosvg.svg2pdf(bytestring=page.encode(), write_to=buf)
            buf.seek(0)
            writer.add_page(PdfReader(buf).pages[0])
    with open(os.path.join(HERE, 'sign-tiles.pdf'), 'wb') as f:
        writer.write(f)
    print({k: round(v) for k, v in B.items()}, f'{rows * cols} tiles', file=sys.stderr)


if __name__ == '__main__':
    main()
