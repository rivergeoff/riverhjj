// Take 5 — one mark, one line, one type family.
// The pages of an open book are two mountains; the lines on the pages are four terraces; the sun
// rises in the valley between them with 13 rays at 15° steps, and its two level rays reach the
// mountains as the bridge. Everything is drawn with a single stroke weight.
// Type: Source Serif 4 + Source Sans 3 (one superfamily).
// Run: node take5.mjs   → ../take-5/svg/*.svg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, text, arcText } from './type.mjs';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../take-5');
const SERIF = loadFont('sourceserif600.ttf');
const SERIF_I = loadFont('sourceserif-italic.ttf');
const SANS = loadFont('sourcesans600.ttf');
const SANS_B = loadFont('sourcesans700.ttf');

export const C = {
  forest: '#0F2A1C',
  field: '#2E5E3A',
  sun: '#F6C453',
  oldGold: '#A97C22',
  cream: '#FDF7E1',
};

const f2 = (n) => Math.round(n * 100) / 100;
const pt = ([x, y]) => `${f2(x)},${f2(y)}`;

// ---------- the mark, on a 240 grid ----------
export const G = {
  w: 6, // the one stroke weight
  spine: [120, 182],
  peak: [38, 50],
  bend: [66, 158], // control point that curves the inner page edge into a U-shaped valley
  outer: [14, 166],
  horizon: 116,
  sunR: 20,
  rayIn: 30,
  rayOut: 45,
  terraces: [13, 25, 37, 49], // offsets of the four page lines above the page foot
  inset: 9,
};

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const mirrorX = ([x, y]) => [240 - x, y];
// inner page edge: quadratic from spine to peak, sampled
const quad = (a, c, b, t) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
const innerEdge = () => Array.from({ length: 121 }, (_, i) => quad(G.spine, G.bend, G.peak, i / 120));
// intersection of the infinite line ab with a polyline
function hit(a, b, poly) {
  for (let i = 1; i < poly.length; i++) {
    const p = poly[i - 1], q = poly[i];
    const d = (b[0] - a[0]) * (q[1] - p[1]) - (b[1] - a[1]) * (q[0] - p[0]);
    if (!d) continue;
    const u = ((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0])) / d;
    if (u >= 0 && u <= 1) return lerp(p, q, u);
  }
  return null;
}

export function markPaths() {
  const { spine: S, peak: T, outer: O, horizon: H } = G;
  const inner = innerEdge();
  const outerEdge = [O, T];
  const lines = G.terraces.map((d) => {
    const a = [O[0], O[1] - d], b = [S[0], S[1] - d];
    const p = hit(a, b, outerEdge), q = hit(a, b, inner);
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    return [lerp(p, q, G.inset / len), lerp(q, p, G.inset / len)];
  });
  const rays = [];
  for (let i = 0; i < 13; i++) {
    const a = ((-90 + i * 15) * Math.PI) / 180;
    const p = [120 + G.rayIn * Math.sin(a), H - G.rayIn * Math.cos(a)];
    let q = [120 + G.rayOut * Math.sin(a), H - G.rayOut * Math.cos(a)];
    if (i === 0) q = hit([0, H], [240, H], inner);
    if (i === 12) q = mirrorX(hit([0, H], [240, H], inner));
    rays.push([p, q]);
  }
  const edge = (poly) => 'M' + poly.map(pt).join(' L');
  const page = (m) => {
    const f = m ? mirrorX : (v) => v;
    return `${edge(inner.map(f))} L${pt(f(O))} Z`;
  };
  return {
    pages: `${page(false)} ${page(true)}`,
    lines: lines.map(([p, q]) => `M${pt(p)} L${pt(q)} M${pt(mirrorX(p))} L${pt(mirrorX(q))}`).join(' '),
    rays: rays.map(([p, q]) => `M${pt(p)} L${pt(q)}`).join(' '),
    bridge: [rays[0], rays[12]].map(([p, q]) => `M${pt(p)} L${pt(q)}`).join(' '),
    sunRays: rays.slice(1, 12).map(([p, q]) => `M${pt(p)} L${pt(q)}`).join(' '),
    cover: `M${pt([O[0] - 6, O[1] + 11])} L${pt([S[0], S[1] + 12])} L${pt([240 - O[0] + 6, O[1] + 11])}`,
    sun: `M${120 - G.sunR},${H} A${G.sunR},${G.sunR} 0 0 1 ${120 + G.sunR},${H} Z`,
  };
}

// The mark in one colour (ink), optionally with the sun in an accent colour.
export function mark(ink, accent = ink, w = G.w) {
  const m = markPaths();
  return `<g fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">
    <path d="${m.pages}"/><path d="${m.lines}"/><path d="${m.cover}"/>
    <path d="${m.rays}" stroke="${accent}"/>
  </g>
  <path d="${m.sun}" fill="${accent}"/>`;
}

