"""
Three more takes on the 18" x 42" guest-hub sign, built with the same
engrave-safe engine as build_sign.py (single line weight, hidden lines
removed, every region closed so it can be colored in).

  design2-river-map     the Huzzah winds down the board; each place is a stop
  design3-gristmill     Dillard Mill up top, arrow boards nailed to a post
  design4-badge         park-patch badge, two-column tiles, dogwood footer

Usage:  python docs/signage/build_variants.py
"""
import math

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from shapely import affinity
from shapely.geometry import LineString, Polygon, box
from shapely.ops import unary_union

from build_sign import (B, C, H, W, Layer, Sign, circle, export, font, pine, rbox, ridge,
                        smooth, text_w, wave)

C.update(dogwood='#FBF6EA', center='#D9A93B', leaf='#6E8B4E', post='#7A5434',
         stone='#A39C8E', roof='#4A3A30')

PLACES = [('DILLARD MILL', 'mill', 'mill'), ('HUZZAH CREEK', 'creek', 'canoe'),
          ('COZY COTTAGE', 'cottage', 'cottage'), ('THE SEBASTIAN', 'sebastian', 'tub'),
          ('THE AIRSTREAM', 'airstream', 'airstream'), ('ARGOSY & SHERMAN', 'argosy', 'two'),
          ('TINY CABINS', 'tiny', 'tiny'), ('THE CAFÉ', 'cafe', 'cafe'),
          ('BARN & BATHHOUSE', 'barn', 'barn'), ('PONDS & TRAILS', None, 'fish')]
TITLE = 'AlfaSlabOne-Regular.ttf'
SUB = 'ZillaSlab-Bold.ttf'


def dogwood(L, x, y, r, rot=0):
    """Missouri's state tree: four notched petals + a center."""
    for i in range(4):
        a = math.radians(rot + 45 + 90 * i)
        petal = affinity.scale(circle(0, 0, 1), r * 0.36, r * 0.5)
        notch = circle(0, -r * 0.5, r * 0.1)
        petal = affinity.translate(petal.difference(notch), 0, -r * 0.0)
        petal = affinity.translate(petal, 0, -r * 0.48)
        petal = affinity.rotate(petal, math.degrees(a) - 90 + 90, origin=(0, 0))
        L.add(affinity.translate(petal, x, y), 'dogwood')
    L.add(circle(x, y, r * 0.2), 'center')


def leaf(x, y, length, ang):
    p = Polygon(smooth([(0, 0), (length * .5, -length * .22), (length, 0)], 8) +
                smooth([(length, 0), (length * .5, length * .22), (0, 0)], 8)[1:])
    return affinity.translate(affinity.rotate(p, ang, origin=(0, 0)), x, y)


class Base(Sign):
    def frame(self):
        self.board = rbox(0.4, 0.4, W - 0.4, H - 0.4, 0.8)
        return self.board

    def arc_text(self, s, fname, cap, cx, cy, r, color, bottom=False, sp=0.08):
        cmap, gs, caph = font(fname)
        k = cap / caph
        widths = [gs[cmap[ord(c)]].width * k for c in s]
        total = sum(widths) + sp * (len(s) - 1)
        pen = SVGPathPen(gs)
        cum = 0.0
        for c, w in zip(s, widths):
            off = (cum + w / 2 - total / 2) / r
            th = math.pi / 2 - off if bottom else -math.pi / 2 + off
            phi = th - math.pi / 2 if bottom else th + math.pi / 2
            px, py = cx + r * math.cos(th), cy + r * math.sin(th)
            co, si = math.cos(phi), math.sin(phi)
            gs[cmap[ord(c)]].draw(TransformPen(pen, (k * co, k * si, k * si, -k * co,
                                                     px - w / 2 * co, py - w / 2 * si)))
            cum += w + sp
        self.texts.append((pen.getCommands(), color))

    def take_one(self, geom, color, lines=()):
        L = Layer()
        L.add(geom, color, lines)
        self.take(L)


