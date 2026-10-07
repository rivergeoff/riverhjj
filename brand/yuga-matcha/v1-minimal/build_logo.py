"""Builds the yuga matcha logo set as outlined SVGs (no font dependency).

Usage: python3 build_logo.py <fonts_dir>
Fonts (Google Fonts, OFL): Fraunces Italic (variable), Instrument Sans (variable),
Shippori Mincho Medium.
"""
import math
import os
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONTS = sys.argv[1] if len(sys.argv) > 1 else os.environ["YUGA_FONTS"]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logo")
os.makedirs(OUT, exist_ok=True)

PINE, DOOR, MATCHA, CREAM, TIDE = "#16302b", "#2c5a7a", "#8fb06a", "#f2efe6", "#6f9bb3"


def load(name, axes=None):
    f = TTFont(os.path.join(FONTS, name))
    if axes:
        f = instantiateVariableFont(f, axes)
    return f


SERIF = load("Fraunces-Italic%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf",
             {"opsz": 144, "wght": 320, "SOFT": 100, "WONK": 1})
SANS = load("InstrumentSans%5Bwdth%2Cwght%5D.ttf", {"wght": 520, "wdth": 100})
JP = load("ShipporiMincho-Medium.ttf")


def text_path(font, text, size, x=0.0, y=0.0, tracking=0.0, anchor="start"):
    """Return (svg path d, advance width) for text with its baseline at y."""
    gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
    upm = font["head"].unitsPerEm
    s = size / upm
    names = [cmap[ord(c)] for c in text]
    adv = [hmtx[n][0] * s for n in names]
    width = sum(adv) + tracking * size * (len(text) - 1)
    if anchor == "middle":
        x -= width / 2
    elif anchor == "end":
        x -= width
    pen = SVGPathPen(gs)
    cx = x
    for n, a in zip(names, adv):
        gs[n].draw(TransformPen(pen, (s, 0, 0, -s, cx, y)))
        cx += a + tracking * size
    return pen.getCommands(), width


def text_on_circle(font, text, size, cx, cy, r, tracking=0.0, start_deg=-90, fill=False):
    """Glyphs set clockwise around a circle, centred on start_deg, baseline on r."""
    gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
    s = size / font["head"].unitsPerEm
    names = [cmap[ord(c)] for c in text]
    adv = [hmtx[n][0] * s + tracking * size for n in names]
    if fill:  # spread evenly over the whole circumference
        extra = (2 * math.pi * r - sum(adv)) / len(names)
        adv = [x + extra for x in adv]
    total = sum(adv) - (0 if fill else tracking * size)
    ang = math.radians(start_deg) - (total / r) / 2
    pen = SVGPathPen(gs)
    for n, a in zip(names, adv):
        w = hmtx[n][0] * s
        mid = ang + (w / 2) / r
        px, py = cx + r * math.cos(mid), cy + r * math.sin(mid)
        rot = mid + math.pi / 2
        c, si = math.cos(rot), math.sin(rot)
        # glyph local: x centred on -w/2, y up -> rotate and place
        t = (s * c, s * si, s * si, -s * c,
             px - (w / 2) * c, py - (w / 2) * si)
        gs[n].draw(TransformPen(pen, t))
        ang += a / r
    return pen.getCommands()


# ── the mark ────────────────────────────────────────────────────────────
# The blue door (arch) holding a chawan of matcha; a single leaf rises like
# the morning sun. Drawn on a 200 × 240 grid.
def mark(door=DOOR, bowl=MATCHA, leaf=CREAM, foam="#c3dba4", stroke=None):
    leaf_d = "M100 64c-20 14-20 40 0 54 20-14 20-40 0-54z"
    if stroke:  # one-colour line version
        return f'''<g fill="none" stroke="{stroke}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
    <path d="M34 232V100a66 66 0 0 1 132 0v132z"/>
    <path d="M54 154h92a46 46 0 0 1-92 0z"/>
    <path d="M86 204v8h28v-8"/>
    <path d="M66 168c11-6 23-6 34 0s23 6 34 0" stroke-width="5"/>
    <g transform="rotate(18 100 91)"><path d="{leaf_d}"/><path d="M100 76v30" stroke-width="4"/></g>
  </g>'''
    return f'''<path d="M34 232V100a66 66 0 0 1 132 0v132z" fill="{door}"/>
  <path d="M54 154h92a46 46 0 0 1-92 0z" fill="{bowl}"/>
  <path d="M54 154h92c-11 8-24 8-31 3s-19-5-30 0-20 5-31-3z" fill="{foam}"/>
  <path d="M86 202h28v8a3 3 0 0 1-3 3H89a3 3 0 0 1-3-3z" fill="{bowl}"/>
  <g transform="rotate(18 100 91)"><path d="{leaf_d}" fill="{leaf}"/>
  <path d="M100 74v34" stroke="{door}" stroke-width="2.4" stroke-linecap="round"/></g>'''


