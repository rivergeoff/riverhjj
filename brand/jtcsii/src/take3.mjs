// Take 3 — "Ani ng Liwanag" (Harvest of Light): a formal Philippine school seal where every
// element and every count means something.
// Run: node take3.mjs   → ../take-3/svg/*.svg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, text, arcText } from './type.mjs';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../take-3');
// Type: a serif for the name and its italic for the motto, with a quiet sans for small labels.
const FONTSETS = {
  playfair: { name: 'playfair800.ttf', motto: 'playfair-italic600.ttf', track: 0.07 },
  dmserif: { name: 'dmserif.ttf', motto: 'dmserif-italic.ttf', track: 0.07 },
  baskerville: { name: 'baskerville700.ttf', motto: 'baskerville-italic.ttf', track: 0.06 },
  garamond: { name: 'ebgaramond700.ttf', motto: 'ebgaramond-italic600.ttf', track: 0.09 },
};
const FS = FONTSETS[process.env.JTC_FONTS ?? 'baskerville'];
const NAME = loadFont(FS.name);
const MOTTO = loadFont(FS.motto);
const LABEL = loadFont('montserrat600.ttf');
const capHeight = (font) => (font.tables.os2.sCapHeight || font.unitsPerEm * 0.7) / font.unitsPerEm;
const xHeight = (font) => (font.tables.os2.sxHeight || font.unitsPerEm * 0.5) / font.unitsPerEm;
// size at which a string set on radius r spans the given angle
const fitArc = (font, str, r, deg, tracking) => {
  const w = text(font, str, 0, 0, 100, { tracking }).width;
  return (100 * r * (deg * Math.PI / 180)) / w;
};

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
  flagBlue: '#0038A8',
  flagRed: '#CE1126',
};