# --------------------------------------------------------------------------- 2
class RiverMap(Base):
    """The Huzzah runs top to bottom; every destination is a stop along it."""

    def cx(self, y):
        return 9 + 5.2 * math.cos(math.pi * (y - 8.6) / 3.0)

    def build(self):
        frame = self.frame()
        L = Layer(frame)
        ys = [5.0 + i * 0.25 for i in range(160)]
        river = Polygon([(self.cx(y) - 0.95, y) for y in ys] +
                        [(self.cx(y) + 0.95, y) for y in reversed(ys)])
        L.add(river, 'river')
        # header: sky + hills skyline
        L.add(box(0, 0, W, 6.6), 'sky')
        L.add(ridge([(0.2, 5.4), (3.5, 4.4), (7.0, 5.2), (10.5, 4.2), (14.0, 5.0), (18, 4.5)], 6.6),
              'far')
        for x, b, h_, w_ in ((1.8, 6.4, 2.0, 1.2), (3.2, 6.5, 1.5, 0.9), (14.9, 6.4, 2.2, 1.3),
                             (16.3, 6.5, 1.6, 1.0)):
            for g, c in pine(x, b, h_, w_):
                L.add(g, c)
        # footer bank
        L.add(ridge([(0.2, 38.5), (5, 38.9), (9, 38.4), (13, 38.9), (18, 38.5)], H), 'near')
        # stops: pill label reaching to the roomier side + round icon badge on the river
        stops = []
        for i, (title, key, kind) in enumerate(PLACES):
            y = 8.6 + i * 3.0
            x = self.cx(y)
            right = x <= 9
            pill = rbox(x, y - 0.98, 17.0, y + 0.98, 0.98) if right else \
                rbox(1.0, y - 0.98, x, y + 0.98, 0.98)
            L.add(pill, 'plank')
            L.add(circle(x, y, 1.2), 'cream')
            stops.append((title, key, kind, x, y, right))
        self.take(L)
        for title, key, kind, x, y, right in stops:
            self.place_icon(kind, x - 0.75, y - 0.75, 1.5)
            a = 16.0 if right else 2.0
            if B.get(key) is not None:
                self.arrow(a, y, 1.45, B[key])
            t0, t1 = (x + 1.45, a - 0.95) if right else (a + 0.95, x - 1.45)
            self.text(title, TITLE, 0.62, (t0 + t1) / 2, y + 0.31, 'cream', max_w=t1 - t0)
        self.text('PINE VALLEY', TITLE, 1.25, W / 2, 2.35, 'title', max_w=14)
        self.text('FOLLOW THE HUZZAH', SUB, 0.45, W / 2, 3.25, 'ink', sp=0.1)
        self.text('MARK TWAIN NATIONAL FOREST', TITLE, 0.5, W / 2, 40.35, 'cream', max_w=14)
        self.line(frame.exterior)
        return self


