// Take 4 — "Gintong Liwanag" (Golden Light): an engraved, gold-foil seal. Guilloché border,
// line-engraved shading, metallic gold, Cormorant Garamond. Same meanings as Take 3:
// 13 rays, 2 peaks, 1 book-bridge, 4 terraces, 3 stars, 13 grains per palay stalk.
// Run: node take4.mjs   → ../take-4/svg/*.svg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, text, arcText } from './type.mjs';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../take-4');
const SERIF = loadFont('cormorant700.ttf');
const SERIF_M = loadFont('cormorant600.ttf');
const SERIF_I = loadFont('cormorant-italic.ttf');
const LABEL = loadFont('jakarta700.ttf');

const C = {
  forest: '#0F2A1C',
  field: '#2E5E3A',
  sun: '#F6C453',
  oldGold: '#A97C22',
  cream: '#FDF7E1',
  engrave: '#B5841F', // engraving lines on gold
};
const COUNTS = { rays: 13, grains: 13, terraces: 4, stars: 3 };

const f2 = (n) => Math.round(n * 100) / 100;
const P = (r, deg, [cx, cy] = [0, 0]) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};
const pt = ([x, y]) => `${f2(x)},${f2(y)}`;
const pts = (a) => a.map(pt).join(' ');
const mir = (a) => a.map(([x, y]) => [-x, y]);
const grain = (l, w) => {
  const h = l / 2, k = w / 2;
  return `M0,${-h} C${k * 1.05},${-h * 0.62} ${k * 1.1},${h * 0.55} 0,${h} C${-k * 1.1},${h * 0.55} ${-k * 1.05},${-h * 0.62} 0,${-h} Z`;
};
const star = (R, r) => 'M' + Array.from({ length: 10 }, (_, i) => pt(P(i % 2 ? r : R, i * 36))).join(' L') + ' Z';
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

// Parallel engraving lines at an angle, clipped to a shape.
function hatch(clipId, shape, { angle = 0, gap = 3, color, width = 0.6, opacity = 1, extent = 200 }) {
  const lines = [];
  for (let d = -extent; d <= extent; d += gap) lines.push(`M${-extent},${f2(d)} H${extent}`);
  return `<clipPath id="${clipId}"><path d="${shape}"/></clipPath>
  <g clip-path="url(#${clipId})"><path transform="rotate(${angle})" d="${lines.join(' ')}" stroke="${color}" stroke-width="${width}" stroke-opacity="${opacity}" fill="none"/></g>`;
}