// The numbers the seal is built on.
export const COUNTS = {
  rays: 8, // the eight rays of the flag's sun, drawn as grains of palay
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

// ---------- 3D finish ----------
// The same seal is built twice: flat (for embroidery, stamps, one-colour print) and with a 3D
// finish, where gold is raised and lit from the top left, the scene sits recessed, and the
// scene's elements are modelled with light and shadow.
let D3 = true;
const fx = (id) => (D3 ? ` filter="url(#${id})"` : '');
const gold = () => (D3 ? 'url(#gold3d)' : C.sun);

function defs3d() {
  if (!D3) return '';
  const lin = (id, x1, y1, x2, y2, stops, units = 'objectBoundingBox') =>
    `<linearGradient id="${id}" gradientUnits="${units}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
  const rad = (id, cx, cy, r, stops) =>
    `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
  return `<defs>
  ${lin('gold3d', 0, 0, 1, 1, [[0, '#FFEDB0'], [0.3, '#F6C453'], [0.55, '#D9A23A'], [0.8, '#F8D676'], [1, '#B07F22']])}
  ${rad('disc3d', -40, -60, 320, [[0, '#1B4430'], [0.6, '#0F2A1C'], [1, '#071810']])}
  ${rad('skyBlue', 0, 20, 150, [[0, '#4A86EE'], [0.45, '#0038A8'], [1, '#001A5C']])}
  ${rad('skyRed', 0, 20, 150, [[0, '#F4605A'], [0.45, '#CE1126'], [1, '#6E0814']])}
  ${lin('mtnDark', 0, -30, 0, 104, [[0, '#2A5E40'], [1, '#0B2416']], 'userSpaceOnUse')}
  ${lin('mtnLit', 0, -30, 0, 104, [[0, '#8CC47E'], [0.45, '#4E8C58'], [1, '#1F4A31']], 'userSpaceOnUse')}
  ${lin('mtnFar', 0, 30, 0, 80, [[0, '#6FA27A'], [1, '#2E5E3A']], 'userSpaceOnUse')}
  ${lin('haze', 0, 18, 0, 70, [[0, '#FFF1C9', 0], [0.55, '#FFF1C9', 0.3], [1, '#FFF1C9', 0]], 'userSpaceOnUse')}
  ${lin('paddy', 0, 0, 0, 1, [[0, '#F7D57E'], [0.5, '#E2B24E'], [1, '#B98A2E']])}
  ${lin('wall3d', 0, 0, 0, 1, [[0, '#6E4C10'], [1, '#B08328']])}
  ${lin('cover3d', 0, 0, 0, 1, [[0, '#E8B94F'], [1, '#8C6417']])}
  ${lin('pageL', 0, 0, 1, 0, [[0, '#FFFDF6'], [0.75, '#F6ECD2'], [1, '#D8C69A']])}
  ${lin('pageR', 1, 0, 0, 0, [[0, '#FFFDF6'], [0.75, '#F6ECD2'], [1, '#D8C69A']])}
  ${lin('tower3d', 0, 0, 1, 0, [[0, '#FFFFFF'], [0.5, '#F5ECD3'], [1, '#BFAE80']])}
  ${rad('gloss', -110, -160, 340, [[0, '#FFFFFF', 0.15], [0.45, '#FFFFFF', 0.04], [1, '#FFFFFF', 0]])}
  ${rad('rim', 0, 0, 249, [[0.93, '#000000', 0], [0.98, '#000000', 0.15], [1, '#000000', 0.35]])}
  <filter id="raise" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="1.15" result="h"/>
    <feSpecularLighting in="h" surfaceScale="2.4" specularConstant=".9" specularExponent="20" lighting-color="#FFF4D6" result="s"><feDistantLight azimuth="225" elevation="50"/></feSpecularLighting>
    <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
    <feDiffuseLighting in="h" surfaceScale="2.4" diffuseConstant="1" lighting-color="#FFFFFF" result="d"><feDistantLight azimuth="225" elevation="58"/></feDiffuseLighting>
    <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1.12" k2="0" k3="0" k4="0" result="shaded"/>
    <feComposite in="shaded" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".8" k4="0" result="lit"/>
    <feComposite in="lit" in2="SourceAlpha" operator="in" result="litIn"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="sb"/>
    <feOffset in="sb" dx="1" dy="1.6" result="so"/>
    <feFlood flood-color="#020D07" flood-opacity=".55"/><feComposite in2="so" operator="in" result="shadow"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="litIn"/></feMerge>
  </filter>
  <filter id="raiseText" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation=".5" result="h"/>
    <feSpecularLighting in="h" surfaceScale="1.4" specularConstant=".7" specularExponent="18" lighting-color="#FFFFFF" result="s"><feDistantLight azimuth="225" elevation="52"/></feSpecularLighting>
    <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
    <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".5" k4="0" result="lit"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation=".8" result="sb"/>
    <feOffset in="sb" dx=".9" dy="1.3" result="so"/>
    <feFlood flood-color="#020D07" flood-opacity=".7"/><feComposite in2="so" operator="in" result="shadow"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="lit"/></feMerge>
  </filter>
  <filter id="sink" x="-5%" y="-5%" width="110%" height="110%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b"/>
    <feOffset in="b" dx="2" dy="3" result="o"/>
    <feComposite in="SourceAlpha" in2="o" operator="out" result="edge"/>
    <feFlood flood-color="#000" flood-opacity=".6"/><feComposite in2="edge" operator="in" result="sh"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge>
  </filter>
  <filter id="drop" x="-15%" y="-15%" width="130%" height="150%"><feDropShadow dx="0" dy="2.6" stdDeviation="2.2" flood-color="#1A1206" flood-opacity=".5"/></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="1.4"/></filter>
</defs>`;
}

// ---------- the medallion (radius 128, origin at its centre) ----------
const MED = 128;
// A large setting sun, low in the gap between the peaks: the far ridge and the mountain slopes
// cover its lower part, so it peeks out from behind them.
const SUN = { x: 0, y: 28, r: 56 };
const BOOK_TOP = [[-76, 38], [-56, 26], [-24, 28], [0, 50]];
const BOOK_BOT = [[-76, 50], [-54, 40], [-24, 42], [0, 64]];

function sun(sunAt = SUN) {
  const { x, y, r } = sunAt;
  const rays = [];
  const n = COUNTS.rays, step = 15; // 8 rays fanned 15° apart, symmetric about the vertical
  for (let i = 0; i < n; i++) {
    const a = -step * (n - 1) / 2 + i * step;
    const t = `translate(${x} ${y}) rotate(${f2(a)}) translate(0 ${-(r + 27)})`;
    rays.push(`<path transform="${t}" d="${grain(32, 11)}" fill="${gold()}"/>`);
    rays.push(`<path transform="${t}" d="M0,-10.5 V10.5" stroke="${C.oldGold}" stroke-width="1" stroke-linecap="round"/>`);
  }
  return `<defs>
    <radialGradient id="sunGlow" cx="${x}" cy="${y}" r="${r * 2.3}" gradientUnits="userSpaceOnUse">
      <stop offset=".4" stop-color="#FFE7A0" stop-opacity=".55"/><stop offset=".7" stop-color="#F6C453" stop-opacity=".18"/><stop offset="1" stop-color="#F6C453" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sunFill" cx="${x - r * 0.25}" cy="${y - r * 0.3}" r="${r * 1.15}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFF6D2"/><stop offset=".45" stop-color="#FBD873"/><stop offset="1" stop-color="#EDA93A"/>
    </radialGradient>
  </defs>
  <circle cx="${x}" cy="${y}" r="${r * 2.3}" fill="url(#sunGlow)"/>
  <g${fx('raise')}>${rays.join('')}</g>
  <circle cx="${x}" cy="${y}" r="${r + 7}" fill="#FCE3A0" opacity=".35"/>
  <circle cx="${x}" cy="${y}" r="${r}" fill="url(#sunFill)"/>
  <circle cx="${x}" cy="${y}" r="${r - 0.6}" fill="none" stroke="#FFF3C9" stroke-width="1.2" stroke-opacity=".8"/>`;
}

// mountains sit closer in so their inner slopes cross in front of the sun
const MTN_SHIFT = 16;
const inward = (a) => a.map(([x, y]) => [x + MTN_SHIFT, y]);

function mountains() {
  const far = [[-150, 72], [-104, 44], [-72, 52], [-40, 41], [0, 47], [40, 41], [72, 52], [104, 44], [150, 72], [150, 150], [-150, 150]];
  const left = inward([[-170, 104], [-150, 30], [-136, 16], [-114, 0], [-92, -26], [-76, -4], [-58, 26], [-40, 60], [-22, 104]]);
  const lit = inward([[-92, -26], [-76, -4], [-58, 26], [-40, 60], [-22, 104], [-48, 104], [-60, 58], [-78, 14]]);
  const crease = inward([[-92, -26], [-96, 0], [-104, 26], [-108, 54]]);
  const crease2 = inward([[-114, 0], [-124, 26], [-128, 50]]);
  const rim = lit.slice(0, 5);
  return `<path d="M${pts(far)} Z" fill="${D3 ? 'url(#mtnFar)' : C.far}"/>
  <path d="M${pts(left)} Z M${pts(mir(left))} Z" fill="${D3 ? 'url(#mtnDark)' : C.mtn}"/>
  <path d="M${pts(lit)} Z M${pts(mir(lit))} Z" fill="${D3 ? 'url(#mtnLit)' : C.lit}"/>
  <path d="M${pts(crease)} M${pts(mir(crease))} M${pts(crease2)} M${pts(mir(crease2))}" fill="none" stroke="${D3 ? '#0B2416' : C.lit}" stroke-opacity="${D3 ? 0.55 : 1}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  ${D3 ? `<path d="M${pts(rim)} M${pts(mir(rim))}" fill="none" stroke="#FFD98A" stroke-opacity=".8" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="-150" y="18" width="300" height="52" fill="url(#haze)"/>` : ''}`;
}

function bridge() {
  const tx = 70, top = 2, sag = 32;
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
    return `<path d="M${x - 2.8},${f2(yb)} L${x - 2.1},${top - 3} L${x + 2.1},${top - 3} L${x + 2.8},${f2(yb)} Z" fill="${D3 ? 'url(#tower3d)' : C.cream}"/>
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
  return `<g${fx('drop')}><g fill="none" stroke="${C.cream}" stroke-linecap="round">
    <path d="M${-tx},${top} L-100,30 M${tx},${top} L100,30" stroke-width="1.4" stroke-opacity=".85"/>
    <polyline points="${cable.join(' ')}" stroke-width="2"/>
    <path d="${susp.join(' ')}" stroke-width="1"/>
  </g>
  <circle cx="-100" cy="30" r="2.2" fill="${C.sun}"/><circle cx="100" cy="30" r="2.2" fill="${C.sun}"/>
  <path d="M-83,44 C-58,33 -24,36 0,58 C24,36 58,33 83,44 L83,56 C58,46 24,49 0,72 C-24,49 -58,46 -83,56 Z" fill="${D3 ? 'url(#cover3d)' : C.wall}"/>
  <path d="M-83,56 C-58,46 -24,49 0,72 C24,49 58,46 83,56 L83,59 C58,49 24,52 0,75 C-24,52 -58,49 -83,59 Z" fill="${C.oldGold}"/>
  <path d="${page(BOOK_TOP, BOOK_BOT)}" fill="${D3 ? 'url(#pageL)' : C.cream}"/>
  <path d="${page(mir(BOOK_TOP), mir(BOOK_BOT))}" fill="${D3 ? 'url(#pageR)' : C.cream}"/>
  <path d="${edge(2.2)} ${edge(4.4)}" fill="none" stroke="${C.tick}" stroke-opacity=".6" stroke-width=".7"/>
  <path d="${lines}" fill="none" stroke="${C.field}" stroke-opacity=".45" stroke-width="1"/>
  <path d="M0,50 V64" stroke="${C.tick}" stroke-width="1.2"/>
  ${D3 ? '<path d="M-3,50 C-12,42 -26,36 -46,36" fill="none" stroke="#FFFFFF" stroke-opacity=".8" stroke-width="1"/>' : ''}
  ${tower(-tx)}${tower(tx)}</g>`;
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
    svg += `<path d="M${pts(top)} L${pts([...bottom].reverse())} Z" fill="${D3 ? 'url(#paddy)' : i % 2 ? '#D3A443' : '#DDAE4C'}"/>`;
    // retaining wall at the foot of each paddy, casting a soft shadow on the step below
    if (i < COUNTS.terraces - 1) {
      if (D3) svg += `<polyline points="${pts(curve(i + 1, 2))}" fill="none" stroke="#6E4C10" stroke-opacity=".45" stroke-width="3.5" filter="url(#soft)"/>`;
      svg += `<path d="M${pts(curve(i + 1, -4.6))} L${pts([...curve(i + 1)].reverse())} Z" fill="${D3 ? 'url(#wall3d)' : '#A97C22'}"/>`;
    }
    svg += `<polyline points="${pts(top)}" fill="none" stroke="${C.oldGold}" stroke-width="1.3"/>`;
    // water catching the light along each paddy
    svg += `<polyline points="${pts(curve(i, 2.6))}" fill="none" stroke="#F6D98A" stroke-opacity=".7" stroke-width=".8"/>`;
  }
  return svg;
}

const flagSky = (r) => `<path d="M0,${-r} A${r},${r} 0 0 0 0,${r} Z" fill="${D3 ? 'url(#skyBlue)' : C.flagBlue}"/><path d="M0,${-r} A${r},${r} 0 0 1 0,${r} Z" fill="${D3 ? 'url(#skyRed)' : C.flagRed}"/>`;

function medallionScene() {
  // the sky is split down the axis, as the flag hangs vertically in peacetime: blue left, red right
  return `${flagSky(140)}
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
  <g${fx('raise')}><g fill="${gold()}">${d}${dots}</g><g fill="${C.cream}">${eyes}</g>
  <circle r="${r0 + 0.6}" fill="none" stroke="${gold()}" stroke-width="1.2"/>
  <circle r="${r1 - 0.6}" fill="none" stroke="${gold()}" stroke-width="1.2"/></g>`;
}

function medallion(p) {
  return `<defs><clipPath id="${p}med"><circle r="${MED}"/></clipPath></defs>
  <g${fx('sink')}><g clip-path="url(#${p}med)">${medallionScene()}</g></g>
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
  <g fill="${gold()}">${grains.join('')}</g>
  <g stroke="${C.oldGold}" stroke-width=".8" stroke-linecap="round">${crease.join('')}</g>`;
}

// A classic banner: the front band carries the motto; its V-notched ends fold behind it.
function ribbon() {
  const rO = 190, rI = 162, rM = (rO + rI) / 2, drop = 7;
  const f0 = 180 - 57, f1 = 180 + 57; // front band
  const e0 = 180 - 71, e1 = 180 + 71; // ends of the folded pieces
  const arc = (r, b0, b1, sweep) => `A${r},${r} 0 0 ${sweep} ${pt(P(r, b1))}`;
  // a folded end piece, sitting lower (further out) than the band, with a notch at its tip
  const end = (s) => {
    const tip = s < 0 ? e0 : e1, inner = s < 0 ? f0 + 7 : f1 - 7;
    const o = rO + drop, i = rI + drop, m = rM + drop;
    const sw = s < 0 ? 0 : 1;
    return `M${pt(P(o, inner))} ${arc(o, inner, tip, sw)} L${pt(P(m, tip - s * 5))} L${pt(P(i, tip))} ${arc(i, tip, inner, 1 - sw)} Z`;
  };
  // the turn where the band folds back: a small shaded wedge at each end of the band
  const fold = (s) => {
    const b = s < 0 ? f0 : f1;
    return `M${pt(P(rO, b))} L${pt(P(rO + drop, b + s * 0.6))} L${pt(P(rI + drop, b + s * 0.6))} L${pt(P(rI, b))} Z`;
  };
  const band = `M${pt(P(rO, f0))} ${arc(rO, f0, f1, 1)} L${pt(P(rI, f1))} ${arc(rI, f1, f0, 0)} Z`;
  return `<g${fx('raise')}><path d="${end(-1)} ${end(1)}" fill="#C9952F"/>
  <path d="${fold(-1)} ${fold(1)}" fill="#8C6417"/>
  <path d="${band}" fill="${gold()}"/>
  <path d="M${pt(P(rO - 2.6, f0))} ${arc(rO - 2.6, f0, f1, 1)} M${pt(P(rI + 2.6, f0))} ${arc(rI + 2.6, f0, f1, 1)}" fill="none" stroke="${C.oldGold}" stroke-width=".9"/>
  ${mottoOnRibbon(rM, f1 - f0 - 12)}</g>`;
}

function stars() {
  return `<g fill="${gold()}"${fx('raise')}>${[-21, 0, 21]
    .map((a) => {
      const [x, y] = P(167, a);
      return `<path transform="translate(${f2(x)} ${f2(y)}) rotate(${a})" d="${star(9.5, 3.9)}"/>`;
    })
    .join('')}</g>`;
}

// ---------- type on the seal ----------
const NAME_STR = 'JOSE T. CUYOS SR. II INTEGRATED SCHOOL';
const MOTTO_STR = 'Together we bridge, together we succeed';
const BAND = (205 + 238.6) / 2; // centre line of the lettering band

// The name over the top and the year at the foot, both centred on the band.
function ringText() {
  const size = Math.min(20, fitArc(NAME, NAME_STR, BAND - 7, 164, FS.track));
  const base = BAND - (capHeight(NAME) * size) / 2;
  const est = 12.5, estBase = BAND + (capHeight(LABEL) * est) / 2;
  return `${arcText(NAME, NAME_STR, 0, 0, base, size, { tracking: FS.track, side: 'top', fill: C.cream })}
  ${arcText(LABEL, 'EST. 2012', 0, 0, estBase, est, { tracking: 0.42, side: 'bottom', fill: C.sun })}`;
}

// The motto in italic, centred on the ribbon's middle line.
function mottoOnRibbon(r, spanDeg) {
  const size = Math.min(16, fitArc(MOTTO, MOTTO_STR, r, spanDeg, 0.01));
  const base = r + (xHeight(MOTTO) * size) / 2;
  return arcText(MOTTO, MOTTO_STR, 0, 0, base, size, { tracking: 0.01, side: 'bottom', fill: C.forest });
}

// A twisted rope laid in a circle, like the cables of a hanging bridge.
function rope(R, w) {
  const n = Math.round((2 * Math.PI * R) / (w * 0.62));
  const strands = [], shades = [];
  for (let i = 0; i < n; i++) {
    const a = (i * 360) / n;
    const [x, y] = P(R, a);
    const t = `translate(${f2(x)} ${f2(y)}) rotate(${f2(a + 90 + 45)})`;
    strands.push(`<ellipse transform="${t}" rx="${f2(w * 0.74)}" ry="${f2(w * 0.31)}"/>`);
    shades.push(`<path transform="${t}" d="M${f2(-w * 0.6)},${f2(w * 0.12)} Q0,${f2(w * 0.3)} ${f2(w * 0.6)},${f2(w * 0.12)}"/>`);
  }
  const o = R + w / 2, i2 = R - w / 2;
  return `<g${fx('raise')}><defs><clipPath id="ropeClip"><path clip-rule="evenodd" d="M${-o},0 a${o},${o} 0 1 0 ${2 * o},0 a${o},${o} 0 1 0 ${-2 * o},0 Z M${-i2},0 a${i2},${i2} 0 1 0 ${2 * i2},0 a${i2},${i2} 0 1 0 ${-2 * i2},0 Z"/></clipPath></defs>
  <g clip-path="url(#ropeClip)">
    <circle r="${R}" fill="none" stroke="#7E5A14" stroke-width="${w}"/>
    <g fill="${gold()}" stroke="#8C6417" stroke-width=".7">${strands.join('')}</g>
    <g fill="none" stroke="#C9952F" stroke-width="1.2" stroke-linecap="round">${shades.join('')}</g>
  </g>
  <circle r="${o}" fill="none" stroke="#5E4310" stroke-width=".8"/><circle r="${i2}" fill="none" stroke="#5E4310" stroke-width=".8"/></g>`;
}

// ---------- the seal (radius 248, origin at centre) ----------
export function seal(p = 's') {
  const sideMark = (a) => {
    const [x, y] = P(221, a);
    const [ax, ay] = P(221, a - 4.2), [bx, by] = P(221, a + 4.2);
    return `<path d="${diamond(x, y, 4.2, 4.2)}" transform="rotate(${a} ${f2(x)} ${f2(y)})"/><circle cx="${f2(ax)}" cy="${f2(ay)}" r="1.5"/><circle cx="${f2(bx)}" cy="${f2(by)}" r="1.5"/>`;
  };
  return `<g>${defs3d()}
  <circle r="248" fill="${D3 ? 'url(#disc3d)' : C.forest}"/>
  <g${fx('raise')}>
    <circle r="${D3 ? 244.5 : 243}" fill="none" stroke="${gold()}" stroke-width="${D3 ? 6 : 2.2}"/>
    <circle r="238.6" fill="none" stroke="${gold()}" stroke-width="${D3 ? 1.1 : 0.7}" stroke-opacity=".9"/>
  </g>
  <g${fx('raiseText')}>${ringText()}</g>
  <g fill="${gold()}"${fx('raise')}>${sideMark(-90)}${sideMark(90)}</g>
  ${rope(197.5, 12)}
  <g${fx('raise')}>${palayStalk()}<g transform="scale(-1 1)">${palayStalk()}</g></g>
  ${stars()}
  ${medallion(p)}
  ${ribbon()}
  ${D3 ? '<circle r="248" fill="url(#rim)"/><circle r="248" fill="url(#gloss)"/>' : ''}
</g>`;
}

// Small-size mark: the sun, its rays and the book, nothing else.
function mark() {
  const s = sun({ x: 0, y: 30, r: 34 });
  return `<g>${defs3d()}
  <circle r="128" fill="${D3 ? 'url(#disc3d)' : C.forest}"/>
  <defs><clipPath id="mk"><circle r="120"/></clipPath></defs>
  <g${fx('sink')}><g clip-path="url(#mk)">${flagSky(120)}<g transform="translate(0 10) scale(1.08)">${s}
  <g${fx('drop')}><path d="M-86,48 C-60,34 -24,37 0,62 C24,37 60,34 86,48 L86,62 C60,50 24,53 0,78 C-24,53 -60,50 -86,62 Z" fill="${D3 ? 'url(#cover3d)' : C.sun}"/>
  <path d="M-80,42 C-58,29 -24,31 0,54 C24,31 58,29 80,42 L80,54 C58,43 24,46 0,68 C-24,46 -58,43 -80,54 Z" fill="${D3 ? 'url(#pageL)' : C.cream}"/>
  <path d="M0,54 V68" stroke="${C.oldGold}" stroke-width="2"/></g></g></g></g>
  <circle r="124" fill="none" stroke="${gold()}" stroke-width="${D3 ? 5 : 2}"${fx('raise')}/>
  ${D3 ? '<circle r="128" fill="url(#rim)" transform="scale(.516)"/><circle r="128" fill="url(#gloss)" transform="scale(.516)"/>' : ''}
</g>`;
}

// ---------- documents ----------
const doc = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>\n`;
const placeSeal = (x, y, size, p) => `<g transform="translate(${f2(x + size / 2)} ${f2(y + size / 2)}) scale(${f2((size / 500) * 10000) / 10000})">${seal(p)}</g>`;

function stacked(p) {
  const W = 1000, cx = 500, S = 460;
  const est = text(LABEL, 'EST. 2012', cx, 744, 15, { anchor: 'middle', tracking: 0.42, fill: C.oldGold });
  const rule = (x1, x2) => `<rect x="${f2(x1)}" y="737" width="${f2(x2 - x1)}" height="1.5" fill="${C.oldGold}"/>`;
  return doc(W, 880, `${placeSeal(cx - S / 2, 40, S, p)}
  ${text(NAME, 'Jose T. Cuyos Sr. II', cx, 618, 80, { anchor: 'middle', fill: C.forest }).svg}
  ${text(LABEL, 'INTEGRATED SCHOOL', cx, 672, 24, { anchor: 'middle', tracking: 0.42, fill: C.field }).svg}
  ${est.svg}${rule(cx - 190, cx - est.width / 2 - 22)}${rule(cx + est.width / 2 + 22, cx + 190)}
  ${text(MOTTO, MOTTO_STR, cx, 818, 34, { anchor: 'middle', fill: C.field }).svg}`);
}

function horizontal(p, reversed = false) {
  const W = 1320, H = 440, S = 340, x = 60 + S + 54;
  const ink = reversed ? C.cream : C.forest, sub = reversed ? C.sun : C.field, gold = reversed ? C.sun : C.oldGold;
  return doc(W, H, `${placeSeal(50, 50, S, p)}
  <rect x="${50 + S + 26}" y="104" width="1.5" height="232" fill="${gold}" opacity=".6"/>
  ${text(NAME, 'Jose T. Cuyos Sr. II', x, 204, 84, { fill: ink }).svg}
  ${text(LABEL, 'INTEGRATED SCHOOL', x + 3, 258, 23, { tracking: 0.42, fill: sub }).svg}
  <rect x="${x + 3}" y="289" width="48" height="1.5" fill="${gold}"/>
  ${text(LABEL, 'EST. 2012', x + 64, 295, 13, { tracking: 0.42, fill: gold }).svg}
  ${text(MOTTO, MOTTO_STR, x + 2, 344, 27, { fill: ink }).svg}`, reversed ? C.forest : null);
}

const build = (suffix) => ({
  [`seal${suffix}.svg`]: doc(500, 500, placeSeal(0, 0, 500, 's')),
  [`medallion${suffix}.svg`]: doc(280, 280, `<g transform="translate(140 140)">${defs3d()}<circle r="140" fill="${C.forest}"/>${medallion('m')}</g>`),
  [`mark${suffix}.svg`]: doc(256, 256, `<g transform="translate(128 128)">${mark()}</g>`),
  [`logo-stacked${suffix}.svg`]: stacked('st'),
  [`logo-horizontal${suffix}.svg`]: horizontal('hz'),
  [`logo-horizontal-reversed${suffix}.svg`]: horizontal('hr', true),
});
D3 = true;
const files = build('');
D3 = false;
Object.assign(files, build('-flat'));
fs.mkdirSync(path.join(out, 'svg'), { recursive: true });
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, 'svg', n), s);
console.log('wrote', Object.keys(files).join(', '));
