"""Draw the YUGA tin label (albedo + roughness mask) and leaf vein maps with PIL."""
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, 'fonts')
OUT = os.path.join(HERE, 'tex')
os.makedirs(OUT, exist_ok=True)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def spaced(d, cx, y, text, f, fill, tracking):
    widths = [d.textlength(c, font=f) for c in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = cx - total / 2
    for c, w in zip(text, widths):
        d.text((x, y), c, font=f, fill=fill, anchor='lm')
        x += w + tracking


def label():
    W, H = 4096, 1600
    green = (24, 46, 30)
    img = Image.new('RGB', (W, H), green)
    rough = Image.new('L', (W, H), 70)  # lacquer: glossy
    d = ImageDraw.Draw(img)
    dr = ImageDraw.Draw(rough)
    rnd = random.Random(3)
    # subtle lacquer mottling
    noise = Image.effect_noise((W // 8, H // 8), 18).resize((W, H), Image.BICUBIC)
    img = Image.composite(Image.new('RGB', (W, H), (30, 56, 36)), img, noise.point(lambda v: max(0, v - 110)))
    d = ImageDraw.Draw(img)
    gold = (196, 160, 98)
    for y, h in [(70, 7), (92, 3), (H - 77, 7), (H - 95, 3)]:
        d.rectangle([0, y, W, y + h], fill=gold)
        dr.rectangle([0, y, W, y + h], fill=40)
    cx = W // 2
    # cream washi panel
    panel = [cx - 430, 190, cx + 430, H - 190]
    paper = Image.new('RGB', (860, H - 380), (238, 232, 218))
    pn = Image.effect_noise(paper.size, 10).filter(ImageFilter.GaussianBlur(1))
    paper = Image.composite(Image.new('RGB', paper.size, (226, 219, 203)), paper, pn.point(lambda v: max(0, v - 120) * 3))
    img.paste(paper, (panel[0], panel[1]))
    dr.rectangle(panel, fill=170)
    d = ImageDraw.Draw(img)
    d.rectangle([cx - 405, 215, cx + 405, H - 215], outline=gold, width=4)
    ink = (26, 50, 32)
    spaced(d, cx, 330, 'CEREMONIAL', font('inter-latin-300-normal.ttf', 50), ink, 26)
    jp = font('shippori-600.ttf', 290)
    d.text((cx, 600), '悠', font=jp, fill=ink, anchor='mm')
    d.text((cx, 900), '雅', font=jp, fill=ink, anchor='mm')
    d.rectangle([cx + 205, 850, cx + 295, 940], fill=(176, 50, 40))
    d.text((cx + 250, 895), '茶', font=font('shippori-600.ttf', 62), fill=(238, 232, 218), anchor='mm')
    spaced(d, cx, 1120, 'YUGA', font('cormorant-garamond-latin-500-normal.ttf', 128), ink, 40)
    spaced(d, cx, 1230, 'MATCHA · 30 G', font('inter-latin-300-normal.ttf', 36), ink, 12)
    # back panel lettering
    it = font('cormorant-garamond-latin-300-italic.ttf', 64)
    for u in (0.08, 0.92):
        t = Image.new('RGBA', (1300, 120), (0, 0, 0, 0))
        ImageDraw.Draw(t).text((650, 60), 'shade-grown · stone-milled · whisked slowly', font=it, fill=gold, anchor='mm')
        t = t.rotate(90, expand=True)
        img.paste(t, (int(u * W) - 60, H // 2 - 650), t)
    img.save(os.path.join(OUT, 'label.png'))
    rough.save(os.path.join(OUT, 'label_rough.png'))


def leaf_veins():
    """Albedo/bump for a camellia leaf in UV space (u across, v along)."""
    W, H = 1024, 2048
    col = Image.new('RGB', (W, H), (52, 92, 26))
    bump = Image.new('L', (W, H), 128)
    dc, db = ImageDraw.Draw(col), ImageDraw.Draw(bump)
    n = Image.effect_noise((W // 4, H // 4), 30).resize((W, H), Image.BICUBIC)
    col = Image.composite(Image.new('RGB', (W, H), (70, 116, 34)), col, n.point(lambda v: max(0, v - 100) * 2))
    dc = ImageDraw.Draw(col)
    cx = W // 2
    for i in range(1, 12):
        y = H - i * H / 12.5
        for s in (1, -1):
            pts = []
            for k in range(30):
                t = k / 29
                pts.append((cx + s * t * W * 0.48, y - t * t * H * 0.09 - t * H * 0.03))
            dc.line(pts, fill=(80, 124, 40), width=4)
            db.line(pts, fill=95, width=7)
            # fine tertiary veins
            for k in range(4, 26, 5):
                x0, y0 = pts[k]
                dc.line([(x0, y0), (x0 + s * 20, y0 - 60)], fill=(66, 108, 32), width=2)
    dc.line([(cx, 0), (cx, H)], fill=(120, 160, 70), width=12)
    db.line([(cx, 0), (cx, H)], fill=80, width=18)
    col.filter(ImageFilter.GaussianBlur(2.2)).save(os.path.join(OUT, 'leaf_col.png'))
    bump.filter(ImageFilter.GaussianBlur(3)).save(os.path.join(OUT, 'leaf_bump.png'))


if __name__ == '__main__':
    label()
    leaf_veins()
    print('textures done')
