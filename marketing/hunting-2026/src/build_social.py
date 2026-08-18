#!/usr/bin/env python3
"""
ROUTED GROUND — social cuts.

Two crops of the same survey: a 1080 square for the feed and a 1080x1920 for
stories. Same seeded terrain as the print sheet, same palette, same voice —
but far less text, because a phone screen is read at arm's length in a scroll,
not pinned to a wall in a gun shop.

Rendered at native 1080 (scale 1) so the aerial plate is downsampled rather
than stretched.
"""

import os

from build_flyer import (
    ESPRESSO, PARCHMENT, CHARCOAL, OLIVE, RIVER, TAN, RUST,
    PHONE, SITE, HANDLE, DRONE,
    HERE, b64_font, duotone, contour_svg, ticks_svg, season_strip,
    font_face_block, render,
)
from terrain import contour_set

TERRAIN_KW = dict(n_levels=46, min_len=0.014, n_hills=42, nx=230, ny=290,
                  r_lo=0.055, r_hi=0.20, tol=0.0035)

BULLETS_SQ = [
    ("FOUR BUILDINGS", "Sleeps up to 10 · two full baths"),
    ("A COMMERCIAL KITCHEN", "Everybody eats breakfast at 4 a.m."),
    ("PUBLIC GROUND NEXT DOOR", "No lease. No guide fee. No antler-point rule."),
]

BULLETS_ST = BULLETS_SQ + [
    ("ROOM FOR THE RIG", "Trucks, trailers and UTVs park at the door."),
]


def social_css(w, h, neat):
    return f"""
@page {{ size:{w}px {h}px; margin:0; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html,body {{ width:{w}px; height:{h}px; }}
body {{ background:{PARCHMENT}; position:relative; overflow:hidden;
        -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
.abs {{ position:absolute; }}
svg text.mono {{ font-family:MONO; }}
.tick {{ font-size:11px; fill:{ESPRESSO}; fill-opacity:.6; letter-spacing:.14em; }}
.srow {{ font-size:11px; fill:{ESPRESSO}; fill-opacity:.75; letter-spacing:.1em; }}
.srow.hero {{ fill:{RUST}; fill-opacity:1; font-family:MONOB; }}
.ledger {{ font-family:MONO; font-size:11px; letter-spacing:.19em;
           color:{ESPRESSO}; opacity:.62; text-transform:uppercase; }}
.eyebrow {{ font-family:MONOB; font-size:15px; letter-spacing:.30em;
            color:{RUST}; text-transform:uppercase; }}
.subhead {{ font-family:SERI; font-size:25px; line-height:33px; color:{ESPRESSO}; }}
.subhead b {{ font-family:SER; font-style:normal; }}
.rule {{ background:{ESPRESSO}; opacity:.28; }}
.plate {{ border:1.5px solid {ESPRESSO}; display:block; }}
.platecap {{ font-family:MONO; font-size:11px; letter-spacing:.16em;
             color:{ESPRESSO}; opacity:.72; text-transform:uppercase; }}
.pricebar {{ background:{ESPRESSO}; }}
.pricenum {{ font-family:NP; color:{PARCHMENT}; letter-spacing:-.015em; }}
.pricelab {{ font-family:MONOB; font-size:14px; letter-spacing:.26em;
             color:{TAN}; text-transform:uppercase; }}
.pricesub {{ font-family:SERI; font-size:24px; color:{PARCHMENT}; opacity:.92; }}
.vr {{ background:{TAN}; opacity:.38; }}
.bhead {{ font-family:MONOB; font-size:15px; letter-spacing:.13em;
          color:{ESPRESSO}; text-transform:uppercase; }}
.bsub {{ font-family:SER; font-size:21px; line-height:24px; color:{CHARCOAL};
         opacity:.82; margin-top:3px; }}
.legendpanel {{ background:rgba(244,241,235,.90);
                border:1px solid rgba(58,42,30,.30); }}
.footband {{ background:{ESPRESSO}; }}
.fphone {{ font-family:NP; color:{PARCHMENT}; letter-spacing:.01em; }}
.fsite {{ font-family:MONOB; letter-spacing:.22em; color:{TAN};
          text-transform:uppercase; }}
.fnote {{ font-family:SERI; color:{PARCHMENT}; opacity:.92; }}
"""


