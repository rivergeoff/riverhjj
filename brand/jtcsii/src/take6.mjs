// Take 6 — the official seal, illustrated. A Philippine school seal drawn as one lit scene:
// the 8-ray sun and 3 stars of the flag rising over two peaks, a highland hanging bridge,
// golden rice terraces, and an open book at the foundation, framed by palay and a motto ribbon.
// One light source (the sun, top centre) shades everything. One type family: Cinzel.
// Run: node take6.mjs   → ../take-6/svg/*.svg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, text, arcText } from './type.mjs';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../take-6');
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

// ---------- the scene inside the medallion (radius 162) ----------
const SUN = [0, -56];

function philippineSun(p) {
  // 8 ray groups, each a long centre ray and two short flanking rays, as on the flag
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const a = i * 45;
    const tri = (deg, len, half) => {
      const [tx, ty] = P(len, deg, SUN);
      const [ax, ay] = P(31, deg - half, SUN);
      const [bx, by] = P(31, deg + half, SUN);
      return `M${f2(ax)},${f2(ay)} L${f2(tx)},${f2(ty)} L${f2(bx)},${f2(by)} Z`;
    };
    rays += tri(a, 68, 6.5) + tri(a - 12.5, 55, 3.6) + tri(a + 12.5, 55, 3.6);
  }
  return `<circle cx="${SUN[0]}" cy="${SUN[1]}" r="150" fill="url(#${p}glow)"/>
  <path d="${rays}" fill="url(#${p}ray)"/>
  <circle cx="${SUN[0]}" cy="${SUN[1]}" r="29" fill="url(#${p}sunCore)"/>
  <circle cx="${SUN[0]}" cy="${SUN[1]}" r="29" fill="none" stroke="#FFF3C4" stroke-width="1" stroke-opacity=".8"/>`;
}

function stars(p) {
  return [-24, 0, 24]
    .map((a) => {
      const [x, y] = P(100, a, SUN);
      return `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${a})" d="${star(8.6, 3.5)}" fill="url(#${p}ray)" stroke="#FFF1BC" stroke-width=".5"/>`;
    })
    .join('');
}

function mountains(p) {
  const far = [[-180, 40], [-148, 8], [-122, 16], [-96, -2], [-66, 14], [-40, 8], [-16, 24], [0, 20], [16, 24], [40, 8], [66, 14], [96, -2], [122, 16], [148, 8], [180, 40], [180, 200], [-180, 200]];
  const left = [[-180, 120], [-180, -6], [-158, -20], [-138, -26], [-120, -40], [-104, -52], [-90, -38], [-76, -16], [-62, 8], [-48, 38], [-36, 70], [-22, 120]];
  const lit = [[-104, -52], [-90, -38], [-76, -16], [-62, 8], [-48, 38], [-36, 70], [-22, 120], [-58, 120], [-68, 66], [-80, 24], [-94, -12]];
  const rim = [[-104, -52], [-90, -38], [-76, -16], [-62, 8], [-48, 38]];
  const ridge = [[-180, -6], [-158, -20], [-138, -26], [-120, -40], [-104, -52]];
  const creases = [[[-104, -52], [-112, -18], [-122, 14]], [[-138, -26], [-144, 6], [-150, 30]], [[-94, -12], [-100, 22], [-104, 50]]];
  const cr = creases.map((c) => `M${pts(c)} M${pts(mir(c))}`).join(' ');
  return `<path d="${poly(far)}" fill="url(#${p}far)"/>
  <rect x="-180" y="0" width="360" height="50" fill="url(#${p}haze)"/>
  <path d="${poly(left)} ${poly(mir(left))}" fill="url(#${p}mtn)"/>
  <path d="${poly(lit)} ${poly(mir(lit))}" fill="url(#${p}lit)"/>
  <path d="${cr}" fill="none" stroke="#0F2C1D" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${pts(rim)} M${pts(mir(rim))}" fill="none" stroke="url(#${p}ray)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".9"/>
  <path d="M${pts(ridge)} M${pts(mir(ridge))}" fill="none" stroke="#F6C453" stroke-width=".8" stroke-opacity=".35" stroke-linejoin="round"/>`;
}

function terraces(p) {
  const tops = [34, 47, 60, 73, 86, 99, 112, 125, 138];
  const curve = (i, off = 0) => {
    const a = [];
    for (let x = -180; x <= 180; x += 4) a.push([x, tops[i] + 26 * (1 - (x / 150) ** 2) * (i < 3 ? 1 : 1.15) - 26 * 0 + off]);
    return a.map(([x, y]) => [x, y - 22]);
  };
  let svg = '';
  for (let i = 0; i < tops.length; i++) {
    const top = curve(i);
    const next = i < tops.length - 1 ? curve(i + 1) : top.map(([x]) => [x, 200]);
    svg += `<path d="M${pts(top)} L${pts([...next].reverse())} Z" fill="url(#${p}paddy)"/>`;
    // the grassy bund along each step, lit on top
    svg += `<path d="M${pts(top)} L${pts([...curve(i, 2)].reverse())} Z" fill="url(#${p}bund)"/>`;
    svg += `<polyline points="${pts(top)}" fill="none" stroke="#9CC57A" stroke-width=".7" stroke-opacity=".8"/>`;
    // water catching the sky
    svg += `<polyline points="${pts(curve(i, 6.5))}" fill="none" stroke="#FFF6D8" stroke-width=".7" stroke-opacity=".4"/>`;
  }
  return svg;
}

