"""Builds a self-contained, live version of site.html (portfolio/website.html):
CSS inlined, a sticky header whose links scroll to each section, and the
1920px layout scaled to fit any screen width.
Run after gen-site.py: python3 build-web.py
"""
import re
from pathlib import Path

here = Path(__file__).parent
html = (here / 'site.html').read_text()
css = (here / 'formal.css').read_text() + '\n' + (here / 'site.css').read_text()

body = html[html.index('<body>') + 6:html.index('</body>')]

# lift the header out of the hero so it can stick to the top while scrolling
hdr = re.search(r'<header class="hdr">.*?</header>', body, re.S).group(0)
body = body.replace(hdr, '', 1)

extra = '''
:root { color-scheme: light; }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { background: #fbfaf7; overflow-x: hidden; }
#stage { width: 1920px; }
#stage .hdr { position: sticky; top: env(safe-area-inset-top, 0px); }
#stage .hero { margin-top: -96px; }
#stage section { scroll-margin-top: 96px; }
.hdr nav a:hover, .ftr a:hover { color: var(--ink); }
a.btn:hover { filter: brightness(1.08); }
a:focus-visible { outline: 2px solid var(--sage); outline-offset: 3px; border-radius: 6px; }
'''

fit = '''<script>
// scale the 1920px layout to the viewer's width
(() => {
  const stage = document.getElementById('stage');
  const fit = () => { stage.style.zoom = Math.min(1, document.documentElement.clientWidth / 1920); };
  fit(); addEventListener('resize', fit);
})();
</script>'''

out = f'''<title>River Jalalon Portfolio</title>
<style>
{css}
{extra}
</style>
<div id="stage">
{hdr}
{body}
</div>
{fit}
'''
(here.parent / 'website.html').write_text(out)
print('wrote portfolio/website.html', len(out), 'bytes')
