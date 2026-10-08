#!/usr/bin/env bash
# Turn rendered frames (every 2nd frame, 720x1280) into 30 fps 1080x1920 clips in public/shots.
# Motion-compensated interpolation for camera moves, plain frame blending for particle shots.
set -e
cd "$(dirname "$0")/.."
mkdir -p public/shots
grade="eq=contrast=1.04:saturation=1.05,curves=master='0/0.012 0.25/0.23 0.75/0.77 1/0.98'"
for shot in "${@:-hero powder whisk leaves}"; do
  for s in $shot; do
    case $s in
      powder) interp="minterpolate=fps=30:mi_mode=blend" ;;
      whisk) interp="fps=30" ;;
      *) interp="minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" ;;
    esac
    ffmpeg -y -loglevel error -framerate 15 -pattern_type glob -i "renders/$s/*.png" \
      -vf "$interp,tpad=stop_mode=clone:stop_duration=1,scale=1080:1920:flags=lanczos,unsharp=5:5:0.45,$grade,format=yuv420p" \
      -c:v libx264 -preset slow -crf 14 -an "public/shots/$s.mp4"
    echo "assembled $s"
  done
done
