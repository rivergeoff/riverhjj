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

## Take 3: "Ani ng Liwanag" (Harvest of Light) (`take-3/`)

A formal school seal in the Philippine tradition. Every element and every count has a meaning:
13 palay rays (Kindergarten + Grades 1–12), 2 peaks (elementary + secondary), 1 book-bridge,
4 terraces (the DepEd core values), 3 stars (learners, teachers, community), and 13 grains on each
palay stalk. Set in Fraunces, Marcellus and Plus Jakarta Sans. Files: `seal.svg` (primary),
`medallion.svg`, `mark.svg` (small sizes), plus stacked, horizontal and reversed lockups.

To regenerate all three takes: `cd src && npm install && npm run build`.
