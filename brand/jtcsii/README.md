# Jose T. Cuyos Sr. II Integrated School: logo suite

Redesigned identity: gold only (no copper), a more detailed emblem, and a seal whose
centre is a full circle.

- `svg/`: master artwork with all text converted to outlines (no fonts needed)
  - `logo-stacked.svg`: primary logo
  - `logo-horizontal.svg`, `logo-horizontal-reversed.svg`: secondary logos
  - `emblem-arch.svg`, `emblem-circle.svg`: the emblem alone
  - `seal.svg`: official seal
- `png/`: 2× renders of the above, plus `guidelines.png`
- `guidelines.html`: brand guidelines board

## Take 2: "Radiant" (`take-2/`)

A more unified version of the same story. Every curve is a circle around the sun: its halo,
the bridge's main cable, the rice terraces and the woven border are all concentric. Colours
are flat and line weights are consistent, and the scene is simpler (no river, pines or
gradients). The same files as above, plus one-colour emblems (`emblem-mono-forest.svg`,
`emblem-mono-cream.svg`) for stamps, embroidery and single-ink print.

## Take 3: the chosen seal (`take-3/`)

The final seal for Jose T. Cuyos Sr. II Integrated School, Rosario, Agusan del Sur. Every
version comes from `src/take3.mjs`:

| Version | Files | Use for |
| --- | --- | --- |
| 3D | `seal.svg`, `logo-*.svg`, `mark.svg` | screens, social media, full-colour print |
| Flat | `*-flat.svg` | signage, tarpaulins, multi-colour embroidery |
| One colour, black | `*-mono.svg` | letterheads, memos, certificates, photocopies, stamps, engraving |
| One colour, green | `*-mono-green.svg` | single-ink print and embroidery in forest green |
| Blank | `seal-blank*.svg` | the seal with no lettering, for setting text by hand |

`png/*-3000px.png` are large transparent exports of the seal in each version. In one colour the
flag's blue and red are shown by heraldic hatching (blue horizontal, red vertical).

## Take 4: "Gintong Liwanag" (Golden Light) (`take-4/`)

The same meanings as Take 3, made as an engraved gold-foil seal: a guilloché border,
line-engraved sun and mountains, metallic gold, palay growing up out of the terraces, and the
motto set in the ring. Set in Cormorant Garamond and Plus Jakarta Sans. Same file set as Take 3.

To regenerate all four takes: `cd src && npm install && npm run build`.

## Teaser video (`jtcsii-teaser.mp4`, source in `video/`)

A 37-second, 1920×1080 logo reveal: a cold open, the seal assembling element by element with
captions on each meaning, the full seal forming, a showcase of the logo system, and an end card,
with synthesized sound design. It is a Remotion project that animates the seal's own layers.

```
cd video && npm install
npm run assets   # export the seal's layers (../src/layers.mjs) and synthesize public/sound.wav
npm run dev      # preview in Remotion Studio
npm run render   # write out/teaser.mp4
```

