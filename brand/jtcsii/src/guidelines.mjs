// Builds ../guidelines.html (and ../png/guidelines.png) from the generated SVGs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
// Each inline copy needs unique ids, so suffix them per use.
let n = 0;
const svg = (f, cls = '') => {
  const tag = `u${n++}`;
  return fs.readFileSync(path.join(root, 'svg', f), 'utf8')
    .replace(/id="([^"]+)"/g, `id="$1${tag}"`)
    .replace(/url\(#([^)]+)\)/g, `url(#$1${tag})`)
    .replace(/ width="\d+" height="\d+"/, ` class="${cls}"`);
};

const swatches = [
  ['Deep Forest', '#0F2A1C', 'Primary dark · backgrounds, seal'],
  ['Field Green', '#2E5E3A', 'Sky, descriptors'],
  ['Sun Gold', '#F6C453', 'Sun, rice, woven band, terraces'],
  ['Old Gold', '#A97C22', 'Gold for small text on light grounds'],
  ['Paper Cream', '#FDF7E1', 'Pages, bridge, reversed type'],
];
const symbols = [
  ['The Sun', 'The light of learning. Its rays are drawn as grains of palay, honoring the harvest and the gold of Rosario.'],
  ['The Book as a Hanging Bridge', 'An open book forms the deck of a highland hanging bridge strung between the mountains: education connects learners to opportunity and to one another.'],
  ['The Mountains', 'Two sunlit peaks and a distant range stand for the upland community the school serves.'],
  ['The River & Pines', 'The valley and forest below the bridge: the life of the land the school belongs to.'],
  ['The Woven Band', 'A diamond pattern drawn from Cordillera weaving pays tribute to the school’s Indigenous learners and heritage.'],
  ['The Golden Terraces', 'Stepped rice terraces in gold: the land, its fields, and its mines, on which the school stands.'],
];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>JTCSII Brand Guidelines</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
:root{--forest:#0F2A1C;--field:#2E5E3A;--sun:#F6C453;--old:#A97C22;--cream:#FDF7E1;--ink:#1d2b22;--muted:#6b7a70;--line:#e3e6df;--bg:#fff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 "Instrument Sans",system-ui,sans-serif}
.wrap{max-width:1400px;margin:0 auto;padding:56px 48px 72px}
.eyebrow{font-size:12px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:var(--muted)}
header{display:flex;justify-content:space-between;align-items:baseline;gap:24px;flex-wrap:wrap;margin-bottom:28px}
header .motto{font:italic 34px/1 "Instrument Serif",serif;color:var(--field)}
.grid{display:grid;grid-template-columns:1fr 1.25fr;gap:28px}
.card{border:1px solid var(--line);padding:22px 24px;display:flex;flex-direction:column}
.card.dark{background:var(--forest);border-color:var(--forest)}.card.dark .eyebrow{color:#9fb3a5}
.card .art{flex:1;display:grid;place-items:center;padding:16px 0}
.stack{display:grid;gap:28px}
svg.stacked{width:min(100%,520px);height:auto}svg.hz{width:100%;height:auto}
.lower{display:grid;grid-template-columns:330px 1fr 1fr;gap:40px;margin-top:56px}
svg.seal{width:100%;height:auto}
h3{margin:0 0 2px;font-size:16px;font-weight:600}.sym p{margin:0 0 14px;color:#4a5a50}
.type .serif{font:72px/1 "Instrument Serif",serif;color:var(--forest);margin:18px 0 6px}
.type .sans{font:700 34px/1 "Instrument Sans",sans-serif;letter-spacing:.16em;white-space:nowrap;color:var(--field);margin:28px 0 6px}
.type small{color:var(--muted);letter-spacing:.04em}
.palette{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-top:16px}
.sw .chip{aspect-ratio:1;border-radius:4px;border:1px solid rgba(0,0,0,.06)}
.sw b{display:block;margin-top:10px;font-weight:600}.sw span{font-size:12px;letter-spacing:.08em;color:var(--muted)}.sw em{display:block;font-style:normal;font-size:12px;color:var(--muted)}
.scale{display:flex;align-items:flex-end;gap:28px;margin-top:20px;flex-wrap:wrap}
.scale svg{height:auto}
.rules{margin:18px 0 0;padding-left:18px;color:#4a5a50}
@media (max-width:980px){.grid,.lower{grid-template-columns:1fr}.palette{grid-template-columns:repeat(3,1fr)}.wrap{padding:32px 16px}}
</style></head><body><div class="wrap">
<header><div class="eyebrow">Brand Identity Guidelines · Jose T. Cuyos Sr. II Integrated School</div><div class="motto">Together we bridge, together we succeed</div></header>
<div class="grid">
  <div class="card"><div class="eyebrow">Primary Logo — Stacked</div><div class="art">${svg('logo-stacked.svg', 'stacked')}</div></div>
  <div class="stack">
    <div class="card"><div class="eyebrow">Secondary Logo — Horizontal</div><div class="art">${svg('logo-horizontal.svg', 'hz')}</div></div>
    <div class="card dark"><div class="eyebrow">Secondary Logo — Reversed</div><div class="art">${svg('logo-horizontal-reversed.svg', 'hz')}</div></div>
  </div>
</div>
<div class="lower">
  <div><div class="eyebrow">Official Seal</div><div style="margin-top:16px">${svg('seal.svg', 'seal')}</div>
    <div class="eyebrow" style="margin-top:36px">Circle Emblem</div><div style="margin-top:16px;width:180px">${svg('emblem-circle.svg', 'seal')}</div></div>
  <div class="sym"><div class="eyebrow" style="margin-bottom:16px">Symbolism</div>${symbols.map(([h, p]) => `<h3>${h}</h3><p>${p}</p>`).join('')}</div>
  <div>
    <div class="type"><div class="eyebrow">Typography</div><div class="serif">Instrument Serif</div><small>Primary typeface — school name, headings, motto (italic)</small>
    <div class="sans">INSTRUMENT SANS</div><small>Secondary typeface — descriptors, labels and body text</small></div>
    <div class="eyebrow" style="margin-top:44px">Scale and Legibility</div>
    <div class="scale">${[150, 96, 60, 36].map((w) => svg('emblem-arch.svg', '').replace('<svg ', `<svg style="width:${w}px" `)).join('')}</div>
    <ul class="rules"><li>Minimum size: 24 px / 8 mm wide for the emblem.</li><li>Below 36 px, use the emblem alone — no wordmark.</li><li>Clear space on all sides: the width of the sun.</li></ul>
  </div>
</div>
<div style="margin-top:56px"><div class="eyebrow">Color Palette — gold only, no copper</div>
<div class="palette">${swatches.map(([nm, hx, use]) => `<div class="sw"><div class="chip" style="background:${hx}"></div><b>${nm}</b><span>${hx}</span><em>${use}</em></div>`).join('')}</div></div>
</div></body></html>`;
fs.writeFileSync(path.join(root, 'guidelines.html'), html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1.5 });
await page.goto('file://' + path.join(root, 'guidelines.html'));
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'png', 'guidelines.png'), fullPage: true });
await browser.close();
console.log('wrote guidelines.html + png/guidelines.png');
