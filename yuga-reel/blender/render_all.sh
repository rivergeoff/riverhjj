#!/usr/bin/env bash
# Render every 3D shot at 720x1280, every other frame (interpolated to 30 fps in assemble.sh).
cd "$(dirname "$0")/.."
PY=${PY:-/root/bpyenv/bin/python}
while pgrep -f "shot_hero.py" >/dev/null; do sleep 20; done
for spec in "hero 189" "powder 149" "whisk 199" "leaves 149"; do
  set -- $spec
  $PY blender/shot_$1.py -- --frames 0 $2 --step 2 --samples 24 --scale 67 2>&1 | grep --line-buffered -E "RENDERED|Traceback|Error:"
done
echo ALL_DONE
