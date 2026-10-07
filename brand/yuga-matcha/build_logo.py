"""yuga matcha — crafted logo set (v2).

A hand-brushed ensō, an illustrated hand-thrown chawan with a seigaiha wave
glaze, rising steam and a worn hanko stamp. Brush strokes are generated from
many individual "bristles" so they taper and dry out like real ink.

Usage: python3 build_logo.py <fonts_dir>   (needs fonttools)
"""
import math
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "v1-minimal"))
from build_logo import load, text_path, JP  # noqa: E402  (shared glyph helpers)

OUT = os.path.join(HERE, "logo")
os.makedirs(OUT, exist_ok=True)

PINE, JADE, MATCHA, FOAM = "#16302b", "#3f7a64", "#8fb06a", "#c9dda8"
DOOR, INDIGO, TIDE, CREAM, CELADON = "#2c5a7a", "#1f4560", "#8db4c8", "#f2efe6", "#dfe6d6"

SERIF = load("Fraunces-Italic%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf",
             {"opsz": 144, "wght": 360, "SOFT": 60, "WONK": 1})
SERIF_UP = load("Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf",
                {"opsz": 9, "wght": 420, "SOFT": 0, "WONK": 0})


def f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")


# ── brush engine ────────────────────────────────────────────────────────
def brush(fn, wmax, color, n=18, seed=1, steps=180, dry=0.6, envelope=None, opacity=1.0):
    """A brush stroke along fn(u)->(x, y), u in 0..1, built from n bristles.

    Bristles end at slightly different points and break up towards the tail,
    which gives the dry-brush ("kasure") texture of real sumi ink.
    """
    rnd = random.Random(seed)
    env = envelope or (lambda u: min(1, u / 0.05) ** 0.5 * (1 - 0.8 * u ** 1.8))
    out = []
    for k in range(n):
        off = k / (n - 1) - 0.5
        end = 1 - rnd.uniform(0, 0.16) - abs(off) * rnd.uniform(0.05, 0.35)
        start = rnd.uniform(0, 0.025) + abs(off) * 0.03
        thick = wmax / n * rnd.uniform(2.2, 3.4)
        gaps = []
        for _ in range(rnd.randint(0, 3) if rnd.random() < dry else 0):
            g0 = rnd.uniform(0.45, 0.95)
            gaps.append((g0, g0 + rnd.uniform(0.008, 0.05)))
        segs, cur = [], []
        for i in range(steps + 1):
            u = start + (end - start) * i / steps
            if any(a < u < b for a, b in gaps):
                if cur:
                    segs.append(cur)
                    cur = []
                continue
            cur.append(u)
        if cur:
            segs.append(cur)
        for seg in segs:
            if len(seg) < 3:
                continue
            left, right = [], []
            for u in seg:
                x, y = fn(u)
                x2, y2 = fn(min(1, u + 1e-3))
                x1, y1 = fn(max(0, u - 1e-3))
                dx, dy = x2 - x1, y2 - y1
                L = math.hypot(dx, dy) or 1
                nx, ny = -dy / L, dx / L
                w = wmax * env(u)
                o = off * w + 0.18 * math.sin(u * 40 + k * 1.7)
                t = thick * env(u) / 2 * (0.85 + 0.15 * math.sin(u * 90 + k))
                left.append((x + nx * (o + t), y + ny * (o + t)))
                right.append((x + nx * (o - t), y + ny * (o - t)))
            pts = left + right[::-1]
            out.append("M" + "L".join(f"{f(a)} {f(b)}" for a, b in pts) + "Z")
    op = f' opacity="{opacity}"' if opacity < 1 else ""
    return f'<path d="{"".join(out)}" fill="{color}"{op}/>'


def taper(fn, w0, w1, color, steps=90, opacity=1.0):
    """A single smooth tapered line (steam, fine linework)."""
    left, right = [], []
    for i in range(steps + 1):
        u = i / steps
        x, y = fn(u)
        x2, y2 = fn(min(1, u + 1e-3))
        x1, y1 = fn(max(0, u - 1e-3))
        L = math.hypot(x2 - x1, y2 - y1) or 1
        nx, ny = -(y2 - y1) / L, (x2 - x1) / L
        w = (w0 + (w1 - w0) * u) / 2 * math.sin(math.pi * min(1, u * 1.2 + 0.08)) ** 0.4
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    pts = left + right[::-1]
    return f'<path d="M{"L".join(f"{f(a)} {f(b)}" for a, b in pts)}Z" fill="{color}" opacity="{opacity}"/>'


# ── filters: hand-drawn wobble + worn stamp ─────────────────────────────
DEFS = f'''<defs>
  <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="worn" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="grain"/>
    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.55" result="holes"/>
    <feComposite in="SourceGraphic" in2="holes" operator="in" result="speckled"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="2" result="n2"/>
    <feDisplacementMap in="speckled" in2="n2" scale="3" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <clipPath id="bowlBody"><path d="M76 176c1 40 30 70 74 71 44-1 73-31 74-71-24 9-50 12-74 12s-50-3-74-12z"/></clipPath>
</defs>'''


