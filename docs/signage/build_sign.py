"""
Pine Valley guest-hub directional sign: 18" x 42" vertical board.
Coloring-book line art for laser / CNC engraving, then colored in by hand.

Outputs (into this folder):
  sign-engrave.svg    true-scale vector (inches): outlines only, one line weight,
                      hidden lines removed so nothing double-engraves
  sign-colored.png    example of the finished, colored-in sign
  sign-tiles.pdf      the engrave file tiled on US-Letter pages (hand transfer)

Arrow directions come from the coordinates in src/lib/map/map-units.ts,
measured from the Hippy Showers / courtyard, with the sign mounted so the
reader faces NORTH.

Usage:  pip install fonttools shapely cairosvg pypdf
        python docs/signage/build_sign.py
"""
import io
import math
import os

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from shapely import affinity
from shapely.geometry import LineString, Point, Polygon, box
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, 'fonts')
W, H = 18.0, 42.0
LW = 0.06                  # single engrave line weight, inches
INK = '#2E2118'
WOOD = '#E2CDA8'

# Ozark palette for the colored example
C = dict(sky='#BFD8E0', sun='#F2B544', far='#8FA3A0', near='#5E7D4F', bluff='#C9B79A',
         pine='#2F5A3A', trunk='#6B4A2F', river='#4F8FA6', canoe='#B5502E',
         plank='#C99A63', arrow='#B5502E', red='#A8432C', cream='#F4EAD5',
         steel='#B9C2C6', fish='#7E8F3E', title='#B5502E')

# ------------------------------------------------------------- geography
HUB = (-91.2059, 37.7234)


def bearing(lng, lat):
    dx = (lng - HUB[0]) * math.cos(math.radians(HUB[1])) * 111320
    dy = (lat - HUB[1]) * 110540
    return (math.degrees(math.atan2(dx, dy)) + 360) % 360


B = dict(mill=bearing(-91.2082, 37.7260), creek=bearing(-91.2075, 37.7255),
         cottage=bearing(-91.2068, 37.7248), airstream=bearing(-91.2055, 37.7245),
         sebastian=bearing(-91.2053, 37.7238), argosy=bearing(-91.2049, 37.7233),
         tiny=bearing(-91.2056, 37.7231), cafe=bearing(-91.2064, 37.7235),
         barn=bearing(-91.2054, 37.7231))

# ------------------------------------------------------------- text
_fonts = {}


def font(name):
    if name not in _fonts:
        f = TTFont(os.path.join(FONTS, name))
        gs = f.getGlyphSet()
        bp = BoundsPen(gs)
        gs[f.getBestCmap()[ord('H')]].draw(bp)
        _fonts[name] = (f.getBestCmap(), gs, bp.bounds[3])
    return _fonts[name]


def text_w(s, fname, cap, sp=0.0):
    cmap, gs, caph = font(fname)
    return sum(gs[cmap[ord(c)]].width for c in s) * cap / caph + sp * (len(s) - 1)


def text_d(s, fname, cap, x, y, anchor='middle', max_w=None, sp=0.0):
    cmap, gs, caph = font(fname)
    k = cap / caph
    w = text_w(s, fname, cap, sp)
    sx = min(1.0, max_w / w) if max_w else 1.0
    w *= sx
    x0 = {'start': x, 'middle': x - w / 2, 'end': x - w}[anchor]
    pen, cx = SVGPathPen(gs), 0.0
    for c in s:
        g = gs[cmap[ord(c)]]
        g.draw(TransformPen(pen, (k * sx, 0, 0, -k, x0 + cx, y)))
        cx += (g.width * k + sp) * sx
    return pen.getCommands()


# ------------------------------------------------------------- shape helpers
def smooth(pts, n=16):
    """Catmull-Rom through pts."""
    out = []
    p = [pts[0]] + list(pts) + [pts[-1]]
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for t in [j / n for j in range(n)]:
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t +
                                    (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
                                    (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
                             for k in (0, 1)))
    out.append(pts[-1])
    return out


def ridge(pts, bottom):
    c = smooth(pts)
    return Polygon(c + [(c[-1][0], bottom), (c[0][0], bottom)])


def rbox(x0, y0, x1, y1, r):
    return box(x0 + r, y0 + r, x1 - r, y1 - r).buffer(r, quad_segs=12)


def circle(x, y, r):
    return Point(x, y).buffer(r, quad_segs=24)