function bridge(p) {
  const tl = -66, tr = 66, top = -26, deck = (x) => 20 + 6 * (1 - (x / 66) ** 2);
  const cable = (x) => top + 2 + (deck(0) - 3 - top - 2) * (1 - (x / 66) ** 2);
  const c = [], hang = [], planks = [];
  for (let x = tl; x <= tr; x += 2) c.push(pt([x, cable(x)]));
  for (let x = tl + 6; x < tr - 3; x += 6) hang.push(`M${f2(x)},${f2(cable(x))} V${f2(deck(x))}`);
  for (let x = tl; x < tr; x += 3.3) planks.push(`M${f2(x)},${f2(deck(x))} v3`);
  const d = [];
  for (let x = tl; x <= tr; x += 2) d.push(pt([x, deck(x)]));
  const deckPoly = `M${d.join(' L')} L${[...d].reverse().map((q) => { const [x, y] = q.split(',').map(Number); return pt([x, y + 3]); }).join(' L')} Z`;
  const tower = (x) => `<path d="M${x - 3},${f2(deck(x) + 4)} L${x - 2.2},${top} L${x + 2.2},${top} L${x + 3},${f2(deck(x) + 4)} Z" fill="url(#${p}wood)"/>
    <path d="M${x - 4.2},${top} L${x + 4.2},${top} L${x + 3},${top - 4} L${x - 3},${top - 4} Z" fill="#F8D372"/>
    <path d="M${x - 3},${top + 12} L${x + 3},${top + 12}" stroke="#7E5A14" stroke-width="1"/>`;
  return `<g fill="none" stroke="#FDF7E1" stroke-linecap="round">
    <path d="M${tl},${top} L${tl - 24},${f2(deck(tl) + 2)} M${tr},${top} L${tr + 24},${f2(deck(tr) + 2)}" stroke-width="1.1" stroke-opacity=".85"/>
    <polyline points="${c.join(' ')}" stroke-width="1.5"/>
    <path d="${hang.join(' ')}" stroke-width=".7" stroke-opacity=".9"/>
  </g>
  <path d="${deckPoly}" fill="url(#${p}wood)"/>
  <path d="${planks.join(' ')}" stroke="#7E5A14" stroke-width=".5"/>
  <polyline points="${d.map((q) => { const [x, y] = q.split(',').map(Number); return pt([x, y - 4]); }).join(' ')}" fill="none" stroke="#FDF7E1" stroke-width=".9"/>
  ${tower(tl)}${tower(tr)}`;
}

function book(p) {
  // a large open book at the foundation of the scene, cover in forest with a gold edge
  const top = [[-134, 78], [-100, 64], [-42, 66], [0, 88]];
  const bot = [[-134, 106], [-98, 94], [-42, 98], [0, 118]];
  const c = (s) => `${pt(s[0])} C${pts(s.slice(1))}`;
  const rev = (s) => [...s].reverse();
  const page = (a, b) => `M${c(a)} L${c(rev(b))} Z`;
  const lines = [0.2, 0.36, 0.52, 0.68, 0.84]
    .map((k) => {
      const l = top.map(([x, y], i) => [x + (i === 0 ? 16 : i === 3 ? -14 : 0), y + (bot[i][1] - y) * k]);
      return `M${c(l)} M${c(mir(l))}`;
    })
    .join(' ');
  const edges = [3, 5.5, 8, 10.5, 13].map((o) => {
    const l = bot.map(([x, y], i) => [x - (i === 0 ? 2 : 0), y + o]);
    return `M${c(l)} M${c(mir(l))}`;
  }).join(' ');
  return `<path d="M-146,90 C-104,76 -44,78 0,104 C44,78 104,76 146,90 L146,122 C104,108 44,112 0,144 C-44,112 -104,108 -146,122 Z" fill="url(#${p}cover)"/>
  <path d="M-146,122 C-104,108 -44,112 0,144 C44,112 104,108 146,122" fill="none" stroke="url(#${p}goldV)" stroke-width="2.2"/>
  <path d="M-140,86 C-102,72 -44,74 0,100 C44,74 102,72 140,86 L140,115 C102,101 44,105 0,135 C-44,105 -102,101 -140,115 Z" fill="#E8D7AE"/>
  <path d="${edges}" fill="none" stroke="#C9A866" stroke-width=".7"/>
  <path d="${page(top, bot)} ${page(mir(top), mir(bot))}" fill="url(#${p}page)"/>
  <path d="${lines}" fill="none" stroke="${C.field}" stroke-opacity=".35" stroke-width="1"/>
  <path d="M0,88 V118" stroke="#C9A866" stroke-width="1.4"/>
  <path d="M-2,88 C-12,82 -24,80 -40,81" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="1"/>`;
}

