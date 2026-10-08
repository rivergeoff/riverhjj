#!/usr/bin/env bash
# Render preview stills for the given frames into out/stills, then a contact sheet.
set -e
cd "$(dirname "$0")/.."
npx remotion bundle src/index.ts --out-dir=build >/dev/null 2>&1
for f in "$@"; do
  npx remotion still build YugaReel out/stills/f$f.jpg --frame=$f --scale=0.5 --log=error >/dev/null 2>&1 &
  while [ "$(jobs -r | wc -l)" -ge 4 ]; do sleep 0.5; done
done
wait
