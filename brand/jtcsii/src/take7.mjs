// Take 7 — the school's own story as an official seal: a far-flung school in the mountains of
// Rosario, a rope bridge across the gorge to the schoolhouse, gold veins and a mine for the
// town's livelihood, the sun and stars of the flag, and an open book at the foundation, framed
// in rope like the bridge. Lit from the sun; set in Cinzel.
// Run: node take7.mjs   → ../take-7/svg/*.svg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, text, arcText } from './type.mjs';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../take-7');
const CINZEL = loadFont('cinzel700.ttf');
const CINZEL_B = loadFont('cinzel800.ttf');
const CINZEL_M = loadFont('cinzel600.ttf');

const C = {
  forest: '#0F2A1C',
  field: '#2E5E3A',
  sun: '#F6C453',
  oldGold: '#A97C22',
  cream: '#FDF7E1',
};

const f2 = (n) => Math.round(n * 100) / 100;
const P = (r, deg, [cx, cy] = [0, 0]) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};
const pt = ([x, y]) => `${f2(x)},${f2(y)}`;
const pts = (a) => a.map(pt).join(' ');
const mir = (a) => a.map(([x, y]) => [-x, y]);
const poly = (a) => `M${pts(a)} Z`;
const star = (R, r) => 'M' + Array.from({ length: 10 }, (_, i) => pt(P(i % 2 ? r : R, i * 36))).join(' L') + ' Z';
const grain = (l, w) => {
  const h = l / 2, k = w / 2;
  return `M0,${-h} C${k * 1.05},${-h * 0.62} ${k * 1.1},${h * 0.55} 0,${h} C${-k * 1.1},${h * 0.55} ${-k * 1.05},${-h * 0.62} 0,${-h} Z`;
};
const diamond = (x, y, rx, ry) => `M${f2(x)},${f2(y - ry)} L${f2(x + rx)},${f2(y)} L${f2(x)},${f2(y + ry)} L${f2(x - rx)},${f2(y)} Z`;
const cubic = (s, t) => {
  const u = 1 - t;
  return [0, 1].map((i) => u ** 3 * s[0][i] + 3 * u * u * t * s[1][i] + 3 * u * t * t * s[2][i] + t ** 3 * s[3][i]);
};
const cubicYAt = (s, x) => {
  let lo = 0, hi = 1;
  for (let k = 0; k < 40; k++) {
    const m = (lo + hi) / 2;
    if (cubic(s, m)[0] < x) lo = m; else hi = m;
  }
  return cubic(s, (lo + hi) / 2)[1];
};

// ---------- shared paint ----------
function defs(p) {
  const lin = (id, x1, y1, x2, y2, stops) =>
    `<linearGradient id="${p}${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
  const rad = (id, cx, cy, r, stops, fx = cx, fy = cy) =>
    `<radialGradient id="${p}${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
  const GOLD = [[0, '#FFF2BF'], [0.22, '#F8D372'], [0.48, '#D9A23A'], [0.7, '#F6CD68'], [1, '#9C7019']];
  return `
  ${lin('gold', -250, -250, 250, 250, GOLD)}
  ${lin('goldV', 0, -250, 0, 250, GOLD)}
  ${lin('rimIn', 0, -250, 0, 250, [[0, '#8C6417'], [0.5, '#E3AF48'], [1, '#FFF0B5']])}
  ${rad('band', 0, 0, 250, [[0.7, '#163A28'], [0.86, C.forest], [1, '#0A1F14']])}
  ${lin('sky', 0, -165, 0, 60, [[0, '#0F2E1F'], [0.32, '#1F4F36'], [0.62, '#3D7448'], [0.84, '#A7A75A'], [1, '#F2CF77']])}
  ${rad('glow', 0, -40, 150, [[0, '#FFE7A0', 0.75], [0.35, '#F6C453', 0.28], [1, '#F6C453', 0]])}
  ${rad('sunCore', -8, -60, 34, [[0, '#FFF7D6'], [0.45, '#FAD772'], [1, '#E3A236']])}
  ${lin('ray', 0, -130, 0, 20, [[0, '#FFE69A'], [0.5, '#F6C453'], [1, '#D99A2E']])}
  ${lin('far', 0, -20, 0, 60, [[0, '#6E9461'], [1, '#4E7D52']])}
  ${lin('haze', 0, 0, 0, 50, [[0, '#F5E3A6', 0], [0.55, '#F5E3A6', 0.32], [1, '#F5E3A6', 0]])}
  ${lin('mtn', 0, -50, 0, 110, [[0, '#24543A'], [1, '#0F2C1D']])}
  ${lin('lit', 0, -50, 0, 110, [[0, '#5C9A5E'], [0.5, '#3B7449'], [1, '#1D4630']])}
  ${lin('paddy', 0, 20, 0, 120, [[0, '#F8DA86'], [1, '#E3AE45']])}
  ${lin('bund', 0, 20, 0, 120, [[0, '#4F8247'], [1, '#2C5B33']])}
  ${lin('page', 0, 80, 0, 140, [[0, '#FFFDF6'], [1, '#EADBB4']])}
  ${lin('cover', 0, 90, 0, 150, [[0, '#24543A'], [1, '#0F2A1C']])}
  ${lin('ribbon', 0, 150, 0, 196, [[0, '#FBDF8F'], [0.5, '#F2BF55'], [1, '#C68F28']])}
  ${lin('ribbonDark', 0, 150, 0, 200, [[0, '#B98626'], [1, '#7E5A14']])}
  ${lin('grain', 0, -10, 0, 10, [[0, '#FFE9A3'], [1, '#D19A2E']])}
  ${lin('wood', 0, 0, 0, 30, [[0, '#E9C27A'], [1, '#A97C22']])}`;
}

