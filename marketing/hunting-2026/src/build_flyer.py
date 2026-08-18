#!/usr/bin/env python3
"""
ROUTED GROUND — Pine Valley hunting-season flyer.

Emits an 8.5x11 print sheet (HTML -> Chromium -> vector PDF) plus 1:1 and 9:16
social cuts. All three share one terrain: the same seeded contour field, cropped
three different ways, so the set reads as one survey.

Ground is paper. Marks are evidence. Rust is the only raised voice.
"""

import base64
import io
import math
import os
import subprocess

from PIL import Image, ImageOps

from terrain import contour_set

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = "/root/.claude/skills/synced/canvas-design/canvas-fonts"
DRONE = "/home/user/dillardmill/public/property-drone.PNG"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

# ---------------------------------------------------------------- palette
ESPRESSO = "#3A2A1E"
PARCHMENT = "#F4F1EB"
CHARCOAL = "#2B2B2B"
OLIVE = "#6B7A5A"
RIVER = "#6F8291"
TAN = "#CBB8A3"
RUST = "#9C5A3C"

# ---------------------------------------------------------------- content
PHONE = "(314) 843-4321"
SITE = "dillardmill.com"
HANDLE = "@pinevalleydm"
ADDRESS = "126 Dillard Mill Road · Davisville, Missouri 65456"

SHOOTING_LIGHT = [
    ("FRI NOV 13", "06:13", "17:25"),
    ("SAT NOV 14", "06:14", "17:24"),
    ("SUN NOV 15", "06:15", "17:23"),
]

BUILDINGS = [
    ("TT CAFÉ", "2 queens + 1 full", "Commercial kitchen · seats thirty"),
    ("COZY COTTAGE", "2 doubles", "Full kitchen · bath · propane fire"),
    ("TINY CABIN No. 1", "1 queen", "Heat and air · courtyard"),
    ("TINY CABIN No. 2", "1 queen", "Heat and air · courtyard"),
]

EDGES = [
    ("NO ANTLER-POINT RESTRICTION",
     "Dropped statewide for the 2026 season."),
    ("NO MANDATORY CWD CHECK",
     "Crawford County is off the 2026 sampling rotation."),
    ("ROOM FOR THE RIG",
     "Trucks, trailers and UTVs park at the door."),
    ("COME AND GO IN THE DARK",
     "Late arrival. Pre-dawn departure. Nobody waits up."),
]

# season bands within the Oct 1 – Nov 30 window (day offsets from Oct 1)
def _d(month, day):
    return (day - 1) if month == 10 else (31 + day - 1)


SEASONS = [
    ("ARCHERY", _d(10, 1), _d(11, 13), OLIVE, False),
    ("FALL TURKEY", _d(10, 1), _d(10, 31), RIVER, False),
    ("ANTLERLESS", _d(10, 9), _d(10, 11), TAN, False),
    ("YOUTH", _d(10, 24), _d(10, 25), TAN, False),
    ("FIREARMS DEER", _d(11, 14), _d(11, 24), RUST, True),
    ("ARCHERY RESUMES", _d(11, 25), _d(11, 30), OLIVE, False),
]
WINDOW_DAYS = 61  # Oct 1 .. Nov 30


# ---------------------------------------------------------------- helpers
def b64_font(name):
    with open(os.path.join(FONTS, name), "rb") as f:
        return base64.b64encode(f.read()).decode()


