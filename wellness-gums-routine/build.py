head=open('../gums3/index.html').read().split('<body>')[0]
BL=' style="border-bottom:1px solid rgba(236,232,225,.3)"'
BD=' style="border-bottom:1px solid rgba(43,36,32,.2)"'
def S(i,inner,style=''): return '<section class="s" style="left:%dpx;%s">%s</section>\n'%(i*1080,style,inner)
def rowsL(items): return ''.join('<div class="rowl"%s><span class="n" style="opacity:.7">0%d</span><span class="b" style="color:var(--lt)">%s</span></div>'%(BL if k==len(items)-1 else '',k+1,t) for k,t in enumerate(items))
def rowsD(items): return ''.join('<div class="row"%s><span class="n" style="color:var(--muted)">0%d</span><span class="b">%s</span></div>'%(BD if k==len(items)-1 else '',k+1,t) for k,t in enumerate(items))
cl=['Brush twice a day for two minutes','Clean between your teeth daily','Spit, don’t rinse','A dental check-up in the last year']
checks=''.join('<div class="row"%s><span class="box"></span><span class="b">%s</span></div>'%(BD if k==3 else '',t) for k,t in enumerate(cl))
body='''<body><div id="strip" style="width:8640px">
<div style="position:absolute;left:1080px;top:0;width:1080px;height:1350px;background:var(--olive)"></div>
<div style="position:absolute;left:2160px;top:0;width:110px;height:1350px;background:var(--olive)"></div>
<div style="position:absolute;left:3240px;top:0;width:1080px;height:1350px;background:var(--blush)"></div>
<div style="position:absolute;left:5400px;top:0;width:1080px;height:1350px;background:var(--blush)"></div>
<div style="position:absolute;left:6480px;top:0;width:1080px;height:1350px;background:var(--esp)"></div>
<div style="position:absolute;left:7560px;top:0;width:110px;height:1350px;background:var(--esp)"></div>
<div style="position:absolute;left:0;top:1200px;width:8640px;height:1px;background:rgba(43,36,32,.18)"></div>
'''
body+=S(0,'''<div style="position:absolute;left:540px;top:0;width:540px;height:1350px;background:var(--taupe)"></div>
<div class="lbl" style="left:80px">The Wellness</div><div class="lbl" style="left:300px;color:var(--muted)">Journal, No. 04</div>
<div class="h" style="top:300px;left:80px;width:430px;font-size:70px">The most underrated part of your morning routine.</div>
<div style="position:absolute;top:820px;left:80px;width:400px;font-size:28px;font-weight:300;font-style:italic;color:var(--muted)">Hint: it’s not your skincare.</div>
<div class="src" style="left:80px;color:var(--muted)">October 2026</div><div class="pg" style="right:auto;left:440px;color:var(--muted)">01</div>''')
body+=S(1,'''<div class="lbl" style="opacity:.75">The answer</div>
<div class="h" style="top:300px;font-size:150px;width:880px">Your gums.</div>
<div class="b" style="position:absolute;top:720px;left:90px;width:680px;color:var(--lt)">We give our skin minutes and our gums seconds. Yet they’re a quiet part of the bigger picture of your health.</div>
<div class="pg" style="opacity:.75">02</div>''','color:var(--ivory)')
body+=S(2,'''<div class="lbl" style="left:190px;color:var(--muted)">Good to know</div>
<div class="h" style="top:240px;left:190px;width:820px;font-size:80px">What healthy gums look like.</div>
<div style="position:absolute;top:560px;left:190px;width:800px">%s</div>
<div class="src" style="left:190px;color:var(--muted)">NHS</div><div class="pg" style="color:var(--muted)">03</div>'''%rowsD(['Pink and firm','Snug around your teeth','No bleeding when you brush']))
body+=S(3,'''<div class="lbl" style="color:var(--muted)">If you’ve noticed</div>
<div class="h" style="top:300px;width:880px;font-size:100px">A little pink in the sink?</div>
<div class="b" style="position:absolute;top:640px;left:90px;width:680px">It’s common, and usually easy to turn around with a few small habits.</div>
<div class="src" style="color:var(--muted)">NHS</div><div class="pg" style="color:var(--muted)">04</div>''')
body+=S(4,'''<div class="lbl" style="color:var(--muted)">The bigger picture</div>
<div class="h" style="top:300px;width:880px;font-size:80px">Caring for your gums is caring for you.</div>
<div class="b" style="position:absolute;top:640px;left:90px;width:700px">Gum specialists and heart specialists have been studying how oral health and heart health relate. Looking after your gums is one simple, everyday way to look after yourself.</div>
<div class="src" style="color:var(--muted);width:800px">European Federation of Periodontology &amp; World Heart Federation. Sanz et al., 2020</div><div class="pg" style="color:var(--muted)">05</div>''')
body+=S(5,'''<div class="lbl" style="color:var(--muted)">A quick routine check</div>
<div class="h" style="top:240px;width:880px;font-size:80px">How many do you already do?</div>
<div style="position:absolute;top:500px;left:90px;width:900px">%s</div>
<div style="position:absolute;top:1040px;left:90px;font-size:34px;font-weight:400">Comment your score out of 4.</div>
<div class="src" style="color:var(--muted)">NHS</div><div class="pg" style="color:var(--muted)">06</div>'''%checks)
body+=S(6,'''<div class="lbl" style="opacity:.7">Small upgrades</div>
<div class="h" style="top:240px;width:880px;font-size:80px">Small upgrades, big difference.</div>
<div style="position:absolute;top:560px;left:90px;width:900px">%s</div>
<div class="pg" style="opacity:.7">07</div>'''%rowsL(['Try small interdental brushes.','Ask your dentist to check your gums, not just your teeth.','Book a hygienist visit if it’s been a while.']),'color:var(--ivory)')
body+=S(7,'''<div class="lbl" style="left:190px;color:var(--muted)">Coming soon</div>
<div class="h" style="top:300px;left:190px;width:820px;font-size:90px">Dentistry is coming to The Wellness.</div>
<div class="b" style="position:absolute;top:720px;left:190px;width:640px">Save this for your routine, and share it with someone who’d find it useful.</div>
<div class="src" style="left:190px;color:var(--olive)">thewellnesslondon.com</div><div class="pg" style="color:var(--muted)">08</div>''')
body+='</div></body></html>'
open('index.html','w').write(head+body)
