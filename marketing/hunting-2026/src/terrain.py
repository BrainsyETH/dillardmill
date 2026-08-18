"""
ROUTED GROUND — terrain engine.

Builds a continuous scalar elevation field over the unit square, then extracts
iso-contours from it with marching squares. The contours are the visual bed of
every composition in this set: hundreds of individually computed strokes that
read as tone from across a room and as topography up close.

The field is a sum of radial basis hills (Ozark upland) with a meandering
trough carved through it (a creek valley). Everything is seeded, so the terrain
is identical across the print sheet and both social cuts — the same ground,
photographed at three different crops.
"""

import math
import random

# --------------------------------------------------------------------------
# scalar field
# --------------------------------------------------------------------------


def _smoothstep(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


class Terrain:
    """Continuous elevation field on [0,1]^2, sampled on demand."""

    def __init__(self, seed=1908, n_hills=17, r_lo=0.10, r_hi=0.42):
        rng = random.Random(seed)
        self.hills = []
        for _ in range(n_hills):
            self.hills.append(
                (
                    rng.uniform(-0.25, 1.25),      # cx
                    rng.uniform(-0.25, 1.25),      # cy
                    rng.uniform(r_lo, r_hi),       # radius
                    rng.uniform(0.35, 1.00),       # amplitude
                    rng.uniform(0.55, 1.9),        # anisotropy
                    rng.uniform(0, math.pi),       # rotation
                )
            )
        # meandering creek: a polyline the trough follows
        self.creek = []
        x, y = -0.12, 0.30
        head = rng.uniform(-0.35, 0.15)
        while x < 1.14:
            self.creek.append((x, y))
            head += rng.uniform(-0.55, 0.55)
            head = max(-0.95, min(0.95, head))
            x += 0.045
            y += 0.045 * head
            y = max(0.06, min(0.94, y))

    def _creek_dist(self, px, py):
        best = 9.9
        pts = self.creek
        for i in range(len(pts) - 1):
            ax, ay = pts[i]
            bx, by = pts[i + 1]
            dx, dy = bx - ax, by - ay
            L = dx * dx + dy * dy
            if L <= 1e-12:
                continue
            t = ((px - ax) * dx + (py - ay) * dy) / L
            t = max(0.0, min(1.0, t))
            qx, qy = ax + t * dx, ay + t * dy
            d = math.hypot(px - qx, py - qy)
            if d < best:
                best = d
        return best

    def height(self, x, y):
        h = 0.0
        for cx, cy, r, amp, aniso, rot in self.hills:
            dx, dy = x - cx, y - cy
            c, s = math.cos(rot), math.sin(rot)
            u = (dx * c - dy * s) * aniso
            v = (dx * s + dy * c) / aniso
            d2 = (u * u + v * v) / (r * r)
            h += amp * math.exp(-d2)
        # carve the valley
        cd = self._creek_dist(x, y)
        h -= 1.05 * math.exp(-(cd * cd) / (0.042 * 0.042))
        return h

    def grid(self, nx, ny):
        return [
            [self.height(i / (nx - 1.0), j / (ny - 1.0)) for i in range(nx)]
            for j in range(ny)
        ]


# --------------------------------------------------------------------------
# marching squares
# --------------------------------------------------------------------------


def _interp(p1, p2, v1, v2, level):
    if abs(v2 - v1) < 1e-12:
        return p1
    t = (level - v1) / (v2 - v1)
    return (p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1]))


def iso_segments(field, level, nx, ny):
    """Extract line segments along `level` from a sampled field."""
    segs = []
    for j in range(ny - 1):
        for i in range(nx - 1):
            # corners: sw, se, ne, nw
            v = (
                field[j][i],
                field[j][i + 1],
                field[j + 1][i + 1],
                field[j + 1][i],
            )
            idx = 0
            if v[0] > level:
                idx |= 1
            if v[1] > level:
                idx |= 2
            if v[2] > level:
                idx |= 4
            if v[3] > level:
                idx |= 8
            if idx in (0, 15):
                continue
            x0, x1 = i / (nx - 1.0), (i + 1) / (nx - 1.0)
            y0, y1 = j / (ny - 1.0), (j + 1) / (ny - 1.0)
            sw, se, ne, nw = (x0, y0), (x1, y0), (x1, y1), (x0, y1)
            # edge crossings: bottom, right, top, left
            eb = _interp(sw, se, v[0], v[1], level)
            er = _interp(se, ne, v[1], v[2], level)
            et = _interp(nw, ne, v[3], v[2], level)
            el = _interp(sw, nw, v[0], v[3], level)
            table = {
                1: [(el, eb)], 2: [(eb, er)], 3: [(el, er)],
                4: [(er, et)], 6: [(eb, et)], 7: [(el, et)],
                8: [(et, el)], 9: [(et, eb)], 11: [(et, er)],
                12: [(er, el)], 13: [(er, eb)], 14: [(eb, el)],
            }
            if idx in (5, 10):
                centre = (v[0] + v[1] + v[2] + v[3]) / 4.0
                if (centre > level) == (idx == 5):
                    pairs = [(el, et), (eb, er)] if idx == 5 else [(et, er), (el, eb)]
                else:
                    pairs = [(el, eb), (er, et)] if idx == 5 else [(et, el), (eb, er)]
                segs.extend(pairs)
            else:
                segs.extend(table[idx])
    return segs


