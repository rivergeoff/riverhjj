// Font loading and outlined-type helpers shared by the logo generators.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const opentype = require('opentype.js');

const here = path.dirname(fileURLToPath(import.meta.url));
export const loadFont = (f) => opentype.loadSync(path.join(here, 'fonts', f));
const font = loadFont;
export const SERIF = font('serif.ttf');
export const SERIF_I = font('serifi.ttf');
export const SANS = font('sans600.ttf');
export const SANS_R = font('sans400.ttf');

const f2 = (n) => Math.round(n * 100) / 100;

// ---------- type helpers ----------
export function layout(fnt, str, size, tracking = 0) {
  const glyphs = fnt.stringToGlyphs(str);
  const scale = size / fnt.unitsPerEm;
  let x = 0;
  const items = glyphs.map((g, i) => {
    const it = { g, x, adv: g.advanceWidth * scale };
    let adv = it.adv;
    if (i < glyphs.length - 1) adv += fnt.getKerningValue(g, glyphs[i + 1]) * scale + tracking * size;
    x += adv;
    return it;
  });
  return { items, width: x };
}

export function text(fnt, str, x, y, size, { tracking = 0, anchor = 'start', fill = '#0F2A1C' } = {}) {
  const L = layout(fnt, str, size, tracking);
  const x0 = anchor === 'middle' ? x - L.width / 2 : anchor === 'end' ? x - L.width : x;
  const d = L.items.map((it) => it.g.getPath(x0 + it.x, y, size).toPathData(2)).join('');
  return { svg: `<path d="${d}" fill="${fill}"/>`, width: L.width };
}

// Text set on a circle. side 'top' reads clockwise over the top, 'bottom' reads left→right under.
export function arcText(fnt, str, cx, cy, r, size, { tracking = 0, side = 'top', fill = '#FDF7E1' } = {}) {
  const L = layout(fnt, str, size, tracking);
  return L.items
    .map((it) => {
      const s = it.x + it.adv / 2 - L.width / 2;
      const th = side === 'top' ? -Math.PI / 2 + s / r : Math.PI / 2 - s / r;
      const rot = ((side === 'top' ? th + Math.PI / 2 : th - Math.PI / 2) * 180) / Math.PI;
      const px = cx + r * Math.cos(th);
      const py = cy + r * Math.sin(th);
      const d = it.g.getPath(-it.adv / 2, 0, size).toPathData(2);
      return `<path transform="translate(${f2(px)} ${f2(py)}) rotate(${f2(rot)})" d="${d}" fill="${fill}"/>`;
    })
    .join('');
}

