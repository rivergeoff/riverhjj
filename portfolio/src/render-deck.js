// Renders deck.html to per-slide PNG previews and a 1920x1080 PDF.
// Usage: node render-deck.js [--pdf] [slideNumbers...]
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const args = process.argv.slice(2);
const wantPdf = args.includes('--pdf');
const only = args.filter(a => /^\d+$/.test(a)).map(Number);
const outDir = path.join(__dirname, '..', 'preview');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(__dirname, 'deck.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const slides = await page.$$('section.slide');
  for (let i = 0; i < slides.length; i++) {
    if (only.length && !only.includes(i + 1)) continue;
    const file = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.jpg`);
    await slides[i].screenshot({ path: file, type: 'jpeg', quality: 88 });
  }
  console.log('previews:', slides.length);
  if (wantPdf) {
    await page.pdf({ path: path.join(__dirname, '..', 'Portfolio-Archive-Template.pdf'), width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
    console.log('pdf written');
  }
  await browser.close();
})();
