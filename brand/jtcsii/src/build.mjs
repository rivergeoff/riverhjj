// Generates the Jose T. Cuyos Sr. II Integrated School logo suite as self-contained SVGs
// (all type converted to outlines). Run: node brand/jtcsii/src/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERIF, SERIF_I, SANS, text, arcText } from './type.mjs';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');


// Brand palette — gold only, no copper.
export const C = {
  forest: '#0F2A1C', // Deep Forest
  field: '#2E5E3A', // Field Green
  sun: '#F6C453', // Sun Gold
  oldGold: '#A97C22', // Old Gold (gold for text on light grounds)
  cream: '#FDF7E1', // Paper Cream
  // working tints used inside the emblem
  ridgeFar: '#27523A',
  ridge: '#173A25',
  ridgeLit: '#22503A',
  amber: '#E3A93C',
  goldDeep: '#C08E2A',
  river: '#3F7A52',
};

const f2 = (n) => Math.round(n * 100) / 100;

// ---------- geometry helpers ----------
const cubic = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
// y on a monotone-in-x cubic at a given x (bisection)
function yAt(seg, x) {
  let lo = 0, hi = 1;
  const inc = seg[3][0] > seg[0][0];
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    const px = cubic(...seg, m)[0];
    if ((px < x) === inc) lo = m; else hi = m;
  }
  return cubic(...seg, (lo + hi) / 2)[1];
}
const seg = (s) => `M${s[0]} C${s[1]} ${s[2]} ${s[3]}`;
const mirror = (pts) => pts.map(([x, y]) => [300 - x, y]);
const poly = (pts) => 'M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + ' Z';

// Rice grain pointing "up" (−y), centred on the origin, length l, width w.
const grain = (l, w) => {
  const h = l / 2, k = w / 2;
  return `M0,${-h} C${k * 1.05},${-h * 0.62} ${k * 1.1},${h * 0.55} 0,${h} C${-k * 1.1},${h * 0.55} ${-k * 1.05},${-h * 0.62} 0,${-h} Z`;
};

// ---------- the scene (drawn wide so it can be framed by an arch or a circle) ----------
// Scene space: 300 wide, sun at (150,132), bottom of terraces at y=400.
const SUN = [150, 132];
const BOOK_L_TOP = [[78, 259], [100, 248], [128, 250], [150, 265]];
const BOOK_L_BOT = [[80, 271], [102, 262], [128, 265], [150, 280]];
const foreY = (x) => 309 + 13 * Math.cos(((x - 150) * Math.PI) / 130);

function defs(p) {
  return `
  <linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
    <stop offset="0" stop-color="#2A5A37"/><stop offset=".45" stop-color="${C.field}"/><stop offset="1" stop-color="#244D30"/>
  </linearGradient>
  <radialGradient id="${p}glow" cx="${SUN[0]}" cy="${SUN[1]}" r="130" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.sun}" stop-opacity=".34"/><stop offset=".45" stop-color="${C.sun}" stop-opacity=".1"/><stop offset="1" stop-color="${C.sun}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${p}sun" cx="${SUN[0] - 10}" cy="${SUN[1] - 12}" r="48" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#FFE7A3"/><stop offset=".55" stop-color="${C.sun}"/><stop offset="1" stop-color="${C.amber}"/>
  </radialGradient>
  <linearGradient id="${p}page" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFDF4"/><stop offset="1" stop-color="#F3E8C4"/>
  </linearGradient>
  <linearGradient id="${p}earth" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.sun}"/><stop offset="1" stop-color="${C.amber}"/>
  </linearGradient>`;
}

function sunAndRays(p) {
  const rays = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * 360) / 16; // 0 = straight up
    const long = i % 2 === 0;
    const dist = long ? 60 : 55;
    const g = long ? grain(21, 7.4) : grain(13, 5.4);
    rays.push(
      `<path transform="translate(${SUN[0]} ${SUN[1]}) rotate(${a}) translate(0 ${-dist})" d="${g}" fill="${C.sun}"/>`
    );
  }
  return `
  <circle cx="${SUN[0]}" cy="${SUN[1]}" r="130" fill="url(#${p}glow)"/>
  ${rays.join('')}
  <circle cx="${SUN[0]}" cy="${SUN[1]}" r="35" fill="url(#${p}sun)"/>
  <circle cx="${SUN[0]}" cy="${SUN[1]}" r="41" fill="none" stroke="${C.sun}" stroke-opacity=".35" stroke-width="1"/>`;
}

