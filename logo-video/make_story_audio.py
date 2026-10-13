"""Synthesize the score for the 36 s brand-story video (story.html timeline)."""
import sys
import wave

import numpy as np

SR, DUR = 48000, 36.0
n = int(SR * DUR)
t = np.arange(n) / SR
rng = np.random.default_rng(11)
L = np.zeros(n)
R = np.zeros(n)


def env(a, b, c, d):
    return np.clip(np.minimum((t - a) / max(b - a, 1e-6), (d - t) / max(d - c, 1e-6)), 0, 1)


def add(sig, pan=0.0, gain=1.0):
    global L, R
    L += sig * gain * np.sqrt(0.5 * (1 - pan))
    R += sig * gain * np.sqrt(0.5 * (1 + pan))


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


def onepole(x, cut):
    """Vectorised-enough one-pole lowpass (fixed cutoff) via IIR in chunks."""
    a = 1 - np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y


# ---- Pad: a slow chord progression that brightens as the seal comes together
prog = [(0.0, 8.0, [50, 57, 62, 66, 69]),        # D
        (7.5, 15.0, [47, 54, 59, 62, 66]),       # Bm
        (14.5, 21.5, [43, 50, 55, 59, 62, 66]),  # Gmaj7
        (21.0, 28.6, [45, 52, 57, 61, 64, 69]),  # A (lift)
        (28.2, 36.0, [50, 57, 62, 66, 69, 74])]  # D (home)
master_pad = env(0, 3.0, 34.5, 36)
for k, (a, b, chord) in enumerate(prog):
    g = env(a, a + 1.2, b - 0.8, b + 0.4) * (0.75 + 0.35 * (k == 4))
    for j, m in enumerate(chord):
        for det in (-0.08, 0.08):
            f = note(m + det)
            ph = rng.uniform(0, 6.28)
            s = sum(np.sin(2 * np.pi * f * h * t + ph * h) / h ** 1.7 for h in range(1, 6))
            add(s * g * master_pad * (0.65 + 0.35 * np.sin(2 * np.pi * 0.09 * t + j)), pan=det * 6, gain=0.016)
add(np.sin(2 * np.pi * note(38) * t) * env(0, 4, 27, 29) * 0.8 + np.sin(2 * np.pi * note(38) * t) * env(28.4, 29, 34, 36), gain=0.07)

# ---- Pulse that builds through the assembly (soft kick-like heartbeat)
for beat in np.arange(15.0, 28.4, 0.6):
    dt = np.clip(t - beat, 0, None); on = t >= beat
    lvl = 0.25 + 0.75 * (beat - 15) / 13.4
    add(np.sin(2 * np.pi * (45 + 60 * np.exp(-dt * 25)) * dt) * np.exp(-dt * 9) * on, gain=0.12 * lvl)


def bell(at, m, gain, pan=0.0, decay=1.6):
    dt = np.clip(t - at, 0, None); on = t >= at; f = note(m)
    s = (np.sin(2 * np.pi * f * dt) + 0.45 * np.sin(2 * np.pi * f * 2.76 * dt) * np.exp(-dt * 3)
         + 0.2 * np.sin(2 * np.pi * f * 5.4 * dt) * np.exp(-dt * 6))
    add(s * np.exp(-dt * decay) * on * np.minimum(dt * 500, 1), pan=pan, gain=gain)


def whoosh(a, b, peak, gain, sweep=0.7):
    idx = np.where((t >= a) & (t <= b + 0.5))[0]
    nz = rng.normal(0, 1, len(idx)); p = np.clip((t[idx] - a) / (b - a), 0, 1)
    y = onepole(nz, 300 + peak * 0.5) - onepole(nz, 120)
    shape = p ** 2 * np.exp(-np.clip(t[idx] - b, 0, None) * 9)
    x = np.zeros(n); x[idx] = y * shape * (0.4 + p)
    pan = (-1 + 2 * np.clip((t - a) / (b - a + 0.5), 0, 1)) * sweep
    global L, R
    L += x * gain * np.sqrt(0.5 * (1 - pan)); R += x * gain * np.sqrt(0.5 * (1 + pan))