def _key(p, q=1e6):
    return (int(round(p[0] * q)), int(round(p[1] * q)))


def stitch(segs):
    """Join unordered segments into the longest possible polylines.

    Each segment is consumed exactly once. Chains grow from both ends until
    no unused segment shares an endpoint, which yields whole contour rings
    rather than the shattered fragments a naive pass produces.
    """
    adj = {}
    for i, (a, b) in enumerate(segs):
        adj.setdefault(_key(a), []).append(i)
        adj.setdefault(_key(b), []).append(i)

    used = [False] * len(segs)
    lines = []

    for i0 in range(len(segs)):
        if used[i0]:
            continue
        used[i0] = True
        a, b = segs[i0]
        head = [a]          # grows backward
        tail = [b]          # grows forward

        for chain, start in ((tail, b), (head, a)):
            cur = start
            while True:
                nxt = None
                for j in adj.get(_key(cur), ()):
                    if used[j]:
                        continue
                    p, q = segs[j]
                    if _key(p) == _key(cur):
                        other = q
                    elif _key(q) == _key(cur):
                        other = p
                    else:
                        continue
                    used[j] = True
                    nxt = other
                    break
                if nxt is None:
                    break
                chain.append(nxt)
                cur = nxt

        head.reverse()
        lines.append(head + tail)
    return lines


def arclen(pts):
    return sum(math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
               for i in range(len(pts) - 1))


def decimate(pts, tol):
    """Drop vertices closer than `tol` — grid output is far denser than needed."""
    if len(pts) < 3:
        return pts
    out = [pts[0]]
    for p in pts[1:-1]:
        if math.hypot(p[0] - out[-1][0], p[1] - out[-1][1]) >= tol:
            out.append(p)
    out.append(pts[-1])
    return out


def chaikin(pts, iterations=2, closed=False):
    """Corner-cutting smoothing — turns faceted grid output into drawn line."""
    for _ in range(iterations):
        if len(pts) < 3:
            return pts
        out = [] if closed else [pts[0]]
        rng = range(len(pts)) if closed else range(len(pts) - 1)
        for i in rng:
            p = pts[i]
            q = pts[(i + 1) % len(pts)]
            out.append((0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]))
            out.append((0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]))
        if not closed:
            out.append(pts[-1])
        pts = out
    return pts


def contour_set(seed=1908, nx=190, ny=240, n_levels=19, smooth=2,
                min_len=0.035, tol=0.0045, n_hills=17,
                r_lo=0.10, r_hi=0.42):
    """Full pipeline: field -> iso-lines -> stitched, decimated, smoothed.

    Returns a list of (level_index, polyline) in unit coordinates, ordered
    low ground to high.
    """
    t = Terrain(seed=seed, n_hills=n_hills, r_lo=r_lo, r_hi=r_hi)
    fld = t.grid(nx, ny)
    lo = min(min(r) for r in fld)
    hi = max(max(r) for r in fld)
    levels = [lo + (hi - lo) * (i / (n_levels + 1.0))
              for i in range(1, n_levels + 1)]

    out = []
    for li, lv in enumerate(levels):
        segs = iso_segments(fld, lv, nx, ny)
        if not segs:
            continue
        for line in stitch(segs):
            if arclen(line) < min_len:
                continue
            line = decimate(line, tol)
            if len(line) < 4:
                continue
            closed = math.hypot(line[0][0] - line[-1][0],
                                line[0][1] - line[-1][1]) < 0.012
            out.append((li, chaikin(line, smooth, closed)))
    return out


if __name__ == "__main__":
    import time
    t0 = time.time()
    cs = contour_set()
    print("contour polylines:", len(cs))
    print("total vertices:", sum(len(p) for _, p in cs))
    print("levels present:", len({li for li, _ in cs}))
    print("longest:", max(len(p) for _, p in cs), "vertices")
    print("elapsed: %.1fs" % (time.time() - t0))