function mountains() {
  // distant range seen through the gorge
  const far = [[-160, 300], [-60, 238], [10, 214], [40, 226], [96, 204], [118, 214], [138, 200], [150, 194], [164, 202], [184, 212], [204, 202], [262, 226], [292, 214], [360, 238], [460, 300], [460, 390], [-160, 390]];
  // the two flanking peaks; inner faces lit by the sun
  const left = [[-160, 345], [-70, 268], [-20, 238], [18, 214], [36, 200], [48, 192], [62, 176], [74, 190], [86, 200], [100, 220], [116, 244], [132, 272], [150, 302], [150, 360], [-160, 360]];
  const leftLit = [[62, 176], [74, 190], [86, 200], [100, 220], [116, 244], [132, 272], [150, 302], [138, 293], [112, 264], [98, 250], [86, 232], [78, 214], [70, 200], [66, 188]];
  // a secondary shoulder ridge for depth
  const leftShoulder = [[-160, 360], [-110, 300], [-60, 272], [-24, 262], [6, 250], [26, 258], [44, 276], [60, 300], [70, 330], [-160, 360]];
  const ridgeLines = (pts) => pts.map(([x, y]) => `${x},${y}`).join(' ');
  const strata = [
    [[44, 214], [52, 222], [60, 220]],
    [[30, 238], [42, 246], [54, 243]],
    [[20, 262], [34, 268], [48, 266]],
  ];
  const strataSvg = (m) =>
    strata.map((s) => `<polyline points="${ridgeLines(m ? mirror(s) : s)}" fill="none" stroke="${C.ridgeLit}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  return `
  <path d="${poly(far)}" fill="${C.ridgeFar}"/>
  <path d="${poly(left)}" fill="${C.ridge}"/>
  <path d="${poly(mirror(left))}" fill="${C.ridge}"/>
  <path d="${poly(leftLit)}" fill="${C.ridgeLit}"/>
  <path d="${poly(mirror(leftLit))}" fill="${C.ridgeLit}"/>
  <path d="${poly(leftShoulder)}" fill="#13321F"/>
  <path d="${poly(mirror(leftShoulder))}" fill="#13321F"/>`;
}

function river() {
  return `
  <path d="M146,292 C138,302 158,310 142,320 C130,327 132,331 118,334 L182,334 C168,331 170,327 160,319 C174,309 156,301 154,292 Z" fill="${C.river}"/>
  <path d="M150,296 C146,304 158,310 148,318 C140,324 142,329 134,333" fill="none" stroke="${C.sun}" stroke-opacity=".55" stroke-width="1.1" stroke-linecap="round"/>`;
}

const pine = (x, y, h) => {
  const w = h * 0.42;
  const t = (k) => y - h * k;
  return `M${f2(x)},${f2(t(1))} L${f2(x + w * 0.42)},${f2(t(0.66))} L${f2(x + w * 0.24)},${f2(t(0.66))} L${f2(x + w * 0.7)},${f2(t(0.33))} L${f2(x + w * 0.38)},${f2(t(0.33))} L${f2(x + w)},${f2(t(0.04))} L${f2(x + w * 0.12)},${f2(t(0.04))} L${f2(x + w * 0.12)},${f2(y + 2)} L${f2(x - w * 0.12)},${f2(y + 2)} L${f2(x - w * 0.12)},${f2(t(0.04))} L${f2(x - w)},${f2(t(0.04))} L${f2(x - w * 0.38)},${f2(t(0.33))} L${f2(x - w * 0.7)},${f2(t(0.33))} L${f2(x - w * 0.24)},${f2(t(0.66))} L${f2(x - w * 0.42)},${f2(t(0.66))} Z`;
};

function foreground() {
  const pts = [];
  for (let x = -170; x <= 470; x += 5) pts.push([x, foreY(x)]);
  const hill = 'M' + pts.map(([x, y]) => `${x},${f2(y)}`).join(' L') + ' L470,340 L-170,340 Z';
  const trees = [
    [-60, 15], [-46, 20], [-30, 14], [-6, 17], [6, 24], [18, 18], [32, 21], [46, 15], [60, 18], [76, 13],
  ].flatMap(([x, h]) => [[x, h], [300 - x, h]]);
  const treePaths = trees.map(([x, h]) => pine(x, foreY(x) + 1.5, h)).join(' ');
  return `<path d="${hill}" fill="${C.forest}"/><path d="${treePaths}" fill="${C.forest}"/>`;
}

function bookBridge() {
  const R_TOP = BOOK_L_TOP.map(([x, y]) => [300 - x, y]);
  const R_BOT = BOOK_L_BOT.map(([x, y]) => [300 - x, y]);
  const pageL = `M${BOOK_L_TOP[0]} C${BOOK_L_TOP[1]} ${BOOK_L_TOP[2]} ${BOOK_L_TOP[3]} L${BOOK_L_BOT[3]} C${BOOK_L_BOT[2]} ${BOOK_L_BOT[1]} ${BOOK_L_BOT[0]} Z`;
  const pageR = `M${R_TOP[0]} C${R_TOP[1]} ${R_TOP[2]} ${R_TOP[3]} L${R_BOT[3]} C${R_BOT[2]} ${R_BOT[1]} ${R_BOT[0]} Z`;
  // cover: slightly larger, dipping at the spine
  const cover = `M72,264 C98,254 128,258 150,272 C172,258 202,254 228,264 L229,276 C204,268 174,272 150,288 C126,272 96,268 71,276 Z`;
  // page-edge lines (thickness of the page block)
  const edges = [3, 6, 9]
    .map((o) => {
      const l = BOOK_L_BOT.map(([x, y], i) => [x - (i === 0 ? 2 : 0), y + o * 0.55 - 1]);
      const r = l.map(([x, y]) => [300 - x, y]);
      return `<path d="${seg(l)}" fill="none" stroke="${C.goldDeep}" stroke-opacity=".55" stroke-width=".8"/><path d="${seg(r)}" fill="none" stroke="${C.goldDeep}" stroke-opacity=".55" stroke-width=".8"/>`;
    })
    .join('');
  // printed lines on the pages
  const lines = [0.3, 0.52, 0.74]
    .map((k) => {
      const l = BOOK_L_TOP.map(([x, y], i) => [x + (i === 0 ? 9 : i === 3 ? -8 : 0), y + (BOOK_L_BOT[i][1] - y) * k]);
      const r = l.map(([x, y]) => [300 - x, y]);
      return `<path d="${seg(l)}" fill="none" stroke="${C.field}" stroke-opacity=".38" stroke-width="1"/><path d="${seg(r)}" fill="none" stroke="${C.field}" stroke-opacity=".38" stroke-width="1"/>`;
    })
    .join('');

  // hanging bridge: towers at the outer page edges, catenary main cables, suspenders to the page tops
  const tl = 84, tr = 216, topY = 214, sagY = 246;
  const cableY = (x) => topY + (sagY - topY) * (1 - ((x - 150) / (150 - tl)) ** 2);
  const deckY = (x) => (x <= 150 ? yAt(BOOK_L_TOP, x) : yAt(R_TOP, x));
  const cable = [];
  for (let x = tl; x <= tr; x += 2) cable.push(`${x},${f2(cableY(x))}`);
  const susp = [];
  for (let x = tl + 8; x < tr - 4; x += 8) {
    if (Math.abs(x - 150) < 3) continue;
    susp.push(`M${x},${f2(cableY(x))} V${f2(deckY(x) + 0.5)}`);
  }
  const tower = (x) => {
    const base = deckY(x) + 1;
    return `<path d="M${x - 2.6},${base} L${x - 2},${topY - 2} L${x + 2},${topY - 2} L${x + 2.6},${base} Z" fill="${C.cream}"/>
      <rect x="${x - 4.2}" y="${topY - 6}" width="8.4" height="4.4" rx="1.2" fill="${C.sun}"/>
      <rect x="${x - 3.2}" y="${f2(topY + (base - topY) * 0.45)}" width="6.4" height="1.6" fill="${C.sun}"/>`;
  };
  // back-stays to anchors on the slopes
  const stays = `M${tl},${topY} L52,250 M${tr},${topY} L248,250`;
  const handrail = [];
  for (let x = tl; x <= tr; x += 2) handrail.push(`${x},${f2(deckY(x) - 6 - 3 * (1 - ((x - 150) / 66) ** 2))}`);

  return `
  <g fill="none" stroke="${C.cream}" stroke-linecap="round">
    <path d="${stays}" stroke-width="1.5" stroke-opacity=".9"/>
    <polyline points="${cable.join(' ')}" stroke-width="1.8"/>
    <path d="${susp.join(' ')}" stroke-width="1" stroke-opacity=".92"/>
  </g>
  <circle cx="52" cy="250" r="2.4" fill="${C.sun}"/><circle cx="248" cy="250" r="2.4" fill="${C.sun}"/>
  <path d="${cover}" fill="${C.goldDeep}"/>
  <path d="M71,276 C96,268 126,272 150,288 C174,272 204,268 229,276 L229,278.5 C204,271 174,275 150,291 C126,275 96,271 71,278.5 Z" fill="#8F6A1C"/>
  <path d="${pageL}" fill="url(#bk-page)"/>
  <path d="${pageR}" fill="url(#bk-page)"/>
  ${edges}${lines}
  <path d="M150,265 L150,280" stroke="${C.goldDeep}" stroke-width="1.2"/>
  ${tower(tl)}${tower(tr)}`;
}

function wovenBand(y0 = 333) {
  const h = 19, mid = y0 + h / 2;
  const unit = 18;
  const parts = [];
  for (let x = -171; x <= 471; x += unit) {
    const cx = x + unit / 2;
    parts.push(`M${cx},${mid - 6.5} L${cx + 6.5},${mid} L${cx},${mid + 6.5} L${cx - 6.5},${mid} Z`);
    // small inward triangles between diamonds
    parts.push(`M${x - 2.6},${y0 + 2.4} L${x + 2.6},${y0 + 2.4} L${x},${y0 + 6} Z`);
    parts.push(`M${x - 2.6},${y0 + h - 2.4} L${x + 2.6},${y0 + h - 2.4} L${x},${y0 + h - 6} Z`);
  }
  const eyes = [];
  for (let x = -171; x <= 471; x += unit) {
    const cx = x + unit / 2;
    eyes.push(`M${cx},${mid - 2.4} L${cx + 2.4},${mid} L${cx},${mid + 2.4} L${cx - 2.4},${mid} Z`);
  }
  return `
  <rect x="-200" y="${y0}" width="700" height="${h}" fill="${C.forest}"/>
  <rect x="-200" y="${y0}" width="700" height="1.6" fill="${C.sun}"/>
  <rect x="-200" y="${y0 + h - 1.6}" width="700" height="1.6" fill="${C.sun}"/>
  <path d="${parts.join(' ')}" fill="${C.sun}"/>
  <path d="${eyes.join(' ')}" fill="${C.forest}"/>
  <path d="${Array.from({ length: 37 }, (_, i) => { const cx = -171 + i * unit + unit / 2; return `M${cx - 0.9},${mid} a.9,.9 0 1 0 1.8,0 a.9,.9 0 1 0 -1.8,0`; }).join(' ')}" fill="${C.cream}"/>`;
}

function terraces(y0 = 352) {
  // stepped rice terraces: each step = a darker retaining wall + a bright paddy
  const steps = [
    { base: 359, bulge: 3.5 },
    { base: 367, bulge: 4.5 },
    { base: 376, bulge: 5.5 },
    { base: 386, bulge: 6.5 },
    { base: 397, bulge: 7.5 },
    { base: 410, bulge: 8.5 },
  ];
  const curve = (b, bulge, phase) => {
    const pts = [];
    for (let x = -170; x <= 470; x += 6) {
      const y = b + bulge * (1 - ((x - 150) / 190) ** 2) + 0.9 * Math.sin((x + phase) / 17);
      pts.push(`${x},${f2(y)}`);
    }
    return pts;
  };
  const fills = ['#F8CD66', '#F2BE4E', '#F6C453', '#EDB547', '#F2BE4E', '#E9B043'];
  let prev = [`-170,${y0}`, `470,${y0}`];
  let svg = `<rect x="-200" y="${y0}" width="700" height="80" fill="url(#bk-earth)"/>`;
  steps.forEach((s, i) => {
    const c = curve(s.base, s.bulge, i * 23);
    svg += `<path d="M${prev.join(' L')} L${[...c].reverse().join(' L')} Z" fill="${fills[i]}"/>`;
    svg += `<polyline points="${c.join(' ')}" fill="none" stroke="${C.goldDeep}" stroke-width="1.5"/>`;
    svg += `<polyline points="${c.map((pt) => { const [x, y] = pt.split(',').map(Number); return `${x},${f2(y + 1.6)}`; }).join(' ')}" fill="none" stroke="#FFE39A" stroke-opacity=".7" stroke-width=".7"/>`;
    prev = c;
  });
  return svg;
}

function scene(p) {
  return `
  <rect x="-200" y="-200" width="700" height="620" fill="url(#${p}sky)"/>
  ${sunAndRays(p)}
  ${mountains()}
  ${foreground()}
  ${river()}
  ${bookBridge().replaceAll('bk-', p)}
  ${wovenBand()}
  ${terraces().replaceAll('bk-', p)}`;
}

// ---------- marks ----------
const archPath = (i) => `M${i},${400 - i} V150 A${150 - i},${150 - i} 0 0 1 ${300 - i},150 V${400 - i} Z`;

export function archEmblem(p = 'a') {
  return `<g>
  <defs>${defs(p)}<clipPath id="${p}clip"><path d="${archPath(4)}"/></clipPath></defs>
  <path d="${archPath(0)}" fill="${C.forest}"/>
  <g clip-path="url(#${p}clip)">${scene(p)}</g>
  <path d="${archPath(9.5)}" fill="none" stroke="${C.sun}" stroke-width="1.6"/>
</g>`;
}

// Full-circle emblem of radius R centred at (cx,cy)
export function circleEmblem(p = 'c', cx = 150, cy = 150, R = 150) {
  const s = (0.8 * R) / 150;
  const tx = cx - SUN[0] * s;
  const ty = cy - 0.43 * R - SUN[1] * s;
  return `<g>
  <defs>${defs(p)}<clipPath id="${p}clip"><circle cx="${cx}" cy="${cy}" r="${R - 3}"/></clipPath></defs>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="${C.forest}"/>
  <g clip-path="url(#${p}clip)"><g transform="translate(${f2(tx)} ${f2(ty)}) scale(${f2(s * 1000) / 1000})">${scene(p)}</g></g>
  <circle cx="${cx}" cy="${cy}" r="${R - 7}" fill="none" stroke="${C.sun}" stroke-width="1.6"/>
</g>`;
}

export function seal(p = 's') {
  const cx = 250, cy = 250;
  const dots = [];
  for (let i = 0; i < 120; i++) {
    const a = (i * Math.PI * 2) / 120;
    dots.push(`<circle cx="${f2(cx + 181 * Math.cos(a))}" cy="${f2(cy + 181 * Math.sin(a))}" r="1.15"/>`);
  }
  const diamond = (x, y, r) => `M${x},${y - r} L${x + r * 0.7},${y} L${x},${y + r} L${x - r * 0.7},${y} Z`;
  return `<g>
  <circle cx="${cx}" cy="${cy}" r="248" fill="${C.forest}"/>
  <circle cx="${cx}" cy="${cy}" r="240" fill="none" stroke="${C.sun}" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="235" fill="none" stroke="${C.sun}" stroke-width=".8" stroke-opacity=".7"/>
  <g fill="${C.sun}">${dots.join('')}</g>
  ${arcText(SANS, 'JOSE T. CUYOS SR. II INTEGRATED SCHOOL', cx, cy, 201, 18.5, { tracking: 0.13, side: 'top', fill: C.cream })}
  ${arcText(SERIF_I, 'Together we bridge, together we succeed', cx, cy, 216, 25, { tracking: 0.01, side: 'bottom', fill: C.sun })}
  ${text(SANS, 'EST.', 41, 226, 9.5, { anchor: 'middle', tracking: 0.25, fill: C.sun }).svg}
  ${text(SERIF, '20', 41, 262, 32, { anchor: 'middle', fill: C.cream }).svg}
  ${text(SANS, 'EST.', 459, 226, 9.5, { anchor: 'middle', tracking: 0.25, fill: C.sun }).svg}
  ${text(SERIF, '12', 459, 262, 32, { anchor: 'middle', fill: C.cream }).svg}
  <path d="${diamond(41, 281, 4.5)} ${diamond(459, 281, 4.5)}" fill="${C.sun}"/>
  ${circleEmblem(p, cx, cy, 170)}
</g>`;
}

// ---------- lockups ----------
const svgDoc = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>\n`;

function stacked(p = 'st') {
  const W = 900, H = 980, cx = W / 2;
  const name = text(SERIF, 'Jose T. Cuyos Sr. II', cx, 640, 104, { anchor: 'middle', fill: C.forest });
  const sub = text(SANS, 'INTEGRATED SCHOOL', cx, 722, 30, { anchor: 'middle', tracking: 0.42, fill: C.field });
  const est = text(SANS, 'EST. 2012', cx, 796, 21, { anchor: 'middle', tracking: 0.34, fill: C.oldGold });
  const tag = text(SERIF_I, 'Together we bridge, together we succeed', cx, 892, 44, { anchor: 'middle', fill: C.field });
  const rule = (x1, x2) => `<rect x="${x1}" y="787" width="${x2 - x1}" height="2" fill="${C.oldGold}"/>`;
  const body = `<g transform="translate(${cx - 165} 50) scale(1.1)">${archEmblem(p)}</g>
  ${name.svg}${sub.svg}${est.svg}${rule(cx - 230, cx - est.width / 2 - 26)}${rule(cx + est.width / 2 + 26, cx + 230)}${tag.svg}`;
  return svgDoc(W, H, body);
}

function horizontal(p = 'hz', reversed = false) {
  const W = 1200, H = 440;
  const ink = reversed ? C.cream : C.forest;
  const sub = reversed ? C.sun : C.field;
  const est = reversed ? C.sun : C.oldGold;
  const body = `<g transform="translate(60 60) scale(.8)">${archEmblem(p)}</g>
  <rect x="352" y="88" width="1.6" height="264" fill="${reversed ? C.sun : C.field}" opacity="${reversed ? 0.6 : 0.35}"/>
  ${text(SERIF, 'Jose T. Cuyos Sr. II', 396, 222, 104, { fill: ink }).svg}
  ${text(SANS, 'INTEGRATED SCHOOL', 400, 290, 28, { tracking: 0.42, fill: sub }).svg}
  ${text(SANS, 'EST. 2012', 400, 342, 17, { tracking: 0.34, fill: est }).svg}`;
  return svgDoc(W, H, body, reversed ? C.forest : null);
}

const files = {
  'emblem-arch.svg': svgDoc(300, 400, archEmblem('e')),
  'emblem-circle.svg': svgDoc(300, 300, circleEmblem('ec')),
  'seal.svg': svgDoc(500, 500, seal('s')),
  'logo-stacked.svg': stacked(),
  'logo-horizontal.svg': horizontal('hz'),
  'logo-horizontal-reversed.svg': horizontal('hr', true),
};
fs.mkdirSync(path.join(out, 'svg'), { recursive: true });
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, 'svg', n), s);
console.log('wrote', Object.keys(files).join(', '));
