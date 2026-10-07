"""Generates site.html (website edition) from formal.html.

Each deck slide's content becomes a stacked, linkable website section; a
header with in-page navigation, a hero and a footer are added around them.
Run: python3 gen-site.py
"""
import re
from pathlib import Path

here = Path(__file__).parent
src = (here / 'formal.html').read_text()

sprite = src[src.index('<svg width="0"'):src.index('</svg>', src.index('<svg width="0"')) + 6]
script = src[src.index('<script>'):src.index('</script>') + 9]
blocks = re.split(r'<!-- ============ (\d\d) · [^=]+ ============ -->', src)
slides = {int(blocks[i]): blocks[i + 1] for i in range(1, len(blocks), 2)}

def inner(n):
    body = slides[n][:slides[n].index('</section>')]
    body = re.sub(r'<div class="eyebrow">\d\d · ', '<div class="eyebrow">', body)
    a = body.index('<div class="main">') + len('<div class="main">')
    b = body.rindex('</div></div>')
    return body[a:b]

# (slide, id, label, alt background, header group)
SECTIONS = [
    (3, 'about', 'About', False, 'about'),
    (4, 'services', 'Services', True, 'services'),
    (5, 'packages', 'Packages', False, 'services'),
    (6, 'work', 'Selected work', True, 'work'),
    (7, 'social-media', 'Social media', False, 'work'),
    (8, 'carousels', 'Carousels', True, 'work'),
    (9, 'reels', 'Reels & checkout videos', False, 'work'),
    (10, 'brand-videos', 'Brand videos', True, 'work'),
    (11, 'instagram', 'Instagram layout', False, 'work'),
    (12, 'case-study', 'Case study', True, 'work'),
    (13, 'calendar', 'Content calendar', False, 'process'),
    (14, 'workflow', 'Workflow', True, 'process'),
    (15, 'brand-kit', 'Brand kit', False, 'work'),
    (16, 'campaigns', 'Campaigns', True, 'work'),
    (17, 'archive', 'More work', False, 'work'),
    (18, 'get-in-touch', 'Contact', True, 'contact'),
]
NAV = [('about', 'About'), ('services', 'Services'), ('work', 'Work'), ('calendar', 'Process'), ('get-in-touch', 'Contact')]
GROUP_TO_NAV = {'about': 'about', 'services': 'services', 'work': 'work', 'process': 'calendar', 'contact': 'get-in-touch'}

def header(active=None):
    links = ''.join(f'<a href="#{i}"{" class=\"on\"" if i == active else ""}>{t}</a>' for i, t in NAV)
    return f'''<header class="hdr">
    <a class="brand" href="#home"><span class="av" style="width:38px;height:38px;font-size:20px">R</span>River Jalalon</a>
    <nav>{links}</nav>
    <a class="btn pri" href="#get-in-touch" style="height:44px">Let's talk <svg class="ico" width="16" height="16"><use href="#i-arrow"/></svg></a>
  </header>'''

hero = f'''<section class="site-sec hero" id="home" data-document-role="page" data-label="Home">
  {header()}
  <div class="abs" style="left:250px;top:250px;width:760px">
    <div class="eyebrow">Social media &amp; brand content · Davao City, PH</div>
    <div class="h1" style="margin-top:26px">Content people <i>choose to stay with.</i></div>
    <div class="lead" style="margin-top:32px;max-width:620px">I'm River — a psychology graduate and former Editor-in-Chief who designs, writes and edits social content, brand videos and campaigns built on how people actually think and scroll.</div>
    <div class="flex" style="gap:12px;margin-top:44px">
      <a class="btn pri" href="#work">View work <svg class="ico" width="18" height="18"><use href="#i-arrow"/></svg></a>
      <a class="btn" href="#packages">See packages</a>
    </div>
    <div class="flex" style="gap:56px;margin-top:64px;padding-top:28px;border-top:1px solid var(--line)">
      <div><div class="serif" style="font-size:44px">1.7s</div><div class="small">a post's window to earn a pause</div></div>
      <div><div class="serif" style="font-size:44px">2019</div><div class="small">writing &amp; editing since</div></div>
      <div><div class="serif" style="font-size:44px">10</div><div class="small">featured projects</div></div>
    </div>
  </div>
  <div class="abs" style="left:1130px;top:180px;width:560px;height:800px">
    <div class="card abs" style="left:0;top:40px;width:320px;padding:12px;transform:rotate(-3deg)"><div class="ph sand" style="height:400px">Featured work</div><div class="small" style="margin-top:10px">Social media design</div></div>
    <div class="card abs" style="left:240px;top:150px;width:300px;padding:12px;transform:rotate(3deg)"><div class="ph sage" style="height:370px">Featured work</div><div class="small" style="margin-top:10px">Brand kit</div></div>
    <div class="card abs" style="left:60px;top:520px;width:420px;padding:12px"><div class="ph slate" style="height:180px">Brand video · 16:9</div></div>
    <div class="toast" style="left:330px;top:0;width:320px">
      <div class="ibox" style="background:var(--sage);color:#fff"><svg width="20" height="20"><use href="#i-spark"/></svg></div>
      <div><div style="font-size:15px;font-weight:600">Available for projects</div><div class="small">Replies within two working days</div></div>
    </div>
  </div>
</section>
'''

parts = [hero]
for n, sid, label, alt, group in SECTIONS:
    body = inner(n)
    foot = ''
    if sid == 'get-in-touch':
        links = ''.join(f'<a href="#{i}">{t}</a>' for i, t in NAV)
        foot = f'<div class="ftr"><span>© 2026 River Jalalon</span>{links}<a class="sp" href="#home">Back to top ↑</a></div>'
    parts.append(f'''<section class="site-sec{' alt' if alt else ''}" id="{sid}" data-document-role="page" data-label="{label}">
  <div class="idx">{label}</div>
  <div class="wrap">{body}</div>
  {foot}
</section>
''')

html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>River Jalalon — Portfolio Website</title>
<link rel="stylesheet" href="formal.css">
<link rel="stylesheet" href="site.css">
</head>
<body>
{sprite}

{''.join(parts)}
{script}
</body>
</html>
'''
(here / 'site.html').write_text(html)
print('wrote site.html with', len(parts), 'sections')
