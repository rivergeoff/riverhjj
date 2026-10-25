// Take 3 — "Ani ng Liwanag" (Harvest of Light): a formal Philippine school seal where every
// element and every count means something. Set entirely in Cinzel.
// Run: node take3.mjs   → ../take-3/svg/*.svg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, text, arcText } from './type.mjs';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../take-3');
// One family throughout: Cinzel, classic carved capitals for an official seal.
const CINZEL_B = loadFont('cinzel800.ttf');
const CINZEL = loadFont('cinzel700.ttf');
const CINZEL_M = loadFont('cinzel600.ttf');
const ITALIC = loadFont('cormorant-italic.ttf'); // the motto, in a calligraphic italic

export const C = {
  forest: '#0F2A1C', // Deep Forest
  field: '#2E5E3A', // Field Green
  sun: '#F6C453', // Sun Gold
  oldGold: '#A97C22', // Old Gold
  cream: '#FDF7E1', // Paper Cream
  // tints used inside the medallion
  halo: '#3A6C46',
  far: '#5A9466',
  mtn: '#163824',
  lit: '#2A5A3C',
  wall: '#DCA63C',
  tick: '#B88A2A',
  flagBlue: '#0038A8',
  flagRed: '#CE1126',
};

// The numbers the seal is built on.
export const COUNTS = {
  rays: 8, // the eight rays of the flag's sun
  grains: 21, // per palay stalk: a full head of grain, for the harvest
  peaks: 2, // elementary + secondary, integrated
  terraces: 4, // Maka-Diyos, Maka-tao, Makakalikasan, Makabansa
  stars: 3, // learners, teachers, parents & community
};

const f2 = (n) => Math.round(n * 100) / 100;
// clock angles: 0° = straight up, increasing clockwise
const P = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.sin(a), -r * Math.cos(a)];
};
const pt = ([x, y]) => `${f2(x)},${f2(y)}`;
const pts = (a) => a.map(pt).join(' ');
const mir = (a) => a.map(([x, y]) => [-x, y]);
const grain = (l, w) => {
  const h = l / 2, k = w / 2;
  return `M0,${-h} C${k * 1.05},${-h * 0.62} ${k * 1.1},${h * 0.55} 0,${h} C${-k * 1.1},${h * 0.55} ${-k * 1.05},${-h * 0.62} 0,${-h} Z`;
};
const star = (R, r) =>
  'M' + Array.from({ length: 10 }, (_, i) => pt(P(i % 2 ? r : R, i * 36))).join(' L') + ' Z';
const diamond = (x, y, rx, ry) => `M${f2(x)},${f2(y - ry)} L${f2(x + rx)},${f2(y)} L${f2(x)},${f2(y + ry)} L${f2(x - rx)},${f2(y)} Z`;

function cubicYAt(s, x) {
  let lo = 0, hi = 1;
  const at = (t, i) => {
    const u = 1 - t;
    return u ** 3 * s[0][i] + 3 * u * u * t * s[1][i] + 3 * u * t * t * s[2][i] + t ** 3 * s[3][i];
  };
  for (let k = 0; k < 40; k++) {
    const m = (lo + hi) / 2;
    if (at(m, 0) < x) lo = m; else hi = m;
  }
  return at((lo + hi) / 2, 1);
}

// ---------- the medallion (radius 128, origin at its centre) ----------
const MED = 128;
// One scene on one axis: the sun of the flag rises in the gap between the peaks; the hanging
// bridge crosses its face, its deck the line between the flag's blue and red; below it a river
// runs down the terraced valley and into the open book. From the book, the way leads up across
// the bridge and into the light.
const SUN = { x: 0, y: -22, r: 19 };
const DISC = 47;

function sun() {
  const at = (r, d) => { const [x, y] = P(r, d); return `${f2(SUN.x + x)},${f2(SUN.y + y)}`; };
  const rays = Array.from({ length: COUNTS.rays }, (_, i) => {
    const a = i * (360 / COUNTS.rays);
    return `M${at(23, a - 8)} L${at(43, a)} L${at(23, a + 8)} Z`;
  }).join(' ');
  return `<circle cx="${SUN.x}" cy="${SUN.y}" r="${DISC + 14}" fill="${C.sun}" opacity=".12"/>
  <path d="M${SUN.x - DISC},${SUN.y} A${DISC},${DISC} 0 0 1 ${SUN.x + DISC},${SUN.y} Z" fill="${C.flagBlue}"/>
  <path d="M${SUN.x - DISC},${SUN.y} A${DISC},${DISC} 0 0 0 ${SUN.x + DISC},${SUN.y} Z" fill="${C.flagRed}"/>
  <path d="${rays}" fill="${C.sun}"/>
  <circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.r}" fill="${C.sun}"/>
  <circle cx="${SUN.x}" cy="${SUN.y}" r="${DISC}" fill="none" stroke="${C.sun}" stroke-width="2.2"/>`;
}

