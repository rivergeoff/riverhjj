// Usage: node render.mjs <outDir> [fps] [t1,t2,...]   (times given => stills only)
import { createRequire } from 'module';
import http from 'http';
import fs from 'fs';
import path from 'path';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const root = path.dirname(new URL(import.meta.url).pathname);
const [outDir, fpsArg, timesArg] = process.argv.slice(2);
const fps = Number(fpsArg || 30);
fs.mkdirSync(outDir, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
}).listen(8765);

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[err]', e.message));
await page.goto('http://localhost:8765/index.html');
await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
await page.evaluate(() => document.fonts.ready);

const times = timesArg ? timesArg.split(',').map(Number)
  : Array.from({ length: Math.round(await page.evaluate('window.DURATION') * fps) }, (_, i) => i / fps);
const t0 = Date.now();
for (let i = 0; i < times.length; i++) {
  await page.evaluate(t => window.renderAt(t), times[i]);
  const name = timesArg ? `still_${times[i].toFixed(2)}.png` : `f_${String(i).padStart(5, '0')}.png`;
  await page.screenshot({ path: path.join(outDir, name), clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  if (i % 30 === 0) console.log(`frame ${i}/${times.length}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
server.close();