// ---------- the scene inside the medallion (radius 160) ----------
// Story: a far-flung school in the mountains of Rosario. A rope bridge crosses the gorge to the
// schoolhouse; gold runs in the mountains and is mined for a living; the sun of the flag rises
// over it all, and an open book stands at the foundation.
const SUN = [0, -30];

function sceneDefs(p) {
  const lin = (id, x1, y1, x2, y2, stops) =>
    `<linearGradient id="${p}${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
  return `
  ${lin('sky2', 0, -165, 0, 60, [[0, '#0F2E1F'], [0.3, '#1E4E35'], [0.58, '#3F7649'], [0.8, '#B3AC5E'], [1, '#F4D37C']])}
  ${lin('mtnL', 0, -80, 0, 100, [[0, '#2A5C3F'], [1, '#0F2C1D']])}
  ${lin('litL', 0, -80, 0, 100, [[0, '#6AA86A'], [0.45, '#3F7A4C'], [1, '#1A4430']])}
  ${lin('hill', 0, 60, 0, 170, [[0, '#3E7A4A'], [1, '#173D27']])}
  ${lin('river', 0, 40, 0, 120, [[0, '#FBE4A0'], [0.5, '#D9C27A'], [1, '#7FA88A']])}
  ${lin('vein', -60, 0, 60, 0, [[0, '#FFF1B8'], [0.5, '#F6C453'], [1, '#FFE08A']])}
  ${lin('wall', 0, -10, 0, 16, [[0, '#FFFDF4'], [1, '#E7D9B4']])}
  ${lin('roof', 0, -12, 0, 4, [[0, '#2E6A43'], [1, '#163A27']])}
  ${lin('rope', 0, -6, 0, 6, [[0, '#F3D99A'], [0.5, '#D1A552'], [1, '#8C6417']])}`;
}

function philippineSun(p) {
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const a = i * 45;
    const tri = (deg, len, half) => {
      const [tx, ty] = P(len, deg, SUN);
      const [ax, ay] = P(27, deg - half, SUN);
      const [bx, by] = P(27, deg + half, SUN);
      return `M${f2(ax)},${f2(ay)} L${f2(tx)},${f2(ty)} L${f2(bx)},${f2(by)} Z`;
    };
    rays += tri(a, 60, 6.5) + tri(a - 12.5, 48, 3.6) + tri(a + 12.5, 48, 3.6);
  }
  const stars = [-26, 0, 26].map((a) => {
    const [x, y] = P(92, a, SUN);
    return `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${a})" d="${star(8, 3.3)}" fill="url(#${p}ray)" stroke="#FFF1BC" stroke-width=".5"/>`;
  }).join('');
  return `<circle cx="${SUN[0]}" cy="${SUN[1]}" r="140" fill="url(#${p}glow)"/>
  <path d="${rays}" fill="url(#${p}ray)"/>
  <circle cx="${SUN[0]}" cy="${SUN[1]}" r="25" fill="url(#${p}sunCore)"/>
  <circle cx="${SUN[0]}" cy="${SUN[1]}" r="25" fill="none" stroke="#FFF3C4" stroke-width="1" stroke-opacity=".8"/>
  ${stars}`;
}

