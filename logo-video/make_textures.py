"""Build the PBR texture set for the 3D coin from the flat logo image.

front_color.png   - albedo for the face (inside the gold rim)
front_height.png  - bump map: gold/white/orange relief raised above the enamel
front_metal.png   - R = roughness, G = metalness (gold parts are metal)
back_*.png        - same set for a procedurally drawn gold reverse side
"""
import math
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC, OUT, FONTS = sys.argv[1], sys.argv[2], sys.argv[3]
N = 2048
CX, CY, R = 801, 801, 586  # coin centre and inner (enamel) radius in source px

src = Image.open(SRC).convert("RGB")
crop = src.crop((CX - R, CY - R, CX + R, CY + R)).resize((N, N), Image.LANCZOS)
a = np.asarray(crop).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]

yy, xx = np.mgrid[0:N, 0:N]
dist = np.hypot(xx - N / 2 + 0.5, yy - N / 2 + 0.5) / (N / 2)
inside = dist < 0.995

mx = a.max(-1)
mn = a.min(-1)
sat = (mx - mn) / np.maximum(mx, 1)
gold = (r > 120) & (r > g) & (g > b) & ((r - b) > 55) & (g / np.maximum(r, 1) > 0.66)
orange = (r > 170) & (g / np.maximum(r, 1) <= 0.66) & (b < 120)
white = (mn > 185) & (sat < 0.18)
lightgreen = (g > r + 12) & (g > 105)

height = np.zeros((N, N), np.float32)
height[lightgreen] = 0.30
height[orange] = 0.42
height[white] = 0.85
height[gold] = 1.0
height[~inside] = 0.0
h_img = Image.fromarray((height * 255).astype(np.uint8))
h_img = Image.blend(h_img.filter(ImageFilter.GaussianBlur(2.2)), h_img.filter(ImageFilter.GaussianBlur(6)), 0.35)