const LEFT = [[-150, 110], [-150, 4], [-132, -10], [-116, -30], [-100, -50], [-88, -64], [-76, -46], [-66, -22], [-54, 4], [-40, 30], [-24, 52], [0, 64]];
const LEFT_LIT = [[-88, -64], [-76, -46], [-66, -22], [-54, 4], [-40, 30], [-24, 52], [0, 64], [-30, 64], [-50, 40], [-62, 12], [-74, -18], [-82, -44]];

function mountains() {
  const far = [[-150, 50], [-110, 30], [-80, 38], [-50, 26], [-20, 34], [0, 30], [20, 34], [50, 26], [80, 38], [110, 30], [150, 50], [150, 150], [-150, 150]];
  const crease = [[-88, -64], [-96, -36], [-106, -8], [-112, 20]];
  return `<path d="M${pts(far)} Z" fill="${C.far}"/>
  <path d="M${pts(LEFT)} Z M${pts(mir(LEFT))} Z" fill="${C.mtn}"/>
  <path d="M${pts(LEFT_LIT)} Z M${pts(mir(LEFT_LIT))} Z" fill="${C.lit}"/>
  <path d="M${pts(crease)} M${pts(mir(crease))}" fill="none" stroke="${C.mtn}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${pts(LEFT_LIT.slice(0, 7))} M${pts(mir(LEFT_LIT.slice(0, 7)))}" fill="none" stroke="${C.sun}" stroke-opacity=".55" stroke-width="1.1" stroke-linejoin="round"/>`;
}

// The bridge, silhouetted against the sun; its deck lies on the line between blue and red.
function bridge() {
  const A = -66, B = 66, y0 = SUN.y, sag = 2.5, top = SUN.y - 26;
  const deckY = (x) => y0 + sag * (1 - (x / B) ** 2);
  const cableY = (x) => top + 3 + (y0 - 4 - top - 3) * (1 - (x / B) ** 2);
  const d = [], k = [];
  for (let x = A; x <= B; x += 2) { d.push([x, deckY(x)]); k.push([x, cableY(x)]); }
  const hangers = [];
  for (let x = A + 6; x < B - 3; x += 6) hangers.push(`M${f2(x)},${f2(cableY(x))} V${f2(deckY(x))}`);
  const ink = C.forest;
  const tower = (x) => `<path d="M${x - 2.6},${f2(deckY(x) + 8)} L${x - 2},${top} L${x + 2},${top} L${x + 2.6},${f2(deckY(x) + 8)} Z" fill="${ink}"/>
    <rect x="${x - 4}" y="${top - 3}" width="8" height="3.4" rx="1" fill="${ink}"/>`;
  return `<path d="M${pts(d)} L${pts([...d].reverse().map(([x, y]) => [x, y + 3.2]))} Z" fill="${ink}"/>
  <g fill="none" stroke="${ink}" stroke-linecap="round">
    <polyline points="${pts(k)}" stroke-width="2"/>
    <path d="${hangers.join(' ')}" stroke-width="1"/>
    <path d="M${A},${top} L${A - 22},${f2(y0 + 16)} M${B},${top} L${B + 22},${f2(y0 + 16)}" stroke-width="1.4"/>
  </g>
  ${tower(A)}${tower(B)}`;
}

