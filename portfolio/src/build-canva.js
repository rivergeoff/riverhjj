// Bakes deck.html into a single static HTML file for Canva's URL import:
// runs the page scripts, inlines deck.css, points asset URLs at the public repo
// and drops <script> tags. Output: ../canva/deck.html
// Usage: node build-canva.js <branch>
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const branch = process.argv[2] || 'main';
const assetBase = `https://raw.githubusercontent.com/rivergeoff/riverhjj/${branch}/portfolio/assets/`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(__dirname, 'deck.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.querySelectorAll('script').forEach(s => s.remove());
    // Canva's importer ignores <use> references, so inline every symbol (and the
    // gradient/pattern defs it needs) into the SVG that uses it.
    const defs = document.querySelector('svg defs');
    document.querySelectorAll('svg use').forEach(use => {
      const sym = document.querySelector(use.getAttribute('href'));
      const svg = use.closest('svg');
      if (!sym || !svg) return;
      if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', sym.getAttribute('viewBox'));
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      for (const a of ['fill', 'stroke', 'stroke-width']) if (use.getAttribute(a)) g.setAttribute(a, use.getAttribute(a));
      sym.childNodes.forEach(n => g.appendChild(n.cloneNode(true)));
      if (/url\(#/.test(sym.innerHTML) && defs) svg.insertBefore(defs.cloneNode(true), svg.firstChild);
      use.replaceWith(g);
    });
    const sprite = document.querySelector('body > svg[width="0"]');
    if (sprite) sprite.remove();
  });
  let html = await page.content();
  await browser.close();

  const css = fs.readFileSync(path.join(__dirname, 'deck.css'), 'utf8');
  html = html.replace(/<link rel="stylesheet" href="deck.css">/, `<style>\n${css}\n</style>`);
  html = html.split('../assets/').join(assetBase);

  const out = path.join(__dirname, '..', 'canva');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'deck.html'), html);
  console.log('wrote canva/deck.html', html.length, 'bytes');
})();
