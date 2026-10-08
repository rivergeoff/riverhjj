"""Synthesise the original YUGA score (pads, koto-like plucks, foley) in sync with the edit.

Usage: python3 scripts/score.py public/score.wav
Timings mirror src/Reel.tsx (30 fps, 12-frame crossfades).
"""
import sys
import wave
import numpy as np

SR = 48000
FPS = 30
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

def f2s(frame): return frame / FPS
def hz(note):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    n, o = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)

# scene starts (frames): 0, 108, 246, 384, 572, 750
S = [0, 108, 246, 384, 572, 750, 900]
L = np.zeros(N); R = np.zeros(N)
t_all = np.arange(N) / SR

def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * gain * l
    R[i:i + len(sig)] += sig * gain * r

def fft_filter(x, lo, hi, slope=1.0):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if lo: g *= 1 / (1 + (lo / np.maximum(f, 1)) ** (2 * slope))
    if hi: g *= 1 / (1 + (f / hi) ** (2 * slope))
    return np.fft.irfft(X * g, len(x))

def env(n, a, r, curve=2.0):
    e = np.ones(n)
    na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** curve
    e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e

# ---------- pads ----------
CHORDS = [
    (0, ['D2', 'A2', 'F#3', 'C#4', 'E4']),
    (f2s(S[1]), ['B1', 'F#2', 'D3', 'A3', 'C#4']),
    (f2s(S[2]), ['G1', 'D2', 'B2', 'F#3', 'A3']),
    (f2s(S[3]), ['E2', 'B2', 'D3', 'F#3', 'G3']),
    (f2s(S[3]) + 3.2, ['A1', 'E2', 'B2', 'D3', 'E4']),
    (f2s(S[4]), ['D2', 'A2', 'E3', 'F#3', 'C#4', 'A4']),
    (f2s(S[5]), ['G1', 'D2', 'B2', 'F#3', 'A3', 'D4']),
    (f2s(S[5]) + 2.6, ['D2', 'A2', 'E3', 'F#3', 'A3', 'E4']),
]
for k, (start, notes) in enumerate(CHORDS):
    end = CHORDS[k + 1][0] if k + 1 < len(CHORDS) else DUR
    dur = end - start + 1.6
    n = int(dur * SR); t = np.arange(n) / SR
    sig = np.zeros(n)
    for j, nt in enumerate(notes):
        f = hz(nt)
        for det in (-0.12, 0.0, 0.11):
            ph = rng.random() * 6.28
            ff = f * 2 ** (det / 12 * 0.15)
            sig += (np.sin(2 * np.pi * ff * t + ph) + 0.28 * np.sin(4 * np.pi * ff * t + ph) + 0.08 * np.sin(6 * np.pi * ff * t)) / (1 + j * 0.25)
    sig *= 1 + 0.12 * np.sin(2 * np.pi * 0.23 * t)
    sig *= env(n, 1.4 if k else 2.6, 1.6, 1.5)
    if k == len(CHORDS) - 1:
        sig *= np.clip((DUR - start - t) / 2.5, 0, 1)
    sig = fft_filter(sig, 60, 2200 + 900 * (k >= 5))
    add(sig, start, 0.016, pan=-0.15 + 0.3 * (k % 2))

# ---------- koto-ish plucks (Karplus-Strong) ----------
def pluck(note, dur=2.8, bright=0.6, decay=0.996):
    f = hz(note); P = int(round(SR / f)); n = int(dur * SR)
    y = np.zeros(n + P + 1)
    burst = rng.uniform(-1, 1, P)
    burst = bright * burst + (1 - bright) * np.convolve(burst, np.ones(4) / 4, 'same')
    y[1:P + 1] = burst
    k = P + 1
    while k < len(y):
        m = min(P, len(y) - k)
        y[k:k + m] = decay * 0.5 * (y[k - P:k - P + m] + y[k - P - 1:k - P - 1 + m])
        k += m
    y = y[1:n + 1]
    y += 0.25 * np.sin(2 * np.pi * f * 2 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 3) * 0.3
    return y * env(n, 0.002, 0.4, 1)

MELODY = [
    (0.85, 'A4'), (1.45, 'D5'), (2.15, 'E5'), (2.9, 'A4'),
    (3.95, 'F#5'), (4.7, 'E5'), (5.3, 'D5'), (6.5, 'B4'), (7.2, 'D5'),
    (9.3, 'A5'), (9.85, 'F#5'), (10.5, 'E5'), (11.6, 'D5'),
    (19.15, 'D5'), (19.6, 'A5'), (20.1, 'F#5'), (20.75, 'E5'), (21.5, 'D6'),
    (25.35, 'A5'), (25.9, 'F#5'), (26.6, 'E5'),
]
for i, (s, nt) in enumerate(MELODY):
    add(pluck(nt), s, 0.32, pan=np.sin(i * 1.7) * 0.5)