// Terraces step down both sides of the valley toward the river.
function terraces() {
  const tops = [34, 50, 66, 82], dips = [30, 30, 30, 30];
  const curve = (i, off = 0) => {
    const a = [];
    for (let x = -150; x <= 150; x += 5) a.push([x, tops[i] + dips[i] * (1 - (x / 140) ** 2) + off]);
    return a;
  };
  let svg = '';
  for (let i = 0; i < COUNTS.terraces; i++) {
    const top = curve(i);
    const bottom = i < COUNTS.terraces - 1 ? curve(i + 1) : top.map(([x]) => [x, 160]);
    svg += `<path d="M${pts(top)} L${pts([...bottom].reverse())} Z" fill="${i % 2 ? '#F3BF4C' : C.sun}"/>`;
    if (i < COUNTS.terraces - 1) svg += `<path d="M${pts(curve(i + 1, -4.6))} L${pts([...curve(i + 1)].reverse())} Z" fill="${C.wall}"/>`;
    svg += `<polyline points="${pts(top)}" fill="none" stroke="${C.oldGold}" stroke-width="1.3"/>`;
    svg += `<polyline points="${pts(curve(i, 2.6))}" fill="none" stroke="${C.cream}" stroke-opacity=".55" stroke-width=".8"/>`;
  }
  return svg;
}

// The river: from beneath the bridge, down the valley, into the gutter of the book.
function river() {
  return `<defs><linearGradient id="rv" x1="0" y1="30" x2="0" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#CFE6EE"/><stop offset="1" stop-color="#5C9CC4"/></linearGradient></defs>
  <path d="M-1,32 C-5,42 6,48 -2,58 C-12,70 4,78 -6,88 C-11,94 -8,98 -12,102 L12,102 C8,98 13,92 8,86 C18,74 2,68 9,58 C16,48 3,42 1,32 Z" fill="url(#rv)"/>
  <path d="M0,36 C-2,44 6,50 0,58 C-8,70 4,78 -2,88" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width=".8"/>`;
}

function book() {
  const top = [[-100, 92], [-72, 80], [-30, 82], [0, 100]];
  const bot = [[-100, 114], [-70, 104], [-30, 107], [0, 122]];
  const c = (s) => `${pt(s[0])} C${pts(s.slice(1))}`;
  const rev = (s) => [...s].reverse();
  const page = (a, b) => `M${c(a)} L${c(rev(b))} Z`;
  const lines = [0.25, 0.45, 0.65, 0.85].map((k) => {
    const l = top.map(([x, y], i) => [x + (i === 0 ? 12 : i === 3 ? -10 : 0), y + (bot[i][1] - y) * k]);
    return `M${c(l)} M${c(mir(l))}`;
  }).join(' ');
  return `<path d="M-108,98 C-74,86 -32,88 0,108 C32,88 74,86 108,98 L108,122 C74,111 32,114 0,134 C-32,114 -74,111 -108,122 Z" fill="${C.oldGold}"/>
  <path d="M-104,96 C-72,84 -31,86 0,105 C31,86 72,84 104,96 L104,118 C72,108 31,111 0,128 C-31,111 -72,108 -104,118 Z" fill="${C.wall}"/>
  <path d="${page(top, bot)} ${page(mir(top), mir(bot))}" fill="${C.cream}"/>
  <path d="${lines}" fill="none" stroke="${C.field}" stroke-opacity=".45" stroke-width="1"/>
  <path d="M0,100 V122" stroke="${C.tick}" stroke-width="1.2"/>`;
}

function medallionScene() {
  return `<rect x="-140" y="-140" width="280" height="280" fill="${C.field}"/>
  <g transform="translate(0 -6)">${sun()}${mountains()}${terraces()}${river()}${bridge()}${book()}</g>`;
}

function wovenRing(r0 = 128, r1 = 140, n = 48, p = '') {
  const rm = (r0 + r1) / 2;
  let d = '', eyes = '', dots = '';
  for (let i = 0; i < n; i++) {
    const a = (i * 360) / n;
    const [x, y] = P(rm, a);
    d += `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(a)})" d="${diamond(0, 0, 4.6, 5)}"/>`;
    eyes += `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(a)})" d="${diamond(0, 0, 1.6, 1.8)}"/>`;
    const [dx, dy] = P(rm, a + 180 / n);
    dots += `<circle cx="${f2(dx)}" cy="${f2(dy)}" r="1.1"/>`;
  }
  return `<circle r="${rm}" fill="none" stroke="${C.forest}" stroke-width="${r1 - r0}"/>
  <g fill="${C.sun}">${d}${dots}</g><g fill="${C.cream}">${eyes}</g>
  <circle r="${r0 + 0.6}" fill="none" stroke="${C.sun}" stroke-width="1.2"/>
  <circle r="${r1 - 0.6}" fill="none" stroke="${C.sun}" stroke-width="1.2"/>`;
}

