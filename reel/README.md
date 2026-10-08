# Sonder reel

A 9:16 reel (~20 s) for **Sonder Matcha Slow Bar**: "moments between moments".

Six slow, natural shots get a warm film grade, grain, gentle push-ins, crossfades
and Instrument Serif captions. They end on a cream brand card with an "order ahead"
call to action, scored with an original ambient pad and felt-piano track
(`score.py`, so there is no music licensing to worry about).

## Make it

1. Download the six clips described in `shots.json` (`find` field). Use Pexels or
   Mixkit (free for commercial use), vertical or 4K, 50/60 fps where possible.
   Save them as the `file` names in `reel/footage/`.
2. Adjust `start` (in-point, in seconds), `duration`, `speed` and `caption` per shot.
3. `pip install numpy scipy && python3 build.py`, then open `sonder-reel.mp4`.

`python3 build.py --placeholder` renders with stand-in gradients, to preview the
type and timing.
