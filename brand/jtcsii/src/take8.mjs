// Take 8 — the seal as a real struck-and-enamelled badge. Raised gold (lit with SVG lighting
// filters) holds glossy enamel in cloisonné cells, the way real school seals and pins are made.
// Fewer, calmer symbols: twin mountains, the bridge between them, the sun of the flag, an open
// book, all struck in gold (Rosario's gold) inside a twisted rope. Set in Cinzel.
// Run: node take8.mjs   → ../take-8/svg/*.svg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, text, arcText } from './type.mjs';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../take-8');
const CINZEL = loadFont('cinzel700.ttf');
const CINZEL_B = loadFont('cinzel800.ttf');

const C = { forest: '#0F2A1C', field: '#2E5E3A', sun: '#F6C453', oldGold: '#A97C22', cream: '#FDF7E1' };

const f2 = (n) => Math.round(n * 100) / 100;
const P = (r, deg, [cx, cy] = [0, 0]) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};
const pt = ([x, y]) => `${f2(x)},${f2(y)}`;
const pts = (a) => a.map(pt).join(' ');
const mir = (a) => a.map(([x, y]) => [-x, y]);
const star = (R, r) => 'M' + Array.from({ length: 10 }, (_, i) => pt(P(i % 2 ? r : R, i * 36))).join(' L') + ' Z';
const ring = (r1, r2) => `M${-r1},0 a${r1},${r1} 0 1 0 ${2 * r1},0 a${r1},${r1} 0 1 0 ${-2 * r1},0 Z M${-r2},0 a${r2},${r2} 0 1 0 ${2 * r2},0 a${r2},${r2} 0 1 0 ${-2 * r2},0 Z`;

function defs(p) {
  return `
  <linearGradient id="${p}gold" gradientUnits="userSpaceOnUse" x1="-250" y1="-250" x2="250" y2="250">
    <stop offset="0" stop-color="#FFE9A0"/><stop offset=".3" stop-color="#E9B649"/><stop offset=".55" stop-color="#C98F2A"/><stop offset=".78" stop-color="#F1C962"/><stop offset="1" stop-color="#9A6B17"/>
  </linearGradient>
  <radialGradient id="${p}enamelBand" r="240" gradientUnits="userSpaceOnUse"><stop offset=".72" stop-color="#174A33"/><stop offset="1" stop-color="#0B281B"/></radialGradient>
  <radialGradient id="${p}sky" cx="0" cy="-40" r="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3F8A5A"/><stop offset=".5" stop-color="#1F5A3C"/><stop offset="1" stop-color="#0E3324"/></radialGradient>
  <linearGradient id="${p}mtn" x1="0" y1="-40" x2="0" y2="80" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5FA36B"/><stop offset="1" stop-color="#2D6B45"/></linearGradient>
  <linearGradient id="${p}mtnFar" x1="0" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8FC08A"/><stop offset="1" stop-color="#4E8C5B"/></linearGradient>
  <linearGradient id="${p}ground" x1="0" y1="60" x2="0" y2="174" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#24603F"/><stop offset="1" stop-color="#0F3524"/></linearGradient>
  <linearGradient id="${p}page" x1="0" y1="70" x2="0" y2="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#EBDDB8"/></linearGradient>
  <radialGradient id="${p}gloss" cx="-90" cy="-130" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".26"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity=".05"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
  <linearGradient id="${p}strand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7A2"/><stop offset=".5" stop-color="#D9A544"/><stop offset="1" stop-color="#8C6417"/></linearGradient>
  <!-- raised gold: blur the shape's alpha into a height map, light it, and keep a soft cast shadow -->
  <filter id="${p}emboss" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="h"/>
    <feSpecularLighting in="h" surfaceScale="2.6" specularConstant=".95" specularExponent="22" lighting-color="#FFF6DA" result="s"><feDistantLight azimuth="235" elevation="48"/></feSpecularLighting>
    <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
    <feDiffuseLighting in="h" surfaceScale="2.6" diffuseConstant="1" lighting-color="#FFFFFF" result="d"><feDistantLight azimuth="235" elevation="55"/></feDiffuseLighting>
    <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1.15" k2="0" k3="0" k4="0" result="shaded"/>
    <feComposite in="shaded" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".85" k4="0" result="lit"/>
    <feComposite in="lit" in2="SourceAlpha" operator="in" result="litIn"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="sb"/>
    <feOffset in="sb" dx="1" dy="1.6" result="so"/>
    <feFlood flood-color="#03100A" flood-opacity=".55"/><feComposite in2="so" operator="in" result="shadow"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="litIn"/></feMerge>
  </filter>
  <!-- recessed enamel: a soft inner shadow along each cell's edge -->
  <filter id="${p}inset" x="-5%" y="-5%" width="110%" height="110%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b"/>
    <feOffset in="b" dx="1.2" dy="1.8" result="o"/>
    <feComposite in="SourceAlpha" in2="o" operator="out" result="edge"/>
    <feFlood flood-color="#000" flood-opacity=".45"/><feComposite in2="edge" operator="in" result="sh"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge>
  </filter>`;
}

