// Builds <take>/guidelines.html (+ png/guidelines.png) for the seal-based takes (3 and 4).
// Run: node guidelines-seal.mjs take-3 | take-4
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const take = process.argv[2] ?? 'take-3';
const root = path.resolve(here, '..', take);
let n = 0;
const svg = (f, cls = '', style = '') => {
  const tag = `u${n++}`;
  return fs.readFileSync(path.join(root, 'svg', f), 'utf8')
    .replace(/id="([^"]+)"/g, `id="$1${tag}"`)
    .replace(/url\(#([^)]+)\)/g, `url(#$1${tag})`)
    .replace(/ width="\d+" height="\d+"/, ` class="${cls}" style="${style}"`);
};

const baseMeaning = [
  ['13', 'Rays of palay', 'Kindergarten plus Grades 1 to 12: every level of the integrated K–12 school rises from the same sun. Drawn as grains of palay for the harvest and the gold of Rosario.'],
  ['2', 'Mountain peaks', 'The elementary and secondary departments: two schools that became one integrated school.'],
  ['1', 'Book-bridge', 'An open book is the deck of a highland hanging bridge between the two peaks. Education joins the levels and carries learners across to opportunity: together we bridge.'],
  ['4', 'Rice terraces', 'The four DepEd core values, Maka-Diyos, Maka-tao, Makakalikasan and Makabansa, built step by step like terraces in the valley the school serves.'],
  ['3', 'Stars', 'Learners, teachers, and parents with the community: the three who succeed together.'],
];
const woven = ['The woven ring', 'A Cordillera-style diamond weave encircles the scene: the school’s Indigenous learners and heritage hold everything together.'];

// Per-take settings: type, story, and the construction geometry (seal space 500×500, centre 250,250).
const CONFIGS = {
  'take-3': {
    label: 'Take 3 · Ani ng Liwanag',
    fonts: 'family=Montserrat:wght@500;600;700&family=Cormorant+Garamond:ital,wght@1,600&family=Plus+Jakarta+Sans:wght@400;500;700',
    display: '"Cormorant Garamond",serif', formal: '"Montserrat",sans-serif',
    lede: 'A formal school seal in the Philippine tradition, where every element and every count stands for something about the school.',
    extraSwatches: [['Flag Blue', '#0038A8', 'Left half of the medallion'], ['Flag Red', '#CE1126', 'Right half of the medallion']],
    swatchUse: { 'Field Green': 'Mountains, descriptors' },
    extraRules: [
      'Choose the version by where it will appear. <b>3D</b> (<code>seal.svg</code>): screens, social media, full-colour print. <b>Flat</b> (<code>*-flat</code>): signage, tarpaulins, embroidery in several colours. <b>One colour</b> (<code>*-mono</code> black, <code>*-mono-green</code> forest): letterheads, memos, certificates, anything that will be photocopied, rubber stamps and engraving.',
      'In one colour the flag\u2019s blue and red are shown by heraldic hatching, horizontal lines for blue and vertical lines for red, so the meaning survives without colour.',
      'Below 1 inch (about 96 px), use the mark instead of the full seal.',
    ],
    colorTitle: 'Forest and gold, with the flag at its heart',
    meaning: [
      ['8', 'Rays of the sun', 'A great sun settling behind the peaks, with the eight rays of the flag\u2019s sun reaching to the rim: the light of learning, rising where the flag\u2019s blue and red meet, split as the flag hangs vertically in peacetime (blue left, red right).'],
      ['2', 'Mountain peaks', 'A far-flung school in the uplands, and its two departments, elementary and secondary, integrated into one.'],
      ['1', 'Book-bridge', 'An open book is the deck of a highland hanging bridge between the two peaks: education reaches learners even in the mountains and carries them across to opportunity. Together we bridge.'],
      ['4', 'Rice terraces', 'The four DepEd core values, Maka-Diyos, Maka-tao, Makakalikasan and Makabansa, built step by step like terraces in the valley the school serves.'],
      ['13', 'Grains on each stalk', 'Kindergarten plus Grades 1 to 12: every level of the integrated K–12 school, carried by the palay wreath.'],
    ],
    parts: [
      ['Gold', 'The gold of Rosario, its mines and its livelihood, in the sun, the wreath, the terraces and every line of the seal.'],
      ['The woven band', 'A strip of hand-woven cloth in the red, black, white and yellow of Philippine indigenous weaving, drawn stitch by stitch: human figures with raised arms for the people and their community, stepped diamond \u201ceyes\u201d for protection, and sawtooth borders. It honours the school\u2019s Indigenous Peoples learners and holds the whole scene together.'],
      ['The rope', 'A ring of twisted rope, the cable of a highland hanging bridge, holding the whole scene together.'],
      ['Place & year', 'Rosario, Agusan del Sur arcs over the top of the inner band and the founding year, 2012, sits at its foot: where the school stands, and since when. Gold ornaments mark the band between the name and the motto.'],
    ],
    construct: { rings: [127, 140, 157, 175, 193, 243], sunY: 270, rayLen: 145, rays: { n: 8, start: -70, step: 20 }, starFrom: [250, 250], starAngles: [], starLen: 0, note: '8 rays at 20° intervals (±10°, ±30°, ±50°, ±70°), each reaching the rim of the medallion; woven band r 127–140, palay wreath r 157, rope r 175–193, outer rim r 243.' },
    type: [
      ['<div class="s2" style="font-weight:700;letter-spacing:0;font-size:40px">MONTSERRAT</div>', 'Name & year · Bold', 'A bold geometric sans for the school name around the seal, the year beneath the scene, and the name in the logos. On the 3D seal it is set as raised lettering with depth and shadow.'],
      ['<div class="s1" style="font-style:italic;font-weight:600">Together we bridge</div>', 'Motto · Italic', 'Cormorant Garamond Semibold Italic, a calligraphic voice for the motto at the foot of the seal and beside the logos; Bold Italic in the one-colour version so it survives photocopying.'],
      ['<div class="s2" style="font-weight:600;font-size:30px">INTEGRATED SCHOOL</div>', 'Labels · Semibold', 'Montserrat Semibold, widely spaced, for the location, \u201cIntegrated School\u201d and \u201cEst. 2012\u201d.'],
    ],
    noBodyCard: true,
  },
  'take-4': {
    label: 'Take 4 · Gintong Liwanag',
    fonts: 'family=Cormorant+Garamond:ital,wght@0,600;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;700',
    display: '"Cormorant Garamond",serif', formal: '"Cormorant Garamond",serif',
    lede: 'An engraved gold-foil seal: a guilloché border, line-engraved shading and metallic gold, with the same meaning built into every element and every count.',
    meaning: [...baseMeaning, ['13', 'Grains on each stalk', 'Two stalks of palay grow up out of the terraces, each carrying thirteen grains: the same thirteen levels as the rays. What the light of learning gives, the community harvests.']],
    parts: [
      ['The rising sun', 'A young school, founded 2012, still rising. Its face is engraved in fine rings, like a struck medal.'],
      woven,
      ['The guilloché border', 'The interlaced lines found on banknotes and diplomas: a seal made to be trusted, and hard to copy.'],
      ['20 · 12', 'The founding year flanks the seal at left and right, where the name and the motto meet.'],
    ],
    construct: { rings: [170, 182.5, 185.5, 222, 233, 244.5], sunY: 236.7, rayLen: 100, starFrom: [250, 236.7], starAngles: [-17, 0, 17], starLen: 134, note: '13 rays at 12.5° intervals across 150°; stars at 17° intervals around the sun; concentric rings at r 170 · 182.5 · 185.5 · 222 · 233 · 244.5.' },
    type: [
      ['<div class="s1">Cormorant Garamond</div>', 'Display · Name & motto', 'A high-contrast Garamond with sharp, calligraphic detail. Bold for the school name, italic for the motto.'],
      ['<div class="s2">CORMORANT CAPS</div>', 'Formal · Seal & descriptor', 'The same family in widely spaced capitals for the seal ring and “Integrated School”: one voice, two registers.'],
    ],
  },
};
const cfg = CONFIGS[take];

function construction() {
  const k = cfg.construct, cx = 250, cy = 250;
  const rings = k.rings.map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('');
  const ray = (x0, y0, deg, len) => {
    const a = (deg * Math.PI) / 180;
    return `<line x1="${x0}" y1="${y0}" x2="${(x0 + len * Math.sin(a)).toFixed(1)}" y2="${(y0 - len * Math.cos(a)).toFixed(1)}"/>`;
  };
  const r = k.rays ?? { n: 13, start: -75, step: 12.5 };
  const rays = Array.from({ length: r.n }, (_, i) => ray(250, k.sunY, r.start + i * r.step, k.rayLen)).join('');
  const stars = k.starAngles.map((d) => ray(k.starFrom[0], k.starFrom[1], d, k.starLen)).join('');
  return `<svg viewBox="0 0 500 500" class="construct" aria-hidden="true">
  <g fill="none" stroke="#E0533D" stroke-width=".8" opacity=".9">${rings}</g>
  <g stroke="#E0533D" stroke-width=".7" stroke-dasharray="3 3">${rays}${stars}</g>
  <line x1="0" y1="250" x2="500" y2="250" stroke="#E0533D" stroke-width=".6" stroke-dasharray="2 4"/>
  <line x1="250" y1="0" x2="250" y2="500" stroke="#E0533D" stroke-width=".6" stroke-dasharray="2 4"/>
  <circle cx="250" cy="${k.sunY}" r="3" fill="#E0533D"/>
</svg>`;
}

const meaning = cfg.meaning;
const parts = cfg.parts;
const swatches = [
  ['Deep Forest', '#0F2A1C', 'Seal ground, primary text'],
  ['Field Green', '#2E5E3A', 'Sky, descriptors'],
  ['Sun Gold', '#F6C453', 'Sun, palay, ribbon, terraces'],
  ['Old Gold', '#A97C22', 'Gold for small text on light grounds'],
  ['Paper Cream', '#FDF7E1', 'Pages, bridge, reversed text'],
];

const palette = [...swatches.slice(0, 4), ...(cfg.extraSwatches ?? []), swatches[4]].map(([n, h, u]) => [n, h, cfg.swatchUse?.[n] ?? u]);

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>JTCSII Brand Guidelines</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${cfg.fonts}&display=swap" rel="stylesheet">
<style>
:root{--display:${cfg.display};--formal:${cfg.formal};--forest:#0F2A1C;--field:#2E5E3A;--sun:#F6C453;--old:#A97C22;--cream:#FDF7E1;--ink:#16241b;--muted:#5f6f64;--line:#e6e2d3;--paper:#FBF8EE}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.6 "Plus Jakarta Sans",system-ui,sans-serif}
.wrap{max-width:1400px;margin:0 auto;padding:64px 56px 80px}
.eyebrow{font:700 11px/1 "Plus Jakarta Sans",sans-serif;letter-spacing:.3em;text-transform:uppercase;color:var(--old)}
h1{font:400 64px/1 var(--display);letter-spacing:-.02em;margin:14px 0 8px;color:var(--forest)}
h1 em{font-style:italic;color:var(--field)}
.lede{max-width:640px;color:var(--muted);font-size:16px;margin:0}
h2{font:400 34px/1.1 var(--display);margin:8px 0 22px;color:var(--forest);letter-spacing:-.01em}
section{margin-top:72px}
.hero{display:grid;grid-template-columns:1.05fr 1fr;gap:28px;margin-top:40px}
.panel{background:#fff;border:1px solid var(--line);border-radius:4px;padding:28px;display:flex;flex-direction:column}
.panel.dark{background:var(--forest);border-color:var(--forest)}.panel.dark .eyebrow{color:var(--sun)}
.panel .art{flex:1;display:grid;place-items:center;padding:18px 0}
.stack{display:grid;gap:28px}
svg.stacked{width:min(100%,480px);height:auto}svg.hz{width:100%;height:auto}
.numbers{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid var(--line)}
.num{padding:26px 26px 28px 0;border-bottom:1px solid var(--line)}
.num:not(:nth-child(3n)){border-right:1px solid var(--line);margin-right:0}.num:not(:nth-child(3n+1)){padding-left:26px}
.num b{display:block;font-variant-numeric:lining-nums;font:400 76px/1 var(--display);color:var(--field);letter-spacing:-.03em}
.num h3{font:400 15px/1.2 var(--formal);letter-spacing:.2em;text-transform:uppercase;margin:12px 0 8px;color:var(--forest)}
.num p{margin:0;color:var(--muted);font-size:14px}
.anatomy{display:grid;grid-template-columns:520px 1fr;gap:56px;align-items:center}
.figure{position:relative}.figure svg{display:block;width:100%;height:auto}.figure .construct{position:absolute;inset:0}
.parts h3{font:400 15px/1.2 var(--formal);letter-spacing:.18em;text-transform:uppercase;margin:0 0 6px;color:var(--forest)}
.parts p{margin:0 0 22px;color:var(--muted)}
.legend{font-size:13px;color:#b8432f;margin-top:10px}
.family{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;align-items:end}
.family figure{margin:0;text-align:center}.family figcaption{margin-top:14px;font-size:13px;color:var(--muted)}
.type{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:28px}
.spec{background:#fff;border:1px solid var(--line);border-radius:4px;padding:28px}
.spec .s1{font:500 52px/1.05 var(--display);color:var(--forest);letter-spacing:-.02em}
.spec .s2{font:400 46px/1 var(--formal);letter-spacing:.14em;color:var(--field)}
.spec .s3{font:700 40px/1 "Plus Jakarta Sans",sans-serif;color:var(--forest);letter-spacing:-.01em}
.spec h3{font:700 12px/1 "Plus Jakarta Sans";letter-spacing:.22em;text-transform:uppercase;color:var(--old);margin:22px 0 6px}
.spec p{margin:0;color:var(--muted);font-size:14px}
.palette{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px}
.sw .chip{aspect-ratio:4/5;border-radius:4px;border:1px solid rgba(0,0,0,.06);display:flex;align-items:flex-end;padding:14px;font:700 12px "Plus Jakarta Sans";letter-spacing:.12em}
.sw b{display:block;margin-top:12px;font:400 20px var(--display)}.sw span{font-size:12px;letter-spacing:.1em;color:var(--muted)}.sw em{display:block;font-style:normal;font-size:13px;color:var(--muted)}
.scale{display:flex;align-items:flex-end;gap:32px;flex-wrap:wrap}
.rules{margin:18px 0 0;padding-left:18px;color:var(--muted)}
@media (max-width:1000px){.hero,.anatomy,.type{grid-template-columns:1fr}.numbers{grid-template-columns:1fr}.num{border-right:0!important;padding-left:0!important}.family,.palette{grid-template-columns:repeat(2,1fr)}.wrap{padding:36px 16px}h1{font-size:44px}}
</style></head><body><div class="wrap">
<div class="eyebrow">Brand Identity Guidelines · ${cfg.label}</div>
<h1>Jose T. Cuyos Sr. II <em>Integrated School</em></h1>
<p class="lede">${cfg.lede}</p>

<div class="hero">
  <div class="panel"><div class="eyebrow">Primary Logo · Stacked</div><div class="art">${svg('logo-stacked.svg', 'stacked')}</div></div>
  <div class="stack">
    <div class="panel"><div class="eyebrow">Secondary Logo · Horizontal</div><div class="art">${svg('logo-horizontal.svg', 'hz')}</div></div>
    <div class="panel dark"><div class="eyebrow">Secondary Logo · Reversed</div><div class="art">${svg('logo-horizontal-reversed.svg', 'hz')}</div></div>
  </div>
</div>

<section><div class="eyebrow">Symbolism</div><h2>Meaning, in numbers</h2>
<div class="numbers">${meaning.map(([b, h, p]) => `<div class="num"><b>${b}</b><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></section>

<section class="anatomy">
  <div><div class="figure">${svg('seal.svg')}${construction()}</div>
  <div class="legend">Construction: ${cfg.construct.note}</div></div>
  <div class="parts"><div class="eyebrow">Anatomy of the Seal</div><h2>Built like an heirloom</h2>
  ${parts.map(([h, p]) => `<h3>${h}</h3><p>${p}</p>`).join('')}</div>
</section>

<section><div class="eyebrow">Logo Family</div><h2>One seal, three sizes of voice</h2>
<div class="family">
  <figure>${svg('seal.svg', '', 'width:100%;height:auto')}<figcaption>Official seal: documents, certificates, signage</figcaption></figure>
  <figure>${svg('medallion.svg', '', 'width:86%;height:auto')}<figcaption>Medallion: merchandise, uniforms, social media</figcaption></figure>
  <figure>${svg('mark.svg', '', 'width:62%;height:auto')}<figcaption>Mark: app icons, favicons, anything under 48 px</figcaption></figure>
  <figure><div class="scale" style="justify-content:center;gap:14px;flex-wrap:nowrap">${[120, 72, 40, 24].map((w) => svg('mark.svg', '', `width:${w}px;height:auto`)).join('')}</div><figcaption>Mark at 120 · 72 · 40 · 24 px</figcaption></figure>
</div></section>

<section><div class="eyebrow">Typography</div><h2>Three voices, one hierarchy</h2>
<div class="type">
  ${cfg.type.map(([sample, h, p]) => `<div class="spec">${sample}<h3>${h}</h3><p>${p}</p></div>`).join('')}
  ${cfg.noBodyCard ? '' : `<div class="spec"><div class="s3">Plus Jakarta Sans</div><h3>Text · Labels & body</h3><p>A clear contemporary sans for body copy, labels and small details such as “EST. 2012”.</p></div>`}
</div></section>

<section><div class="eyebrow">Color</div><h2>${cfg.colorTitle ?? 'Forest and gold, nothing else'}</h2>
<div class="palette">${palette.map(([nm, hx, use]) => `<div class="sw"><div class="chip" style="background:${hx};color:${['#F6C453', '#FDF7E1'].includes(hx) ? '#0F2A1C' : '#FDF7E1'}">${hx}</div><b>${nm}</b><em>${use}</em></div>`).join('')}</div>
<ul class="rules"><li>Keep the seal on Deep Forest, Paper Cream or white. Never place it on photos without a solid backing.</li><li>Clear space around every logo: at least the diameter of the sun.</li><li>Minimum sizes: seal 96 px / 25 mm, medallion 48 px, mark 16 px.</li>${(cfg.extraRules ?? []).map((r) => `<li>${r}</li>`).join('')}</ul></section>
</div></body></html>`;
fs.writeFileSync(path.join(root, 'guidelines.html'), html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1.5 });
await page.goto('file://' + path.join(root, 'guidelines.html'));
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'png', 'guidelines.png'), fullPage: true });
await browser.close();
console.log(`wrote ${take}/guidelines.html + png/guidelines.png`);
