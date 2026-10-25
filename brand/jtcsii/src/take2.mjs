// Take 2 — "Radiant": one geometric system. Every curve in the emblem is a circle around the
// sun (halo, bridge cable, terraces, woven border), flat colours only, one stroke scale.
// Run: node take2.mjs   → ../take-2/svg/*.svg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERIF, SERIF_I, SANS, text, arcText } from './type.mjs';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../take-2');
const f2 = (n) => Math.round(n * 100) / 100;

const BRAND = {
  forest: '#0F2A1C',
  field: '#2E5E3A',
  sun: '#F6C453',
  oldGold: '#A97C22',
  cream: '#FDF7E1',
};

// Full-colour and one-colour palettes for the emblem.
const FULL = {
  rim: BRAND.forest, line: BRAND.sun, band: BRAND.forest, weave: BRAND.sun, weaveEye: BRAND.cream,
  sky: BRAND.field, halo: BRAND.sun, haloOpacity: 0.22, sun: BRAND.sun, ray: BRAND.sun,
  far: '#28543A', mtn: '#143622', lit: '#21492F', outline: null,
  pages: BRAND.cream, pageInk: BRAND.field, cover: '#D9A43A', coverDark: '#B5862A',
  cable: BRAND.cream, tower: BRAND.cream, cap: BRAND.sun,
  terraceA: BRAND.sun, terraceB: '#ECB447', terraceLine: '#B5862A',
};
const mono = (ink, paper) => ({
  rim: ink, line: paper, band: ink, weave: paper, weaveEye: ink,
  sky: ink, halo: paper, haloOpacity: 0.5, sun: paper, ray: paper,
  far: ink, mtn: ink, lit: ink, outline: paper,
  pages: paper, pageInk: ink, cover: paper, coverDark: ink,
  cable: paper, tower: paper, cap: paper,
  terraceA: ink, terraceB: ink, terraceLine: paper,
});

// ---------- the radial system (origin = sun centre) ----------
const R = {
  sun: 36, ray: 57, halo: 100, terrace0: 118, step: 12,
  outer: 234, rimLine: 228, bandOut: 224, bandIn: 208, clip: 207,
};
const PEAK = [-88, 0];
// The scene is drawn at unit scale around the sun, then enlarged and lifted inside the frame.
const SCENE = { s: 1.22, dy: -26 };

const grain = (l, w) => {
  const h = l / 2, k = w / 2;
  return `M0,${-h} C${k * 1.05},${-h * 0.62} ${k * 1.1},${h * 0.55} 0,${h} C${-k * 1.1},${h * 0.55} ${-k * 1.05},${-h * 0.62} 0,${-h} Z`;
};
const pts = (a) => a.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' ');
const mir = (a) => a.map(([x, y]) => [-x, y]);
const circ = (r) => `M${-r},0 a${r},${r} 0 1 0 ${2 * r},0 a${r},${r} 0 1 0 ${-2 * r},0 Z`;

// Mountain silhouette shared by the peaks and the terraced slopes below them.
const SIL_L = [[-420, 150], [-250, 96], [-172, 60], [-134, 30], [-118, 38], PEAK, [-66, 34], [-40, 82], [-18, 110], [0, 128]];
// Lower terraced hill: rice terraces climb it, the rocky peaks rise above.
const HILL_L = [[-420, 175], [-250, 124], [-170, 102], [-118, 100], [-70, 112], [-36, 122], [0, 130]];
const hill = `M${pts(HILL_L)} L${pts(mir(HILL_L).reverse().slice(1))} L420,700 L-420,700 Z`;
const silhouette = `M${pts(SIL_L)} L${pts(mir(SIL_L).reverse().slice(1))} L420,700 L-420,700 Z`;

function sceneDefs(p) {
  return `<clipPath id="${p}sil"><path d="${hill}"/></clipPath>
  <clipPath id="${p}ann"><path clip-rule="evenodd" d="${circ(900)} ${circ(R.terrace0)}"/></clipPath>`;
}