// ---------- the medallion (radius 168) ----------
const SUN = [0, -46];
const LEFT = [[-180, 70], [-180, -10], [-150, -26], [-124, -40], [-100, -62], [-84, -74], [-68, -52], [-58, -28], [-52, -2], [-48, 26], [-40, 56], [-26, 74], [0, 80]];
const FAR = [[-180, 40], [-120, 14], [-84, 26], [-50, 6], [-22, 22], [0, 12], [22, 22], [50, 6], [84, 26], [120, 14], [180, 40], [180, 200], [-180, 200]];
const BOOK_TOP = [[-128, 88], [-96, 75], [-40, 77], [0, 98]];
const BOOK_BOT = [[-128, 116], [-94, 104], [-40, 108], [0, 128]];
const c3 = (s) => `${pt(s[0])} C${pts(s.slice(1))}`;
const rev = (s) => [...s].reverse();

function enamel(p) {
  // sunray guilloché under translucent enamel
  const rays = Array.from({ length: 96 }, (_, i) => {
    const [x, y] = P(260, i * 3.75, SUN);
    return `M${SUN[0]},${SUN[1]} L${f2(x)},${f2(y)}`;
  }).join(' ');
  const mtns = `M${pts(LEFT)} L${pts(rev(mir(LEFT)).slice(1))} L180,200 L-180,200 Z`;
  const ground = 'M-180,70 C-120,58 -60,62 0,80 C60,62 120,58 180,70 L180,200 L-180,200 Z';
  const page = (a, b) => `M${c3(a)} L${c3(rev(b))} Z`;
  return `<rect x="-200" y="-200" width="400" height="400" fill="url(#${p}sky)"/>
  <path d="${rays}" stroke="#9FD3A6" stroke-opacity=".12" stroke-width="1.1"/>
  <path d="M${pts(FAR)} Z" fill="url(#${p}mtnFar)" filter="url(#${p}inset)"/>
  <path d="${mtns}" fill="url(#${p}mtn)" filter="url(#${p}inset)"/>
  <path d="${ground}" fill="url(#${p}ground)" filter="url(#${p}inset)"/>
  <path d="${page(BOOK_TOP, BOOK_BOT)} ${page(mir(BOOK_TOP), mir(BOOK_BOT))}" fill="url(#${p}page)" filter="url(#${p}inset)"/>`;
}

