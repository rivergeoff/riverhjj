// Exports the 3D seal as separate, aligned layers (transparent PNGs, 1600 px square) plus the
// finished logo files, for the reveal video in ../video. Run: node layers.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import {
  setMode, defs3d, sunParts, flagSky, mountains, terraces, bridge, wovenRing, palayStalk, rope,
  ornament, sealTextParts, MED, ROPE, ORNAMENT_AT,
} from './take3.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const take3 = path.resolve(here, '../take-3/svg');
const outDir = path.resolve(here, '../video/public');
const SIZE = 1600;

setMode(true);
const raise = (body) => `<g filter="url(#raise)">${body}</g>`;
// layers inside the medallion share its clip and the scene's offset
const scene = (body, { shift = true } = {}) =>
  `<defs><clipPath id="med"><circle r="${MED}"/></clipPath></defs><g clip-path="url(#med)">${shift ? `<g transform="translate(0 -8)">${body}</g>` : body}</g>`;
const sun = sunParts();
const text = sealTextParts();

const layers = {
  disc: '<circle r="248" fill="url(#disc3d)"/>',
  rim: raise('<circle r="244.5" fill="none" stroke="url(#gold3d)" stroke-width="6"/><circle r="238.6" fill="none" stroke="url(#gold3d)" stroke-width="1.1" stroke-opacity=".9"/>'),
  ornaments: ornament(-ORNAMENT_AT) + ornament(ORNAMENT_AT),
  rope: rope(ROPE.R, ROPE.w),
  palayL: raise(palayStalk()),
  palayR: raise(`<g transform="scale(-1 1)">${palayStalk()}</g>`),
  medBack: `<circle r="${MED}" fill="#0B2014"/>`,
  sky: scene(flagSky(140), { shift: false }),
  sunGlow: scene(sun.defs + sun.glow),
  ...Object.fromEntries(sun.rays.map((r, i) => [`ray${i}`, scene(raise(r))])),
  sunDisc: scene(sun.defs + sun.disc),
  mountains: scene(mountains()),
  ...Object.fromEntries([0, 1, 2, 3].map((i) => [`terrace${i}`, scene(terraces(i))])),
  bridge: scene(`<g transform="translate(0 40) scale(1.12) translate(0 -40)">${bridge()}</g>`),
  medShade: `<defs><filter id="edge" x="-5%" y="-5%" width="110%" height="110%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b"/><feOffset in="b" dx="2" dy="3" result="o"/>
    <feComposite in="SourceAlpha" in2="o" operator="out" result="e"/>
    <feFlood flood-color="#000" flood-opacity=".6"/><feComposite in2="e" operator="in"/></filter></defs>
    <circle r="${MED}" fill="#000" filter="url(#edge)"/>`,
  weave: wovenRing(),
  name: text.name,
  place: text.place,
  year: text.year,
  motto: text.motto,
  gloss: '<circle r="248" fill="url(#rim)"/><circle r="248" fill="url(#gloss)"/>',
};

const wrap = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-250 -250 500 500" width="${SIZE}" height="${SIZE}">${defs3d()}${body}</svg>`;

// finished files reused in the showcase: [source, output name, width px]
const finished = [
  ['seal.svg', 'seal.png', 1600],
  ['seal-flat.svg', 'seal-flat.png', 1000],
  ['seal-mono.svg', 'seal-mono.png', 1000],
  ['seal-mono-green.svg', 'seal-mono-green.png', 1000],
  ['logo-horizontal.svg', 'logo-horizontal.png', 2640],
  ['logo-horizontal-reversed.svg', 'logo-horizontal-reversed.png', 2640],
  ['mark.svg', 'mark.png', 800],
];

fs.mkdirSync(path.join(outDir, 'layers'), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
const shoot = async (svg, w, h, file) => {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`);
  await page.screenshot({ path: file, omitBackground: true });
};
for (const [name, body] of Object.entries(layers)) {
  await shoot(wrap(body), SIZE, SIZE, path.join(outDir, 'layers', `${name}.png`));
}
for (const [src, dst, w] of finished) {
  const svg = fs.readFileSync(path.join(take3, src), 'utf8');
  const [, vw, vh] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const h = Math.round((w * vh) / vw);
  await shoot(svg.replace(/ width="\d+" height="\d+"/, ` width="${w}" height="${h}"`), w, h, path.join(outDir, dst));
}
await browser.close();
// the lockups carry empty canvas on the right; trim them so they centre on screen
for (const f of ['logo-horizontal.png', 'logo-horizontal-reversed.png']) {
  const file = path.join(outDir, f);
  execFileSync('convert', [file, '-trim', '+repage', '-bordercolor', 'none', '-border', '24', file]);
}
console.log(`wrote ${Object.keys(layers).length} layers and ${finished.length} logo files to ${outDir}`);