function scene(p) {
  return `<rect x="-180" y="-180" width="360" height="360" fill="url(#${p}sky)"/>
  ${philippineSun(p)}${stars(p)}${mountains(p)}${terraces(p)}${bridge(p)}${book(p)}`;
}

// ---------- palay wreath and ribbon (seal space) ----------
function palayStalk(p, R = 150) {
  const out = [];
  const at = (deg, side, len) => {
    const [x, y] = P(R, deg);
    const rot = deg + 90 + side * 38;
    const [dx, dy] = P(len / 2 + 0.8, rot);
    const t = `translate(${f2(x + dx)} ${f2(y + dy)}) rotate(${f2(rot)})`;
    out.push(`<path transform="${t}" d="${grain(len, len * 0.46)}" fill="url(#${p}grain)" stroke="#8C6417" stroke-width=".5"/>`);
    out.push(`<path transform="${t}" d="M0,${f2(-len * 0.32)} V${f2(len * 0.3)}" stroke="#B5841F" stroke-width=".5"/>`);
    // awn: the fine bristle at the grain's tip
    out.push(`<path transform="${t}" d="M0,${f2(-len / 2)} l0,-4" stroke="#E9B44A" stroke-width=".5"/>`);
  };
  for (let k = 0; k < 10; k++) {
    const deg = -146 + k * 9.2;
    at(deg, -1, 16 - k * 0.35);
    at(deg + 4.2, 1, 16 - k * 0.35);
  }
  const [tx, ty] = P(R, -52);
  const [tdx, tdy] = P(7.6, 38);
  out.push(`<path transform="translate(${f2(tx + tdx)} ${f2(ty + tdy)}) rotate(38)" d="${grain(14, 6)}" fill="url(#${p}grain)" stroke="#8C6417" stroke-width=".5"/>`);
  // a slender leaf curling outward near the base
  const lo = [], li = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20, deg = -160 + 34 * t, b = Math.sin(Math.PI * t);
    lo.push(P(R + 3 + 11 * b * (1 - 0.4 * t), deg));
    li.push(P(R + 3 + 3 * b, deg));
  }
  return `<path d="M${pts(lo)} L${pts([...li].reverse())} Z" fill="#3E7A4A" stroke="#1D4630" stroke-width=".5"/>
  <path d="M${pt(P(R, -168))} A${R},${R} 0 0 1 ${pt(P(R, -54))}" fill="none" stroke="url(#${p}goldV)" stroke-width="1.8" stroke-linecap="round"/>
  ${out.join('')}`;
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
  const beads = Array.from({ length: 72 }, (_, i) => {
    const [x, y] = P(179, i * 5);
    return `<circle cx="${f2(x)}" cy="${f2(y)}" r="1.6"/>`;
  }).join('');
  const side = (a) => {
    const [x, y] = P(214, a);
    return `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${a})" d="${star(6.5, 2.7)}"/>`;
  };
  return `<g><defs>${defs(p)}<clipPath id="${p}clip"><circle r="${MED}"/></clipPath>
    <filter id="${p}shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#000" flood-opacity=".45"/></filter></defs>
  <circle r="248" fill="url(#${p}gold)"/>
  <circle r="242" fill="url(#${p}rimIn)"/>
  <circle r="238" fill="url(#${p}band)"/>
  <circle r="234.5" fill="none" stroke="url(#${p}gold)" stroke-width=".8"/>
  ${arcText(CINZEL_B, 'JOSE T. CUYOS SR. II INTEGRATED SCHOOL', 0, 0, 206, 21.5, { tracking: 0.08, side: 'top', fill: C.cream })}
  ${arcText(CINZEL, 'TOGETHER WE BRIDGE · TOGETHER WE SUCCEED', 0, 0, 225, 14.2, { tracking: 0.1, side: 'bottom', fill: C.sun })}
  <g fill="url(#${p}gold)">${side(-90)}${side(90)}</g>
  <circle r="191" fill="none" stroke="url(#${p}gold)" stroke-width="1.2"/>
  <circle r="186" fill="url(#${p}gold)"/>
  <circle r="181.5" fill="${C.forest}"/>
  <g fill="url(#${p}gold)">${beads}</g>
  <circle r="${MED + 9}" fill="url(#${p}rimIn)"/>
  <circle r="${MED + 2}" fill="url(#${p}gold)"/>
  <g clip-path="url(#${p}clip)">${scene(p)}</g>
  <circle r="${MED}" fill="none" stroke="#0A1F14" stroke-opacity=".6" stroke-width="1"/>
  <g filter="url(#${p}shadow)">${palayStalk(p)}<g transform="scale(-1 1)">${palayStalk(p)}</g></g>
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
