# yuga matcha — logo & identity

Open `index.html` (or `yuga-brand-sheet.png`) for the full brand sheet.

- `logo/` — vector SVGs, text converted to outlines (safe for print, Canva, Figma)
- `png/` — transparent PNGs, ~2400px; `yuga-avatar.png` is 1080×1080 for Instagram
- `-pine` files go on light backgrounds, `-cream` files on dark backgrounds

| Colour | Hex |
| --- | --- |
| pine | `#16302B` |
| blue door | `#2C5A7A` |
| matcha | `#8FB06A` |
| jade | `#3F7A64` |
| tide | `#6F9BB3` |
| foam | `#F2EFE6` |

Fonts (free, Google Fonts): Fraunces Italic Light · Instrument Sans Medium · Shippori Mincho Medium.

Rebuild the SVGs: `python3 build_logo.py <folder with the font .ttf files>` (needs `fonttools`).
