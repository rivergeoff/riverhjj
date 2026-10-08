# YUGA — Ceremonial Matcha · product reel

A 30-second, 9:16 (1080×1920, 30 fps) cinematic product film for **YUGA 悠雅**, built entirely in code with [Remotion](https://remotion.dev) + three.js. No stock footage. Every frame and every sound is generated.

**Final file:** `out/yuga-reel.mp4`

## The edit

| # | Time | Shot | Copy |
|---|------|------|------|
| — | 0:00–0:04 | Darkness, a single shaft of light, dust motes. 悠雅 is brushed in top to bottom. | YUGA · *the art of slow* |
| 01 | 0:04–0:08 | **Shade.** A macro tea leaf with a dew drop, shallow depth of field, sun through shade cloth. | Grown in shade, *picked by hand.* |
| 02 | 0:08–0:13 | **Stone.** A 3D slow-motion burst of 16,000 matcha particles, backlit, with a dolly-out. | Stone-milled *to a fine whisper.* |
| 03 | 0:13–0:19 | **Ritual.** Top-down chawan. The chasen whisks in the classic M-stroke and the foam builds from coarse bubbles to fine microfoam. | Whisked, *never hurried.* |
| — | 0:19–0:25 | **Hero.** A 3D tin (clearcoat label, gold metal lid, studio lighting). The lid lifts and a puff of matcha escapes. | Ceremonial grade · A quiet ritual, *kept in a tin.* |
| — | 0:25–0:30 | **End card.** An ensō brush circle on washi paper, a hanko seal stamp, the wordmark. | YUGA · Ceremonial Matcha · *Slow is a flavour.* |

Finishing pass over the whole film: animated 35 mm grain, projector gate weave and flicker, light leaks on the cuts, and a vignette.

**Score** (`scripts/score.py`): an original piece synthesized in numpy. It has warm pads moving D→Bm→G→Em→A→D, koto-like Karplus-Strong plucks on a pentatonic melody, and foley synced to picture: a powder "poof", whisk swishes that follow the on-screen strokes, brush on paper, a seal thump, and temple bells. It runs through a convolution reverb.

## Commands

```bash
npm i
npm run dev                          # Remotion Studio preview
python3 scripts/score.py public/score.wav   # regenerate the soundtrack
npm run render                       # → out/yuga-reel.mp4
scripts/stills.sh 120 300 600        # quick preview stills
```

Copy, colors and fonts live in `src/theme.ts` and in each scene under `src/scenes/`. Scene lengths are set in `src/Reel.tsx`. If you change them, update `S` in `scripts/score.py` too.
