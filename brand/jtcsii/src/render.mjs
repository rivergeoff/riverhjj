// Renders every SVG in ../svg to a 2x PNG in ../png using the preinstalled Chromium.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const svgDir = path.resolve(here, '../svg');
const pngDir = path.resolve(here, '../png');
fs.mkdirSync(pngDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
for (const f of fs.readdirSync(svgDir).filter((f) => f.endsWith('.svg'))) {
  const svg = fs.readFileSync(path.join(svgDir, f), 'utf8');
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  await page.setViewportSize({ width: +w, height: +h });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`);
  await page.screenshot({ path: path.join(pngDir, f.replace('.svg', '.png')), omitBackground: true });
}
await browser.close();
console.log('rendered to', pngDir);
