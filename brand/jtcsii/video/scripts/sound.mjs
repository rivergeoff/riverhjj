// Synthesizes the teaser's sound design to public/sound.wav, timed from src/timeline.json:
// a warm pad, plucks and bells on each reveal, whooshes on transitions, a riser into the seal's
// impact, and a small reverb. Run: node scripts/sound.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(fs.readFileSync(path.join(root, 'src/timeline.json'), 'utf8'));
const SR = 44100;
const N = Math.ceil(T.duration * SR);
const L = new Float32Array(N), R = new Float32Array(N), send = new Float32Array(N);

// deterministic noise so every build sounds the same
let seed = 1234567;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const note = (name) => {
  const m = name.match(/^([A-G])(#?)(\d)$/);
  const semis = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]] + (m[2] ? 1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * 2 ** (semis / 12);
};
const put = (i, v, pan = 0, wet = 0) => {
  if (i < 0 || i >= N) return;
  L[i] += v * Math.cos(((pan + 1) * Math.PI) / 4);
  R[i] += v * Math.sin(((pan + 1) * Math.PI) / 4);
  send[i] += v * wet;
};

// a plucked or bell-like tone: partials [ratio, gain, decay seconds]
function tone(t0, freq, amp, { partials = [[1, 1, 1.2], [2, 0.35, 0.6], [3, 0.12, 0.3]], attack = 0.004, pan = 0, wet = 0.35, length = 4 } = {}) {
  const i0 = Math.round(t0 * SR), n = Math.round(length * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR, env = Math.min(1, t / attack);
    let v = 0;
    for (const [ratio, g, decay] of partials) v += g * Math.sin(2 * Math.PI * freq * ratio * t) * Math.exp(-t / decay);
    put(i0 + k, v * env * amp, pan, wet);
  }
}
const bell = (t0, freq, amp, pan = 0) =>
  tone(t0, freq, amp, { partials: [[1, 1, 3.2], [2.0, 0.45, 1.8], [2.76, 0.25, 1.1], [5.4, 0.1, 0.5]], pan, wet: 0.55, length: 6 });

// band-passed noise with a moving centre: whooshes, rustles, risers
function noise(t0, dur, amp, { f0 = 300, f1 = 2400, q = 0.9, shape = (x) => Math.sin(Math.PI * x), pan0 = 0, pan1 = 0, wet = 0.25 } = {}) {
  const i0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  let low = 0, band = 0;
  for (let k = 0; k < n; k++) {
    const x = k / n, f = f0 * (f1 / f0) ** x;
    const F = 2 * Math.sin((Math.PI * f) / SR);
    const high = rnd() - low - q * band;
    band += F * high;
    low += F * band;
    put(i0 + k, band * shape(x) * amp, pan0 + (pan1 - pan0) * x, wet);
  }
}
const whoosh = (t0, dur = 0.9, amp = 0.22, dir = 1) =>
  noise(t0, dur, amp, { f0: 260, f1: 3200, shape: (x) => Math.sin(Math.PI * x ** 0.7) ** 2, pan0: -0.5 * dir, pan1: 0.5 * dir });

// a sub boom with a short transient on top
function boom(t0, amp, { f0 = 62, f1 = 34, decay = 0.9 } = {}) {
  const i0 = Math.round(t0 * SR), n = Math.round(3.5 * SR);
  let phase = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR, f = f1 + (f0 - f1) * Math.exp(-t / 0.18);
    phase += (2 * Math.PI * f) / SR;
    put(i0 + k, Math.sin(phase) * Math.exp(-t / decay) * Math.min(1, t / 0.003) * amp, 0, 0.1);
  }
  noise(t0, 0.12, amp * 0.5, { f0: 5000, f1: 900, q: 0.6, shape: (x) => Math.exp(-x * 6), wet: 0.4 });
}

