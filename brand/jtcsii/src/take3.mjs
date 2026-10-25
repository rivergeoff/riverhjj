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

export const C = {
  forest: '#0F2A1C', // Deep Forest
  field: '#2E5E3A', // Field Green
  sun: '#F6C453', // Sun Gold
  oldGold: '#A97C22', // Old Gold
  cream: '#FDF7E1', // Paper Cream
  // tints used inside the medallion
  halo: '#3A6C46',
  far: '#2A5636',
  mtn: '#163824',
  lit: '#2A5A3C',
  wall: '#DCA63C',
  tick: '#B88A2A',
};

// The numbers the seal is built on.
export const COUNTS = {
  rays: 13, // Kindergarten + Grades 1–12
  grains: 13, // per palay stalk: the same thirteen levels, harvested
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
const SUN = { x: 0, y: 6, r: 28 };
const BOOK_TOP = [[-76, 38], [-56, 26], [-24, 28], [0, 50]];
const BOOK_BOT = [[-76, 50], [-54, 40], [-24, 42], [0, 64]];

function sun({ rays = true } = {}) {
  const r = [];
  const n = COUNTS.rays, span = 150; // 13 rays over 150°, 12.5° apart
  for (let i = 0; i < n; i++) {
    const a = -span / 2 + (i * span) / (n - 1);
    r.push(`<path transform="translate(${SUN.x} ${SUN.y}) rotate(${f2(a)}) translate(0 -51)" d="${grain(25, 7.6)}"/>`);
  }
  return `<circle cx="${SUN.x}" cy="${SUN.y}" r="76" fill="${C.halo}" opacity=".55"/>
  <circle cx="${SUN.x}" cy="${SUN.y}" r="44" fill="${C.halo}"/>
  ${rays ? `<g fill="${C.sun}">${r.join('')}</g>` : ''}
  <circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.r}" fill="${C.sun}"/>
  <circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.r - 5}" fill="none" stroke="${C.cream}" stroke-opacity=".35" stroke-width="1"/>`;
}

function mountains() {
  const far = [[-150, 72], [-104, 44], [-72, 52], [-40, 41], [0, 47], [40, 41], [72, 52], [104, 44], [150, 72], [150, 150], [-150, 150]];
  const left = [[-150, 104], [-136, 30], [-124, 16], [-110, 0], [-92, -26], [-76, -4], [-58, 26], [-40, 60], [-22, 104]];
  const lit = [[-92, -26], [-76, -4], [-58, 26], [-40, 60], [-22, 104], [-48, 104], [-60, 58], [-78, 14]];
  const crease = [[-92, -26], [-96, 0], [-104, 26], [-108, 54]];
  const crease2 = [[-110, 0], [-120, 26], [-124, 50]];
  return `<path d="M${pts(far)} Z" fill="${C.far}"/>
  <path d="M${pts(left)} Z M${pts(mir(left))} Z" fill="${C.mtn}"/>
  <path d="M${pts(lit)} Z M${pts(mir(lit))} Z" fill="${C.lit}"/>
  <path d="M${pts(crease)} M${pts(mir(crease))} M${pts(crease2)} M${pts(mir(crease2))}" fill="none" stroke="${C.lit}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function bridge() {
  const tx = 62, top = 2, sag = 32;
  const cableY = (x) => top + sag * (1 - (x / tx) ** 2);
  const deckY = (x) => cubicYAt(BOOK_TOP, -Math.abs(x));
  const cable = [];
  for (let x = -tx; x <= tx; x += 2) cable.push(pt([x, cableY(x)]));
  const susp = [];
  for (let k = 1; k < 16; k++) {
    const x = -tx + (k * 2 * tx) / 16;
    if (Math.abs(x) < 2) continue;
    susp.push(`M${f2(x)},${f2(cableY(x))} V${f2(deckY(x) + 0.6)}`);
  }
  const tower = (x) => {
    const yb = deckY(x) + 1;
    return `<path d="M${x - 2.8},${f2(yb)} L${x - 2.1},${top - 3} L${x + 2.1},${top - 3} L${x + 2.8},${f2(yb)} Z" fill="${C.cream}"/>
    <path d="M${x - 4.4},${top - 3} L${x + 4.4},${top - 3} L${x + 3},${top - 8} L${x - 3},${top - 8} Z" fill="${C.sun}"/>
    <rect x="${x - 3.6}" y="${f2(top + (yb - top) * 0.42)}" width="7.2" height="1.6" fill="${C.sun}"/>`;
  };
  const c = (s) => `${pt(s[0])} C${pts(s.slice(1))}`;
  const rev = (s) => [...s].reverse();
  const page = (a, b) => `M${c(a)} L${c(rev(b))} Z`;
  const lines = [0.28, 0.5, 0.72]
    .map((k) => {
      const l = BOOK_TOP.map(([x, y], i) => [x + (i === 0 ? 9 : i === 3 ? -8 : 0), y + (BOOK_BOT[i][1] - y) * k]);
      return `M${c(l)} M${c(mir(l))}`;
    })
    .join(' ');
  const edge = (o) => {
    const l = BOOK_BOT.map(([x, y], i) => [x - (i === 0 ? 1.5 : 0), y + o]);
    return `M${c(l)} M${c(mir(l))}`;
  };
  return `<g fill="none" stroke="${C.cream}" stroke-linecap="round">
    <path d="M${-tx},${top} L-96,30 M${tx},${top} L96,30" stroke-width="1.4" stroke-opacity=".85"/>
    <polyline points="${cable.join(' ')}" stroke-width="2"/>
    <path d="${susp.join(' ')}" stroke-width="1"/>
  </g>
  <circle cx="-96" cy="30" r="2.2" fill="${C.sun}"/><circle cx="96" cy="30" r="2.2" fill="${C.sun}"/>
  <path d="M-83,44 C-58,33 -24,36 0,58 C24,36 58,33 83,44 L83,56 C58,46 24,49 0,72 C-24,49 -58,46 -83,56 Z" fill="${C.wall}"/>
  <path d="M-83,56 C-58,46 -24,49 0,72 C24,49 58,46 83,56 L83,59 C58,49 24,52 0,75 C-24,52 -58,49 -83,59 Z" fill="${C.oldGold}"/>
  <path d="${page(BOOK_TOP, BOOK_BOT)} ${page(mir(BOOK_TOP), mir(BOOK_BOT))}" fill="${C.cream}"/>
  <path d="${edge(2.2)} ${edge(4.4)}" fill="none" stroke="${C.tick}" stroke-opacity=".6" stroke-width=".7"/>
  <path d="${lines}" fill="none" stroke="${C.field}" stroke-opacity=".45" stroke-width="1"/>
  <path d="M0,50 V64" stroke="${C.tick}" stroke-width="1.2"/>
  ${tower(-tx)}${tower(tx)}`;
}

function terraces() {
  // a valley: each terrace climbs both slopes
  const tops = [20, 36, 52, 68], dips = [44, 44, 44, 44];
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
    // retaining wall at the foot of each paddy
    if (i < COUNTS.terraces - 1) svg += `<path d="M${pts(curve(i + 1, -4.6))} L${pts([...curve(i + 1)].reverse())} Z" fill="${C.wall}"/>`;
    svg += `<polyline points="${pts(top)}" fill="none" stroke="${C.oldGold}" stroke-width="1.3"/>`;
    // water catching the light along each paddy
    svg += `<polyline points="${pts(curve(i, 2.6))}" fill="none" stroke="${C.cream}" stroke-opacity=".55" stroke-width=".8"/>`;
  }
  return svg;
}

function medallionScene() {
  return `<rect x="-140" y="-140" width="280" height="280" fill="${C.field}"/>
  <g transform="translate(0 -8)">${sun()}${mountains()}${terraces()}${bridge()}</g>`;
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

// ---------- the wreath, stars and ribbon ----------
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
    const deg = -116 + k * 12.4;
    at(deg, -1, 15 - k * 0.35);
    at(deg + 4, 1, 15 - k * 0.35);
  }
  // the tip grain, along the stem
  const [tx, ty] = P(R, -44);
  const tipRot = -44 + 90;
  const [tdx, tdy] = P(6.6, tipRot);
  grains.push(`<path transform="translate(${f2(tx + tdx)} ${f2(ty + tdy)}) rotate(${tipRot})" d="${grain(14, 6.2)}"/>`);
  const stem = `M${pt(P(R, -150))} A${R},${R} 0 0 1 ${pt(P(R, -46))}`;
  return `<path d="${stem}" fill="none" stroke="${C.sun}" stroke-width="1.8" stroke-linecap="round"/>
  <g fill="${C.sun}">${grains.join('')}</g>
  <g stroke="${C.oldGold}" stroke-width=".8" stroke-linecap="round">${crease.join('')}</g>`;
}

function ribbon() {
  const a0 = 180 - 66, a1 = 180 + 66; // body, centred under the medallion
  const rO = 190, rI = 162;
  const sector = (r1, r2, b0, b1) =>
    `M${pt(P(r1, b0))} A${r1},${r1} 0 0 1 ${pt(P(r1, b1))} L${pt(P(r2, b1))} A${r2},${r2} 0 0 0 ${pt(P(r2, b0))} Z`;
  // tails tucked behind, ending in a swallowtail
  const tail = (s) => {
    const b = s > 0 ? a1 : a0;
    const e = b + s * 13, sh = 7;
    return `M${pt(P(rO + sh, b - s * 6))} L${pt(P(rO + sh, e))} L${pt(P((rO + rI) / 2 + sh, e - s * 4))} L${pt(P(rI + sh, e))} L${pt(P(rI + sh, b - s * 6))} Z`;
  };
  const fold = (s) => {
    const b = s > 0 ? a1 : a0;
    return `M${pt(P(rO, b))} L${pt(P(rO + 7, b))} L${pt(P(rI + 7, b))} L${pt(P(rI, b))} Z`;
  };
  return `<path d="${tail(1)} ${tail(-1)}" fill="#C9952F"/>
  <path d="${fold(1)} ${fold(-1)}" fill="${C.oldGold}"/>
  <path d="${sector(rO, rI, a0, a1)}" fill="${C.sun}"/>
  <path d="M${pt(P(rO - 2.6, a0))} A${rO - 2.6},${rO - 2.6} 0 0 1 ${pt(P(rO - 2.6, a1))} M${pt(P(rI + 2.6, a0))} A${rI + 2.6},${rI + 2.6} 0 0 1 ${pt(P(rI + 2.6, a1))}" fill="none" stroke="${C.oldGold}" stroke-width=".9"/>
  ${arcText(CINZEL, 'TOGETHER WE BRIDGE · TOGETHER WE SUCCEED', 0, 0, 180, 11, { tracking: 0.05, side: 'bottom', fill: C.forest })}`;
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
  ${arcText(CINZEL, 'EST. 2012', 0, 0, 228, 16.5, { tracking: 0.34, side: 'bottom', fill: C.sun })}
  <g fill="${C.sun}">${sideMark(-90)}${sideMark(90)}</g>
  <circle r="204" fill="none" stroke="${C.sun}" stroke-width="1.4"/>
  <g fill="${C.sun}">${beads}</g>
  <circle r="191" fill="none" stroke="${C.sun}" stroke-width=".7" stroke-opacity=".6"/>
  ${palayStalk()}<g transform="scale(-1 1)">${palayStalk()}</g>
  ${stars()}
  ${medallion(p)}
  ${ribbon()}
</g>`;
}

// Small-size mark: sun, 13 rays and the book, nothing else.
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
  return doc(W, 840, `${placeSeal(cx - S / 2, 40, S, p)}
  ${text(CINZEL_B, 'JOSE T. CUYOS SR. II', cx, 618, 64, { anchor: 'middle', tracking: 0.02, fill: C.forest }).svg}
  ${text(CINZEL, 'INTEGRATED SCHOOL', cx, 676, 30, { anchor: 'middle', tracking: 0.36, fill: C.field }).svg}
  ${est.svg}${rule(cx - 200, cx - est.width / 2 - 22)}${rule(cx + est.width / 2 + 22, cx + 200)}`);
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
  ${text(CINZEL_M, 'TOGETHER WE BRIDGE, TOGETHER WE SUCCEED', x + 2, 340, 15, { tracking: 0.16, fill: ink }).svg}`, reversed ? C.forest : null);
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
