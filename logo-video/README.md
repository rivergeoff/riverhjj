# JTCSIIS — 3D Logo Showcase Video

`jtcsiis-logo-showcase.mp4` is a 16-second 1080p/30fps 3D presentation of the
Jose T. Cuyos Sr. II Integrated School seal, with a synthesized soundtrack.

**Shot list**

| Time | Shot |
| --- | --- |
| 0–3.4 s | Fade up from black; the coin flies in from the distance, spinning edge-on, through drifting gold dust |
| 3.4 s | Lands face-on with a light flare and impact hit |
| 3.4–6 s | Slow turn as studio reflections sweep across the gold relief |
| 6–9.6 s | Macro camera glides over the sun, bridge-and-book and “EST. 2012” |
| 9.6–12.9 s | Pull back, flip to the engraved gold reverse, flip back |
| 12.9–16 s | Hero pose: seal on the left, school name and motto animate in on the right; fade out |

## How it is made

Everything is generated from `logo.webp`; no 3D software is needed.

1. `make_textures.py` turns the flat logo into PBR maps: colour, a bump map
   (gold, white and orange artwork raised above the enamel) and
   roughness/metalness. It also draws the engraved gold reverse side.
2. `index.html` is a three.js scene: a coin with a bevelled lathe rim, reeded
   edge, studio softbox reflections, bloom, depth-of-field dust and a light
   grade. `window.renderAt(t)` draws any moment deterministically.
3. `render.mjs` drives headless Chromium (Playwright) to capture every frame.
4. `make_audio.py` synthesizes the score (pad, whooshes, impacts, bells) to
   the same timeline.

## Re-render

```bash
npm install
pip install pillow numpy fonttools brotli
mkdir -p fonts tex
python3 -c "from fontTools.ttLib import TTFont; import glob
m={'PlayfairDisplay-Italic':'playfair-display-latin-400-italic','PlayfairDisplay-Regular':'playfair-display-latin-400-normal','Montserrat-SemiBold':'montserrat-latin-600-normal'}
[ (lambda f:(setattr(f,'flavor',None),f.save('fonts/'+k+'.ttf')))(TTFont(glob.glob('node_modules/@fontsource/*/files/'+v+'.woff2')[0])) for k,v in m.items()]"
python3 make_textures.py logo.webp tex fonts
python3 make_audio.py score.wav
node render.mjs frames 30            # or: node render.mjs stills 30 3.4,7.6,15
ffmpeg -framerate 30 -i frames/f_%05d.png -i score.wav -c:v libx264 -preset slow \
  -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart \
  jtcsiis-logo-showcase.mp4
```

`render.mjs` imports Playwright from the global install path
(`/opt/node22/lib/node_modules`); change that line if yours lives elsewhere.
Timings, camera keys and title text all live near the bottom of `index.html`.
