// Bakes deck.html into a single static HTML file for Canva's URL import:
// runs the page scripts, inlines deck.css, points asset URLs at the public repo,
// and swaps every inline SVG (which Canva's importer drops) for a transparent PNG.
// Output: ../canva/deck.html and ../canva/img/*.png
// Usage: node build-canva.js <branch-or-commit>
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const ref = process.argv[2] || 'main';
const repoBase = `https://raw.githubusercontent.com/rivergeoff/riverhjj/${ref}/portfolio/`;
const DECK = process.env.DECK || 'deck';
const outDir = path.join(__dirname, '..', 'canva');
const imgName = DECK === 'deck' ? 'img' : `img-${DECK}`;
const imgDir = path.join(outDir, imgName);

(async () => {
  fs.rmSync(imgDir, { recursive: true, force: true });
  fs.mkdirSync(imgDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(__dirname, `${DECK}.html`), { waitUntil: 'networkidle' });

  const svgs = await page.evaluate(() => {
    document.querySelectorAll('script').forEach(s => s.remove());
    const defs = document.querySelector('svg defs');
    // inline <use> symbols so each SVG is self-contained
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
    document.querySelector('body > svg[width="0"]')?.remove();

    // replace each remaining SVG with an <img> placeholder, keeping its box styles
    const list = [];
    document.querySelectorAll('svg').forEach((svg, i) => {
      const cs = getComputedStyle(svg);
      const w = parseFloat(cs.width), h = parseFloat(cs.height);
      const clone = svg.cloneNode(true);
      clone.removeAttribute('class');
      clone.setAttribute('style', `display:block;width:${w}px;height:${h}px;overflow:visible;color:${cs.color};fill:${cs.fill};stroke:${cs.stroke};stroke-width:${cs.strokeWidth}`);
      clone.setAttribute('width', w); clone.setAttribute('height', h);
      list.push({ i, w, h, markup: clone.outerHTML });
      const img = document.createElement('img');
      img.setAttribute('src', `__IMG__svg-${i}.png`);
      if (svg.getAttribute('class')) img.setAttribute('class', svg.getAttribute('class'));
      img.setAttribute('style', (svg.getAttribute('style') || '') + `;width:${w}px;height:${h}px;display:block`);
      if (!svg.closest('.abs, .ico, .cursor') && cs.position === 'static') img.style.display = 'inline-block';
      svg.replaceWith(img);
    });
    return list;
  });

  let html = await page.content();

  // render each SVG on a transparent page at 2x
  const shot = await browser.newPage({ deviceScaleFactor: 2 });
  for (const s of svgs) {
    const pad = 8;
    await shot.setViewportSize({ width: Math.ceil(s.w) + pad * 2, height: Math.ceil(s.h) + pad * 2 });
    await shot.setContent(`<html><body style="margin:0;padding:${pad}px;background:transparent">${s.markup}</body></html>`);
    await shot.locator('svg').screenshot({ path: path.join(imgDir, `svg-${s.i}.png`), omitBackground: true });
  }
  await browser.close();

  // inline every local stylesheet the page links to
  html = html.replace(/<link rel="stylesheet" href="([\w.-]+\.css)">/g,
    (_, f) => `<style>\n${fs.readFileSync(path.join(__dirname, f), 'utf8')}\n</style>`);
  html = html.split('../assets/').join(repoBase + 'assets/');
  html = html.split('__IMG__').join(repoBase + `canva/${imgName}/`);
  fs.writeFileSync(path.join(outDir, `${DECK}.html`), html);
  console.log(`wrote canva/${DECK}.html with`, svgs.length, 'svg images');
})();