metal = np.zeros((N, N), np.float32)
metal[gold] = 1.0
metal_img = Image.fromarray((metal * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
rough = np.full((N, N), 0.34, np.float32)  # glossy enamel
rough[gold] = 0.38
rough_img = Image.fromarray((rough * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))

# Push gold albedo toward a clean metallic base colour; the env map adds the shine.
col = a.copy()
gold_base = np.array([232, 178, 82], np.float32)
gm = np.asarray(metal_img).astype(np.float32)[..., None] / 255
lum = (a.mean(-1, keepdims=True) / 170).clip(0.75, 1.15)
col = col * (1 - gm) + gold_base * lum * gm
# Fill outside the disc with the edge green so mip-mapping never bleeds white.
col[~inside] = np.array([62, 78, 66], np.float32)
Image.fromarray(col.clip(0, 255).astype(np.uint8)).save(f"{OUT}/front_color.png")
h_img.save(f"{OUT}/front_height.png")
Image.merge("RGB", (Image.new("L", (N, N), 0), rough_img, metal_img)).save(f"{OUT}/front_rm.png")

# ---------- Reverse side: engraved gold ----------
S = 4
W = N  # draw at N then supersample text separately
hb = Image.new("L", (N * 2, N * 2), 70)
d = ImageDraw.Draw(hb)
C = N  # centre in 2x space
RR = N  # radius in 2x space


def ring(rad, w, v):
    d.ellipse((C - rad, C - rad, C + rad, C + rad), outline=v, width=w)


ring(int(RR * 0.965), 18, 255)
ring(int(RR * 0.80), 10, 255)
ring(int(RR * 0.62), 6, 200)

serif = ImageFont.truetype(f"{FONTS}/PlayfairDisplay-Italic.ttf", 150)
sans = ImageFont.truetype(f"{FONTS}/Montserrat-SemiBold.ttf", 118)
big = ImageFont.truetype(f"{FONTS}/PlayfairDisplay-Regular.ttf", 520)
small = ImageFont.truetype(f"{FONTS}/Montserrat-SemiBold.ttf", 110)


def arc_text(text, font, radius, centre_deg, value, spacing=1.0, bottom=False):
    widths = [d.textlength(ch, font=font) * spacing for ch in text]
    total = sum(widths)
    ang = total / radius  # radians spanned
    start = math.radians(centre_deg) + (ang / 2 if bottom else -ang / 2)
    acc = 0.0
    for ch, w in zip(text, widths):
        mid = acc + w / 2
        th = start + (-mid / radius if bottom else mid / radius)
        x = C + radius * math.cos(th)
        y = C + radius * math.sin(th)
        tile = Image.new("L", (400, 400), 0)
        ImageDraw.Draw(tile).text((200, 200), ch, font=font, fill=value, anchor="mm")
        rot = -math.degrees(th) - 90 if not bottom else -math.degrees(th) + 90
        tile = tile.rotate(rot, resample=Image.BICUBIC)
        hb.paste(Image.new("L", tile.size, value), (int(x - 200), int(y - 200)), tile)
        acc += w


arc_text("JOSE T. CUYOS SR. II INTEGRATED SCHOOL", sans, RR * 0.885, -90, 255, 1.12)
arc_text("Together we bridge, together we succeed", serif, RR * 0.875, 90, 255, 1.0, bottom=True)

# Centre: sun motif + year
sun_r = int(RR * 0.15)
sy = C - int(RR * 0.2)
d.ellipse((C - sun_r, sy - sun_r, C + sun_r, sy + sun_r), fill=255)
for i in range(9):
    th = math.radians(180 + i * 22.5)
    r0, r1 = sun_r * 1.3, sun_r * 1.85
    p = [(C + r0 * math.cos(th), sy + r0 * math.sin(th))]
    p.append((C + (r0 + r1) / 2 * math.cos(th + 0.09), sy + (r0 + r1) / 2 * math.sin(th + 0.09)))
    p.append((C + r1 * math.cos(th), sy + r1 * math.sin(th)))
    p.append((C + (r0 + r1) / 2 * math.cos(th - 0.09), sy + (r0 + r1) / 2 * math.sin(th - 0.09)))
    d.polygon(p, fill=255)
d.rectangle((C - int(RR * 0.5), sy + sun_r + 30, C + int(RR * 0.5), sy + sun_r + 46), fill=70)
d.text((C, C + int(RR * 0.2)), "2012", font=big, fill=255, anchor="mm")
d.text((C, C + int(RR * 0.47)), "E S T A B L I S H E D", font=small, fill=200, anchor="mm")
for side in (-1, 1):  # little diamonds like the front
    x = C + side * int(RR * 0.5)
    d.polygon([(x, C - 40), (x + 24, C), (x, C + 40), (x - 24, C)], fill=255)

# Triangle tooth ring like the front
for i in range(120):
    th = 2 * math.pi * i / 120
    r0, r1 = RR * 0.70, RR * 0.745
    w = 0.018
    pts = [(C + r1 * math.cos(th), C + r1 * math.sin(th)),
           (C + r0 * math.cos(th - w), C + r0 * math.sin(th - w)),
           (C + r0 * math.cos(th + w), C + r0 * math.sin(th + w))]
    d.polygon(pts, fill=230)

hb = hb.resize((N, N), Image.LANCZOS)
hb_soft = Image.blend(hb.filter(ImageFilter.GaussianBlur(2)), hb.filter(ImageFilter.GaussianBlur(5)), 0.4)
hb_soft.save(f"{OUT}/back_height.png")

# Back albedo: warm gold with fine concentric "lathe" brushing; raised parts brighter
hv = np.asarray(hb).astype(np.float32) / 255
noise = np.random.default_rng(3).normal(0, 1, N * 3)
lathe = noise[(dist * N * 1.4).astype(int).clip(0, N * 3 - 1)] * 0.035
base = np.array([214, 160, 70], np.float32) / 255
top = np.array([245, 196, 104], np.float32) / 255
c = base[None, None] * (1 - hv[..., None]) + top[None, None] * hv[..., None]
c = c * (1 + lathe[..., None])
Image.fromarray((c.clip(0, 1) * 255).astype(np.uint8)).save(f"{OUT}/back_color.png")
rough_b = (0.42 - hv * 0.16 + lathe * 2).clip(0.08, 0.6)
Image.merge("RGB", (Image.new("L", (N, N), 0),
                    Image.fromarray((rough_b * 255).astype(np.uint8)), Image.new("L", (N, N), 255))).save(f"{OUT}/back_rm.png")
print("ok")
