"""Build the Sonder 9:16 reel from footage/ + shots.json.

  python3 build.py                # needs every clip listed in shots.json
  python3 build.py --placeholder  # stands in gradient clips for missing footage (pipeline test)

Output: sonder-reel.mp4 (1080x1920, 30 fps, H.264 High, AAC, -14 LUFS)
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE / "build"
W, H = 1080, 1920
SERIF = HERE / "fonts/instrument-serif-latin-400-normal.ttf"
SERIF_I = HERE / "fonts/instrument-serif-latin-400-italic.ttf"
SANS = Path("/usr/share/fonts/opentype/inter/Inter-Regular.otf")
SANS_L = Path("/usr/share/fonts/opentype/inter/Inter-Light.otf")
CREAM, INK, MATCHA = "F3EEE4", "2A2823", "5F6B47"

# Warm, soft, slightly faded "film" look
GRADE = (
    "eq=contrast=0.94:saturation=0.84:gamma=1.02,"
    "colorbalance=rs=0.035:gs=0.01:bs=-0.045:rm=0.02:bm=-0.02:rh=0.03:gh=0.01:bh=-0.035,"
    "curves=master='0/0.055 0.25/0.26 0.5/0.52 0.8/0.81 1/0.95'"
)


def run(cmd):
    print("$", " ".join(str(c) for c in cmd)[:200])
    subprocess.run([str(c) for c in cmd], check=True)


def esc(s):
    return s.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’")


def tracked(s):
    return " ".join(s.upper()) if s else s


def fade_alpha(t0, t1, fi=0.6, fo=0.5):
    return f"if(lt(t,{t0}),0,if(lt(t,{t0 + fi}),(t-{t0})/{fi},if(lt(t,{t1 - fo}),1,if(lt(t,{t1}),({t1}-t)/{fo},0))))"


def placeholder(path, dur, i):
    hues = ["c9b48a", "8f9d6b", "b7c48f", "e3d6bb", "a89878", "d8c8a6"]
    run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i",
         f"gradients=s=1920x1080:r=60:d={dur}:c0=0x{hues[i % 6]}:c1=0x{INK}:speed=0.02:type=radial",
         "-vf", "noise=alls=12:allf=t", "-c:v", "libx264", "-crf", "18", path])


def prep_shot(i, s, fps, use_placeholder):
    src = HERE / s["file"]
    speed = s.get("speed", 1.0)
    dur = s["duration"]
    if not src.exists():
        if not use_placeholder:
            sys.exit(f"missing footage: {src}  ({s['find']})")
        src = BUILD / f"ph{i}.mp4"
        placeholder(src, s["start"] + dur * speed + 1, i)
    out = BUILD / f"shot{i}.mp4"
    # cover-fit, gentle per-frame push-in (lanczos keeps it sub-pixel smooth), grade
    zoom = f"(1+0.055*t/{dur})" if i % 2 == 0 else f"(1.055-0.055*t/{dur})"
    vf = (
        f"setpts=(PTS-STARTPTS)/{speed},fps={fps},"
        f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},"
        f"scale=w='trunc({W}*{zoom}/2)*2':h=-2:eval=frame:flags=lanczos,crop={W}:{H},"
        f"{GRADE},format=yuv420p"
    )
    run(["ffmpeg", "-y", "-v", "error", "-ss", s["start"], "-i", src, "-t", dur, "-an",
         "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", "10", out])
    return out


def endcard(ec, fps):
    out = BUILD / "endcard.mp4"
    d = ec["duration"]
    txt = [
        f"drawtext=fontfile={SERIF}:text='{esc(ec['wordmark'])}':fontsize=210:fontcolor=0x{INK}"
        f":x=(w-text_w)/2:y=h*0.40:alpha='{fade_alpha(0.35, d + 1, 1.0)}'",
        f"drawtext=fontfile={SANS_L}:text='{esc(tracked(ec['line']))}':fontsize=34:fontcolor=0x{MATCHA}"
        f":x=(w-text_w)/2:y=h*0.40+250:alpha='{fade_alpha(0.9, d + 1, 0.9)}'",
        f"drawbox=x=(iw-120)/2:y=ih*0.40+330:w=120:h=2:color=0x{MATCHA}@0.6:t=fill:enable='gte(t,1.2)'",
        f"drawtext=fontfile={SERIF_I}:text='{esc(ec['cta'])}':fontsize=54:fontcolor=0x{INK}"
        f":x=(w-text_w)/2:y=h*0.40+380:alpha='{fade_alpha(1.5, d + 1, 0.9)}'",
    ]
    vf = (f"noise=alls=5:allf=t,vignette=angle=PI/9,{','.join(txt)},format=yuv420p")
    run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", f"color=c=0x{CREAM}:s={W}x{H}:r={fps}:d={d}",
         "-vf", vf, "-c:v", "libx264", "-crf", "10", out])
    return out


def main():
    cfg = json.loads((HERE / "shots.json").read_text())
    fps, xf = cfg["fps"], cfg["crossfade"]
    BUILD.mkdir(exist_ok=True)
    shots = cfg["shots"]
    clips = [prep_shot(i, s, fps, "--placeholder" in sys.argv) for i, s in enumerate(shots)]
    clips.append(endcard(cfg["endcard"], fps))
    durs = [s["duration"] for s in shots] + [cfg["endcard"]["duration"]]

    # Crossfade chain + timeline positions of each shot
    parts, starts, acc, prev = [], [0.0], durs[0], "0:v"
    for k in range(1, len(clips)):
        last = k == len(clips) - 1
        d = 1.0 if last else xf
        off = acc - d
        starts.append(off)
        parts.append(f"[{prev}][{k}:v]xfade=transition={'fadeblack' if last else 'fade'}:duration={d}:offset={off}[x{k}]")
        prev = f"x{k}"
        acc = off + durs[k]
    total = acc

    # Captions + small top wordmark during the footage section
    over = []
    for i, s in enumerate(shots):
        if s.get("caption"):
            t0, t1 = starts[i] + 0.45, starts[i] + s["duration"] - 0.25
            over.append(
                f"drawtext=fontfile={SERIF_I}:text='{esc(s['caption'])}':fontsize=84:fontcolor=0x{CREAM}"
                f":shadowcolor=0x000000@0.35:shadowx=0:shadowy=2:x=(w-text_w)/2:y=h*0.74"
                f":alpha='{fade_alpha(t0, t1)}'")
    foot_end = starts[-1]
    over.append(
        f"drawtext=fontfile={SANS}:text='{tracked('sonder')}':fontsize=30:fontcolor=0x{CREAM}"
        f":shadowcolor=0x000000@0.3:shadowy=1:x=(w-text_w)/2:y=h*0.075:alpha='0.9*{fade_alpha(0.3, foot_end + 0.3, 1.0, 0.6)}'")
    vchain = (f"[{prev}]{','.join(over)},noise=alls=6:allf=t,vignette=angle=PI/5,"
              f"unsharp=3:3:0.3,format=yuv420p[v]")

    score = BUILD / "score.wav"
    run([sys.executable, HERE / "score.py", score, round(total, 3)])

    inputs = sum((["-i", c] for c in clips), []) + ["-i", score]
    fc = ";".join(parts + [vchain, f"[{len(clips)}:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]"])
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
         "-t", round(total, 3), "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-r", fps, "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart",
         HERE / "sonder-reel.mp4"])
    print(f"done: sonder-reel.mp4  ({total:.1f}s)")


if __name__ == "__main__":
    main()