// ---- the pad: D major add9, voiced wide, opening its filter as the seal comes together ----
const padEnv = [[0, 0], [2, 0.045], [5.8, 0.075], [15.6, 0.09], [20.5, 0.13], [23, 0.085], [31.5, 0.09], [33.5, 0.11], [35.8, 0.06], [T.duration, 0]];
const cutoffEnv = [[0, 350], [6, 650], [15.7, 1100], [20.5, 2400], [23, 1500], [31.5, 1700], [T.duration, 900]];
const at = (env, t) => {
  for (let i = 1; i < env.length; i++) if (t <= env[i][0]) {
    const [t0, v0] = env[i - 1], [t1, v1] = env[i];
    return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
  }
  return env[env.length - 1][1];
};
{
  const voices = ['D2', 'A2', 'D3', 'F#3', 'A3', 'E4'].map((n, i) => ({ f: note(n), g: [1, 0.8, 0.7, 0.5, 0.45, 0.3][i], lfo: 0.07 + i * 0.023 }));
  let lpL = 0, lpR = 0;
  for (let k = 0; k < N; k++) {
    const t = k / SR;
    let l = 0, r = 0;
    for (const v of voices) {
      const trem = 0.85 + 0.15 * Math.sin(2 * Math.PI * v.lfo * t);
      l += v.g * trem * (Math.sin(2 * Math.PI * (v.f - 0.12) * t) + 0.25 * Math.sin(2 * Math.PI * 2 * (v.f - 0.12) * t));
      r += v.g * trem * (Math.sin(2 * Math.PI * (v.f + 0.12) * t) + 0.25 * Math.sin(2 * Math.PI * 2 * (v.f + 0.12) * t));
    }
    const a = 1 - Math.exp((-2 * Math.PI * at(cutoffEnv, t)) / SR);
    lpL += a * (l - lpL);
    lpR += a * (r - lpR);
    const g = at(padEnv, t) * 0.32;
    L[k] += lpL * g;
    R[k] += lpR * g;
  }
}
// low air under the cold open
noise(0, 6.4, 0.05, { f0: 180, f1: 320, q: 1.4, shape: (x) => Math.min(1, x * 4) * Math.min(1, (1 - x) * 3), wet: 0.1 });

// ---- events ----
['A4', 'F#4', 'D4'].forEach((n, i) => bell(T.lines[i].start, note(n), 0.05, [-0.3, 0.3, 0][i]));
whoosh(T.ring, 1.0, 0.16);
noise(T.sky, 1.2, 0.08, { f0: 2000, f1: 7000, q: 0.5, pan0: -0.6, pan1: 0.6, wet: 0.5 });
tone(T.sun, note('D3'), 0.1, { partials: [[1, 1, 2.2], [1.5, 0.5, 1.8], [2, 0.3, 1.2]], attack: 0.7, wet: 0.5, length: 4 });
const rayNotes = ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'];
T.rayOrder.forEach((ray, k) => tone(T.rays + k * T.rayStep, note(rayNotes[k]), 0.11, { pan: ((ray - 3.5) / 3.5) * 0.6, wet: 0.5 }));
boom(T.mountains, 0.16, { f0: 52, f1: 38, decay: 1.4 });
noise(T.mountains, 1.6, 0.06, { f0: 120, f1: 260, q: 1.2, wet: 0.2 });
['D3', 'F#3', 'A3', 'D4'].forEach((n, i) => {
  tone(T.terraces + i * T.terraceStep, note(n), 0.15, { partials: [[1, 1, 0.8], [2, 0.3, 0.4]], pan: -0.3 + i * 0.2 });
  boom(T.terraces + i * T.terraceStep, 0.08, { f0: 90, f1: 60, decay: 0.15 });
});
whoosh(T.bridge, 1.1, 0.12, -1);
tone(T.bridge + 0.1, note('A3'), 0.06, { partials: [1, 2, 3, 4, 5, 6].map((h) => [h, 1 / h, 2.2]), attack: 0.6, wet: 0.5, length: 3.5 });
for (let k = 0; k < 14; k++) {
  const n = ['D6', 'A5', 'F#5', 'E5', 'D5', 'A5', 'E6'][k % 7];
  tone(T.weave + k * 0.1, note(n), 0.035, { pan: -0.8 + (k / 13) * 1.6, wet: 0.6, length: 2 });
}
whoosh(T.pullback - 0.2, 1.4, 0.24);
noise(T.rope, 1.1, 0.05, { f0: 400, f1: 900, q: 1.1, wet: 0.2 });
for (let k = 0; k < 40; k++) {
  const t = T.palay + k * 0.026 + rnd() * 0.01;
  noise(t, 0.03, 0.05 * (1 - k / 45), { f0: 5000, f1: 6500, q: 0.7, pan0: k % 2 ? -0.5 : 0.5, pan1: k % 2 ? -0.5 : 0.5, wet: 0.3 });
}
// the riser runs from the name to the moment the seal is complete
const riseDur = T.impact - T.name;
noise(T.name, riseDur, 0.2, { f0: 300, f1: 6000, q: 0.8, shape: (x) => x ** 2.2, wet: 0.3 });
{
  const i0 = Math.round(T.name * SR), n = Math.round(riseDur * SR);
  let phase = 0;
  for (let k = 0; k < n; k++) {
    const x = k / n;
    phase += (2 * Math.PI * (220 * 2 ** x)) / SR;
    put(i0 + k, Math.sin(phase) * x ** 2 * 0.05, 0, 0.4);
  }
}
boom(T.impact, 0.9);
['D5', 'A5', 'D6', 'F#6'].forEach((n, i) => bell(T.impact + i * 0.015, note(n), 0.07, [-0.4, -0.1, 0.1, 0.4][i]));
whoosh(T.showcase - 0.15, 0.9, 0.18);
tone(T.showcase + 0.35, note('A5'), 0.04, { partials: [[1, 1, 0.25], [2, 0.3, 0.1]], wet: 0.3 });
whoosh(T.versions - 0.15, 0.8, 0.14, -1);
[0.2, 0.32, 0.44].forEach((d, i) => tone(T.versions + d, note(['D5', 'F#5', 'A5'][i]), 0.04, { partials: [[1, 1, 0.25], [2, 0.3, 0.1]], pan: -0.5 + i * 0.5, wet: 0.3 }));
whoosh(T.mark - 0.15, 0.8, 0.14);
[0.2, 0.3, 0.4, 0.5].forEach((d, i) => tone(T.mark + d, note(['D6', 'A5', 'F#5', 'D5'][i]), 0.035, { partials: [[1, 1, 0.25], [2, 0.3, 0.1]], wet: 0.3 }));
whoosh(T.end - 0.2, 1.1, 0.2);
boom(T.end + 0.3, 0.5, { decay: 1.2 });
['D4', 'A4', 'D5', 'E5'].forEach((n, i) => bell(T.end + 0.3 + i * 0.02, note(n), 0.06, [-0.3, 0.3, -0.1, 0.1][i]));