# ── the emblem: ensō + chawan + steam (300 × 300) ───────────────────────
def enso(color=PINE, seed=7, cx=150, cy=150, R=126, wmax=30):
    a0 = math.radians(-58)          # starts upper right, sweeps clockwise
    sweep = math.radians(318)

    def fn(u):
        a = a0 + sweep * u
        r = R - 7 * u + 2.2 * math.sin(u * 7)
        return cx + r * math.cos(a), cy + r * math.sin(a)

    envl = lambda u: min(1, u / 0.03) ** 0.35 * (1.0 - 0.12 * math.sin(u * 3.1) - 0.7 * u ** 3)
    return brush(fn, wmax, color, n=26, seed=seed, steps=300, dry=0.55, envelope=envl)


def seigaiha(x0, y0, x1, y1, r=11, fill=DOOR, line=TIDE):
    rows, y, row = [], y0, 0
    while y < y1 + r:
        x = x0 - (r if row % 2 else 0)
        while x < x1 + 2 * r:
            arcs = "".join(
                f'<path d="M{f(x - rr)} {f(y)}a{f(rr)} {f(rr)} 0 0 1 {f(2 * rr)} 0" fill="none" stroke="{line}" stroke-width="1.1"/>'
                for rr in (r * 0.78, r * 0.52, r * 0.26))
            rows.append(f'<path d="M{f(x - r)} {f(y)}a{f(r)} {f(r)} 0 0 1 {f(2 * r)} 0z" fill="{fill}"/>{arcs}')
            x += 2 * r
        y += r * 0.55
        row += 1
    return "".join(rows)


def chawan(ink=PINE, glaze=DOOR, wave=TIDE, body=CELADON, tea=MATCHA, foam=FOAM, seed=3):
    rnd = random.Random(seed)
    # matcha foam bubbles inside the rim ellipse
    bubbles = []
    for _ in range(70):
        a, rr = rnd.uniform(0, 2 * math.pi), math.sqrt(rnd.random())
        x, y = 150 + 64 * rr * math.cos(a), 176 + 8.5 * rr * math.sin(a)
        bubbles.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(rnd.uniform(.5, 1.6))}" fill="{foam}" opacity="{f(rnd.uniform(.5, .95))}"/>')
    # celadon top glaze running down over the blue wave glaze in rounded drips
    drip, x = "M60 150V198", 66.0
    drip = f"M60 150V{198 + rnd.uniform(-1, 1):.1f}H66"
    while x < 232:
        w, d = rnd.uniform(13, 26), rnd.uniform(4, 17)
        drip += f"C{f(x + 1)} {f(198 + d * 1.3)} {f(x + w - 1)} {f(198 + d * 1.3)} {f(x + w)} {f(198 + rnd.uniform(-1.5, 1.5))}"
        x += w
    drip += "V150z"
    return f'''<g filter="url(#ink)">
  <path d="M76 176c1 40 30 70 74 71 44-1 73-31 74-71-24 9-50 12-74 12s-50-3-74-12z" fill="{body}"/>
  <g clip-path="url(#bowlBody)">
    <rect x="60" y="180" width="180" height="80" fill="{glaze}"/>{seigaiha(66, 198, 232, 252, fill=glaze, line=wave)}
    <path d="{drip}" fill="{body}"/>
  </g>
  <path d="M128 245c1 5 2 8 3 9h38c1-1 2-4 3-9" fill="{glaze}" stroke="{ink}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M76 176c1 40 30 70 74 71 44-1 73-31 74-71" fill="none" stroke="{ink}" stroke-width="2.6" stroke-linecap="round"/>
  <ellipse cx="150" cy="176" rx="74" ry="12" fill="{body}" stroke="{ink}" stroke-width="2.6"/>
  <ellipse cx="150" cy="177" rx="66" ry="9" fill="{tea}"/>
  <path d="M100 176c14-5 34-4 48 0s32 4 46-1" fill="none" stroke="{foam}" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>
  {"".join(bubbles)}
  <path d="M90 206c10 6 18 9 26 10" fill="none" stroke="{CREAM}" stroke-width="2" stroke-linecap="round" opacity=".55"/>
</g>'''


def steam(color=PINE):
    w1 = lambda u: (148 + 9 * math.sin(u * 5.0 + 0.3) - 6 * u, 160 - 76 * u)
    w2 = lambda u: (174 + 7 * math.sin(u * 4.4 + 2.4), 160 - 52 * u)
    w3 = lambda u: (122 + 6 * math.sin(u * 4 + 1), 161 - 40 * u)
    return (taper(w1, 3.2, 0.4, color, opacity=.6) + taper(w2, 2.6, 0.3, color, opacity=.42)
            + taper(w3, 2.2, 0.3, color, opacity=.32))