# --------------------------------------------------------------------------- 3
class Gristmill(Base):
    """Dillard Mill on the Huzzah, with arrow boards nailed to a center post."""

    def build(self):
        frame = self.frame()
        top = 14.4
        L = Layer(frame.intersection(box(0, 0, W, top)))
        L.add(box(0, 0, W, top), 'sky')
        L.add(ridge([(0.2, 7.0), (3.5, 5.6), (7.5, 6.6), (11, 5.4), (15, 6.4), (18, 5.8)], top), 'far')
        for x, b, h_, w_ in ((1.6, 9.8, 3.0, 1.7), (3.0, 10.0, 2.2, 1.3), (15.0, 9.9, 3.2, 1.8),
                             (16.6, 10.1, 2.2, 1.2)):
            for g, c in pine(x, b, h_, w_):
                L.add(g, c)
        # the mill: roof, wall, windows, door, stone foundation
        L.add(Polygon([(3.9, 5.3), (9.0, 3.3), (14.1, 5.3)]), 'roof')
        wall = box(4.5, 5.15, 13.5, 9.7)
        L.add(wall, 'red')
        for wx in (5.3, 7.0, 10.0, 11.7):
            L.add(box(wx, 7.0, wx + 1.0, 8.4), 'cream', [LineString([(wx + .5, 7), (wx + .5, 8.4)])])
        L.add(box(8.3, 7.4, 9.7, 9.7), 'trunk')
        L.add(box(4.1, 9.7, 13.9, 11.3), 'stone',
              [LineString([(4, 10.5), (14, 10.5)])] +
              [LineString([(x, 9.7), (x, 10.5)]) for x in (5.6, 7.9, 10.2, 12.5)] +
              [LineString([(x, 10.5), (x, 11.3)]) for x in (4.8, 6.8, 9.0, 11.3, 13.3)])
        # the Huzzah spilling over the dam, then a grassy bank
        L.add(box(0, 11.3, W, 12.7), 'river',
              [wave(1.0, 17.0, 11.85, .1, .8), wave(1.4, 16.6, 12.3, .1, .8)])
        L.add(ridge([(0.2, 13.0), (6, 12.6), (12, 13.1), (18, 12.7)], top), 'near')
        self.take(L)
        self.line(LineString([(0.4, top), (W - 0.4, top)]))
        self.text('PINE VALLEY', TITLE, 1.15, W / 2, 2.55, 'title', max_w=14)
        self.text('DILLARD MILL', SUB, 0.55, W / 2, 6.35, 'cream', sp=0.1)

        # post, boards and ground
        P = Layer(frame)
        P.add(box(8.0, top, 10.0, 41.0), 'post')
        P.add(ridge([(0.2, 40.0), (4, 39.7), (9, 40.1), (14, 39.6), (18, 40.0)], H), 'near')
        P.add(affinity.scale(circle(3.2, 40.4, 1), .7, .35), 'stone')
        P.add(affinity.scale(circle(14.6, 40.3, 1), .9, .4), 'stone')
        boards = []
        y = 15.0
        for title, key, kind in PLACES:
            brg = B.get(key)
            left = brg is not None and 180 < brg < 360
            h, pt = 2.05, 0.9
            if left:
                x0, x1 = 1.0, 12.4
                p = Polygon([(x0 + pt, y), (x1, y), (x1, y + h), (x0 + pt, y + h), (x0, y + h / 2)])
            else:
                x0, x1 = 5.6, 17.0
                p = Polygon([(x0, y), (x1 - pt, y), (x1, y + h / 2), (x1 - pt, y + h), (x0, y + h)])
            P.add(p, 'plank')
            boards.append((title, brg, left, x0, x1, y, h, pt))
            y += 2.5
        self.take(P)
        for x in (2.0, 5.5, 12.0, 15.8):   # grass tufts
            self.line(LineString([(x - .3, 40.3), (x - .1, 39.7), (x, 40.2), (x + .15, 39.6),
                                  (x + .3, 40.25)]))
        for title, brg, left, x0, x1, y, h, pt in boards:
            a = 1.45
            if brg is not None:
                ax = x0 + pt + a / 2 + 0.05 if left else x1 - pt - a / 2 - 0.05
                self.arrow(ax, y + h / 2, a, brg)
                t0, t1 = (ax + a / 2 + .25, x1 - .4) if left else (x0 + .4, ax - a / 2 - .25)
            else:
                t0, t1 = x0 + .4, x1 - pt - .3
            self.text(title, TITLE, 0.72, (t0 + t1) / 2, y + h / 2 + 0.36, 'cream', max_w=t1 - t0)
        self.line(frame.exterior)
        return self