function scene(p, P) {
  // sun, halo, rice-grain rays
  const rays = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    if (-R.ray * Math.cos(a) > 40) continue; // hidden behind the hills
    rays.push(`<path transform="rotate(${i * 30}) translate(0 ${-R.ray})" d="${grain(21, 7.6)}" fill="${P.ray}"/>`);
  }
  const far = [[-90, 130], [-40, 74], [-16, 84], [0, 62], [16, 84], [40, 74], [90, 130]];
  const litL = [PEAK, [-66, 34], [-40, 82], [-18, 110], [-36, 116], [-56, 74], [-76, 34]];
  const litL2 = [[-134, 30], [-118, 38], [-108, 66], [-122, 84], [-126, 52]];
  const strokeOut = P.outline ? ` stroke="${P.outline}" stroke-width="2" stroke-linejoin="round"` : '';

  // terraces: concentric rings, only inside the hills and outside r = terrace0
  let rings = '';
  for (let r = R.terrace0, i = 0; r < 470; r += R.step, i++) {
    rings += `<circle r="${r + R.step / 2}" fill="none" stroke="${i % 2 ? P.terraceB : P.terraceA}" stroke-width="${R.step}"/>`;
  }
  let ringLines = '';
  for (let r = R.terrace0; r < 470; r += R.step) ringLines += `<circle r="${r}" fill="none" stroke="${P.terraceLine}" stroke-width="${r === R.terrace0 ? 2 : 1.3}"/>`;

  // the book
  const top = [[-80, 100], [-60, 88], [-26, 90], [0, 116]];
  const bot = [[-80, 112], [-58, 101], [-26, 104], [0, 130]];
  const c = (s) => `${pts([s[0]])} C${pts(s.slice(1))}`;
  const rev = (s) => [...s].reverse();
  const page = (s1, s2) => `M${c(s1)} L${c(rev(s2))} Z`;
  const pageL = page(top, bot);
  const pageR = page(mir(top), mir(bot));
  const cover = `M-87,106 C-62,95 -26,98 0,124 C26,98 62,95 87,106 L87,118 C62,108 26,112 0,138 C-26,112 -62,108 -87,118 Z`;
  const inkLines = [0.3, 0.55, 0.8]
    .map((k) => {
      const l = top.map(([x, y], i) => [x + (i === 0 ? 10 : i === 3 ? -9 : 0), y + (bot[i][1] - y) * k]);
      return `<path d="M${c(l)} M${c(mir(l))}" fill="none" stroke="${P.pageInk}" stroke-opacity="${P.outline ? 1 : 0.4}" stroke-width="1.2"/>`;
    })
    .join('');

  // hanging bridge: the main cable is the lower arc of the halo
  const tx = 66;
  const cableY = (x) => Math.sqrt(R.halo ** 2 - x ** 2);
  const cubicY = (s, x) => {
    // y on the page-top curve at x (left half; symmetric)
    let lo = 0, hi = 1;
    for (let k = 0; k < 40; k++) {
      const t = (lo + hi) / 2, u = 1 - t;
      const px = u ** 3 * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t ** 3 * s[3][0];
      if (px < x) lo = t; else hi = t;
    }
    const t = (lo + hi) / 2, u = 1 - t;
    return u ** 3 * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t ** 3 * s[3][1];
  };
  const deckY = (x) => cubicY(top, -Math.abs(x));
  const susp = [];
  for (let x = -tx + 8.25; x < tx - 4; x += 8.25) if (Math.abs(x) > 3) susp.push(`M${f2(x)},${f2(cableY(x))} V${f2(deckY(x) + 0.6)}`);
  const ang = (Math.asin(tx / R.halo) * 180) / Math.PI;
  const tower = (x) => {
    const yt = cableY(x) - 7, yb = deckY(x) + 1;
    return `<path d="M${x - 2.8},${f2(yb)} L${x - 2.2},${f2(yt)} L${x + 2.2},${f2(yt)} L${x + 2.8},${f2(yb)} Z" fill="${P.tower}"/>
    <rect x="${x - 4.6}" y="${f2(yt - 3.6)}" width="9.2" height="4.4" rx="1.2" fill="${P.cap}"/>`;
  };

  return `
  <rect x="-500" y="-500" width="1000" height="1200" fill="${P.sky}"/>
  <circle r="${R.halo}" fill="none" stroke="${P.halo}" stroke-opacity="${P.haloOpacity}" stroke-width="1.4"/>
  <circle r="${R.halo - 22}" fill="none" stroke="${P.halo}" stroke-opacity="${P.haloOpacity * 0.6}" stroke-width="1" stroke-dasharray="1.5 5.5" stroke-linecap="round"/>
  ${rays.join('')}
  <circle r="${R.sun}" fill="${P.sun}"/>
  <path d="M${pts(far)} Z" fill="${P.far}"/>
  <path d="${silhouette}" fill="${P.mtn}"${strokeOut}/>
  <path d="M${pts(litL)} Z M${pts(mir(litL))} Z M${pts(litL2)} Z M${pts(mir(litL2))} Z" fill="${P.lit}"/>
  <g clip-path="url(#${p}sil)"><g clip-path="url(#${p}ann)">${rings}${ringLines}</g></g>
  <path d="M${f2(-tx)},${f2(cableY(tx))} A${R.halo},${R.halo} 0 0 0 ${f2(tx)},${f2(cableY(tx))}" fill="none" stroke="${P.cable}" stroke-width="2.2" stroke-linecap="round" data-sweep="${f2(ang)}"/>
  <path d="${susp.join(' ')}" fill="none" stroke="${P.cable}" stroke-width="1.15" stroke-linecap="round"/>
  <path d="${cover}" fill="${P.cover}"/>
  <path d="M-87,118 C-62,108 -26,112 0,138 C26,112 62,108 87,118 L87,121 C62,111 26,115 0,141 C-26,115 -62,111 -87,121 Z" fill="${P.coverDark}"/>
  <path d="${pageL} ${pageR}" fill="${P.pages}"/>
  ${inkLines}
  <path d="M0,116 V130" stroke="${P.coverDark}" stroke-width="1.4"/>
  ${tower(-tx)}${tower(tx)}`;
}