function foilDefs(id, span) {
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${-span}" y1="${-span}" x2="${span}" y2="${span}">
    <stop offset="0" stop-color="#FCE9A8"/><stop offset=".28" stop-color="${C.sun}"/><stop offset=".5" stop-color="#D9A23A"/>
    <stop offset=".68" stop-color="#F9D97C"/><stop offset=".86" stop-color="#E2AE45"/><stop offset="1" stop-color="#C08A25"/>
  </linearGradient>`;
}

// ---------- the engraved scene (scene units: medallion radius 128) ----------
const SUN = [0, -4];
const BOOK_TOP = [[-76, 38], [-56, 26], [-24, 28], [0, 50]];
const BOOK_BOT = [[-76, 50], [-54, 40], [-24, 42], [0, 64]];

function palay(R, a0, a1, foil, size = 11) {
  const grains = [], crease = [];
  const at = (deg, side, len) => {
    const [x, y] = P(R, deg);
    const rot = deg + 90 + side * 34;
    const [dx, dy] = P(len / 2 + 0.7, rot);
    const t = `translate(${f2(x + dx)} ${f2(y + dy)}) rotate(${f2(rot)})`;
    grains.push(`<path transform="${t}" d="${grain(len, len * 0.46)}"/>`);
    crease.push(`<path transform="${t}" d="M0,${f2(-len * 0.3)} V${f2(len * 0.3)}"/>`);
  };
  const pairs = (COUNTS.grains - 1) / 2;
  const step = (a1 - 8 - (a0 + 18)) / (pairs - 1);
  for (let k = 0; k < pairs; k++) {
    const deg = a0 + 18 + k * step;
    at(deg, -1, size - k * 0.25);
    at(deg + 3.5, 1, size - k * 0.25);
  }
  const [tx, ty] = P(R, a1 - 2);
  const [tdx, tdy] = P(size / 2 + 0.5, a1 - 2 + 90);
  grains.push(`<path transform="translate(${f2(tx + tdx)} ${f2(ty + tdy)}) rotate(${a1 + 88})" d="${grain(size, size * 0.42)}"/>`);
  return `<path d="M${pt(P(R, a0))} A${R},${R} 0 0 1 ${pt(P(R, a1 - 2))}" fill="none" stroke="url(#${foil})" stroke-width="1.4" stroke-linecap="round"/>
  <g fill="url(#${foil})">${grains.join('')}</g>
  <g stroke="${C.engrave}" stroke-width=".6" stroke-linecap="round">${crease.join('')}</g>`;
}

function scene(p) {
  const foil = `${p}fs`;
  // sky
  const skyLines = [];
  for (let y = -130; y <= 70; y += 2.8) skyLines.push(`M-130,${f2(y)} H130`);
  // sun, halo, rays
  const halo = [36, 41, 46, 51, 56].map((r) => `<circle cx="${SUN[0]}" cy="${SUN[1]}" r="${r}"/>`).join('');
  const rays = [], creases = [];
  for (let i = 0; i < COUNTS.rays; i++) {
    const a = -75 + i * 12.5;
    const t = `translate(${SUN[0]} ${SUN[1]}) rotate(${f2(a)}) translate(0 -49)`;
    rays.push(`<path transform="${t}" d="${grain(23, 7.4)}"/>`);
    creases.push(`<path transform="${t}" d="M0,-7 V7"/>`);
  }
  const sunRings = [];
  for (let r = 3; r < 25; r += 2.6) sunRings.push(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="${f2(r)}"/>`);
  const stars = [-17, 0, 17].map((a) => {
    const [x, y] = P(93, a, SUN);
    return `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${a})" d="${star(7.6, 3.1)}"/>`;
  }).join('');

  // mountains
  const far = [[-150, 72], [-104, 44], [-72, 52], [-40, 41], [0, 47], [40, 41], [72, 52], [104, 44], [150, 72], [150, 150], [-150, 150]];
  const left = [[-150, 104], [-136, 30], [-124, 16], [-110, 0], [-92, -26], [-76, -4], [-58, 26], [-40, 60], [-22, 104]];
  const lit = [[-92, -26], [-76, -4], [-58, 26], [-40, 60], [-22, 104], [-48, 104], [-60, 58], [-78, 14]];
  const farD = `M${pts(far)} Z`;
  const mtnD = `M${pts(left)} Z M${pts(mir(left))} Z`;
  const litL = `M${pts(lit)} Z`, litR = `M${pts(mir(lit))} Z`;
  const rimL = [[-92, -26], [-76, -4], [-58, 26], [-40, 60]];
  const ridgeL = [[-150, 104], [-136, 30], [-124, 16], [-110, 0], [-92, -26]];

  // terraces: a valley of four steps
  const tops = [36, 50, 64, 78];
  const curve = (i, off = 0) => {
    const a = [];
    for (let x = -150; x <= 150; x += 4) a.push([x, tops[i] + 32 * (1 - (x / 140) ** 2) + off]);
    return a;
  };
  let terr = '';
  for (let i = 0; i < COUNTS.terraces; i++) {
    const top = curve(i);
    const bottom = i < COUNTS.terraces - 1 ? curve(i + 1) : top.map(([x]) => [x, 170]);
    terr += `<path d="M${pts(top)} L${pts([...bottom].reverse())} Z" fill="url(#${foil})"/>`;
    terr += `<polyline points="${pts(curve(i, 5))}" fill="none" stroke="${C.engrave}" stroke-width=".5" stroke-opacity=".55"/>`;
    terr += `<polyline points="${pts(curve(i, 9.5))}" fill="none" stroke="${C.engrave}" stroke-width=".5" stroke-opacity=".4"/>`;
    if (i < COUNTS.terraces - 1) terr += `<path d="M${pts(curve(i + 1, -4))} L${pts([...curve(i + 1)].reverse())} Z" fill="${C.oldGold}" opacity=".85"/>`;
    terr += `<polyline points="${pts(top)}" fill="none" stroke="#FCE9A8" stroke-width=".9"/>`;
  }

  // bridge and book
  const tx = 62, top = 2, sag = 32;
  const cableY = (x) => top + sag * (1 - (x / tx) ** 2);
  const deckY = (x) => cubicYAt(BOOK_TOP, -Math.abs(x));
  const cable = [];
  for (let x = -tx; x <= tx; x += 2) cable.push(pt([x, cableY(x)]));
  const susp = [];
  for (let k = 1; k < 16; k++) {
    const x = -tx + (k * 2 * tx) / 16;
    if (Math.abs(x) > 2) susp.push(`M${f2(x)},${f2(cableY(x))} V${f2(deckY(x) + 0.6)}`);
  }
  const tower = (x) => {
    const yb = deckY(x) + 1;
    return `<path d="M${x - 2.6},${f2(yb)} L${x - 2},${top - 3} L${x + 2},${top - 3} L${x + 2.6},${f2(yb)} Z" fill="${C.cream}"/>
    <path d="M${x - 4.2},${top - 3} L${x + 4.2},${top - 3} L${x + 2.8},${top - 8} L${x - 2.8},${top - 8} Z" fill="url(#${foil})"/>
    <rect x="${x - 3.4}" y="${f2(top + (yb - top) * 0.42)}" width="6.8" height="1.4" fill="url(#${foil})"/>`;
  };
  const c = (s) => `${pt(s[0])} C${pts(s.slice(1))}`;
  const rev = (s) => [...s].reverse();
  const page = (a, b) => `M${c(a)} L${c(rev(b))} Z`;
  const lines = [0.24, 0.42, 0.6, 0.78]
    .map((k) => {
      const l = BOOK_TOP.map(([x, y], i) => [x + (i === 0 ? 9 : i === 3 ? -8 : 0), y + (BOOK_BOT[i][1] - y) * k]);
      return `M${c(l)} M${c(mir(l))}`;
    })
    .join(' ');

  return `
  <rect x="-140" y="-140" width="280" height="280" fill="url(#${p}sky)"/>
  <path d="${skyLines.join(' ')}" stroke="${C.cream}" stroke-opacity=".06" stroke-width=".5"/>
  <g transform="translate(0 -6)">
  <g fill="none" stroke="url(#${foil})" stroke-opacity=".22" stroke-width=".6">${halo}</g>
  <g fill="url(#${foil})">${stars}</g>
  <g fill="url(#${foil})">${rays.join('')}</g>
  <g stroke="${C.engrave}" stroke-width=".7" stroke-linecap="round">${creases.join('')}</g>
  <circle cx="${SUN[0]}" cy="${SUN[1]}" r="26" fill="url(#${foil})"/>
  <g fill="none" stroke="${C.engrave}" stroke-opacity=".4" stroke-width=".5">${sunRings.join('')}</g>
  <circle cx="${SUN[0]}" cy="${SUN[1]}" r="26" fill="none" stroke="#FCE9A8" stroke-width=".8"/>
  <path d="${farD}" fill="#2C5A3A"/>
  ${hatch(`${p}hf`, farD, { angle: 0, gap: 2.2, color: '#1F4630', width: 0.55 })}
  <path d="${mtnD}" fill="#122F1F"/>
  ${hatch(`${p}hm`, mtnD, { angle: 0, gap: 2.2, color: '#24503A', width: 0.6 })}
  <path d="${litL} ${litR}" fill="#3E7A52"/>
  ${hatch(`${p}hl`, litL, { angle: 58, gap: 3.4, color: '#2F6342', width: 0.6 })}
  ${hatch(`${p}hr`, litR, { angle: -58, gap: 3.4, color: '#2F6342', width: 0.6 })}
  <path d="M${pts(rimL)} M${pts(mir(rimL))}" fill="none" stroke="url(#${foil})" stroke-width="1" stroke-opacity=".85" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${pts(ridgeL)} M${pts(mir(ridgeL))}" fill="none" stroke="url(#${foil})" stroke-width=".7" stroke-opacity=".45" stroke-linejoin="round"/>
  ${terr}
  ${palay(112, -134, -52, foil)}<g transform="scale(-1 1)">${palay(112, -134, -52, foil)}</g>
  <g fill="none" stroke="${C.cream}" stroke-linecap="round">
    <path d="M${-tx},${top} L-96,30 M${tx},${top} L96,30" stroke-width="1.2" stroke-opacity=".85"/>
    <polyline points="${cable.join(' ')}" stroke-width="1.8"/>
    <path d="${susp.join(' ')}" stroke-width=".9"/>
  </g>
  <circle cx="-96" cy="30" r="2" fill="url(#${foil})"/><circle cx="96" cy="30" r="2" fill="url(#${foil})"/>
  <path d="M-83,44 C-58,33 -24,36 0,58 C24,36 58,33 83,44 L83,56 C58,46 24,49 0,72 C-24,49 -58,46 -83,56 Z" fill="url(#${foil})"/>
  <path d="M-83,56 C-58,46 -24,49 0,72 C24,49 58,46 83,56 L83,59 C58,49 24,52 0,75 C-24,52 -58,49 -83,59 Z" fill="${C.oldGold}"/>
  <path d="${page(BOOK_TOP, BOOK_BOT)} ${page(mir(BOOK_TOP), mir(BOOK_BOT))}" fill="${C.cream}"/>
  <path d="${lines}" fill="none" stroke="${C.field}" stroke-opacity=".4" stroke-width=".8"/>
  <path d="M0,50 V64" stroke="${C.engrave}" stroke-width="1.1"/>
  ${tower(-tx)}${tower(tx)}
  </g>`;
}

