// Renders the procedural textures in scene.html to PNG files in ../assets.
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const out = path.join(__dirname, '..', 'assets');
const jobs = [
  ['bg-hill', 'kind=hill&w=1920&h=1080&seed=11'],
  ['bg-field', 'kind=field&w=1920&h=1080&seed=5'],
  ['paper-cream', 'kind=paper&w=1920&h=1080&color=%23ede6d6&seed=3'],
  ['paper-bone', 'kind=paper&w=1920&h=1080&color=%23f4f0e6&seed=4&grain=0.05'],
  ['paper-olive', 'kind=paper&w=1200&h=1200&color=%2378785c&seed=8'],
  ['paper-slate', 'kind=paper&w=1200&h=1200&color=%238a95a3&seed=9'],
  ['paper-caramel', 'kind=paper&w=1200&h=1200&color=%23a87b4f&seed=10'],
  ['paper-charcoal', 'kind=paper&w=1920&h=1080&color=%2326261f&seed=12&fibre=%23fff&grain=0.05'],
  ['paper-sage', 'kind=paper&w=1200&h=1200&color=%23b4b59a&seed=13'],
  ['paper-kraft', 'kind=paper&w=1200&h=1200&color=%23c4a57c&seed=14'],
  ['felt-brown', 'kind=felt&w=1200&h=1400&color=%235a3a2a&seed=15'],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [name, qs] of jobs) {
    const [w, h] = [qs.match(/w=(\d+)/)[1], qs.match(/h=(\d+)/)[1]].map(Number);
    await page.setViewportSize({ width: w, height: h });
    await page.goto('file://' + path.join(__dirname, 'scene.html') + '?' + qs);
    await page.waitForFunction(() => document.title === 'done');
    await page.locator('#c').screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 86 });
    console.log('rendered', name);
  }
  await browser.close();
})();