// ---------- frames ----------
// A closed frame path sampled as points: circle, or an arch (semicircle + sides + rounded base).
const ARCH_BASE = 272, ARCH_CORNER = 44;
function framePoints(shape, inset, step = 0.6) {
  const r = R.outer - inset;
  if (shape === 'circle') {
    const n = Math.ceil((2 * Math.PI * r) / step);
    return Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i / n) * 2 * Math.PI;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
  }
  const b = ARCH_BASE - inset, rc = Math.max(ARCH_CORNER - inset, 4);
  const P = [];
  const arc = (cx, cy, rr, a0, a1) => {
    const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * rr) / step));
    for (let i = 0; i < n; i++) { const a = a0 + ((a1 - a0) * i) / n; P.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
  };
  const line = (x0, y0, x1, y1) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let i = 0; i < n; i++) P.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
  };
  arc(0, 0, r, -Math.PI / 2, 0); // top → right
  line(r, 0, r, b - rc);
  arc(r - rc, b - rc, rc, 0, Math.PI / 2);
  line(r - rc, b, -(r - rc), b);
  arc(-(r - rc), b - rc, rc, Math.PI / 2, Math.PI);
  line(-r, b - rc, -r, 0);
  arc(0, 0, r, Math.PI, 1.5 * Math.PI);
  return P;
}
const framePath = (shape, inset) => 'M' + pts(framePoints(shape, inset, 2)) + ' Z';