function medallion(p) {
  return `<defs><clipPath id="${p}med"><circle r="${MED}"/></clipPath></defs>
  <g clip-path="url(#${p}med)">${medallionScene()}</g>
  ${wovenRing()}`;
}

// ---------- the wreath and stars ----------
function palayStalk() {
  const R = 166;
  const grains = [], crease = [];
  const at = (deg, side, len) => {
    const [x, y] = P(R, deg);
    const rot = deg + 90 + side * 34; // tangent (clockwise) tilted outward/inward
    const [dx, dy] = P(len / 2 + 0.8, rot);
    const t = `translate(${f2(x + dx)} ${f2(y + dy)}) rotate(${f2(rot)})`;
    grains.push(`<path transform="${t}" d="${grain(len, len * 0.46)}"/>`);
    crease.push(`<path transform="${t}" d="M0,${-len * 0.32} V${len * 0.32}"/>`);
  };
  const pairs = (COUNTS.grains - 1) / 2;
  for (let k = 0; k < pairs; k++) {
    const deg = -154 + k * 10.4;
    at(deg, -1, 15 - k * 0.25);
    at(deg + 4, 1, 15 - k * 0.25);
  }
  // the tip grain, along the stem
  const [tx, ty] = P(R, -44);
  const tipRot = -44 + 90;
  const [tdx, tdy] = P(6.6, tipRot);
  grains.push(`<path transform="translate(${f2(tx + tdx)} ${f2(ty + tdy)}) rotate(${tipRot})" d="${grain(14, 6.2)}"/>`);
  const stem = `M${pt(P(R, -163))} A${R},${R} 0 0 1 ${pt(P(R, -46))}`;
  return `<path d="${stem}" fill="none" stroke="${C.sun}" stroke-width="1.8" stroke-linecap="round"/>
  <g fill="${C.sun}">${grains.join('')}</g>
  <g stroke="${C.oldGold}" stroke-width=".8" stroke-linecap="round">${crease.join('')}</g>`;
}

function stars() {
  return `<g fill="${C.sun}">${[-21, 0, 21]
    .map((a) => {
      const [x, y] = P(167, a);
      return `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${a})" d="${star(9.5, 3.9)}"/>`;
    })
    .join('')}</g>`;
}

// ---------- the seal (radius 248, origin at centre) ----------
export function seal(p = 's') {
  const beads = Array.from({ length: 96 }, (_, i) => {
    const [x, y] = P(197.5, (i * 360) / 96);
    return `<circle cx="${f2(x)}" cy="${f2(y)}" r="1.25"/>`;
  }).join('');
  const sideMark = (a) => {
    const [x, y] = P(221, a);
    const [ax, ay] = P(221, a - 4.2), [bx, by] = P(221, a + 4.2);
    return `<path d="${diamond(x, y, 4.2, 4.2)}" transform="rotate(${a} ${f2(x)} ${f2(y)})"/><circle cx="${f2(ax)}" cy="${f2(ay)}" r="1.5"/><circle cx="${f2(bx)}" cy="${f2(by)}" r="1.5"/>`;
  };
  return `<g>
  <circle r="248" fill="${C.forest}"/>
  <circle r="243" fill="none" stroke="${C.sun}" stroke-width="2.2"/>
  <circle r="238.6" fill="none" stroke="${C.sun}" stroke-width=".7" stroke-opacity=".8"/>
  ${arcText(CINZEL_B, 'JOSE T. CUYOS SR. II INTEGRATED SCHOOL', 0, 0, 214, 19.5, { tracking: 0.09, side: 'top', fill: C.cream })}
  ${arcText(ITALIC, 'Together we bridge, together we succeed', 0, 0, 227, 22, { tracking: 0.01, side: 'bottom', fill: C.sun })}
  <g fill="${C.sun}">${sideMark(-90)}${sideMark(90)}</g>
  <circle r="204" fill="none" stroke="${C.sun}" stroke-width="1.4"/>
  <g fill="${C.sun}">${beads}</g>
  <circle r="191" fill="none" stroke="${C.sun}" stroke-width=".7" stroke-opacity=".6"/>
  ${palayStalk()}<g transform="scale(-1 1)">${palayStalk()}</g>
  ${stars()}
  ${medallion(p)}
  ${arcText(CINZEL, 'EST. 2012', 0, 0, 160.5, 11.5, { tracking: 0.3, side: 'bottom', fill: C.sun })}