def wave(x0, x1, y, amp=0.12, wl=0.8):
    n = max(2, int((x1 - x0) / wl * 16))
    return LineString([(x0 + (x1 - x0) * i / n,
                        y + amp * math.sin(2 * math.pi * (x1 - x0) * i / n / wl))
                       for i in range(n + 1)])


def pine(x, base, h, w):
    """Shortleaf pine: trunk + three stacked tiers (back to front)."""
    items = [(box(x - w * .09, base - h * .2, x + w * .09, base), 'trunk')]
    for i, (top, bot, ww) in enumerate([(0.0, .45, .62), (.2, .65, .82), (.4, .85, 1.0)]):
        y0, y1 = base - h + top * h, base - h + bot * h
        items.append((Polygon([(x, y0), (x + w * ww / 2, y1), (x - w * ww / 2, y1)]), 'pine'))
    return items


def to_d(geom):
    """shapely geometry → SVG path data (lines)."""
    if geom.is_empty:
        return ''
    if geom.geom_type in ('Polygon',):
        return ' '.join(to_d(r) for r in [geom.exterior, *geom.interiors])
    if hasattr(geom, 'geoms'):
        return ' '.join(to_d(g) for g in geom.geoms)
    cs = list(geom.coords)
    closed = cs[0] == cs[-1] and len(cs) > 2
    return 'M' + ' L'.join(f'{x:.3f},{y:.3f}' for x, y in cs) + (' Z' if closed else '')


# ------------------------------------------------------------- scene engine
class Layer:
    """Shapes listed back → front. Each emits its outline minus everything in
    front of it, so the art is clean single lines (no hidden/double cuts)."""

    def __init__(self, clip=None):
        self.items = []     # (polygon, color, extra_lines)
        self.clip = clip

    def add(self, poly, color, lines=()):
        poly = poly.buffer(0)
        if self.clip is not None:
            poly = poly.intersection(self.clip)
        self.items.append((poly, color, list(lines)))

    def render(self):
        fills, strokes = [], []
        front = Polygon()
        for poly, color, lines in reversed(self.items):
            vis = poly.difference(front)
            fills.append((vis, color))
            strokes.append(poly.boundary.difference(front))
            for ln in lines:
                strokes.append(ln.intersection(poly).difference(front))
            front = unary_union([front, poly])
        fills.reverse()
        return fills, strokes