function goldWork() {
  // the sun of the flag: 8 ray groups
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const tri = (deg, len, half) => {
      const [tx, ty] = P(len, deg, SUN), [ax, ay] = P(29, deg - half, SUN), [bx, by] = P(29, deg + half, SUN);
      return `M${f2(ax)},${f2(ay)} L${f2(tx)},${f2(ty)} L${f2(bx)},${f2(by)} Z`;
    };
    rays += tri(i * 45, 66, 7) + tri(i * 45 - 13, 53, 3.8) + tri(i * 45 + 13, 53, 3.8);
  }
  const stars = [-27, 0, 27].map((a) => {
    const [x, y] = P(100, a, SUN);
    return `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${a})" d="${star(8.5, 3.5)}"/>`;
  }).join('');
  // cloisonné wire: mountain ridges, far range, ground line, book
  const wire = (d, w = 2.6) => `<path d="${d}" fill="none" stroke="#000" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const ridge = `M${pts(LEFT.slice(1))} M${pts(mir(LEFT).slice(1))}`;
  const ground = 'M-180,70 C-120,58 -60,62 0,80 C60,62 120,58 180,70';
  const creases = 'M-84,-74 L-92,-40 L-104,-10 M84,-74 L92,-40 L104,-10';
  // the bridge between the peaks
  const A = [-50, 22], B = [50, 22];
  const deck = (t) => [A[0] + (B[0] - A[0]) * t, A[1] + 10 * 4 * t * (1 - t)];
  const cable = (t) => [A[0] + (B[0] - A[0]) * t, A[1] - 22 + 26 * 4 * t * (1 - t)];
  const N = 40;
  const D = Array.from({ length: N + 1 }, (_, i) => deck(i / N));
  const K = Array.from({ length: N + 1 }, (_, i) => cable(i / N));
  const hangers = Array.from({ length: 13 }, (_, i) => { const t = (i + 1) / 14; const [x, y] = deck(t), [, cy] = cable(t); return `M${f2(x)},${f2(cy)} V${f2(y)}`; }).join(' ');
  const towers = `M${A[0]},${A[1] + 4} V${A[1] - 26} M${B[0]},${B[1] + 4} V${B[1] - 26}`;
  const page = `M${c3(BOOK_TOP)} L${c3(rev(BOOK_BOT))} Z M${c3(mir(BOOK_TOP))} L${c3(rev(mir(BOOK_BOT)))} Z`;
  const lines = [0.25, 0.45, 0.65].map((k) => {
    const l = BOOK_TOP.map(([x, y], i) => [x + (i === 0 ? 16 : i === 3 ? -14 : 0), y + (BOOK_BOT[i][1] - y) * k]);
    return `M${c3(l)} M${c3(mir(l))}`;
  }).join(' ');
  return `<path d="${rays}"/>
  <circle cx="${SUN[0]}" cy="${SUN[1]}" r="26"/>
  ${stars}
  <g stroke="url(#__gold)">${wire(ridge, 3)}${wire(ground, 2.4)}${wire(creases, 1.6)}
  ${wire(`M${pts(D)}`, 3)}${wire(`M${pts(K)}`, 1.6)}${wire(hangers, 1.1)}${wire(towers, 3.2)}
  ${wire(page, 2.4)}${wire(lines, 1)}${wire('M0,98 V128', 2)}</g>
  <path d="M-128,116 C-94,104 -40,108 0,128 C40,108 94,104 128,116 L128,88 L138,96 L138,128 C100,115 42,119 0,146 C-42,119 -100,115 -138,128 L-138,96 L-128,88 Z"/>`;
}

function rope(p, R, w) {
  const n = Math.round((2 * Math.PI * R) / (w * 0.6));
  const s = [];
  for (let i = 0; i < n; i++) {
    const a = (i * 360) / n;
    const [x, y] = P(R, a);
    s.push(`<ellipse transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(a + 90 + 48)})" rx="${f2(w * 0.72)}" ry="${f2(w * 0.3)}"/>`);
  }
  return `<clipPath id="${p}rc${R}"><path clip-rule="evenodd" d="${ring(R + w / 2, R - w / 2)}"/></clipPath>
  <g filter="url(#${p}emboss)"><g clip-path="url(#${p}rc${R})"><circle r="${R}" fill="none" stroke="#7E5A14" stroke-width="${w}"/><g fill="url(#${p}strand)" stroke="#6E4F12" stroke-width=".5">${s.join('')}</g></g></g>`;
}

export function seal(p) {
  const gw = goldWork().replaceAll('url(#__gold)', `url(#${p}gold)`).replace(/stroke="#000"/g, `stroke="url(#${p}gold)"`);
  return `<g><defs>${defs(p)}<clipPath id="${p}med"><circle r="168"/></clipPath></defs>
  <circle r="249" fill="url(#${p}gold)" filter="url(#${p}emboss)"/>
  ${rope(p, 236, 20)}
  <circle r="225" fill="url(#${p}enamelBand)" filter="url(#${p}inset)"/>
  <g fill="url(#${p}gold)" filter="url(#${p}emboss)">
    ${arcText(CINZEL_B, 'JOSE T. CUYOS SR. II INTEGRATED SCHOOL', 0, 0, 193, 21.5, { tracking: 0.08, side: 'top', fill: `url(#${p}gold)` })}
    ${arcText(CINZEL, 'TOGETHER WE BRIDGE · TOGETHER WE SUCCEED', 0, 0, 213, 13.6, { tracking: 0.11, side: 'bottom', fill: `url(#${p}gold)` })}
    ${text(CINZEL_B, '20', -201, 9, 24, { anchor: 'middle', fill: `url(#${p}gold)` }).svg}
    ${text(CINZEL_B, '12', 201, 9, 24, { anchor: 'middle', fill: `url(#${p}gold)` }).svg}
    <path d="${ring(181, 175)}" fill-rule="evenodd"/>
  </g>
  <g clip-path="url(#${p}med)">
    ${enamel(p)}
    <g fill="url(#${p}gold)" filter="url(#${p}emboss)">${gw}</g>
    <circle r="168" fill="url(#${p}gloss)"/>
  </g>
  <circle r="225" fill="url(#${p}gloss)" opacity=".5"/>
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
  ${text(CINZEL, 'TOGETHER WE BRIDGE, TOGETHER WE SUCCEED', x + 2, 340, 15, { tracking: 0.16, fill: ink }).svg}`, reversed ? C.forest : null);
}

const files = {
  'seal.svg': doc(500, 500, placeSeal(0, 0, 500, 's')),
  'logo-horizontal.svg': horizontal('hz'),
  'logo-horizontal-reversed.svg': horizontal('hr', true),
};
fs.mkdirSync(path.join(out, 'svg'), { recursive: true });
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, 'svg', n), s);
console.log('wrote', Object.keys(files).join(', '));