function weave(shape, P) {
  const mid = (R.outer - R.bandOut + (R.outer - R.bandIn)) / 2;
  const pp = framePoints(shape, mid, 0.25);
  const cum = [0];
  for (let i = 1; i <= pp.length; i++) cum.push(cum[i - 1] + Math.hypot(pp[i % pp.length][0] - pp[i - 1][0], pp[i % pp.length][1] - pp[i - 1][1]));
  const total = cum[pp.length];
  const n = Math.round(total / 17);
  const d = [], eyes = [], dots = [];
  let j = 0;
  for (let k = 0; k < n * 2; k++) {
    const s = (k * total) / (n * 2);
    while (cum[j + 1] < s) j++;
    const [x, y] = pp[j];
    const [x2, y2] = pp[(j + 1) % pp.length];
    const a = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
    const t = `translate(${f2(x)} ${f2(y)}) rotate(${f2(a)})`;
    if (k % 2 === 0) {
      d.push(`<path transform="${t}" d="M-5.4,0 L0,-5.6 L5.4,0 L0,5.6 Z"/>`);
      eyes.push(`<path transform="${t}" d="M-1.9,0 L0,-2 L1.9,0 L0,2 Z"/>`);
    } else {
      dots.push(`<path transform="${t}" d="M-2.2,-7.6 L2.2,-7.6 L0,-4.4 Z M-2.2,7.6 L2.2,7.6 L0,4.4 Z"/>`);
    }
  }
  return `<path d="${framePath(shape, R.outer - R.bandOut)} ${framePath(shape, R.outer - R.bandIn)}" fill-rule="evenodd" fill="${P.band}"/>
  <g fill="${P.weave}">${d.join('')}${dots.join('')}</g><g fill="${P.weaveEye}">${eyes.join('')}</g>
  <path d="${framePath(shape, R.outer - R.bandOut)}" fill="none" stroke="${P.line}" stroke-width="1.6"/>
  <path d="${framePath(shape, R.outer - R.bandIn)}" fill="none" stroke="${P.line}" stroke-width="1.6"/>`;
}

// Emblem in its own coordinates (origin = sun). Returns { svg, box:[x,y,w,h] }.
function emblem(p, shape = 'arch', P = FULL) {
  const clip = framePath(shape, R.outer - R.clip);
  const svg = `<g><defs>${sceneDefs(p)}<clipPath id="${p}clip"><path d="${clip}"/></clipPath></defs>
  <path d="${framePath(shape, 0)}" fill="${P.rim}"/>
  <g clip-path="url(#${p}clip)"><g transform="translate(0 ${SCENE.dy}) scale(${SCENE.s})">${scene(p, P)}</g></g>
  ${weave(shape, P)}
  <path d="${framePath(shape, R.outer - R.rimLine)}" fill="none" stroke="${P.line}" stroke-width="1.2" stroke-opacity=".8"/>
</g>`;
  const box = shape === 'circle' ? [-R.outer, -R.outer, 2 * R.outer, 2 * R.outer] : [-R.outer, -R.outer, 2 * R.outer, R.outer + ARCH_BASE];
  return { svg, box };
}

