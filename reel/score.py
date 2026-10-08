"""Original ambient score for the Sonder reel: warm pad + soft felt-piano notes.

Usage: python3 score.py out.wav seconds
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
out, dur = sys.argv[1], float(sys.argv[2])
n = int(SR * dur)
t = np.arange(n) / SR
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, f):
    return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)


# Fmaj9 → Am7 → Dm9 → Cmaj7(add9), one chord per bar
chords = [[41, 53, 57, 60, 64, 67], [45, 52, 55, 60, 64], [38, 53, 57, 60, 64], [36, 52, 55, 59, 62]]
bar = dur / 4

pad = np.zeros((2, n))
for i, chord in enumerate(chords):
    start, end = i * bar - 0.6, (i + 1) * bar + 1.2
    m = (t >= max(start, 0)) & (t < min(end, dur))
    tt = t[m] - start
    env = np.minimum(1, tt / 1.8) * np.minimum(1, (end - start - tt) / 1.6)
    for note in chord:
        for ch, det in ((0, -0.06), (1, 0.06)):
            f = hz(note) * 2 ** (det / 12)
            ph = rng.uniform(0, 2 * np.pi)
            v = np.sin(2 * np.pi * f * tt + ph) + 0.25 * np.sin(4 * np.pi * f * tt + ph) + 0.08 * np.sin(6 * np.pi * f * tt)
            pad[ch, m] += v * env * (0.6 if note < 45 else 0.35)
pad = np.stack([lowpass(c, 1400) for c in pad])
pad *= 1 + 0.08 * np.sin(2 * np.pi * 0.17 * t)  # slow breathing swell

# Sparse felt-piano melody (time in seconds as fraction of bar, midi)
melody = [(0.25, 72), (0.75, 69), (1.25, 76), (1.6, 72), (2.2, 74), (2.6, 69), (3.0, 71), (3.35, 67), (3.7, 72)]
piano = np.zeros((2, n))
for pos, note in melody:
    s = int(pos * bar * SR)
    L = min(n - s, int(4.5 * SR))
    if L <= 0:
        continue
    tt = np.arange(L) / SR
    f = hz(note)
    v = sum(a * np.sin(2 * np.pi * f * k * tt) * np.exp(-tt * (1.1 + k * 0.9)) for k, a in ((1, 1), (2, 0.35), (3, 0.12), (4, 0.05)))
    v *= np.minimum(1, tt / 0.008)
    pan = 0.5 + 0.25 * np.sin(note)
    piano[0, s:s + L] += v * (1 - pan) * 0.55
    piano[1, s:s + L] += v * pan * 0.55
piano = np.stack([lowpass(c, 2600) for c in piano])

# Soft room air / tape hiss
air = np.stack([lowpass(rng.standard_normal(n), 900) for _ in range(2)]) * 0.025

mix = pad * 0.22 + piano * 0.5 + air
# Simple stereo reverb: a few long feedback delays
for d, g in ((0.071, 0.45), (0.113, 0.38), (0.167, 0.32), (0.241, 0.25)):
    k = int(d * SR)
    for ch in range(2):
        k2 = k + (37 if ch else 0)
        wet = np.zeros(n)
        wet[k2:] = mix[ch, :-k2] * g
        mix[ch] += lowpass(wet, 3000)

fade = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 2.5)
mix *= fade
mix /= np.abs(mix).max() / 0.8
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