// ---------- documents ----------
const doc = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>\n`;
const place = (svg, x, y, s) => `<g transform="translate(${f2(x)} ${f2(y)}) scale(${f2(s * 10000) / 10000})">${svg}</g>`;

// Mark scaled into any box, centred on its optical centre (120,122).
const markAt = (cx, cy, size, ink, accent, wScale = 1) => {
  const s = size / 240;
  return place(mark(ink, accent, G.w * wScale), cx - 120 * s, cy - 122 * s, s);
};

const diamond = (x, y, r) => `M${f2(x)},${f2(y - r)} L${f2(x + r * 0.72)},${f2(y)} L${f2(x)},${f2(y + r)} L${f2(x - r * 0.72)},${f2(y)} Z`;

// The seal: the mark in a ring of type. Strokes are the mark's weight or half of it.
export function seal(ink, accent, ground) {
  const s = 300 / 240, w = G.w * s;
  const ring = Array.from({ length: 60 }, (_, i) => {
    const a = (i * Math.PI * 2) / 60;
    return diamond(250 + 172 * Math.sin(a), 250 - 172 * Math.cos(a), 2.6);
  }).join(' ');
  return `${ground ? `<circle cx="250" cy="250" r="246" fill="${ground}"/>` : ''}
  <circle cx="250" cy="250" r="${f2(246 - w / 2)}" fill="none" stroke="${ink}" stroke-width="${f2(w)}"/>
  ${arcText(SANS_B, 'JOSE T. CUYOS SR. II INTEGRATED SCHOOL', 250, 250, 199, 19.5, { tracking: 0.2, side: 'top', fill: ink })}
  ${arcText(SANS_B, 'EST. 2012', 250, 250, 216, 19.5, { tracking: 0.42, side: 'bottom', fill: ink })}
  <path d="${diamond(39, 250, 6)} ${diamond(461, 250, 6)}" fill="${accent}"/>
  <circle cx="250" cy="250" r="184" fill="none" stroke="${ink}" stroke-width="${f2(w / 2)}"/>
  <path d="${ring}" fill="${accent}"/>
  <circle cx="250" cy="250" r="160" fill="none" stroke="${ink}" stroke-width="${f2(w / 2)}"/>
  ${markAt(250, 254, 262, ink, accent, 1.1)}`;
}

function wordmark(x, y, ink, sub, gold, { align = 'start', size = 92 } = {}) {
  const k = size / 92;
  const a = align === 'middle' ? 'middle' : 'start';
  return `${text(SERIF, 'Jose T. Cuyos Sr. II', x, y, size, { anchor: a, tracking: -0.012, fill: ink }).svg}
  ${text(SANS_B, 'INTEGRATED SCHOOL', x + (a === 'start' ? 3 * k : 0), y + 58 * k, 27 * k, { anchor: a, tracking: 0.34, fill: sub }).svg}`;
}

function horizontal(reversed) {
  const ink = reversed ? C.cream : C.forest, accent = reversed ? C.sun : C.oldGold;
  const W = 1240, H = 400;
  return doc(W, H, `${markAt(190, 200, 270, ink, accent)}
  <rect x="352" y="104" width="${G.w / 2}" height="192" fill="${ink}" opacity=".35"/>
  ${wordmark(396, 206, ink, reversed ? C.sun : C.field, accent)}
  ${text(SANS, 'EST. 2012', 399, 300, 15, { tracking: 0.36, fill: accent }).svg}`, reversed ? C.forest : null);
}

function stacked() {
  const W = 1000, cx = 500;
  const est = text(SANS, 'EST. 2012', cx, 664, 16, { anchor: 'middle', tracking: 0.38, fill: C.oldGold });
  const rule = (x1, x2) => `<rect x="${f2(x1)}" y="657.5" width="${f2(x2 - x1)}" height="${G.w / 2}" fill="${C.oldGold}"/>`;
  return doc(W, 800, `${markAt(cx, 230, 340, C.forest, C.oldGold)}
  ${wordmark(cx, 490, C.forest, C.field, C.oldGold, { align: 'middle', size: 96 })}
  ${est.svg}${rule(cx - 190, cx - est.width / 2 - 22)}${rule(cx + est.width / 2 + 22, cx + 190)}
  ${text(SERIF_I, 'Together we bridge, together we succeed', cx, 742, 34, { anchor: 'middle', fill: C.field }).svg}`);
}

// Brand pattern: the woven diamond, drawn with the mark's stroke, on a 40 grid.
function pattern(ink, ground) {
  const cells = [];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const cx = 20 + x * 40 + (y % 2) * 20, cy = 20 + y * 40;
    cells.push(`M${cx},${cy - 12} L${cx + 9},${cy} L${cx},${cy + 12} L${cx - 9},${cy} Z`);
  }
  const dots = [];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) dots.push(`<circle cx="${x * 40 + ((y + 1) % 2) * 20}" cy="${20 + y * 40}" r="1.8"/>`);
  return doc(160, 160, `<path d="${cells.join(' ')}" fill="none" stroke="${ink}" stroke-width="${G.w / 2}" stroke-linejoin="round"/><g fill="${ink}">${dots.join('')}</g>`, ground);
}

const files = {
  'mark.svg': doc(240, 240, mark(C.forest, C.oldGold)),
  'mark-reversed.svg': doc(240, 240, mark(C.cream, C.sun), C.forest),
  'mark-mono.svg': doc(240, 240, mark(C.forest)),
  'seal.svg': doc(500, 500, seal(C.cream, C.sun, C.forest)),
  'seal-light.svg': doc(500, 500, seal(C.forest, C.oldGold, null)),
  'logo-horizontal.svg': horizontal(false),
  'logo-horizontal-reversed.svg': horizontal(true),
  'logo-stacked.svg': stacked(),
  'pattern.svg': pattern('#3D6B48', C.forest),
};
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(path.join(out, 'svg'), { recursive: true });
  for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, 'svg', n), s);
  console.log('wrote', Object.keys(files).join(', '));
}