def duotone(path, dark=ESPRESSO, light=PARCHMENT, gamma=1.28,
            lo=0.0, hi=1.0):
    """Map a photograph onto the two-colour ramp of the palette.

    A plan-view aerial in duotone stops reading as a snapshot and starts
    reading as a plate in a survey report — which is also the most forgiving
    treatment for a source image that is only 1280px wide.
    """
    im = Image.open(path).convert("L")
    im = ImageOps.autocontrast(im, cutoff=(1.5, 0.5))
    dr, dg, db = (int(dark[i:i + 2], 16) for i in (1, 3, 5))
    lr, lg, lb = (int(light[i:i + 2], 16) for i in (1, 3, 5))
    ramp = []
    for i in range(256):
        t = (i / 255.0) ** gamma
        t = lo + t * (hi - lo)
        ramp.append((
            int(dr + (lr - dr) * t),
            int(dg + (lg - dg) * t),
            int(db + (lb - db) * t),
        ))
    out = Image.new("RGB", im.size)
    px = im.load()
    op = out.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            op[x, y] = ramp[px[x, y]]
    buf = io.BytesIO()
    out.save(buf, "PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode()


def path_d(pts, w, h, ox=0.0, oy=0.0, sx=1.0, sy=1.0):
    """Unit-square polyline -> SVG path data in the target box."""
    out = []
    for i, (x, y) in enumerate(pts):
        px = (ox + x * sx) * w
        py = (oy + (1 - y) * sy) * h
        out.append(("M" if i == 0 else "L") + f"{px:.2f},{py:.2f}")
    return "".join(out)


def contour_svg(w, h, contours, n_levels, ox=0.0, oy=0.0, sx=1.0, sy=1.0,
                base_op=0.30, index_every=5, color=TAN, index_color=OLIVE):
    """The visual bed: hundreds of thin marks that read as tone from a distance.

    Every fifth line is an index contour, drawn heavier — the convention that
    makes a real topographic sheet legible, and the thing that makes this read
    as survey rather than decoration.
    """
    parts = []
    for li, pts in contours:
        idx = (li % index_every == 0)
        sw = 0.9 if idx and li else 0.45
        op = base_op * (1.30 if idx else 1.0)
        col = index_color if idx else color
        parts.append(
            f'<path d="{path_d(pts, w, h, ox, oy, sx, sy)}" fill="none" '
            f'stroke="{col}" stroke-width="{sw}" stroke-opacity="{op:.3f}" '
            f'stroke-linejoin="round" stroke-linecap="round"/>'
        )
    return "\n".join(parts)


def ticks_svg(w, h, inset, n=None, every=24, length=5, color=ESPRESSO,
              op=0.5, sw=0.7):
    """Coordinate ticks stepping along the neatline."""
    p = []
    x = inset
    while x <= w - inset:
        p.append(f'<line x1="{x:.1f}" y1="{inset}" x2="{x:.1f}" '
                 f'y2="{inset - length}" stroke="{color}" stroke-width="{sw}" '
                 f'stroke-opacity="{op}"/>')
        p.append(f'<line x1="{x:.1f}" y1="{h - inset}" x2="{x:.1f}" '
                 f'y2="{h - inset + length}" stroke="{color}" '
                 f'stroke-width="{sw}" stroke-opacity="{op}"/>')
        x += every
    y = inset
    while y <= h - inset:
        p.append(f'<line x1="{inset}" y1="{y:.1f}" x2="{inset - length}" '
                 f'y2="{y:.1f}" stroke="{color}" stroke-width="{sw}" '
                 f'stroke-opacity="{op}"/>')
        p.append(f'<line x1="{w - inset}" y1="{y:.1f}" '
                 f'x2="{w - inset + length}" y2="{y:.1f}" stroke="{color}" '
                 f'stroke-width="{sw}" stroke-opacity="{op}"/>')
        y += every
    return "\n".join(p)


def season_strip(w, h, label_w=104, row_h=10.0, gap=2.6):
    """A day-accurate calendar of the Oct–Nov seasons.

    Not a list of dates set in type — an actual measured timeline, which is
    both the more useful object for a hunter and the more honest one for a
    piece built on survey language.
    """
    rows = len(SEASONS)
    track_x = label_w
    track_w = w - label_w - 30
    parts = []

    # month rule + day ticks
    top = 0
    parts.append(f'<line x1="{track_x}" y1="{top}" x2="{track_x + track_w}" '
                 f'y2="{top}" stroke="{ESPRESSO}" stroke-width="0.6" '
                 f'stroke-opacity="0.45"/>')
    for d in range(WINDOW_DAYS + 1):
        x = track_x + track_w * d / WINDOW_DAYS
        major = d in (0, 31, WINDOW_DAYS)
        ln = 5 if major else (3 if d % 7 == 0 else 0)
        if ln:
            parts.append(f'<line x1="{x:.2f}" y1="{top}" x2="{x:.2f}" '
                         f'y2="{top - ln}" stroke="{ESPRESSO}" '
                         f'stroke-width="{0.8 if major else 0.5}" '
                         f'stroke-opacity="{0.6 if major else 0.35}"/>')
    parts.append(f'<text x="{track_x - 8}" y="{top - 7}" class="mono tick" '
                 f'text-anchor="end" style="fill-opacity:.85">'
                 f'2026 SEASONS</text>')
    for lbl, d in (("OCT", 0), ("NOV", 31)):
        x = track_x + track_w * d / WINDOW_DAYS
        parts.append(f'<text x="{x + 3:.2f}" y="{top - 7}" class="mono tick">'
                     f'{lbl}</text>')

    for i, (name, a, b, col, hero) in enumerate(SEASONS):
        y = top + 10 + i * (row_h + gap)
        x0 = track_x + track_w * a / WINDOW_DAYS
        x1 = track_x + track_w * (b + 1) / WINDOW_DAYS
        parts.append(f'<rect x="{x0:.2f}" y="{y:.2f}" width="{x1 - x0:.2f}" '
                     f'height="{row_h}" fill="{col}" '
                     f'fill-opacity="{1.0 if hero else 0.42}"/>')
        if hero:
            parts.append(f'<rect x="{x0:.2f}" y="{y:.2f}" '
                         f'width="{x1 - x0:.2f}" height="{row_h}" fill="none" '
                         f'stroke="{ESPRESSO}" stroke-width="0.8"/>')
        parts.append(f'<text x="{track_x - 8}" y="{y + row_h - 2.4:.2f}" '
                     f'class="mono srow{" hero" if hero else ""}" '
                     f'text-anchor="end">{name}</text>')

    total_h = top + 10 + rows * (row_h + gap)
    return "\n".join(parts), total_h


def render(html_path, pdf_path=None, png_path=None, w_px=816, h_px=1056,
           scale=2, page=None):
    common = [CHROME, "--headless", "--disable-gpu", "--no-sandbox",
              "--hide-scrollbars", "--disable-dev-shm-usage",
              "--allow-file-access-from-files"]
    if pdf_path:
        subprocess.run(
            common + ["--print-to-pdf=" + pdf_path, "--no-pdf-header-footer",
                      "file://" + html_path],
            check=True, capture_output=True, timeout=180)
    if png_path:
        pad = 200
        subprocess.run(
            common + [f"--force-device-scale-factor={scale}",
                      "--virtual-time-budget=4000",
                      f"--window-size={w_px},{h_px + pad}",
                      "--screenshot=" + png_path, "file://" + html_path],
            check=True, capture_output=True, timeout=180)
        im = Image.open(png_path)
        im.crop((0, 0, w_px * scale, h_px * scale)).save(png_path)


# ================================================================ print sheet
W, H = 816, 1056           # 8.5 x 11 in at 96 dpi
NEAT = 34                  # neatline inset
CX, CW = 64, 688           # content column
GUT = 34
PHOTO_W, PHOTO_H = 284, 160
DATA_X = CX + PHOTO_W + GUT
DATA_W = CW - PHOTO_W - GUT

# vertical rhythm — every band measured, nothing left to chance
Y_LEDGER, Y_RULE, Y_EYE, Y_HEAD = 62, 80, 98, 112
Y_SUB, Y_PLATE, Y_PRICE = 292, 346, 536
Y_COLS, Y_BATHS, Y_STRIP, Y_FOOT = 638, 806, 832, 944
Y_PANEL = 818
PRICE_H, ROW_H = 86, 36

FONT_FILES = {
    "NP": "NationalPark-Bold.ttf",
    "NPR": "NationalPark-Regular.ttf",
    "MONO": "IBMPlexMono-Regular.ttf",
    "MONOB": "IBMPlexMono-Bold.ttf",
    "SER": "CrimsonPro-Regular.ttf",
    "SERI": "CrimsonPro-Italic.ttf",
}


def font_face_block():
    return "\n".join(
        f"@font-face{{font-family:{k};src:url(data:font/ttf;base64,"
        f"{b64_font(v)}) format('truetype');font-weight:normal;"
        f"font-style:normal}}" for k, v in FONT_FILES.items())


def base_css():
    return f"""
@page {{ size: 8.5in 11in; margin: 0; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html,body {{ width:{W}px; height:{H}px; }}
body {{ background:{PARCHMENT}; position:relative; overflow:hidden;
        -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
.abs {{ position:absolute; }}
svg text.mono {{ font-family:MONO; }}
.tick {{ font-size:7px; fill:{ESPRESSO}; fill-opacity:.6; letter-spacing:.14em; }}
.srow {{ font-size:7.2px; fill:{ESPRESSO}; fill-opacity:.75; letter-spacing:.1em; }}
.srow.hero {{ fill:{RUST}; fill-opacity:1; font-family:MONOB; }}
.ledger {{ font-family:MONO; font-size:7.4px; letter-spacing:.19em;
           color:{ESPRESSO}; opacity:.62; text-transform:uppercase; }}
.eyebrow {{ font-family:MONOB; font-size:9.4px; letter-spacing:.30em;
            color:{RUST}; text-transform:uppercase; }}
.subhead {{ font-family:SERI; font-size:16.5px; line-height:21px; color:{ESPRESSO}; }}
.subhead b {{ font-family:SER; font-style:normal; }}
.plate {{ border:1px solid {ESPRESSO}; display:block; }}
.platecap {{ font-family:MONO; font-size:7px; letter-spacing:.16em;
             color:{ESPRESSO}; opacity:.72; text-transform:uppercase; }}
.dhead {{ font-family:MONOB; font-size:8.2px; letter-spacing:.24em;
          color:{ESPRESSO}; text-transform:uppercase; }}
.slrow {{ position:absolute; left:0; width:100%; font-family:MONO;
          font-size:11.5px; color:{ESPRESSO}; height:19px; }}
.slrow .sld {{ position:absolute; left:0; letter-spacing:.1em; opacity:.82; }}
.slrow .sla {{ position:absolute; left:132px; font-family:MONOB; }}
.slrow .sldash {{ position:absolute; left:186px; opacity:.4; }}
.slrow .slb {{ position:absolute; left:206px; font-family:MONOB; }}
.dnote {{ font-family:MONO; font-size:6.6px; line-height:10px;
          letter-spacing:.05em; color:{ESPRESSO}; opacity:.62;
          text-transform:uppercase; }}
.pricebar {{ background:{ESPRESSO}; }}
.pricenum {{ font-family:NP; font-size:70px; line-height:70px;
             color:{PARCHMENT}; letter-spacing:-.015em; }}
.pricelab {{ font-family:MONOB; font-size:8.6px; letter-spacing:.26em;
             color:{TAN}; text-transform:uppercase; }}
.pricesub {{ font-family:SERI; font-size:15px; color:{PARCHMENT}; opacity:.9; }}
.vr {{ background:{TAN}; opacity:.38; }}
.colhead {{ font-family:MONOB; font-size:8.2px; letter-spacing:.24em;
            color:{RUST}; text-transform:uppercase; }}
.brow, .erow {{ position:absolute; left:0; width:100%; height:{ROW_H}px; }}
.bname {{ position:absolute; left:0; top:0; font-family:NPR; font-size:16px;
          line-height:18px; color:{ESPRESSO}; letter-spacing:.01em; }}
.bbeds {{ position:absolute; right:0; top:5px; font-family:MONOB;
          font-size:8.4px; letter-spacing:.1em; color:{RUST};
          text-transform:uppercase; }}
.bnote {{ position:absolute; left:0; top:19px; font-family:SER;
          font-size:12.5px; line-height:14px; color:{CHARCOAL}; opacity:.8; }}
.ehead {{ position:absolute; left:0; top:0; font-family:MONOB; font-size:9px;
          letter-spacing:.13em; color:{ESPRESSO}; text-transform:uppercase; }}
.esub {{ position:absolute; left:0; top:14px; font-family:SER;
         font-size:12.5px; line-height:14px; color:{CHARCOAL}; opacity:.8; }}
.rule {{ background:{ESPRESSO}; opacity:.28; }}
.legendpanel {{ background:rgba(244,241,235,.90);
                border:0.5px solid rgba(58,42,30,.30); }}
.footband {{ background:{ESPRESSO}; }}
.fphone {{ font-family:NP; font-size:34px; line-height:34px; color:{PARCHMENT};
           letter-spacing:.01em; }}
.fsite {{ font-family:MONOB; font-size:10px; letter-spacing:.22em;
          color:{TAN}; text-transform:uppercase; }}
.faddr {{ font-family:MONO; font-size:7.4px; letter-spacing:.15em;
          color:{TAN}; opacity:.72; text-transform:uppercase; }}
.fnote {{ font-family:SERI; font-size:13px; color:{PARCHMENT}; opacity:.92; }}
"""


def print_sheet():
    contours = contour_set(n_levels=46, min_len=0.014, n_hills=42,
                           nx=230, ny=290, r_lo=0.055, r_hi=0.20,
                           tol=0.0035)
    photo = duotone(DRONE)
    bed = contour_svg(W, H, contours, 44, ox=-0.05, oy=-0.04,
                      sx=1.10, sy=1.09, base_op=0.30)
    tick = ticks_svg(W, H, NEAT, every=24)
    strip, strip_h = season_strip(CW, 0)

    b_rows = "".join(
        f'<div class="brow" style="top:{i * ROW_H}px">'
        f'<div class="bname">{n}</div><div class="bbeds">{b}</div>'
        f'<div class="bnote">{note}</div></div>'
        for i, (n, b, note) in enumerate(BUILDINGS))

    e_rows = "".join(
        f'<div class="erow" style="top:{i * ROW_H}px">'
        f'<div class="ehead">{h}</div><div class="esub">{s}</div></div>'
        for i, (h, s) in enumerate(EDGES))

    sl_rows = "".join(
        f'<div class="slrow" style="top:{20 + i * 19}px">'
        f'<span class="sld">{d}</span><span class="sla">{a}</span>'
        f'<span class="sldash">—</span><span class="slb">{b}</span></div>'
        for i, (d, a, b) in enumerate(SHOOTING_LIGHT))

    html = f"""<!doctype html><meta charset="utf-8">
<style>{font_face_block()}{base_css()}</style>

<svg class="abs" width="{W}" height="{H}" style="left:0;top:0">
  <defs><clipPath id="neat">
    <rect x="{NEAT}" y="{NEAT}" width="{W - 2 * NEAT}" height="{H - 2 * NEAT}"/>
  </clipPath></defs>
  <g clip-path="url(#neat)">{bed}</g>
  {tick}
  <rect x="{NEAT}" y="{NEAT}" width="{W - 2 * NEAT}" height="{H - 2 * NEAT}"
        fill="none" stroke="{ESPRESSO}" stroke-width="1.1"/>
  <rect x="{NEAT + 4}" y="{NEAT + 4}" width="{W - 2 * NEAT - 8}"
        height="{H - 2 * NEAT - 8}" fill="none" stroke="{ESPRESSO}"
        stroke-width="0.5" stroke-opacity="0.45"/>
</svg>

<div class="abs ledger" style="left:{CX}px;top:{Y_LEDGER}px">
  PINE VALLEY AT DILLARD MILL</div>
<div class="abs ledger" style="left:{CX}px;top:{Y_LEDGER}px;width:{CW}px;
     text-align:right">37.7241 N &nbsp; 91.2061 W &nbsp;·&nbsp; CRAWFORD CO., MO</div>
<div class="abs rule" style="left:{CX}px;top:{Y_RULE}px;width:{CW}px;height:1px"></div>

<div class="abs eyebrow" style="left:{CX}px;top:{Y_EYE}px">
  NOVEMBER FIREARMS DEER &nbsp;·&nbsp; NOV 14 – 24, 2026</div>

<svg class="abs" width="{CW}" height="180" style="left:{CX}px;top:{Y_HEAD}px">
  <text x="0" y="100" textLength="{CW}" lengthAdjust="spacing"
        style="font-family:NP;font-size:136px;fill:{ESPRESSO}">BASE CAMP</text>
  <text x="0" y="159" textLength="{CW}" lengthAdjust="spacing"
        style="font-family:NP;font-size:66px;fill:{RUST}">FOR THE MARK TWAIN</text>
</svg>

<div class="abs subhead" style="left:{CX}px;top:{Y_SUB}px;width:{CW - 70}px">
  Four buildings, one commercial kitchen, and ten hunters — on the edge of the
  National Forest at Dillard Mill. <b>Sleep indoors. Wake up already there.</b>
</div>

<img class="abs plate" src="data:image/png;base64,{photo}"
     style="left:{CX}px;top:{Y_PLATE}px;width:{PHOTO_W}px;height:{PHOTO_H}px"/>
<div class="abs platecap" style="left:{CX}px;top:{Y_PLATE + PHOTO_H + 8}px">
  PLATE I &nbsp;·&nbsp; VERTICAL AERIAL &nbsp;·&nbsp; 43 ACRES</div>

<div class="abs" style="left:{DATA_X}px;top:{Y_PLATE}px;width:{DATA_W}px;
     height:{PHOTO_H}px">
  <div class="dhead">LEGAL SHOOTING LIGHT</div>
  <div class="abs rule" style="left:0;top:13px;width:100%;height:1px"></div>
  {sl_rows}
  <div class="abs dnote" style="left:0;top:84px;width:100%">
    ONE HALF HOUR BEFORE SUNRISE TO ONE HALF HOUR AFTER SUNSET · CST ·
    COMPUTED FOR 37.7241 N, 91.2061 W · CONFIRM AGAINST CURRENT MDC REGULATIONS
  </div>
  <div class="abs rule" style="left:0;top:126px;width:100%;height:1px"></div>
  <div class="abs dnote" style="left:0;top:133px;width:100%;opacity:.85">
    PINE VALLEY IS LODGING. THE HUNTING IS ON THE PUBLIC GROUND NEXT DOOR.
  </div>
</div>

<div class="abs pricebar" style="left:{CX}px;top:{Y_PRICE}px;width:{CW}px;
     height:{PRICE_H}px">
  <div class="abs pricenum" style="left:30px;top:9px">$2,000</div>
  <div class="abs vr" style="left:300px;top:16px;width:1px;height:54px"></div>
  <div class="abs pricelab" style="left:330px;top:16px">THE WEEKEND</div>
  <div class="abs pricesub" style="left:330px;top:30px">
    Friday to Sunday · two nights</div>
  <div class="abs pricelab" style="left:330px;top:56px">UP TO 10 HUNTERS</div>
  <div class="abs fnote" style="right:30px;top:24px;text-align:right;
       width:190px;line-height:17px">The whole camp.<br>One party at a time.</div>
</div>

<div class="abs" style="left:{CX}px;top:{Y_COLS}px;width:{PHOTO_W}px">
  <div class="colhead">FOUR BUILDINGS · SLEEPS UP TO 10</div>
  <div class="abs rule" style="left:0;top:13px;width:100%;height:1px"></div>
  <div class="abs" style="left:0;top:20px;width:100%">{b_rows}</div>
</div>
<div class="abs" style="left:{DATA_X}px;top:{Y_COLS}px;width:{DATA_W}px">
  <div class="colhead">WHY THIS COUNTY, THIS YEAR</div>
  <div class="abs rule" style="left:0;top:13px;width:100%;height:1px"></div>
  <div class="abs" style="left:0;top:20px;width:100%">{e_rows}</div>
</div>

<div class="abs platecap" style="left:{CX}px;top:{Y_BATHS}px">
  TWO FULL BATHS &nbsp;·&nbsp; ONE SHARED KITCHEN &nbsp;·&nbsp;
  WALKING DISTANCE TO DILLARD MILL</div>

<div class="abs legendpanel" style="left:{CX - 12}px;top:{Y_PANEL}px;
     width:{CW + 24}px;height:{Y_FOOT - 6 - Y_PANEL}px"></div>
<svg class="abs" width="{CW}" height="{strip_h + 16}"
     style="left:{CX}px;top:{Y_STRIP}px">
  <g transform="translate(0,16)">{strip}</g>
</svg>

<div class="abs footband" style="left:{NEAT + 4}px;top:{Y_FOOT}px;
     width:{W - 2 * NEAT - 8}px;height:{H - NEAT - 4 - Y_FOOT}px">
  <div class="abs fphone" style="left:{CX - NEAT - 4}px;top:14px">{PHONE}</div>
  <div class="abs fsite" style="left:{CX - NEAT - 4}px;top:53px">
    {SITE} &nbsp;·&nbsp; {HANDLE}</div>
  <div class="abs" style="right:26px;top:13px;text-align:right;width:320px">
    <div class="fnote">Book the weekend direct.</div>
    <div class="faddr" style="margin-top:10px">{ADDRESS}</div>
    <div class="faddr" style="margin-top:5px">
      MARK TWAIN NATIONAL FOREST &nbsp;·&nbsp; SALEM DISTRICT</div>
  </div>
</div>
"""
    p = os.path.join(HERE, "flyer_print.html")
    with open(p, "w") as f:
        f.write(html)
    return p


if __name__ == "__main__":
    hp = print_sheet()
    render(hp, pdf_path=os.path.join(HERE, "PineValley-Hunting-2026.pdf"),
           png_path=os.path.join(HERE, "preview_print.png"),
           w_px=W, h_px=H, scale=2)
    print("built")
