#!/usr/bin/env bash
#
# Re-render every flyer in this directory: HTML -> PDF -> PNG.
#
#   ./render.sh              # all flyers
#   ./render.sh safety       # just the ones matching "safety"
#
# Run this after editing a flyer's HTML or swapping one of its images.
#
# Each sheet is a fixed height with overflow hidden, so content that grows too
# tall is silently clipped rather than flowing onto a second page. The page
# count check below is what catches that -- do not remove it.

set -euo pipefail
cd "$(dirname "$0")"

filter="${1:-}"

CHROME="${CHROME:-}"
if [ -z "$CHROME" ]; then
  for candidate in \
    chromium chromium-browser google-chrome google-chrome-stable \
    /opt/pw-browsers/chromium-*/chrome-linux/chrome \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  do
    if command -v "$candidate" >/dev/null 2>&1; then CHROME="$candidate"; break; fi
    if [ -x "$candidate" ]; then CHROME="$candidate"; break; fi
  done
fi

if [ -z "$CHROME" ]; then
  echo "No Chrome or Chromium found. Install one, or point CHROME at it:" >&2
  echo "  CHROME=/path/to/chrome ./render.sh" >&2
  exit 1
fi

shopt -s nullglob
for html in *.html; do
  base="${html%.html}"
  [ -z "$filter" ] || [[ "$base" == *"$filter"* ]] || continue

  echo "rendering $base"
  "$CHROME" --headless --disable-gpu --no-sandbox \
    --virtual-time-budget=3000 \
    --print-to-pdf="$base.pdf" --no-pdf-header-footer \
    "file://$PWD/$html" 2>/dev/null

  python3 - "$base" <<'PY'
import sys
import pypdfium2 as pdfium

base = sys.argv[1]
pdf = pdfium.PdfDocument(f"{base}.pdf")
if len(pdf) != 1:
    raise SystemExit(
        f"  {base}: got {len(pdf)} pages, expected 1 — the content outgrew the "
        f"sheet and part of it is being clipped. Trim it and re-run."
    )
pdf[0].render(scale=200 / 72).to_pil().save(f"{base}.png")
print(f"  {base}.pdf + {base}.png")
PY
done

echo "done"