# ------------------------------------------------------------- the sign
class Sign:
    def __init__(self):
        self.fills, self.strokes, self.texts = [], [], []

    def take(self, layer):
        f, s = layer.render()
        self.fills += f
        self.strokes += s

    def line(self, geom):
        self.strokes.append(geom)

    def text(self, s, fname, cap, x, y, color, anchor='middle', max_w=None, sp=0.0):
        self.texts.append((text_d(s, fname, cap, x, y, anchor, max_w, sp), color))

    # -- header scene --------------------------------------------------
    def header(self):
        frame = rbox(0.4, 0.4, W - 0.4, H - 0.4, 0.8)
        self.board = frame
        top = 13.0
        clip = frame.intersection(box(0, 0, W, top))
        L = Layer(clip)
        L.add(clip, 'sky')
        L.add(circle(13.9, 6.3, 1.25), 'sun')
        L.add(ridge([(0.2, 7.4), (3.0, 6.1), (6.2, 7.0), (9.4, 5.6), (12.6, 6.9),
                     (15.4, 6.0), (18.0, 6.8)], top), 'far')
        L.add(ridge([(0.2, 9.0), (4.0, 8.2), (8.0, 9.2), (12.0, 7.9), (15.0, 8.5),
                     (18.0, 8.0)], top), 'near')
        # limestone bluff over the river, with ledge lines
        bluff = Polygon(smooth([(0.2, 8.0), (2.6, 7.65), (5.0, 7.9), (6.0, 8.6)], 8) +
                        [(6.3, 9.6), (6.1, 10.6), (6.6, 11.6), (0.2, 11.6)])
        L.add(bluff, 'bluff', [LineString([(0, y), (5.5 + d, y + .1)]) for y, d in
                                ((9.0, .4), (9.9, .5), (10.8, .8))])
        for x, b, h_, w_ in ((1.5, 8.05, 2.4, 1.4), (3.4, 7.75, 3.0, 1.7),
                             (11.4, 8.2, 2.5, 1.5), (13.4, 8.5, 3.2, 1.9),
                             (15.7, 8.3, 2.6, 1.5)):
            for g, c in pine(x, b, h_, w_):
                L.add(g, c)
        # the Huzzah winding toward the viewer
        left = smooth([(8.6, 9.2), (7.6, 10.0), (7.0, 11.0), (5.4, 12.2), (3.6, 13.2)], 10)
        right = smooth([(9.6, 9.2), (10.2, 10.0), (10.0, 11.0), (11.8, 12.2), (14.2, 13.2)], 10)
        river = Polygon(left + right[::-1])
        L.add(river, 'river', [wave(7.6, 9.6, 10.25, .08, .6), wave(9.8, 12.4, 12.35, .1, .7)])
        hull = Polygon(smooth([(7.3, 11.05), (8.1, 11.75), (9.7, 11.8), (11.0, 11.05)], 10))
        L.add(affinity.rotate(hull, -6, origin=(9.1, 11.4)), 'canoe')
        self.take(L)
        self.line(LineString([(0.4, top), (W - 0.4, top)]))
        # title on a banner over the sky
        ban = Polygon([(1.2, 1.05), (16.8, 1.05), (16.2, 2.1), (16.8, 3.15), (1.2, 3.15),
                       (1.8, 2.1)])
        L2 = Layer()
        L2.add(ban, 'cream')
        self.take(L2)
        self.text('PINE VALLEY', 'AlfaSlabOne-Regular.ttf', 1.3, W / 2, 2.75, 'title', max_w=13.6)
        sub = Layer()
        sub.add(rbox(5.0, 3.45, 13.0, 4.45, 0.35), 'cream')
        self.take(sub)
        self.text('AT DILLARD MILL', 'ZillaSlab-Bold.ttf', 0.5, W / 2, 4.2, 'ink', sp=0.06)

    # -- plank icons (unit square → placed) ---------------------------
    @staticmethod
    def icon(kind):
        L = []

        def a(g, c, lines=()):
            L.append((g, c, list(lines)))

        if kind == 'mill':
            a(Polygon([(.05, .42), (.42, .1), (.79, .42)]), 'red')
            a(box(.12, .4, .72, .95), 'red', [LineString([(.12, .62), (.72, .62)])])
            a(box(.34, .7, .5, .95), 'cream')
            w = circle(.76, .7, .23)
            a(w, 'trunk', [LineString([(.76, .47), (.76, .93)]), LineString([(.53, .7), (.99, .7)])])
            a(circle(.76, .7, .07), 'cream')
        elif kind == 'canoe':
            a(Polygon(smooth([(0, .42), (.2, .62), (.8, .62), (1, .42)], 10) + [(.9, .5), (.1, .5)]),
              'canoe')
            L.append((None, None, [wave(.02, .98, .78, .05, .32), wave(.12, .88, .92, .05, .32)]))
        elif kind == 'cottage':
            a(box(.62, .12, .76, .4), 'red')
            a(Polygon([(.02, .5), (.5, .1), (.98, .5)]), 'red')
            a(box(.14, .48, .86, .95), 'cream')
            a(box(.42, .66, .6, .95), 'trunk')
            a(box(.2, .58, .34, .72), 'sky')
        elif kind == 'tub':
            a(circle(.24, .9, .07), 'steel')
            a(circle(.76, .9, .07), 'steel')
            a(Polygon(smooth([(.02, .45), (.12, .8), (.5, .86), (.88, .8), (.98, .45)], 10)), 'cream')
            a(rbox(0, .38, 1, .5, .05), 'steel')
            L.append((None, None, [LineString([(.86, .38), (.86, .18), (.74, .18)])]))
        elif kind in ('airstream', 'two'):
            def capsule(dx, dy, s):
                body = rbox(.02, .3, .98, .82, .26)
                g = [(body, 'steel', [LineString([(0, .62), (1, .62)])]),
                     (rbox(.12, .4, .4, .56, .06), 'sky', []),
                     (box(.58, .4, .74, .8), 'cream', []),
                     (circle(.46, .84, .12), 'trunk', [])]
                return [(affinity.translate(affinity.scale(p, s, s, origin=(0, 0)), dx, dy), c,
                         [affinity.translate(affinity.scale(ln, s, s, origin=(0, 0)), dx, dy)
                          for ln in ls]) for p, c, ls in g]
            if kind == 'airstream':
                L += capsule(0, 0, 1)
            else:
                L += capsule(.32, -.18, .66) + capsule(0, .32, .66)
        elif kind == 'tiny':
            for dx in (0, .52):
                a(Polygon([(dx, .5), (dx + .24, .22), (dx + .48, .5)]), 'red')
                a(box(dx + .06, .48, dx + .42, .9), 'cream')
                a(box(dx + .17, .64, dx + .31, .9), 'trunk')
        elif kind == 'cafe':
            a(circle(.72, .62, .17).difference(circle(.72, .62, .08)), 'cream')
            a(Polygon([(.12, .38), (.72, .38), (.66, .95), (.18, .95)]), 'cream',
              [LineString([(.15, .52), (.7, .52)])])
            L.append((None, None, [LineString([(.32 + .05 * math.sin(t / 3), .32 - t * .03)
                                               for t in range(9)]),
                                   LineString([(.52 + .05 * math.sin(t / 3), .32 - t * .03)
                                               for t in range(9)])]))
        elif kind == 'barn':
            a(Polygon([(.04, .95), (.04, .45), (.2, .2), (.5, .05), (.8, .2), (.96, .45), (.96, .95)]),
              'red')
            a(box(.3, .55, .7, .95), 'cream', [LineString([(.3, .55), (.7, .95)]),
                                              LineString([(.7, .55), (.3, .95)])])
            a(box(.42, .26, .58, .42), 'cream')
        elif kind == 'fish':
            a(Polygon([(.7, .55), (.98, .3), (.92, .55), (.98, .82)]), 'fish')
            a(Polygon(smooth([(.02, .55), (.3, .3), (.62, .38), (.78, .55), (.62, .72),
                              (.3, .78), (.02, .55)], 10)), 'fish',
              [LineString([(.2, .4), (.2, .7)])])
            a(circle(.12, .5, .04), 'ink')
        return L

    def place_icon(self, kind, x, y, s):
        L = Layer()
        loose = []
        for g, c, lines in self.icon(kind):
            t = lambda q: affinity.translate(affinity.scale(q, s, s, origin=(0, 0)), x, y)
            if g is None:
                loose += [t(ln) for ln in lines]
            else:
                L.add(t(g), c, [t(ln) for ln in lines])
        self.take(L)
        for ln in loose:
            self.line(ln)

    def arrow(self, cx, cy, size, brg):
        p = Polygon([(-.16, .5), (.16, .5), (.16, -.05), (.42, -.05), (0, -.5), (-.42, -.05),
                     (-.16, -.05)])
        p = affinity.rotate(affinity.scale(p, size, size, origin=(0, 0)), brg, origin=(0, 0))
        L = Layer()
        L.add(affinity.translate(p, cx, cy), 'arrow')
        self.take(L)

    def plank(self, y, h, brg, title, kind):
        x0, x1, pt = 1.0, W - 1.0, h * 0.45
        left = brg is not None and 180 < brg < 360
        if left:
            p = Polygon([(x0 + pt, y), (x1, y), (x1, y + h), (x0 + pt, y + h), (x0, y + h / 2)])
        else:
            p = Polygon([(x0, y), (x1 - pt, y), (x1, y + h / 2), (x1 - pt, y + h), (x0, y + h)])
        L = Layer()
        L.add(p, 'plank')
        self.take(L)
        s = h * 0.72
        a_size = h * 0.78
        if left:
            ax, ix = x0 + pt + a_size / 2, x1 - 0.35 - s
            tx0, tx1 = ax + a_size / 2 + 0.3, ix - 0.3
        else:
            ax, ix = x1 - pt - a_size / 2, x0 + 0.35
            tx0, tx1 = ix + s + 0.3, ax - a_size / 2 - 0.3
        if brg is not None:
            self.arrow(ax, y + h / 2, a_size, brg)
        self.place_icon(kind, ix, y + (h - s) / 2, s)
        cap = h * 0.36
        self.text(title, 'AlfaSlabOne-Regular.ttf', cap, (tx0 + tx1) / 2, y + h / 2 + cap / 2,
                  'cream', max_w=tx1 - tx0)

    def footer(self):
        y = 39.0
        self.line(wave(1.4, W - 1.4, y, .12, .9))
        self.line(wave(1.4, W - 1.4, 41.0, .12, .9))
        for x in (2.3, W - 2.3):
            L = Layer()
            for g, c in pine(x, 40.75, 1.55, 1.0):
                L.add(g, c)
            self.take(L)
        self.text('MARK TWAIN', 'AlfaSlabOne-Regular.ttf', 0.52, W / 2, 39.95, 'pine', sp=0.04)
        self.text('NATIONAL FOREST', 'ZillaSlab-Bold.ttf', 0.4, W / 2, 40.6, 'ink', sp=0.08)

    def build(self):
        self.header()
        rows = [('DILLARD MILL', 'mill', 'mill'), ('HUZZAH CREEK', 'creek', 'canoe'),
                ('COZY COTTAGE', 'cottage', 'cottage'), ('THE SEBASTIAN', 'sebastian', 'tub'),
                ('THE AIRSTREAM', 'airstream', 'airstream'),
                ('ARGOSY & SHERMAN', 'argosy', 'two'), ('TINY CABINS', 'tiny', 'tiny'),
                ('THE CAFÉ', 'cafe', 'cafe'), ('BARN & BATHHOUSE', 'barn', 'barn'),
                ('PONDS & TRAILS', None, 'fish')]
        y, h, gap = 13.45, 2.2, 0.32
        for title, key, kind in rows:
            self.plank(y, h, B.get(key), title, kind)
            y += h + gap
        self.footer()
        self.line(self.board.exterior)
        return self

    # -- output ----------------------------------------------------------
    def svg(self, colored=False, px_per_in=None, body_only=False):
        out = []
        if colored:
            out.append(f'<rect width="{W}" height="{H}" fill="{WOOD}"/>')
            for g, c in self.fills:
                if not g.is_empty:
                    out.append(f'<path d="{to_d(g)}" fill="{C.get(c, c)}" fill-rule="evenodd"/>')
        else:
            out.append(f'<rect width="{W}" height="{H}" fill="#fff"/>') if not body_only else None
        sc = INK if colored else '#000'
        d = ' '.join(to_d(g) for g in self.strokes if not g.is_empty)
        out.append(f'<path d="{d}" fill="none" stroke="{sc}" stroke-width="{LW}" '
                   f'stroke-linecap="round" stroke-linejoin="round"/>')
        for d, c in self.texts:
            fill = C.get(c, INK) if colored else 'none'
            out.append(f'<path d="{d}" fill="{fill}" stroke="{sc}" stroke-width="{LW * .8}" '
                       f'stroke-linejoin="round"/>')
        body = ''.join(o for o in out if o)
        if body_only:
            return body
        size = (f'width="{W}in" height="{H}in"' if px_per_in is None
                else f'width="{int(W * px_per_in)}" height="{int(H * px_per_in)}"')
        return f'<svg xmlns="http://www.w3.org/2000/svg" {size} viewBox="0 0 {W} {H}">{body}</svg>'