function sceneDefs(p) {
  return `${foilDefs(`${p}fs`, 130)}
  <radialGradient id="${p}sky" cx="0" cy="-10" r="150" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#3F7651"/><stop offset=".45" stop-color="${C.field}"/><stop offset="1" stop-color="#1B3E28"/>
  </radialGradient>`;
}

// ---------- the seal (radius 248) ----------
const MED = 170;
const K = MED / 128;

function guilloche(foil, R = 233, A = 5.6, k = 36) {
  const paths = [];
  for (let j = 0; j < 4; j++) {
    const ph = (j * Math.PI) / 2;
    const a = [];
    for (let i = 0; i <= 1440; i++) {
      const t = (i / 1440) * Math.PI * 2;
      const r = R + A * Math.sin(k * t + ph);
      a.push([r * Math.cos(t), r * Math.sin(t)]);
    }
    paths.push(`M${pts(a)} Z`);
  }
  return `<path d="${paths.join(' ')}" fill="none" stroke="url(#${foil})" stroke-width=".6"/>`;
}

function woven(foil, r0, r1, n) {
  const rm = (r0 + r1) / 2;
  let d = '', eyes = '';
  for (let i = 0; i < n; i++) {
    const a = (i * 360) / n;
    const [x, y] = P(rm, a);
    d += `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(a)})" d="${diamond(0, 0, 3.6, 3.9)}"/>`;
    eyes += `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(a)})" d="${diamond(0, 0, 1.2, 1.3)}"/>`;
    const [dx, dy] = P(rm, a + 180 / n);
    d += `<circle cx="${f2(dx)}" cy="${f2(dy)}" r=".9"/>`;
  }
  return `<circle r="${rm}" fill="none" stroke="${C.forest}" stroke-width="${r1 - r0}"/>
  <g fill="url(#${foil})">${d}</g><g fill="${C.forest}">${eyes}</g>
  <circle r="${r0}" fill="none" stroke="url(#${foil})" stroke-width="1"/>
  <circle r="${r1}" fill="none" stroke="url(#${foil})" stroke-width="1"/>`;
}