# gentle arpeggio pulse under the whisking
arp = ['E4', 'B4', 'D5', 'F#5', 'A4', 'E5', 'B4', 'D5']
s0 = f2s(S[3] + 18)
for i in range(int((f2s(S[3] + 150) - s0) / 0.375)):
    add(pluck(arp[i % len(arp)], 1.6, 0.4, 0.993), s0 + i * 0.375, 0.13 * min(1, (i + 1) / 4), pan=0.4 * (-1) ** i)

# ---------- bells ----------
def bell(note, dur=5.0, gain=1.0):
    f = hz(note); n = int(dur * SR); t = np.arange(n) / SR
    sig = np.zeros(n)
    for ratio, a, d in [(1, 1, 1.2), (2.0, 0.5, 1.8), (2.76, 0.35, 2.4), (5.4, 0.2, 4), (8.93, 0.1, 6)]:
        sig += a * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * d)
    return sig * env(n, 0.003, 0.5, 1) * gain

add(bell('D6', 6, 0.5), f2s(S[4] + 98), 0.10, 0.2)      # lid opens
add(bell('A5', 6, 0.5), f2s(S[4] + 108), 0.06, -0.3)
add(bell('D5', 7, 1.0), f2s(S[5] + 50), 0.16, 0.0)      # ensō closes
add(bell('F#6', 6, 0.5), f2s(S[5] + 54), 0.05, 0.3)

# ---------- foley ----------
def noise(d): return rng.standard_normal(int(d * SR))

def whoosh(d=0.9):
    n = int(d * SR); t = np.linspace(0, 1, n)
    lo = fft_filter(noise(d), 200, 900); mid = fft_filter(noise(d), 900, 3000); hi = fft_filter(noise(d), 3000, 9000)
    sig = lo * (1 - t) + mid * np.sin(np.pi * t) + hi * t ** 2
    return sig * np.sin(np.pi * t) ** 2 * t

for f in S[1:6]:
    add(whoosh(0.9), f2s(f) - 0.7, 0.05, pan=0.3)

# low boom / swell
def boom(d=3.0, f0=48):
    n = int(d * SR); t = np.arange(n) / SR
    fr = f0 * (1 + 0.6 * np.exp(-t * 8))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 1.5) * env(n, 0.01, 0.3)

add(boom(4, 40), 0.15, 0.22)
add(boom(3, 46), f2s(S[2] + 22), 0.32)
add(boom(3.5, 44), f2s(S[4]), 0.25)
add(boom(3, 52), f2s(S[5] + 60), 0.12)  # seal stamp

# powder burst: soft breathy poof
pd = 2.2; p = fft_filter(noise(pd), 150, 2500) * np.exp(-np.arange(int(pd * SR)) / SR * 2.4) * env(int(pd * SR), 0.015, 0.4)
add(p, f2s(S[2] + 22), 0.20)
add(fft_filter(noise(pd), 3000, 11000) * np.exp(-np.arange(int(pd * SR)) / SR * 3.5), f2s(S[2] + 22), 0.03, 0.4)

# chasen whisking: bandpassed noise, one swish per pass, follows the on-screen motion
w0, w1 = S[3] + 18, S[3] + 150
wd = f2s(w1 - w0) + 0.4; wn = int(wd * SR); tt = np.arange(wn) / SR
fr = w0 + tt * FPS
ramp = np.interp(fr, [w0, w0 + 25, w1 - 20, w1], [0, 1, 1, 0.3])
phase = (fr - w0) * 0.62 * (0.4 + ramp * 0.6)
strokes = np.abs(np.cos(phase)) ** 3 * ramp
sw = fft_filter(noise(wd), 1800, 7000) * strokes * env(wn, 0.2, 0.5)
add(sw, f2s(w0), 0.07, -0.1)

# ensō brush on paper
bd = 1.6; bn = int(bd * SR)
add(fft_filter(noise(bd), 800, 5000) * np.sin(np.pi * np.linspace(0, 1, bn)) ** 1.5, f2s(S[5] + 6), 0.05, -0.2)

# room tone
add(fft_filter(noise(DUR), 80, 1200), 0, 0.004)

# ---------- reverb ----------
def reverb(x, seconds=3.6, seed=0):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / seconds)
    ir = fft_filter(ir, 120, 6000); ir /= np.sqrt(np.sum(ir ** 2))
    m = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
    return y

wetL, wetR = reverb(L, seed=1), reverb(R, seed=2)
outL = L + 0.42 * wetL
outR = R + 0.42 * wetR

# master: soft clip, tail fade, normalise to -1 dBFS
fade = np.clip((DUR - t_all) / 1.2, 0, 1) ** 1.5
outL *= fade; outR *= fade
peak = max(np.abs(outL).max(), np.abs(outR).max())
g = 10 ** (-1 / 20) / peak
outL = np.tanh(outL * g * 1.1) / np.tanh(1.1); outR = np.tanh(outR * g * 1.1) / np.tanh(1.1)
data = (np.stack([outL, outR], 1) * 32767 * 0.89).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
print('wrote', sys.argv[1], data.shape)