const place = (e, x, y, w) => {
  const s = w / e.box[2];
  return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${f2(s * 10000) / 10000}) translate(${-e.box[0]} ${-e.box[1]})">${e.svg}</g>`;
};
const heightFor = (e, w) => (w / e.box[2]) * e.box[3];
const doc = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>\n`;

function seal(p) {
  const cx = 250, cy = 250;
  const e = emblem(p, 'circle');
  const diamond = (x, y, r) => `M${x},${y - r} L${x + r * 0.7},${y} L${x},${y + r} L${x - r * 0.7},${y} Z`;
  return `<circle cx="${cx}" cy="${cy}" r="248" fill="${BRAND.forest}"/>
  <circle cx="${cx}" cy="${cy}" r="241" fill="none" stroke="${BRAND.sun}" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="236.5" fill="none" stroke="${BRAND.sun}" stroke-width=".8" stroke-opacity=".7"/>
  ${arcText(SANS, 'JOSE T. CUYOS SR. II INTEGRATED SCHOOL', cx, cy, 202, 18.5, { tracking: 0.13, side: 'top', fill: BRAND.cream })}
  ${arcText(SERIF_I, 'Together we bridge, together we succeed', cx, cy, 218, 25, { tracking: 0.01, side: 'bottom', fill: BRAND.sun })}
  ${text(SANS, 'EST.', 41, 226, 9.5, { anchor: 'middle', tracking: 0.25, fill: BRAND.sun }).svg}
  ${text(SERIF, '20', 41, 262, 32, { anchor: 'middle', fill: BRAND.cream }).svg}
  ${text(SANS, 'EST.', 459, 226, 9.5, { anchor: 'middle', tracking: 0.25, fill: BRAND.sun }).svg}
  ${text(SERIF, '12', 459, 262, 32, { anchor: 'middle', fill: BRAND.cream }).svg}
  <path d="${diamond(41, 281, 4.5)} ${diamond(459, 281, 4.5)}" fill="${BRAND.sun}"/>
  ${place(e, cx - 175, cy - 175, 350)}`;
}

function stacked(p) {
  const W = 900, cx = W / 2, e = emblem(p), ew = 340, eh = heightFor(e, ew);
  const y0 = 60 + eh;
  const est = text(SANS, 'EST. 2012', cx, y0 + 262, 21, { anchor: 'middle', tracking: 0.34, fill: BRAND.oldGold });
  const rule = (x1, x2) => `<rect x="${f2(x1)}" y="${f2(y0 + 253)}" width="${f2(x2 - x1)}" height="2" fill="${BRAND.oldGold}"/>`;
  const H = Math.round(y0 + 420);
  return doc(W, H, `${place(e, cx - ew / 2, 60, ew)}
  ${text(SERIF, 'Jose T. Cuyos Sr. II', cx, y0 + 120, 104, { anchor: 'middle' }).svg}
  ${text(SANS, 'INTEGRATED SCHOOL', cx, y0 + 192, 30, { anchor: 'middle', tracking: 0.42, fill: BRAND.field }).svg}
  ${est.svg}${rule(cx - 230, cx - est.width / 2 - 26)}${rule(cx + est.width / 2 + 26, cx + 230)}
  ${text(SERIF_I, 'Together we bridge, together we succeed', cx, y0 + 352, 44, { anchor: 'middle', fill: BRAND.field }).svg}`);
}

function horizontal(p, reversed = false) {
  const W = 1240, H = 440, e = emblem(p), eh = 320, ew = (eh / e.box[3]) * e.box[2];
  const ink = reversed ? BRAND.cream : BRAND.forest;
  const x = 60 + ew + 44;
  return doc(W, H, `${place(e, 60, 60, ew)}
  <rect x="${f2(60 + ew + 22)}" y="88" width="1.6" height="264" fill="${reversed ? BRAND.sun : BRAND.field}" opacity="${reversed ? 0.6 : 0.35}"/>
  ${text(SERIF, 'Jose T. Cuyos Sr. II', x + 4, 222, 104, { fill: ink }).svg}
  ${text(SANS, 'INTEGRATED SCHOOL', x + 8, 290, 28, { tracking: 0.42, fill: reversed ? BRAND.sun : BRAND.field }).svg}
  ${text(SANS, 'EST. 2012', x + 8, 342, 17, { tracking: 0.34, fill: reversed ? BRAND.sun : BRAND.oldGold }).svg}`, reversed ? BRAND.forest : null);
}

const emblemDoc = (p, shape, P = FULL, bg = null) => {
  const e = emblem(p, shape, P);
  const pad = 0;
  return doc(e.box[2] + pad * 2, e.box[3] + pad * 2, place(e, pad, pad, e.box[2]), bg);
};

const files = {
  'emblem-arch.svg': emblemDoc('ea', 'arch'),
  'emblem-circle.svg': emblemDoc('ec', 'circle'),
  'emblem-mono-forest.svg': emblemDoc('mf', 'arch', mono(BRAND.forest, '#FFFFFF')),
  'emblem-mono-cream.svg': emblemDoc('mc', 'arch', mono(BRAND.cream, BRAND.forest), BRAND.forest),
  'seal.svg': doc(500, 500, seal('s')),
  'logo-stacked.svg': stacked('st'),
  'logo-horizontal.svg': horizontal('hz'),
  'logo-horizontal-reversed.svg': horizontal('hr', true),
};
fs.mkdirSync(path.join(out, 'svg'), { recursive: true });
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, 'svg', n), s);
console.log('wrote', Object.keys(files).join(', '));