def leaf(color=JADE, x=150, y=58, s=1.0, rot=-24, vein=CREAM):
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s})" filter="url(#ink)">'
            f'<path d="M0-20c-13 8-14 28 0 38 14-10 13-30 0-38z" fill="{color}"/>'
            f'<path d="M0-12C-1 0-1 8 0 18" stroke="{vein}" stroke-width="1.3" fill="none" stroke-linecap="round"/>'
            f'<path d="M0 18c1 4 3 7 6 9" stroke="{color}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>')


def emblem(theme="light"):
    ink = PINE if theme == "light" else CREAM
    enso_c = JADE if theme == "light" else MATCHA
    body = CELADON if theme == "light" else "#e8eee2"
    return (enso(enso_c) + steam(ink) + leaf(MATCHA if theme == "dark" else JADE, vein=body)
            + chawan(ink=PINE, body=body))


# ── hanko stamp (悠雅, carved, worn) ────────────────────────────────────
def hanko(x, y, s=64, color=DOOR, paper=CREAM, rot=-4):
    jp1, _ = text_path(JP, "悠", s * 0.42, x + s / 2, y + s * 0.47, anchor="middle")
    jp2, _ = text_path(JP, "雅", s * 0.42, x + s / 2, y + s * 0.9, anchor="middle")
    return (f'<g transform="rotate({rot} {x + s / 2} {y + s / 2})" filter="url(#worn)">'
            f'<rect x="{x}" y="{y}" width="{s}" height="{s * 1.04}" rx="{s * .09}" fill="{color}"/>'
            f'<rect x="{x + s * .07}" y="{y + s * .07}" width="{s * .86}" height="{s * .9}" rx="{s * .05}" fill="none" stroke="{paper}" stroke-width="{s * .025}"/>'
            f'<path d="{jp1}{jp2}" fill="{paper}"/></g>')


# ── wordmark ────────────────────────────────────────────────────────────
def wordmark(cx, base, size, ink, accent, sub_ink, swash=True, seed=5):
    yuga, w = text_path(SERIF, "yuga", size, cx, base, tracking=-0.03, anchor="middle")
    out = f'<path d="{yuga}" fill="{ink}"/>'
    if swash:  # a single whisk stroke under the word
        x0, x1 = cx - w * 0.36, cx + w * 0.58
        fn = lambda u: (x0 + (x1 - x0) * u, base + size * 0.30 + size * 0.05 * math.sin(u * math.pi * 1.6 - .4))
        env = lambda u: min(1, u / 0.12) ** 0.7 * (1 - 0.85 * u ** 1.6)
        out = brush(fn, size * 0.07, accent, n=12, seed=seed, steps=120, dry=0.9, envelope=env) + out
    sub, _ = text_path(SERIF_UP, "MATCHA", size * 0.16, cx, base + size * 0.62, tracking=0.48, anchor="middle")
    out += f'<path d="{sub}" fill="{sub_ink}"/>'
    return out


def svg(w, h, body, bg=None):
    rect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'{DEFS}{rect}{body}</svg>\n')


def write(name, content):
    with open(os.path.join(OUT, name), "w") as fh:
        fh.write(content)


def main():
    for theme, ink, accent, sub in (("light", PINE, MATCHA, DOOR), ("dark", CREAM, MATCHA, TIDE)):
        stamp = (DOOR, CREAM) if theme == "light" else (TIDE, PINE)
        em = f'<g transform="translate(227 14) scale(1.15)">{emblem(theme)}</g>'
        write(f"yuga-emblem-{theme}.svg", svg(300, 300, emblem(theme)))
        write(f"yuga-logo-primary-{theme}.svg", svg(800, 640,
              em + wordmark(400, 480, 140, ink, accent, sub) + hanko(560, 406, 44, *stamp)))
        write(f"yuga-logo-horizontal-{theme}.svg", svg(760, 300,
              f'<g transform="translate(10 0)">{emblem(theme)}</g>'
              + wordmark(480, 168, 130, ink, accent, sub) + hanko(632, 104, 40, *stamp)))
        write(f"yuga-wordmark-{theme}.svg", svg(600, 300, wordmark(300, 160, 160, ink, accent, sub)))
    write("yuga-hanko.svg", svg(120, 120, hanko(28, 26, 64, rot=0)))
    # instagram avatar: the emblem on pine
    write("yuga-avatar.svg", svg(500, 500, f'<circle cx="250" cy="250" r="250" fill="{PINE}"/>'
          f'<g transform="translate(55 52) scale(1.3)">{emblem("dark")}</g>'))
    print("wrote", sorted(os.listdir(OUT)))


if __name__ == "__main__":
    main()
