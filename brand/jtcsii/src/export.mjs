// Exports one SVG to a large transparent PNG. Run: node export.mjs <svg> <png> <width-px>
import fs from 'node:fs';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const [src, dst, px] = process.argv.slice(2);
const svg = fs.readFileSync(src, 'utf8');
const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
const scale = Number(px) / Number(w);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: scale });
await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`);
await page.screenshot({ path: dst, omitBackground: true });
await browser.close();
console.log('wrote', dst);