function seal(p) {
  const foil = `${p}f`;
  const side = (x, txt) => `${text(SERIF, txt, x, 10, 27, { anchor: 'middle', fill: C.cream }).svg}
    <path d="${diamond(x, -20, 3, 4)} ${diamond(x, 26, 3, 4)}" fill="url(#${foil})"/>`;
  return `<g>
  <defs>${foilDefs(foil, 250)}
    <radialGradient id="${p}disc" r="250" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#16382A"/><stop offset=".7" stop-color="${C.forest}"/><stop offset="1" stop-color="#0A1F14"/></radialGradient>
    <clipPath id="${p}med"><circle r="128"/></clipPath>${sceneDefs(p)}</defs>
  <circle r="248" fill="url(#${p}disc)"/>
  <circle r="244.5" fill="none" stroke="url(#${foil})" stroke-width="2.4"/>
  <circle r="240.8" fill="none" stroke="url(#${foil})" stroke-width=".6"/>
  ${guilloche(foil)}
  <circle r="225.2" fill="none" stroke="url(#${foil})" stroke-width=".6"/>
  <circle r="222" fill="none" stroke="url(#${foil})" stroke-width="1.4"/>
  ${arcText(SERIF, 'JOSE T. CUYOS SR. II INTEGRATED SCHOOL', 0, 0, 197, 20.5, { tracking: 0.12, side: 'top', fill: C.cream })}
  ${arcText(SERIF_M, 'TOGETHER WE BRIDGE · TOGETHER WE SUCCEED', 0, 0, 213, 12, { tracking: 0.2, side: 'bottom', fill: C.sun })}
  ${side(-203, '20')}${side(203, '12')}
  <circle r="185.5" fill="none" stroke="url(#${foil})" stroke-width="1.2"/>
  ${woven(foil, MED + 2, MED + 12.5, 64)}
  <g transform="scale(${f2(K * 10000) / 10000})"><g clip-path="url(#${p}med)">${scene(p)}</g></g>
</g>`;
}

