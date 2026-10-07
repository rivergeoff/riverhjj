# yuga matcha — logo & identity (vol. 02, crafted)

Open `index.html` (or `yuga-brand-sheet.png`) for the full brand sheet.

The mark: a hand-brushed ensō holding a hand-thrown chawan glazed with
seigaiha waves, matcha foam, rising steam, a falling leaf, and a worn 悠雅 hanko stamp.

- `logo/` — SVGs, lettering converted to outlines
- `png/` — transparent PNGs (~2400px); `yuga-avatar.png` is 1080×1080 for Instagram
- `-light` files go on light backgrounds, `-dark` files on dark backgrounds
- `v1-minimal/` — the earlier flat, minimal version, kept for reference

| Colour | Hex |
| --- | --- |
| pine | `#16302B` |
| blue door | `#2C5A7A` |
| jade | `#3F7A64` |
| matcha | `#8FB06A` |
| tide | `#8DB4C8` |
| celadon | `#DFE6D6` |
| washi | `#F2EFE6` |

Fonts (free, Google Fonts): Fraunces Italic · Fraunces caps · Shippori Mincho · Instrument Sans (body).

Note: the brush texture and worn stamp use SVG filters. Browsers, Figma and the
PNGs render them; for print or Illustrator, use the PNGs or ask for a flattened version.

Rebuild: `python3 build_logo.py <folder with the font .ttf files>` (needs `fonttools`).