def frame_svg(w, h, neat, contours, ox, oy, sx, sy, tick_every):
    bed = contour_svg(w, h, contours, 46, ox=ox, oy=oy, sx=sx, sy=sy,
                      base_op=0.30)
    return f"""
<svg class="abs" width="{w}" height="{h}" style="left:0;top:0">
  <defs><clipPath id="neat">
    <rect x="{neat}" y="{neat}" width="{w - 2 * neat}" height="{h - 2 * neat}"/>
  </clipPath></defs>
  <g clip-path="url(#neat)">{bed}</g>
  {ticks_svg(w, h, neat, every=tick_every, length=8, sw=1.0)}
  <rect x="{neat}" y="{neat}" width="{w - 2 * neat}" height="{h - 2 * neat}"
        fill="none" stroke="{ESPRESSO}" stroke-width="1.8"/>
  <rect x="{neat + 6}" y="{neat + 6}" width="{w - 2 * neat - 12}"
        height="{h - 2 * neat - 12}" fill="none" stroke="{ESPRESSO}"
        stroke-width="0.8" stroke-opacity="0.45"/>
</svg>"""


def headline_svg(cx, cw, top, f1, f2, box_h, y1, y2):
    return f"""
<svg class="abs" width="{cw}" height="{box_h}" style="left:{cx}px;top:{top}px">
  <text x="0" y="{y1}" textLength="{cw}" lengthAdjust="spacing"
        style="font-family:NP;font-size:{f1}px;fill:{ESPRESSO}">BASE CAMP</text>
  <text x="0" y="{y2}" textLength="{cw}" lengthAdjust="spacing"
        style="font-family:NP;font-size:{f2}px;fill:{RUST}">FOR THE MARK TWAIN</text>
</svg>"""


def bullets_html(items, row_h):
    return "".join(
        f'<div class="abs" style="left:0;top:{i * row_h}px;width:100%">'
        f'<div class="bhead">{h}</div><div class="bsub">{s}</div></div>'
        for i, (h, s) in enumerate(items))


def price_block(cx, cw, top, bar_h, num_size, num_top, div_x, lab_x):
    return f"""
<div class="abs pricebar" style="left:{cx}px;top:{top}px;width:{cw}px;
     height:{bar_h}px">
  <div class="abs pricenum" style="left:46px;top:{num_top}px;
       font-size:{num_size}px;line-height:{num_size}px">$2,000</div>
  <div class="abs vr" style="left:{div_x}px;top:{bar_h * 0.20:.0f}px;width:1.5px;
       height:{bar_h * 0.60:.0f}px"></div>
  <div class="abs pricelab" style="left:{lab_x}px;top:{bar_h * 0.22:.0f}px">
    THE WEEKEND</div>
  <div class="abs pricesub" style="left:{lab_x}px;top:{bar_h * 0.38:.0f}px">
    Friday to Sunday</div>
  <div class="abs pricelab" style="left:{lab_x}px;top:{bar_h * 0.68:.0f}px">
    UP TO 10 HUNTERS</div>
</div>"""


# ------------------------------------------------------------------ square
def square():
    W = H = 1080
    NEAT, CX, CW = 40, 80, 920
    contours = contour_set(**TERRAIN_KW)

    html = f"""<!doctype html><meta charset="utf-8">
<style>{font_face_block()}{social_css(W, H, NEAT)}</style>
{frame_svg(W, H, NEAT, contours, -0.05, -0.06, 1.12, 1.14, 40)}

<div class="abs ledger" style="left:{CX}px;top:84px">PINE VALLEY AT DILLARD MILL</div>
<div class="abs ledger" style="left:{CX}px;top:84px;width:{CW}px;text-align:right">
  CRAWFORD CO., MISSOURI</div>
<div class="abs rule" style="left:{CX}px;top:110px;width:{CW}px;height:1.5px"></div>

<div class="abs eyebrow" style="left:{CX}px;top:142px">
  NOVEMBER FIREARMS DEER &nbsp;·&nbsp; NOV 14 – 24, 2026</div>

{headline_svg(CX, CW, 172, 182, 90, 250, 134, 214)}

<div class="abs subhead" style="left:{CX}px;top:430px;width:{CW - 40}px">
  Four buildings, one commercial kitchen, and ten hunters — on the edge of the
  National Forest. <b>Sleep indoors. Wake up already there.</b>
</div>

{price_block(CX, CW, 540, 150, 104, 20, 430, 476)}

<div class="abs" style="left:{CX}px;top:730px;width:{CW}px">
  {bullets_html(BULLETS_SQ, 62)}
</div>

<div class="abs footband" style="left:{NEAT + 6}px;top:920px;
     width:{W - 2 * NEAT - 12}px;height:{H - NEAT - 6 - 920}px">
  <div class="abs fphone" style="left:{CX - NEAT - 6}px;top:24px;font-size:54px;
       line-height:54px">{PHONE}</div>
  <div class="abs fsite" style="left:{CX - NEAT - 6}px;top:86px;font-size:15px">
    {SITE} &nbsp;·&nbsp; {HANDLE}</div>
  <div class="abs fnote" style="right:40px;top:34px;text-align:right;
       font-size:21px;line-height:26px;width:380px">
    Book the weekend direct.</div>
</div>
"""
    p = os.path.join(HERE, "social_square.html")
    open(p, "w").write(html)
    return p, W, H