// Small-size mark: sun, 13 rays and the book, in foil.
function mark(p) {
  const foil = `${p}f`;
  const rays = Array.from({ length: COUNTS.rays }, (_, i) => `<path transform="translate(0 -6) rotate(${-75 + i * 12.5}) translate(0 -54)" d="${grain(27, 9)}"/>`).join('');
  return `<g><defs>${foilDefs(foil, 128)}</defs>
  <circle r="128" fill="${C.forest}"/>
  <circle r="121" fill="none" stroke="url(#${foil})" stroke-width="2.5"/>
  <g fill="url(#${foil})">${rays}</g>
  <circle cx="0" cy="-6" r="30" fill="url(#${foil})"/>
  <path d="M-88,46 C-62,32 -26,35 0,60 C26,35 62,32 88,46 L88,60 C62,48 26,51 0,77 C-26,51 -62,48 -88,60 Z" fill="url(#${foil})"/>
  <path d="M-82,40 C-60,27 -26,29 0,52 C26,29 60,27 82,40 L82,52 C60,41 26,44 0,66 C-26,44 -60,41 -82,52 Z" fill="${C.cream}"/>
  <path d="M0,52 V66" stroke="${C.oldGold}" stroke-width="2"/>
</g>`;
}

// ---------- documents ----------
const doc = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>\n`;
const placeSeal = (x, y, size, p) => `<g transform="translate(${f2(x + size / 2)} ${f2(y + size / 2)}) scale(${f2((size / 500) * 10000) / 10000})">${seal(p)}</g>`;

function stacked(p) {
  const W = 1000, cx = W / 2, S = 420, y = 60 + S;
  const est = text(LABEL, 'EST. 2012', cx, y + 252, 16, { anchor: 'middle', tracking: 0.4, fill: C.oldGold });
  const rule = (x1, x2) => `<rect x="${f2(x1)}" y="${y + 245}" width="${f2(x2 - x1)}" height="1.4" fill="${C.oldGold}"/>`;
  return doc(W, y + 380, `${placeSeal(cx - S / 2, 60, S, p)}
  ${text(SERIF, 'Jose T. Cuyos Sr. II', cx, y + 140, 100, { anchor: 'middle', fill: C.forest }).svg}
  ${text(SERIF, 'INTEGRATED SCHOOL', cx, y + 198, 28, { anchor: 'middle', tracking: 0.46, fill: C.field }).svg}
  ${est.svg}${rule(cx - 210, cx - est.width / 2 - 24)}${rule(cx + est.width / 2 + 24, cx + 210)}
  ${text(SERIF_I, 'Together we bridge, together we succeed', cx, y + 326, 40, { anchor: 'middle', fill: C.field }).svg}`);
}

function horizontal(p, reversed = false) {
  const W = 1300, H = 440, S = 320, x = 60 + S + 56;
  const ink = reversed ? C.cream : C.forest;
  return doc(W, H, `${placeSeal(60, 60, S, p)}
  <rect x="${60 + S + 28}" y="96" width="1.4" height="248" fill="${reversed ? C.sun : C.field}" opacity="${reversed ? 0.55 : 0.3}"/>
  ${text(SERIF, 'Jose T. Cuyos Sr. II', x, 212, 98, { fill: ink }).svg}
  ${text(SERIF, 'INTEGRATED SCHOOL', x + 4, 272, 27, { tracking: 0.46, fill: reversed ? C.sun : C.field }).svg}
  ${text(LABEL, 'EST. 2012', x + 4, 334, 14, { tracking: 0.4, fill: reversed ? C.sun : C.oldGold }).svg}
  ${text(SERIF_I, 'Together we bridge, together we succeed', x + 140, 336, 26, { fill: reversed ? C.cream : C.field }).svg}`, reversed ? C.forest : null);
}

const files = {
  'seal.svg': doc(500, 500, placeSeal(0, 0, 500, 's')),
  'medallion.svg': doc(370, 370, `<g transform="translate(185 185)"><defs>${foilDefs('mf', 185)}<clipPath id="mmed"><circle r="128"/></clipPath>${sceneDefs('m')}</defs>
    <circle r="185" fill="${C.forest}"/>${woven('mf', MED + 2, MED + 12.5, 64)}<g transform="scale(${f2(K * 10000) / 10000})"><g clip-path="url(#mmed)">${scene('m')}</g></g></g>`),
  'mark.svg': doc(256, 256, `<g transform="translate(128 128)">${mark('k')}</g>`),
  'logo-stacked.svg': stacked('st'),
  'logo-horizontal.svg': horizontal('hz'),
  'logo-horizontal-reversed.svg': horizontal('hr', true),
};
fs.mkdirSync(path.join(out, 'svg'), { recursive: true });
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, 'svg', n), s);
console.log('wrote', Object.keys(files).join(', '));