// ---- reverb: four combs into two allpasses, slightly different per side ----
function reverb(input, offset) {
  const out = new Float32Array(N);
  for (const [ms, fb] of [[29.7, 0.8], [37.1, 0.79], [41.1, 0.78], [43.7, 0.77]]) {
    const d = Math.round(((ms + offset) * SR) / 1000), buf = new Float32Array(d);
    let idx = 0, lp = 0;
    for (let k = 0; k < N; k++) {
      const y = buf[idx];
      lp = y * 0.6 + lp * 0.4; // damping
      buf[idx] = input[k] + lp * fb;
      out[k] += y;
      idx = (idx + 1) % d;
    }
  }
  for (const ms of [5.0, 1.7]) {
    const d = Math.round(((ms + offset * 0.1) * SR) / 1000), buf = new Float32Array(d), g = 0.7;
    let idx = 0;
    for (let k = 0; k < N; k++) {
      const b = buf[idx], x = out[k], y = -g * x + b;
      buf[idx] = x + g * y;
      out[k] = y;
      idx = (idx + 1) % d;
    }
  }
  return out;
}
const revL = reverb(send, 0), revR = reverb(send, 2.3);
for (let k = 0; k < N; k++) {
  L[k] += revL[k] * 0.22;
  R[k] += revR[k] * 0.22;
}

// ---- master: gentle saturation, fade out, normalise to -1 dBFS ----
let peak = 0;
for (let k = 0; k < N; k++) {
  const t = k / SR, fade = Math.min(1, t / 0.05, (T.duration - t) / 0.9);
  L[k] = Math.tanh(L[k] * 1.1) * fade;
  R[k] = Math.tanh(R[k] * 1.1) * fade;
  peak = Math.max(peak, Math.abs(L[k]), Math.abs(R[k]));
}
const gain = 0.89 / peak;
const data = Buffer.alloc(44 + N * 4);
data.write('RIFF', 0); data.writeUInt32LE(36 + N * 4, 4); data.write('WAVE', 8);
data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
data.write('data', 36); data.writeUInt32LE(N * 4, 40);
for (let k = 0; k < N; k++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[k] * gain)) * 32767), 44 + k * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[k] * gain)) * 32767), 46 + k * 4);
}
fs.writeFileSync(path.join(root, 'public/sound.wav'), data);
console.log(`wrote public/sound.wav (${T.duration}s, peak gain ${gain.toFixed(2)})`);