const pine = (x, y, h) => {
  const w = h * 0.42, t = (k) => y - h * k;
  return `M${f2(x)},${f2(t(1))} L${f2(x + w * 0.45)},${f2(t(0.64))} L${f2(x + w * 0.26)},${f2(t(0.64))} L${f2(x + w * 0.72)},${f2(t(0.32))} L${f2(x + w * 0.4)},${f2(t(0.32))} L${f2(x + w)},${f2(t(0.02))} L${f2(x - w)},${f2(t(0.02))} L${f2(x - w * 0.4)},${f2(t(0.32))} L${f2(x - w * 0.72)},${f2(t(0.32))} L${f2(x - w * 0.26)},${f2(t(0.64))} L${f2(x - w * 0.45)},${f2(t(0.64))} Z`;
};

function mountains(p) {
  const far = [[-180, 50], [-120, 22], [-80, 34], [-44, 18], [-16, 34], [0, 30], [16, 34], [44, 18], [80, 34], [120, 22], [180, 50], [180, 200], [-180, 200]];
  const L = [[-180, 100], [-180, -20], [-160, -34], [-140, -46], [-120, -62], [-96, -76], [-82, -60], [-70, -42], [-58, -20], [-48, 4], [-40, 28], [-30, 56], [-20, 100]];
  const Llit = [[-96, -76], [-82, -60], [-70, -42], [-58, -20], [-48, 4], [-40, 28], [-30, 56], [-20, 100], [-52, 100], [-62, 52], [-74, 10], [-88, -34]];
  const R = [[180, 100], [180, -14], [160, -30], [140, -42], [118, -58], [98, -66], [86, -52], [74, -32], [62, -8], [52, 16], [40, 42], [30, 70], [20, 100]];
  const Rlit = [[98, -66], [86, -52], [74, -32], [62, -8], [52, 16], [40, 42], [30, 70], [20, 100], [50, 100], [60, 54], [72, 14], [88, -30]];
  const rimL = Llit.slice(0, 7), rimR = Rlit.slice(0, 7);
  const ridgeL = L.slice(1, 6), ridgeR = R.slice(1, 6);
  // gold seams running through the rock, with a few nuggets
  const veinD = [
    'M-90,-34 C-84,-24 -82,-16 -74,-10 S-66,4 -60,12',
    'M-80,-2 C-76,6 -70,8 -66,16',
    'M-158,4 C-146,-2 -138,6 -128,0 S-114,-10 -104,-4',
    'M-150,34 C-140,28 -132,36 -122,30',
    'M88,-38 C82,-28 82,-20 74,-14 S68,-2 64,4',
    'M100,-52 C96,-44 98,-38 92,-32',
  ].join(' ');
  const nuggets = [[-74, -10], [-128, 0], [-122, 30], [74, -14], [-66, 16]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('');
  return `<path d="${poly(far)}" fill="url(#${p}far)"/>
  <rect x="-180" y="10" width="360" height="50" fill="url(#${p}haze)"/>
  <path d="${poly(L)} ${poly(R)}" fill="url(#${p}mtnL)"/>
  <path d="${poly(Llit)} ${poly(Rlit)}" fill="url(#${p}litL)"/>
  <path d="M${pts([[-96, -76], [-104, -40], [-116, -8]])} M${pts([[-140, -46], [-146, -12], [-152, 14]])} M${pts([[98, -66], [106, -32], [114, -2]])} M${pts([[140, -42], [146, -10]])}" fill="none" stroke="#0F2C1D" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>
  <path d="${veinD}" fill="none" stroke="#F6C453" stroke-opacity=".16" stroke-width="3.2" stroke-linecap="round"/>
  <path d="${veinD}" fill="none" stroke="#E9B44A" stroke-width=".9" stroke-linecap="round"/>
  <g fill="#F6C453">${nuggets}</g>
  <path d="M${pts(rimL)} M${pts(rimR)}" fill="none" stroke="url(#${p}ray)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".9"/>
  <path d="M${pts(ridgeL)} M${pts(ridgeR)}" fill="none" stroke="#F6C453" stroke-width=".8" stroke-opacity=".35" stroke-linejoin="round"/>`;
}

function mine(p) {
  // a timbered mine portal in the left mountain, rails and an ore cart of gold
  const x0 = -124, y0 = 62;
  return `<path d="M${x0 - 11},${y0} L${x0 - 11},${y0 - 12} A11,11 0 0 1 ${x0 + 11},${y0 - 12} L${x0 + 11},${y0} Z" fill="#06150D"/>
  <rect x="${x0 - 14}" y="${y0 - 16}" width="3.4" height="16" fill="url(#${p}wood)"/>
  <rect x="${x0 + 10.6}" y="${y0 - 16}" width="3.4" height="16" fill="url(#${p}wood)"/>
  <rect x="${x0 - 16}" y="${y0 - 19}" width="32" height="3.6" rx=".8" fill="url(#${p}wood)"/>
  <path d="M${x0 - 6},${y0} L${x0 + 26},${y0 + 14} M${x0 + 2},${y0} L${x0 + 32},${y0 + 10}" stroke="#C9A866" stroke-width=".9"/>
  <path d="M${x0 - 2},${y0 + 4} L${x0 + 28},${y0 + 16}" stroke="#7E5A14" stroke-width=".7" stroke-dasharray="1 3"/>
`;
}

function school(p) {
  // the schoolhouse on the right shoulder, with the flag
  const ledge = `<path d="M66,30 C76,16 86,12 96,12 L150,12 C162,12 172,16 184,24 L184,46 L66,46 Z" fill="url(#${p}mtnL)"/>
    <path d="M70,26 C78,16 86,12 96,12 L150,12 C162,12 172,16 182,22" fill="none" stroke="#7FB27A" stroke-width="1" stroke-opacity=".7"/>`;
  const wins = [104, 112, 124, 132].map((x) => `<rect x="${x}" y="0" width="5" height="5" fill="#1E4630"/><path d="M${x},2.5 h5 M${x + 2.5},0 v5" stroke="#E7D9B4" stroke-width=".5"/>`).join('');
  const flag = `<path d="M150,12 V-24" stroke="#E7D9B4" stroke-width="1"/>
    <rect x="150.5" y="-24" width="13" height="3.5" fill="#0038A8"/><rect x="150.5" y="-20.5" width="13" height="3.5" fill="#CE1126"/>
    <path d="M150.5,-24 L156.5,-20.5 L150.5,-17 Z" fill="#FFFFFF"/><circle cx="152.6" cy="-20.5" r=".9" fill="#FCD116"/>`;
  return `${ledge}
  <path d="M98,12 L98,-2 L142,-2 L142,12 Z" fill="url(#${p}wall)"/>
  <path d="M94,-1 L120,-14 L146,-1 L142,-1 L120,-11 L98,-1 Z" fill="#F6C453"/>
  <path d="M97,-1.5 L120,-12.5 L143,-1.5 Z" fill="url(#${p}roof)"/>
  ${wins}
  <rect x="117" y="3" width="6" height="9" fill="#24543A"/>
  <path d="M98,12 H142" stroke="#C9A866" stroke-width=".8"/>
  ${flag}`;
}

function ropeBridge(p) {
  // a rope bridge from the left cliff to the school's ledge
  const A = [-52, 6], B = [92, 14];
  const sag = 16;
  const deck = (t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t + sag * 4 * t * (1 - t)];
  const rail = (t) => { const [x, y] = deck(t); return [x, y - 9 + 2 * 4 * t * (1 - t)]; };
  const N = 60;
  const d = Array.from({ length: N + 1 }, (_, i) => deck(i / N));
  const r = Array.from({ length: N + 1 }, (_, i) => rail(i / N));
  const planks = Array.from({ length: 34 }, (_, i) => { const [x, y] = deck((i + 0.5) / 34); return `M${f2(x)},${f2(y - 0.2)} v2.6`; }).join(' ');
  const hangers = Array.from({ length: 15 }, (_, i) => { const t = (i + 1) / 16; const [x, y] = deck(t), [, ry] = rail(t); return `M${f2(x)},${f2(ry)} V${f2(y)}`; }).join(' ');
  const post = ([x, y]) => `<rect x="${x - 1.6}" y="${y - 12}" width="3.2" height="13" rx=".8" fill="url(#${p}wood)"/>`;
  return `<path d="M${pts(d)} L${pts([...d].reverse().map(([x, y]) => [x, y + 2.6]))} Z" fill="url(#${p}wood)"/>
  <path d="${planks}" stroke="#6E4F12" stroke-width=".5"/>
  <polyline points="${pts(r)}" fill="none" stroke="url(#${p}rope)" stroke-width="1.3"/>
  <polyline points="${pts(r.map(([x, y]) => [x, y - 0.1]))}" fill="none" stroke="#FFF1C8" stroke-width=".4" stroke-opacity=".7"/>
  <path d="${hangers}" stroke="#E9CF8E" stroke-width=".6"/>
  ${post(A)}${post([B[0] - 2, B[1]])}`;
}

function foreground(p) {
  const hillL = [[-180, 96], [-150, 82], [-110, 76], [-70, 84], [-36, 96], [-14, 120], [-14, 200], [-180, 200]];
  const hillR = mir(hillL);
  const trees = [[-168, 92, 15], [-156, 86, 20], [-142, 84, 16], [-128, 80, 22], [-114, 78, 17], [-98, 80, 21], [-84, 82, 16], [-70, 86, 19], [-56, 90, 14]]
    .flatMap(([x, y, h]) => [[x, y, h], [-x - 4, y + 2, h * 0.95]]);
  const slopeTrees = [[-166, 30, 11], [-152, 40, 13], [-140, 50, 10], [-74, 66, 11], [-64, 72, 12], [150, 46, 12], [164, 40, 10], [138, 54, 11], [66, 70, 12], [76, 64, 10]];
  return `<path d="M-3,36 C-10,52 10,62 -6,78 C-20,92 -10,104 -24,120 L24,120 C12,104 22,92 8,80 C20,66 2,54 3,36 Z" fill="url(#${p}river)"/>
  <path d="M0,40 C-6,56 12,66 0,80 C-12,94 -4,106 -12,118" fill="none" stroke="#FFF6D8" stroke-width=".8" stroke-opacity=".7"/>
  <path d="${slopeTrees.map(([x, y, h]) => pine(x, y, h)).join(' ')}" fill="#143A25"/>
  <path d="M${pts(hillL)} Z M${pts(hillR)} Z" fill="url(#${p}hill)"/>
  <path d="${trees.map(([x, y, h]) => pine(x, y, h)).join(' ')}" fill="#0F2C1D"/>`;
}

function book(p) {
  const top = [[-128, 92], [-96, 79], [-40, 81], [0, 102]];
  const bot = [[-128, 118], [-94, 107], [-40, 111], [0, 130]];
  const c = (s) => `${pt(s[0])} C${pts(s.slice(1))}`;
  const rev = (s) => [...s].reverse();
  const page = (a, b) => `M${c(a)} L${c(rev(b))} Z`;
  const lines = [0.2, 0.36, 0.52, 0.68, 0.84].map((k) => {
    const l = top.map(([x, y], i) => [x + (i === 0 ? 15 : i === 3 ? -13 : 0), y + (bot[i][1] - y) * k]);
    return `M${c(l)} M${c(mir(l))}`;
  }).join(' ');
  const edges = [3, 5.5, 8, 10.5].map((o) => {
    const l = bot.map(([x, y], i) => [x - (i === 0 ? 2 : 0), y + o]);
    return `M${c(l)} M${c(mir(l))}`;
  }).join(' ');
  return `<path d="M-140,102 C-100,89 -42,91 0,116 C42,91 100,89 140,102 L140,134 C100,121 42,125 0,156 C-42,125 -100,121 -140,134 Z" fill="url(#${p}cover)"/>
  <path d="M-140,134 C-100,121 -42,125 0,156 C42,125 100,121 140,134" fill="none" stroke="url(#${p}goldV)" stroke-width="2.2"/>
  <path d="M-134,98 C-98,85 -42,87 0,112 C42,87 98,85 134,98 L134,128 C98,115 42,119 0,148 C-42,119 -98,115 -134,128 Z" fill="#E8D7AE"/>
  <path d="${edges}" fill="none" stroke="#C9A866" stroke-width=".7"/>
  <path d="${page(top, bot)} ${page(mir(top), mir(bot))}" fill="url(#${p}page)"/>
  <path d="${lines}" fill="none" stroke="${C.field}" stroke-opacity=".35" stroke-width="1"/>
  <path d="M0,102 V130" stroke="#C9A866" stroke-width="1.4"/>
  <path d="M-2,102 C-12,96 -24,94 -40,95" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="1"/>`;
}

function scene(p) {
  return `<rect x="-180" y="-180" width="360" height="360" fill="url(#${p}sky2)"/>
  ${philippineSun(p)}${mountains(p)}${mine(p)}${school(p)}${foreground(p)}${ropeBridge(p)}${book(p)}`;
}

// ---------- rope ----------
// A twisted rope laid in a circle: overlapping strands set at a twist angle, clipped to its band.
function rope(p, id, R, w) {
  const n = Math.round((2 * Math.PI * R) / (w * 0.62));
  const strands = [];
  for (let i = 0; i < n; i++) {
    const a = (i * 360) / n;
    const [x, y] = P(R, a);
    strands.push(`<ellipse transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(a + 90 + 48)})" rx="${f2(w * 0.7)}" ry="${f2(w * 0.3)}"/>`);
  }
  return `<clipPath id="${p}${id}"><path clip-rule="evenodd" d="M${-R - w / 2},0 a${R + w / 2},${R + w / 2} 0 1 0 ${2 * R + w},0 a${R + w / 2},${R + w / 2} 0 1 0 ${-2 * R - w},0 Z M${-R + w / 2},0 a${R - w / 2},${R - w / 2} 0 1 0 ${2 * R - w},0 a${R - w / 2},${R - w / 2} 0 1 0 ${-2 * R + w},0 Z"/></clipPath>
  <circle r="${R}" fill="none" stroke="#5E4310" stroke-width="${w}"/>
  <g clip-path="url(#${p}${id})"><g fill="url(#${p}strand)" stroke="#6E4F12" stroke-width=".55">${strands.join('')}</g></g>
  <circle r="${R + w / 2}" fill="none" stroke="#4A350C" stroke-width=".6"/><circle r="${R - w / 2}" fill="none" stroke="#4A350C" stroke-width=".6"/>`;
}

function ribbon(p) {
  const a0 = 180 - 25, a1 = 180 + 25, rO = 193, rI = 167;
  const sector = (r1, r2, b0, b1) => `M${pt(P(r1, b0))} A${r1},${r1} 0 0 1 ${pt(P(r1, b1))} L${pt(P(r2, b1))} A${r2},${r2} 0 0 0 ${pt(P(r2, b0))} Z`;
  const tail = (s) => {
    const b = s > 0 ? a1 : a0, e = b + s * 8, sh = 9;
    return `M${pt(P(rO + sh, b - s * 7))} L${pt(P(rO + sh, e))} L${pt(P((rO + rI) / 2 + sh, e - s * 4.5))} L${pt(P(rI + sh, e))} L${pt(P(rI + sh, b - s * 7))} Z`;
  };
  const fold = (s) => {
    const b = s > 0 ? a1 : a0;
    return `M${pt(P(rO, b))} L${pt(P(rO + 9, b))} L${pt(P(rI + 9, b))} L${pt(P(rI, b))} Z`;
  };
  return `<path d="${tail(1)} ${tail(-1)}" fill="url(#${p}ribbonDark)"/>
  <path d="${fold(1)} ${fold(-1)}" fill="#6E4F12"/>
  <path d="${sector(rO, rI, a0, a1)}" fill="url(#${p}ribbon)"/>
  <path d="M${pt(P(rO - 2.5, a0))} A${rO - 2.5},${rO - 2.5} 0 0 1 ${pt(P(rO - 2.5, a1))} M${pt(P(rI + 2.5, a0))} A${rI + 2.5},${rI + 2.5} 0 0 1 ${pt(P(rI + 2.5, a1))}" fill="none" stroke="#9C7019" stroke-width=".8"/>
  ${arcText(CINZEL_B, 'EST. 2012', 0, 0, 184.4, 12.5, { tracking: 0.28, side: 'bottom', fill: C.forest })}`;
}

// ---------- the seal ----------
const MED = 160;

function seal(p) {
  const side = (a) => {
    const [x, y] = P(209, a);
    return `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${a})" d="${star(6.5, 2.7)}"/>`;
  };
  return `<g><defs>${defs(p)}${sceneDefs(p)}
    <linearGradient id="${p}strand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE6A6"/><stop offset=".45" stop-color="#E0B460"/><stop offset="1" stop-color="#9C7019"/></linearGradient>
    <clipPath id="${p}clip"><circle r="${MED}"/></clipPath>
    <filter id="${p}shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#000" flood-opacity=".45"/></filter></defs>
  <circle r="249" fill="#0A1F14"/>
  <circle r="232" fill="url(#${p}band)"/>
  ${rope(p, 'ro', 240, 15)}
  <circle r="230" fill="none" stroke="url(#${p}gold)" stroke-width="1.6"/>
  <circle r="226" fill="none" stroke="url(#${p}gold)" stroke-width=".6"/>
  ${arcText(CINZEL_B, 'JOSE T. CUYOS SR. II INTEGRATED SCHOOL', 0, 0, 199, 21, { tracking: 0.08, side: 'top', fill: C.cream })}
  ${arcText(CINZEL, 'TOGETHER WE BRIDGE · TOGETHER WE SUCCEED', 0, 0, 219, 13.6, { tracking: 0.1, side: 'bottom', fill: C.sun })}
  <g fill="url(#${p}gold)">${side(-90)}${side(90)}</g>
  <circle r="182" fill="none" stroke="url(#${p}gold)" stroke-width=".6"/>
  ${rope(p, 'ri', 172, 9)}
  <circle r="${MED + 2}" fill="url(#${p}gold)"/>
  <g clip-path="url(#${p}clip)">${scene(p)}</g>
  <circle r="${MED}" fill="none" stroke="#0A1F14" stroke-opacity=".6" stroke-width="1"/>
  <g filter="url(#${p}shadow)">${ribbon(p)}</g>
</g>`;
}

// ---------- lockups ----------
const doc = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>\n`;
const placeSeal = (x, y, size, p) => `<g transform="translate(${f2(x + size / 2)} ${f2(y + size / 2)}) scale(${f2((size / 500) * 10000) / 10000})">${seal(p)}</g>`;

function horizontal(p, reversed = false) {
  const W = 1320, H = 440, S = 340, x = 60 + S + 54;
  const ink = reversed ? C.cream : C.forest, sub = reversed ? C.sun : C.field, gold = reversed ? C.sun : C.oldGold;
  return doc(W, H, `${placeSeal(50, 50, S, p)}
  <rect x="${50 + S + 26}" y="104" width="1.5" height="232" fill="${gold}" opacity=".6"/>
  ${text(CINZEL_B, 'JOSE T. CUYOS SR. II', x, 206, 66, { tracking: 0.02, fill: ink }).svg}
  ${text(CINZEL, 'INTEGRATED SCHOOL', x + 2, 262, 30, { tracking: 0.36, fill: sub }).svg}
  <rect x="${x + 2}" y="292" width="56" height="1.5" fill="${gold}"/>
  ${text(CINZEL, 'EST. 2012', x + 72, 299, 15, { tracking: 0.34, fill: gold }).svg}
  ${text(CINZEL_M, 'TOGETHER WE BRIDGE, TOGETHER WE SUCCEED', x + 2, 340, 15, { tracking: 0.16, fill: ink }).svg}`, reversed ? C.forest : null);
}

function stacked(p) {
  const W = 1000, cx = 500, S = 460;
  const est = text(CINZEL, 'EST. 2012', cx, 760, 17, { anchor: 'middle', tracking: 0.34, fill: C.oldGold });
  const rule = (x1, x2) => `<rect x="${f2(x1)}" y="753" width="${f2(x2 - x1)}" height="1.5" fill="${C.oldGold}"/>`;
  return doc(W, 840, `${placeSeal(cx - S / 2, 40, S, p)}
  ${text(CINZEL_B, 'JOSE T. CUYOS SR. II', cx, 618, 64, { anchor: 'middle', tracking: 0.02, fill: C.forest }).svg}
  ${text(CINZEL, 'INTEGRATED SCHOOL', cx, 676, 30, { anchor: 'middle', tracking: 0.36, fill: C.field }).svg}
  ${est.svg}${rule(cx - 200, cx - est.width / 2 - 22)}${rule(cx + est.width / 2 + 22, cx + 200)}`);
}

const files = {
  'seal.svg': doc(500, 500, placeSeal(0, 0, 500, 's')),
  'logo-stacked.svg': stacked('st'),
  'logo-horizontal.svg': horizontal('hz'),
  'logo-horizontal-reversed.svg': horizontal('hr', true),
};
fs.mkdirSync(path.join(out, 'svg'), { recursive: true });
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, 'svg', n), s);
console.log('wrote', Object.keys(files).join(', '));
