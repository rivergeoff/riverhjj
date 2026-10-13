"""Synthesize a short cinematic score timed to the 16 s logo reveal."""
import sys
import wave

import numpy as np

SR, DUR = 48000, 16.0
n = int(SR * DUR)
t = np.arange(n) / SR
rng = np.random.default_rng(7)
L = np.zeros(n)
Rr = np.zeros(n)


def env(a, b, c, d):
    """Trapezoid gain: 0 at a, 1 from b to c, 0 at d."""
    return np.clip(np.minimum((t - a) / max(b - a, 1e-6), (d - t) / max(d - c, 1e-6)), 0, 1)


def lowpass(x, cutoff):
    """One-pole lowpass with a per-sample (array) or fixed cutoff in Hz."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def add(sig, pan=0.0, gain=1.0):
    global L, Rr
    L += sig * gain * np.sqrt(0.5 * (1 - pan))
    Rr += sig * gain * np.sqrt(0.5 * (1 + pan))


def note(f):
    return 440 * 2 ** ((f - 69) / 12)


# Warm pad: D major add9 voicing, detuned saw-ish via a few partials, slow filter swell
pad_env = env(0, 2.5, 14.8, 16.0)
chord1 = [50, 57, 62, 64, 66]          # D2 A2 D3 E3 F#3
chord2 = [47, 54, 59, 62, 66]          # B1 F#2 B2 D3 F#3 (relative minor colour)
chord3 = [43, 50, 55, 62, 64, 69]      # G (IV) for the hero
sections = [(0, 6.4, chord1), (6.0, 12.4, chord2), (12.0, 16.0, chord3)]
for a, b, ch in sections:
    g = env(a, a + 0.8, b - 0.6, b + 0.4)
    for k, m in enumerate(ch):
        for det in (-0.12, 0.12):
            f = note(m + det / 1.0)
            ph = rng.uniform(0, 2 * np.pi)
            s = sum(np.sin(2 * np.pi * f * h * t + ph * h) / h ** 1.6 for h in range(1, 6))
            add(s * g * pad_env * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t + k)), pan=det * 5, gain=0.022)

# Sub drone
add(np.sin(2 * np.pi * note(38) * t) * env(0, 3, 15, 16), gain=0.09)

# Whooshes: filtered noise with rising cutoff
def whoosh(a, b, peak, gain, pan_sweep=True):
    seg = (t >= a) & (t <= b + 0.6)
    x = np.zeros(n)
    idx = np.where(seg)[0]
    nz = rng.normal(0, 1, len(idx))
    p = (t[idx] - a) / (b - a)
    cut = 200 + peak * np.clip(p, 0, 1) ** 2
    y = lowpass(nz, cut) - lowpass(nz, cut * 0.25)
    shape = np.clip(p, 0, 1) ** 2.2 * np.exp(-np.clip(t[idx] - b, 0, None) * 8)
    x[idx] = y * shape
    if pan_sweep:
        pan = np.clip(-1 + 2 * np.clip((t - a) / (b - a + 0.6), 0, 1), -1, 1) * 0.7
        L_ = x * np.sqrt(0.5 * (1 - pan)); R_ = x * np.sqrt(0.5 * (1 + pan))
        global L, Rr
        L += L_ * gain; Rr += R_ * gain
    else:
        add(x, gain=gain)


whoosh(0.3, 3.35, 5000, 0.55)
whoosh(9.5, 10.6, 3500, 0.35)
whoosh(11.5, 12.6, 3500, 0.35)

# Impacts: pitched-down sine boom + noise crack
def impact(at, gain):
    dt = np.clip(t - at, 0, None)
    on = t >= at
    f = 38 + 70 * np.exp(-dt * 12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-dt * 2.2) * on
    crack = lowpass(rng.normal(0, 1, n) * np.exp(-dt * 30) * on, 2500)
    add(boom, gain=0.55 * gain)
    add(crack, gain=0.5 * gain)


impact(3.36, 1.0)
impact(13.7, 0.8)

# Bells / shimmer: glints and the title hit
def bell(at, midi, gain, pan):
    dt = np.clip(t - at, 0, None)
    on = t >= at
    f = note(midi)
    s = (np.sin(2 * np.pi * f * dt) + 0.5 * np.sin(2 * np.pi * f * 2.76 * dt) * np.exp(-dt * 3)
         + 0.25 * np.sin(2 * np.pi * f * 5.4 * dt) * np.exp(-dt * 6))
    add(s * np.exp(-dt * 1.6) * on * np.minimum(dt * 400, 1), pan=pan, gain=gain)


for i, m in enumerate([86, 90, 93, 98, 93]):
    bell(3.42 + i * 0.11, m, 0.05, -0.6 + i * 0.3)
for k, at in enumerate(np.linspace(4.2, 6.0, 7)):
    bell(at, [81, 86, 88, 90, 93, 95, 98][k], 0.03, np.sin(k) * 0.8)
for k, at in enumerate([7.0, 7.9, 8.8]):
    bell(at, [78, 83, 86][k], 0.03, (-1) ** k * 0.5)
bell(10.65, 86, 0.05, 0.3)
for i, m in enumerate([67, 74, 79, 83, 86, 91]):
    bell(13.72 + i * 0.07, m, 0.045, -0.5 + i * 0.2)

# Simple stereo reverb: a few decaying taps
def reverb(x, taps):
    y = x.copy()
    for d, g in taps:
        k = int(d * SR)
        y[k:] += x[:-k] * g
    return y


L = reverb(L, [(0.031, 0.35), (0.067, 0.28), (0.113, 0.22), (0.171, 0.16), (0.263, 0.11), (0.39, 0.07)])
Rr = reverb(Rr, [(0.037, 0.35), (0.059, 0.28), (0.127, 0.22), (0.181, 0.16), (0.241, 0.11), (0.41, 0.07)])

master = env(0, 0.05, 15.2, 16.0)
st = np.stack([L, Rr], 1) * master[:, None]
st = np.tanh(st / np.abs(st).max() * 1.6) * 0.89  # gentle glue + safe peak
pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("audio ok")