def main():
    import cairosvg
    from pypdf import PdfReader, PdfWriter

    s = Sign().build()
    with open(os.path.join(HERE, 'sign-engrave.svg'), 'w') as f:
        f.write(s.svg())
    cairosvg.svg2png(bytestring=s.svg(colored=True, px_per_in=40).encode(),
                     write_to=os.path.join(HERE, 'sign-colored.png'))

    tw, th, ov = 7.5, 10.0, 0.25
    body = s.svg(body_only=True)
    cols, rows = math.ceil((W - ov) / (tw - ov)), math.ceil((H - ov) / (th - ov))
    writer = PdfWriter()
    for r in range(rows):
        for c in range(cols):
            x, y = c * (tw - ov), r * (th - ov)
            page = (f'<svg xmlns="http://www.w3.org/2000/svg" width="8.5in" height="11in" '
                    f'viewBox="0 0 8.5 11"><rect width="8.5" height="11" fill="#fff"/>'
                    f'<svg x="0.5" y="0.5" width="{tw}" height="{th}" viewBox="{x} {y} {tw} {th}">'
                    f'{body}</svg><rect x="0.5" y="0.5" width="{tw}" height="{th}" fill="none" '
                    f'stroke="#999" stroke-width="0.01" stroke-dasharray="0.1 0.1"/>'
                    f'<text x="0.5" y="10.85" font-family="sans-serif" font-size="0.18" fill="#666">'
                    f'Row {r + 1} / Col {c + 1} (tile {r * cols + c + 1} of {rows * cols}) · '
                    f'print at 100% · {ov}" overlap</text>'
                    f'<path d="M7,10.65 h1" stroke="#000" stroke-width="0.02"/>'
                    f'<text x="7" y="10.55" font-size="0.13" font-family="sans-serif">1 inch</text>'
                    f'</svg>')
            buf = io.BytesIO()
            cairosvg.svg2pdf(bytestring=page.encode(), write_to=buf)
            buf.seek(0)
            writer.add_page(PdfReader(buf).pages[0])
    with open(os.path.join(HERE, 'sign-tiles.pdf'), 'wb') as f:
        writer.write(f)


if __name__ == '__main__':
    main()