def impact(at, gain):
    dt = np.clip(t - at, 0, None); on = t >= at
    f = 36 + 80 * np.exp(-dt * 12)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-dt * 2.0) * on, gain=0.55 * gain)
    idx = np.where(on & (dt < 0.4))[0]
    x = np.zeros(n); x[idx] = onepole(rng.normal(0, 1, len(idx)), 2200) * np.exp(-dt[idx] * 28)
    add(x, gain=0.6 * gain)


D = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86, 88, 90, 93]  # D major pentatonic-ish ladder

# 01 Sun: rising swell + bloom chord
whoosh(0.6, 3.0, 2500, 0.25, 0.0)
for i, m in enumerate([74, 78, 81, 86]):
    bell(2.9 + i * 0.06, m, 0.035, -0.3 + i * 0.2, 1.0)
# 02 Rays: one bell per grain landing
for i in range(7):
    bell(4.1 + i * 0.36 + 1.0, D[5 + i], 0.04, (-1) ** i * 0.5)
# 03 Sky + mountains: low swells
whoosh(7.4, 9.2, 1600, 0.2)
impact(9.6, 0.35); impact(10.0, 0.3)
# 04 Book opens (page whoosh), posts pluck, rail shimmer, spokes ticks
whoosh(11.0, 12.6, 3000, 0.25)
bell(12.8, 69, 0.05, -0.4, 2.2); bell(12.95, 74, 0.05, 0.4, 2.2)
for i in range(7):
    bell(13.5 + i * 0.12, D[6 + i], 0.022, -0.6 + i * 0.2, 2.5)
# 05 Woven band: 17 quick ticks rising left to right
for i in range(17):
    bell(15.75 + i * 0.09, D[i % len(D)] + 12 * (i >= len(D)), 0.016, -0.8 + i * 0.1, 4)
# 06 Copper earth: slab thud + arcs shimmer
impact(18.9, 0.3)
for i in range(4):
    bell(19.0 + i * 0.32, [66, 69, 74, 78][i], 0.035, 0, 1.5)
# 07 Arch frame lands + keyline sweep
whoosh(20.8, 22.0, 3500, 0.3, 0.0)
impact(22.05, 0.45)
whoosh(21.8, 23.4, 6000, 0.08)
# 08 Seal: disc swell, ring shimmer, letter sparkle, rim slam
whoosh(24.2, 25.5, 2500, 0.25)
for i in range(24):
    bell(25.1 + i * 0.06, D[(i * 3) % len(D)] + 12, 0.008, np.sin(i) * 0.8, 5)
for i in range(30):
    bell(25.7 + i * 0.07, D[(i * 5) % len(D)] + 12, 0.006, np.cos(i) * 0.8, 6)
whoosh(27.3, 28.4, 7000, 0.6, 0.0)
impact(28.42, 1.0)
for i, m in enumerate([50, 62, 69, 74, 78, 81, 86]):
    bell(28.45 + i * 0.05, m, 0.045, -0.5 + i * 0.17, 0.9)
# Lockup reveal
for i, m in enumerate([74, 78, 81, 86, 90]):
    bell(31.2 + i * 0.12, m, 0.03, -0.4 + i * 0.2, 1.2)


def reverb(x, taps):
    y = x.copy()
    for d, g in taps:
        k = int(d * SR); y[k:] += x[:-k] * g
    return y


L = reverb(L, [(0.031, 0.35), (0.067, 0.28), (0.113, 0.22), (0.171, 0.16), (0.263, 0.11), (0.39, 0.07), (0.55, 0.04)])
R = reverb(R, [(0.037, 0.35), (0.059, 0.28), (0.127, 0.22), (0.181, 0.16), (0.241, 0.11), (0.41, 0.07), (0.58, 0.04)])
st = np.stack([L, R], 1) * env(0, 0.05, 35.0, 36.0)[:, None]
st = np.tanh(st / np.abs(st).max() * 1.7) * 0.89
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print("audio ok")