</g>`;
}

// Small-size mark: the flag sun and the book, nothing else.
function mark() {
  const s = `<g transform="translate(0 -6)">${sun()}</g>`;
  return `<g>
  <circle r="128" fill="${C.forest}"/>
  <circle r="120" fill="${C.field}"/>
  <defs><clipPath id="mk"><circle r="120"/></clipPath></defs>
  <g clip-path="url(#mk)" transform="translate(0 10) scale(1.08)">${s}
  <path d="M-86,48 C-60,34 -24,37 0,62 C24,37 60,34 86,48 L86,62 C60,50 24,53 0,78 C-24,53 -60,50 -86,62 Z" fill="${C.sun}"/>
  <path d="M-80,42 C-58,29 -24,31 0,54 C24,31 58,29 80,42 L80,54 C58,43 24,46 0,68 C-24,46 -58,43 -80,54 Z" fill="${C.cream}"/>
  <path d="M0,54 V68" stroke="${C.oldGold}" stroke-width="2"/></g>
  <circle r="124" fill="none" stroke="${C.sun}" stroke-width="2"/>
</g>`;
}

// ---------- documents ----------
const doc = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>\n`;
const placeSeal = (x, y, size, p) => `<g transform="translate(${f2(x + size / 2)} ${f2(y + size / 2)}) scale(${f2((size / 500) * 10000) / 10000})">${seal(p)}</g>`;

function stacked(p) {
  const W = 1000, cx = 500, S = 460;
  const est = text(CINZEL, 'EST. 2012', cx, 760, 17, { anchor: 'middle', tracking: 0.34, fill: C.oldGold });
  const rule = (x1, x2) => `<rect x="${f2(x1)}" y="753" width="${f2(x2 - x1)}" height="1.5" fill="${C.oldGold}"/>`;
  return doc(W, 900, `${placeSeal(cx - S / 2, 40, S, p)}
  ${text(CINZEL_B, 'JOSE T. CUYOS SR. II', cx, 618, 64, { anchor: 'middle', tracking: 0.02, fill: C.forest }).svg}
  ${text(CINZEL, 'INTEGRATED SCHOOL', cx, 676, 30, { anchor: 'middle', tracking: 0.36, fill: C.field }).svg}
  ${est.svg}${rule(cx - 200, cx - est.width / 2 - 22)}${rule(cx + est.width / 2 + 22, cx + 200)}
  ${text(ITALIC, 'Together we bridge, together we succeed', cx, 836, 38, { anchor: 'middle', fill: C.field }).svg}`);
}

function horizontal(p, reversed = false) {
  const W = 1320, H = 440, S = 340, x = 60 + S + 54;
  const ink = reversed ? C.cream : C.forest, sub = reversed ? C.sun : C.field, gold = reversed ? C.sun : C.oldGold;
  return doc(W, H, `${placeSeal(50, 50, S, p)}
  <rect x="${50 + S + 26}" y="104" width="1.5" height="232" fill="${gold}" opacity=".6"/>
  ${text(CINZEL_B, 'JOSE T. CUYOS SR. II', x, 206, 66, { tracking: 0.02, fill: ink }).svg}
  ${text(CINZEL, 'INTEGRATED SCHOOL', x + 2, 262, 30, { tracking: 0.36, fill: sub }).svg}
  <rect x="${x + 2}" y="292" width="56" height="1.5" fill="${gold}"/>
  ${text(CINZEL, 'EST. 2012', x + 72, 299, 15, { tracking: 0.34, fill: gold }).svg}
  ${text(ITALIC, 'Together we bridge, together we succeed', x + 2, 344, 27, { fill: ink }).svg}`, reversed ? C.forest : null);
}

const files = {
  'seal.svg': doc(500, 500, placeSeal(0, 0, 500, 's')),
  'medallion.svg': doc(280, 280, `<g transform="translate(140 140)"><circle r="140" fill="${C.forest}"/>${medallion('m')}</g>`),
  'mark.svg': doc(256, 256, `<g transform="translate(128 128)">${mark()}</g>`),
  'logo-stacked.svg': stacked('st'),
  'logo-horizontal.svg': horizontal('hz'),
  'logo-horizontal-reversed.svg': horizontal('hr', true),
};
fs.mkdirSync(path.join(out, 'svg'), { recursive: true });
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, 'svg', n), s);
console.log('wrote', Object.keys(files).join(', '));