def svg(w, h, body, bg=None):
    rect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}">{rect}{body}</svg>\n')


def write(name, content):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content)


def wordmark(cx, base, size, ink, sub_ink, jp_ink=None):
    yuga, _ = text_path(SERIF, "yuga", size, cx, base, tracking=-0.02, anchor="middle")
    sub, _ = text_path(SANS, "MATCHA", size * 0.19, cx + size * 0.045, base + size * 0.5,
                       tracking=0.55, anchor="middle")
    out = f'<path d="{yuga}" fill="{ink}"/><path d="{sub}" fill="{sub_ink}"/>'
    if jp_ink:
        jp, _ = text_path(JP, "悠雅", size * 0.15, cx, base + size * 0.8,
                          tracking=0.5, anchor="middle")
        out += f'<path d="{jp}" fill="{jp_ink}"/>'
    return out


def stacked(theme):
    ink, sub, door, bowl, leaf, bg = theme
    m = f'<g transform="translate(300 70) scale(1)">{mark(door, bowl, leaf)}</g>'
    return svg(800, 640, m + wordmark(400, 450, 150, ink, sub, sub), bg)


def horizontal(theme):
    ink, sub, door, bowl, leaf, bg = theme
    m = f'<g transform="translate(36 40) scale(.8)">{mark(door, bowl, leaf)}</g>'
    yuga, _ = text_path(SERIF, "yuga", 150, 218, 158, tracking=-0.02)
    msub, _ = text_path(SANS, "MATCHA", 22, 228, 236, tracking=0.62)
    jp, _ = text_path(JP, "悠雅", 21, 506, 236, tracking=0.4, anchor="end")
    body = (m + f'<path d="{yuga}" fill="{ink}"/><path d="{msub}" fill="{sub}"/>'
            f'<path d="{jp}" fill="{sub}"/>')
    return svg(560, 270, body, bg)


def seal(ink, door, bowl, leaf, ring_ink, bg=None):
    ring = text_on_circle(SANS, "CEREMONIAL MATCHA · WHISKED TO ORDER · FIND THE BLUE DOOR · ",
                          17, 250, 250, 200, fill=True)
    body = (f'<circle cx="250" cy="250" r="236" fill="none" stroke="{ring_ink}" stroke-width="2.5"/>'
            f'<circle cx="250" cy="250" r="176" fill="none" stroke="{ring_ink}" stroke-width="1.2" opacity=".55"/>'
            f'<path d="{ring}" fill="{ring_ink}"/>'
            f'<g transform="translate(190 112) scale(.6)">{mark(door, bowl, leaf)}</g>')
    yuga, _ = text_path(SERIF, "yuga", 78, 250, 340, tracking=-0.02, anchor="middle")
    body += f'<path d="{yuga}" fill="{ink}"/>'
    return svg(500, 500, body, bg)


def main():
    THEMES = {
        "pine": (PINE, DOOR, DOOR, MATCHA, CREAM, None),          # on light paper
        "cream": (CREAM, MATCHA, DOOR, MATCHA, CREAM, None),      # on pine
    }

    for k, t in THEMES.items():
        write(f"yuga-logo-stacked-{k}.svg", stacked(t))
        write(f"yuga-logo-horizontal-{k}.svg", horizontal(t))
    write("yuga-mark.svg", svg(200, 240, mark()))
    write("yuga-mark-line-pine.svg", svg(200, 240, mark(stroke=PINE)))
    write("yuga-mark-line-cream.svg", svg(200, 240, mark(stroke=CREAM)))
    write("yuga-seal-pine.svg", seal(PINE, DOOR, MATCHA, CREAM, PINE))
    write("yuga-seal-cream.svg", seal(CREAM, DOOR, MATCHA, CREAM, CREAM))
    write("yuga-avatar.svg", svg(500, 500, f'<circle cx="250" cy="250" r="250" fill="{PINE}"/>'
                                 f'<g transform="translate(160 70) scale(.9)">{mark(DOOR, MATCHA, CREAM)}</g>'
                                 + wordmark(250, 395, 92, CREAM, MATCHA)))
    wm = wordmark(300, 150, 170, PINE, DOOR)
    write("yuga-wordmark-pine.svg", svg(600, 260, wm))
    write("yuga-wordmark-cream.svg", svg(600, 260, wordmark(300, 150, 170, CREAM, MATCHA)))
    print("wrote", sorted(os.listdir(OUT)))


if __name__ == "__main__":
    main()