# --------------------------------------------------------------------------- 4
class Badge(Base):
    """Park-patch badge with an Ozark scene, tiles below, dogwood footer."""

    def build(self):
        frame = self.frame()
        cx, cy, Ro, Ri = 9.0, 8.6, 7.6, 5.6
        R = Layer()
        R.add(circle(cx, cy, Ro), 'cream')
        dogwood(R, cx - (Ro + Ri) / 2, cy, 0.85)
        dogwood(R, cx + (Ro + Ri) / 2, cy, 0.85, rot=20)
        self.take(R)
        inner = circle(cx, cy, Ri)
        S = Layer(inner)
        S.add(inner, 'sky')
        S.add(circle(11.6, 6.3, 1.0), 'sun')
        S.add(ridge([(3, 8.5), (5.5, 7.1), (8, 8.0), (10.5, 6.9), (13, 7.7), (15, 7.2)], 15), 'far')
        S.add(ridge([(3, 9.9), (6, 9.1), (9, 10.0), (12, 8.9), (15, 9.5)], 15), 'near')
        bluff = Polygon(smooth([(3, 9.4), (5.0, 9.0), (6.6, 9.4)], 8) +
                        [(7.2, 10.2), (7.0, 11.2), (7.5, 12.2), (3, 12.2)])
        S.add(bluff, 'bluff', [LineString([(3, y), (7.8, y + .1)]) for y in (10.2, 11.2)])
        for x, b, h_, w_ in ((4.4, 9.25, 2.2, 1.3), (12.3, 9.2, 2.6, 1.5), (13.9, 9.5, 1.9, 1.1)):
            for g, c in pine(x, b, h_, w_):
                S.add(g, c)
        left = smooth([(9.2, 10.0), (8.6, 10.9), (8.3, 11.9), (6.8, 13.2), (5.4, 14.6)], 10)
        right = smooth([(9.9, 10.0), (10.6, 10.9), (10.4, 11.9), (11.8, 13.2), (13.4, 14.6)], 10)
        S.add(Polygon(left + right[::-1]), 'river', [wave(8.8, 10.4, 11.0, .06, .5)])
        S.add(Polygon(smooth([(8.4, 12.5), (9.1, 13.0), (10.3, 13.0), (11.0, 12.5)], 10)), 'canoe')
        self.take(S)
        self.arc_text('PINE VALLEY', TITLE, 1.05, cx, cy, Ri + 0.42, 'title', sp=0.12)
        self.arc_text('DILLARD MILL', SUB, 0.7, cx, cy, Ro - 0.45, 'ink', bottom=True, sp=0.14)

        # two-column tiles
        T = Layer()
        tiles = []
        for i, (title, key, kind) in enumerate(PLACES):
            col, row = i % 2, i // 2
            x0 = 1.0 if col == 0 else 9.2
            y0 = 17.0 + row * 3.6
            T.add(rbox(x0, y0, x0 + 7.8, y0 + 3.25, 0.45), 'plank')
            tiles.append((title, key, kind, x0, y0))
        self.take(T)
        for title, key, kind, x0, y0 in tiles:
            self.place_icon(kind, x0 + 0.45, y0 + 0.3, 1.6)
            if B.get(key) is not None:
                self.arrow(x0 + 7.8 - 1.2, y0 + 1.1, 1.5, B[key])
            self.text(title, TITLE, 0.6, x0 + 3.9, y0 + 2.8, 'cream', max_w=7.0)

        # dogwood branch footer
        F = Layer()
        branch = LineString(smooth([(1.4, 37.6), (5, 36.8), (9, 37.4), (13, 36.7), (16.6, 37.4)], 12))
        for x, y, ang in ((3.2, 37.2, -140), (6.6, 37.0, 30), (11.3, 37.0, -150), (14.8, 37.0, 25)):
            F.add(leaf(x, y, 1.3, ang), 'leaf', [LineString([(x, y), (x + 1.0 * math.cos(math.radians(ang)),
                                                                     y + 1.0 * math.sin(math.radians(ang)))])])
        for x, y, r, rot in ((4.8, 36.9, 1.0, 10), (9.0, 37.4, 1.15, 0), (13.2, 36.8, 1.0, -15)):
            dogwood(F, x, y, r, rot)
        self.line(branch.difference(unary_union([g for g, _, _ in F.items])))
        self.take(F)
        self.text('MARK TWAIN NATIONAL FOREST', TITLE, 0.5, W / 2, 39.85, 'pine', max_w=14.5)
        self.text('MISSOURI OZARKS', SUB, 0.4, W / 2, 40.65, 'ink', sp=0.12)
        self.line(frame.exterior)
        return self


if __name__ == '__main__':
    export(RiverMap().build(), 'design2-river-map')
    export(Gristmill().build(), 'design3-gristmill')
    export(Badge().build(), 'design4-badge')