# ------------------------------------------------------------------- story
def story():
    W, H = 1080, 1920
    NEAT, CX, CW = 40, 80, 920
    contours = contour_set(**TERRAIN_KW)
    photo = duotone(DRONE)
    strip, strip_h = season_strip(CW, 0, label_w=190, row_h=15, gap=4)

    PH_W, PH_H = 920, 518
    Y_PLATE = 600
    Y_PRICE = 1190
    Y_BUL = 1356
    Y_PANEL, Y_STRIP, PANEL_H = 1596, 1602, 164
    Y_FOOT = 1772

    html = f"""<!doctype html><meta charset="utf-8">
<style>{font_face_block()}{social_css(W, H, NEAT)}
.srow {{ font-size:13px; }} .tick {{ font-size:13px; }}
</style>
{frame_svg(W, H, NEAT, contours, -0.05, -0.04, 1.12, 1.09, 48)}

<div class="abs ledger" style="left:{CX}px;top:84px">PINE VALLEY AT DILLARD MILL</div>
<div class="abs ledger" style="left:{CX}px;top:84px;width:{CW}px;text-align:right">
  37.7241 N &nbsp; 91.2061 W</div>
<div class="abs rule" style="left:{CX}px;top:110px;width:{CW}px;height:1.5px"></div>

<div class="abs eyebrow" style="left:{CX}px;top:150px">
  NOVEMBER FIREARMS DEER &nbsp;·&nbsp; NOV 14 – 24, 2026</div>

{headline_svg(CX, CW, 182, 182, 90, 250, 134, 214)}

<div class="abs subhead" style="left:{CX}px;top:452px;width:{CW - 30}px">
  Four buildings, one commercial kitchen, and ten hunters — on the edge of the
  National Forest at Dillard Mill.
  <b>Sleep indoors. Wake up already there.</b>
</div>

<img class="abs plate" src="data:image/png;base64,{photo}"
     style="left:{CX}px;top:{Y_PLATE}px;width:{PH_W}px;height:{PH_H}px"/>
<div class="abs platecap" style="left:{CX}px;top:{Y_PLATE + PH_H + 12}px">
  PLATE I &nbsp;·&nbsp; VERTICAL AERIAL &nbsp;·&nbsp; 43 ACRES</div>
<div class="abs platecap" style="left:{CX}px;top:{Y_PLATE + PH_H + 12}px;
     width:{CW}px;text-align:right">LODGING ONLY · HUNT THE PUBLIC GROUND</div>

{price_block(CX, CW, Y_PRICE, 150, 104, 20, 430, 476)}

<div class="abs" style="left:{CX}px;top:{Y_BUL}px;width:{CW}px">
  {bullets_html(BULLETS_ST, 56)}
</div>

<div class="abs legendpanel" style="left:{CX - 16}px;top:{Y_PANEL}px;
     width:{CW + 32}px;height:{PANEL_H}px"></div>
<svg class="abs" width="{CW}" height="{strip_h + 22}"
     style="left:{CX}px;top:{Y_STRIP}px">
  <g transform="translate(0,22)">{strip}</g>
</svg>

<div class="abs footband" style="left:{NEAT + 6}px;top:{Y_FOOT}px;
     width:{W - 2 * NEAT - 12}px;height:{H - NEAT - 6 - Y_FOOT}px">
  <div class="abs fphone" style="left:{CX - NEAT - 6}px;top:22px;font-size:52px;
       line-height:52px">{PHONE}</div>
  <div class="abs fsite" style="left:{CX - NEAT - 6}px;top:82px;font-size:15px">
    {SITE} &nbsp;·&nbsp; {HANDLE}</div>
  <div class="abs fnote" style="right:40px;top:30px;text-align:right;
       font-size:21px;line-height:26px;width:380px">
    Book the weekend direct.</div>
</div>
"""
    p = os.path.join(HERE, "social_story.html")
    open(p, "w").write(html)
    return p, W, H


if __name__ == "__main__":
    for fn, name in ((square, "PineValley-Hunting-2026-square"),
                     (story, "PineValley-Hunting-2026-story")):
        p, w, h = fn()
        render(p, png_path=os.path.join(HERE, name + ".png"),
               w_px=w, h_px=h, scale=1)
        print("built", name, f"{w}x{h}")
