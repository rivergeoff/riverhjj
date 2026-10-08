import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Caption, ramp, SANS, SERIF} from './fx';

const W = 1080;
const H = 1920;
const rng = (key: string, i: number) => random(`${key}-${i}`);

/* ───────────────────────── 1 · Morning light ───────────────────────── */

const Steam: React.FC<{x: number; y: number}> = ({x, y}) => {
  const f = useCurrentFrame();
  return (
    <g style={{filter: 'blur(7px)'}}>
      {[0, 1, 2].map((i) => {
        const t = (f + i * 23) % 70;
        const rise = t * 2.2;
        const o = Math.sin((t / 70) * Math.PI) * 0.55;
        const sway = Math.sin((f + i * 30) / 16) * 18;
        const ox = x + (i - 1) * 34;
        return (
          <path
            key={i}
            d={`M ${ox} ${y - rise} c ${sway} -40, ${-sway} -80, 0 -120 c ${sway} -40, ${-sway} -80, 0 -110`}
            stroke="white"
            strokeWidth={14}
            strokeLinecap="round"
            fill="none"
            opacity={o}
          />
        );
      })}
    </g>
  );
};

export const Morning: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const leaves = Array.from({length: 46}, (_, i) => ({
    x: 380 + rng('lx', i) * 900,
    y: -120 + rng('ly', i) * 1100,
    r: rng('lr', i) * 360,
    s: 0.6 + rng('ls', i) * 1.1,
  }));
  const breathe = 0.85 + Math.sin(f / 22) * 0.08;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#F7EBD8 0%,#F1E3CC 55%,#E6D4B8 100%)'}}>
      {/* window light */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF6E2" stopOpacity="0.95" />
            <stop offset="1" stopColor="#FFE9C2" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <g style={{filter: 'blur(26px)'}} opacity={breathe}>
          <polygon points="420,0 900,0 620,1500 140,1500" fill="url(#beam)" />
          <polygon points="940,0 1080,0 1080,700 860,1500 700,1500" fill="url(#beam)" opacity={0.7} />
        </g>
        {/* dappled leaf shadows */}
        <g style={{filter: 'blur(13px)'}} opacity={0.26} fill="#4F4A30">
          {leaves.map((l, i) => {
            const sway = Math.sin(f / 28 + i) * 9 + Math.sin(f / 11 + i * 3) * 2;
            return (
              <ellipse
                key={i}
                cx={l.x + sway * 2}
                cy={l.y + sway}
                rx={46 * l.s}
                ry={20 * l.s}
                transform={`rotate(${l.r + sway} ${l.x} ${l.y})`}
              />
            );
          })}
          <path d="M 1080 120 Q 760 260 420 700" stroke="#4F4A30" strokeWidth={12} fill="none" />
        </g>
        {/* table */}
        <rect x={0} y={1460} width={W} height={460} fill="#C9AE88" />
        <rect x={0} y={1460} width={W} height={460} fill="url(#beam)" opacity={0.25} />
        <rect x={0} y={1456} width={W} height={8} fill="#E8D6B6" />
        {/* cup + saucer */}
        <ellipse cx={540} cy={1488} rx={260} ry={34} fill="rgba(60,40,20,0.25)" style={{filter: 'blur(10px)'}} />
        <ellipse cx={540} cy={1470} rx={235} ry={36} fill="#EFE7D9" />
        <ellipse cx={540} cy={1462} rx={200} ry={26} fill="#E2D7C4" />
        <path d="M 400 1230 L 680 1230 Q 676 1420 600 1452 L 480 1452 Q 404 1420 400 1230 Z" fill="#F4EEE3" />
        <path d="M 600 1240 Q 674 1300 640 1440 Q 668 1380 664 1240 Z" fill="#D9CDB9" opacity={0.8} />
        <path d="M 676 1270 q 80 0 70 70 q -10 55 -88 58" stroke="#EDE5D7" strokeWidth={20} fill="none" />
        <ellipse cx={540} cy={1230} rx={140} ry={20} fill="#E3DACB" />
        <ellipse cx={540} cy={1234} rx={124} ry={14} fill={C.matcha} />
        <ellipse cx={520} cy={1232} rx={50} ry={5} fill={C.foam} opacity={0.8} />
        <Steam x={540} y={1200} />
      </svg>
      <Caption text="slow mornings" dur={dur} color={C.ink} y={0.3} />
    </AbsoluteFill>
  );
};

/* ───────────────────────── shared: bowl from above ───────────────────────── */

const Linen: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 40% 35%, #EDE5D6, #DCD0BC)'}}>
    <svg width={W} height={H} style={{position: 'absolute', opacity: 0.22, mixBlendMode: 'multiply'}}>
      <filter id="weave">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" seed="3" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#weave)" />
    </svg>
  </AbsoluteFill>
);

const BowlShell: React.FC<{cx: number; cy: number; children?: React.ReactNode}> = ({cx, cy, children}) => {
  const speck = Array.from({length: 90}, (_, i) => {
    const a = rng('sa', i) * Math.PI * 2;
    const d = 330 + rng('sd', i) * 46;
    return {x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: 1 + rng('sr', i) * 2.2};
  });
  return (
    <>
      <defs>
        <radialGradient id="rim" cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#F2EADC" />
          <stop offset="0.75" stopColor="#DDD0BB" />
          <stop offset="1" stopColor="#BFAE93" />
        </radialGradient>
        <radialGradient id="inner" cx="0.55" cy="0.6" r="0.65">
          <stop offset="0" stopColor="#E6DCCB" />
          <stop offset="1" stopColor="#B9AA8F" />
        </radialGradient>
      </defs>
      <circle cx={cx + 30} cy={cy + 46} r={392} fill="rgba(60,40,20,0.32)" style={{filter: 'blur(34px)'}} />
      <circle cx={cx} cy={cy} r={385} fill="url(#rim)" />
      {speck.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#7A6A52" opacity={0.35} />
      ))}
      <circle cx={cx} cy={cy} r={330} fill="url(#inner)" />
      {children}
      <circle cx={cx} cy={cy} r={330} fill="none" stroke="rgba(80,60,40,0.18)" strokeWidth={10} style={{filter: 'blur(4px)'}} />
      <path
        d={`M ${cx - 300} ${cy - 180} A 350 350 0 0 1 ${cx + 120} ${cy - 362}`}
        stroke="rgba(255,255,255,0.65)"
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
        style={{filter: 'blur(3px)'}}
      />
    </>
  );
};

/* ───────────────────────── 2 · Sifting ───────────────────────── */

export const Sift: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const cx = 540;
  const cy = 900;
  const tap = Math.abs(Math.sin(f * 0.55)) * 5;
  const mound = ramp(f, 4, dur - 10, 30, 175);
  const parts = Array.from({length: 260}, (_, i) => {
    const t0 = rng('pt', i) * (dur - 18);
    const life = 14 + rng('pl', i) * 14;
    const p = (f - t0) / life;
    if (p < 0 || p > 1) return null;
    const a = rng('pa', i) * Math.PI * 2;
    const d = Math.sqrt(rng('pd', i)) * 190;
    const sx = cx + Math.cos(a) * d;
    const sy = cy - 20 + Math.sin(a) * d;
    const x = interpolate(p, [0, 1], [sx, cx + (sx - cx) * 0.35]);
    const y = interpolate(p, [0, 1], [sy, cy + (sy - cy) * 0.35]);
    const r = interpolate(p, [0, 1], [3 + rng('pr', i) * 3.5, 1.2]);
    return <circle key={i} cx={x} cy={y} r={r} fill={rng('pc', i) > 0.5 ? C.matcha : C.matchaLight} opacity={0.9 * (1 - p * 0.6)} />;
  });
  return (
    <AbsoluteFill>
      <Linen />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="powder">
            <stop offset="0" stopColor="#8FAA57" />
            <stop offset="0.6" stopColor={C.matcha} />
            <stop offset="1" stopColor={C.matcha} stopOpacity="0" />
          </radialGradient>
          <filter id="powdery">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="8" />
            <feDisplacementMap in="SourceGraphic" scale="26" />
          </filter>
          <pattern id="mesh" width="9" height="9" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 9 0 M 0 0 L 0 9" stroke="#8A867C" strokeWidth="1.2" />
          </pattern>
        </defs>
        {/* bamboo scoop */}
        <g transform={`translate(-560 -150) rotate(-14 860 1460)`}>
          <rect x={620} y={1440} width={520} height={34} rx={17} fill={C.wood} />
          <rect x={620} y={1444} width={520} height={8} rx={4} fill="#D2B993" />
          <ellipse cx={640} cy={1457} rx={40} ry={26} fill="#A58660" />
          <ellipse cx={640} cy={1457} rx={22} ry={12} fill={C.matcha} />
        </g>
        <BowlShell cx={cx} cy={cy}>
          <circle cx={cx} cy={cy} r={mound} fill="url(#powder)" filter="url(#powdery)" />
          <circle cx={cx - mound * 0.2} cy={cy - mound * 0.25} r={mound * 0.35} fill="#B4C985" opacity={0.35} style={{filter: 'blur(14px)'}} />
        </BowlShell>
        {parts}
        {/* sieve */}
        <g transform={`translate(${tap * 0.6} ${-tap})`}>
          <circle cx={cx + 24} cy={cy + 10} r={236} fill="rgba(40,30,20,0.18)" style={{filter: 'blur(16px)'}} />
          <rect x={cx + 190} y={cy - 250} width={360} height={30} rx={15} fill="#9B958A" transform={`rotate(-38 ${cx + 190} ${cy - 250})`} />
          <circle cx={cx} cy={cy - 20} r={222} fill="url(#mesh)" opacity={0.5} />
          <circle cx={cx} cy={cy - 20} r={222} fill="none" stroke="#A39E93" strokeWidth={16} />
          <circle cx={cx} cy={cy - 20} r={222} fill="none" stroke="#E4E0D8" strokeWidth={4} strokeDasharray="300 1100" strokeDashoffset={-200} />
        </g>
      </svg>
      <Caption text="start with intention" dur={dur} color={C.ink} y={0.79} />
    </AbsoluteFill>
  );
};

/* ───────────────────────── 3 · Whisk ───────────────────────── */

export const Whisk: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const cx = 540;
  const cy = 900;
  const froth = ramp(f, 0, dur * 0.85);
  const wPos = (t: number) => ({
    x: cx + Math.sin(t * 0.42) * 150,
    y: cy + Math.sin(t * 0.84) * 55 + Math.cos(t * 0.21) * 30,
  });
  const bubbles = Array.from({length: 150}, (_, i) => {
    const a = rng('ba', i) * Math.PI * 2 + f * (0.01 + rng('bs', i) * 0.02);
    const d = Math.sqrt(rng('bd', i)) * 300;
    const tw = 0.5 + 0.5 * Math.sin(f * 0.3 + i);
    return (
      <circle
        key={i}
        cx={cx + Math.cos(a) * d}
        cy={cy + Math.sin(a) * d}
        r={1.5 + rng('br', i) * 4 * (0.4 + froth)}
        fill="#E6EDC9"
        opacity={(0.25 + froth * 0.5) * tw}
      />
    );
  });
  const tines = (x: number, y: number, o: number, key: string) => (
    <g key={key} opacity={o}>
      {Array.from({length: 64}, (_, i) => {
        const a = (i / 64) * Math.PI * 2;
        const r1 = i % 2 ? 46 : 62;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r1}
            y1={y + Math.sin(a) * r1}
            x2={x + Math.cos(a) * 132}
            y2={y + Math.sin(a) * 132}
            stroke={i % 2 ? '#B89D6E' : '#E6D6B4'}
            strokeWidth={5}
          />
        );
      })}
      <circle cx={x} cy={y} r={134} fill="none" stroke="#C9B286" strokeWidth={4} opacity={0.6} />
      <circle cx={x + 10} cy={y + 14} r={60} fill="rgba(40,30,15,0.25)" style={{filter: 'blur(8px)'}} />
      <circle cx={x} cy={y} r={44} fill="#D8C49C" />
      <circle cx={x} cy={y} r={30} fill="#BFA77C" />
      <circle cx={x - 8} cy={y - 8} r={12} fill="#E9DBBD" opacity={0.7} />
    </g>
  );
  const p = wPos(f);
  return (
    <AbsoluteFill>
      <Linen />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="tea" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#8DA956" />
            <stop offset="0.85" stopColor={C.matcha} />
            <stop offset="1" stopColor={C.matchaDeep} />
          </radialGradient>
          <filter id="foamtex">
            <feTurbulence type="fractalNoise" baseFrequency={0.035 + Math.sin(f / 20) * 0.004} numOctaves="4" seed="2" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.84  0 0 0 0 0.89  0 0 0 0 0.66  0 0 0 1.6 -0.55" />
          </filter>
          <clipPath id="bowlIn">
            <circle cx={cx} cy={cy} r={322} />
          </clipPath>
        </defs>
        <BowlShell cx={cx} cy={cy}>
          <g clipPath="url(#bowlIn)">
            <circle cx={cx} cy={cy} r={322} fill="url(#tea)" />
            <g transform={`rotate(${f * 2.4} ${cx} ${cy})`} opacity={0.35 + froth * 0.6}>
              <rect x={cx - 460} y={cy - 460} width={920} height={920} filter="url(#foamtex)" />
            </g>
            <circle cx={cx} cy={cy} r={322} fill={C.foam} opacity={froth * 0.35} />
            {bubbles}
            {[1, 2, 3].map((k) => {
              const q = wPos(f - k * 2.5);
              return <circle key={k} cx={q.x} cy={q.y} r={150 + k * 14} fill="none" stroke="#E5EDC6" strokeWidth={6} opacity={0.18 / k} />;
            })}
          </g>
        </BowlShell>
        {/* whisk with motion blur ghosts */}
        <g style={{filter: 'blur(1.5px)'}}>
          {[3, 2, 1].map((k) => {
            const q = wPos(f - k * 1.2);
            return tines(q.x, q.y, 0.12 * (4 - k), `g${k}`);
          })}
        </g>
        {tines(p.x, p.y, 1, 'main')}
      </svg>
      <Caption text="whisk. breathe." dur={dur} color={C.ink} y={0.79} />
    </AbsoluteFill>
  );
};

/* ───────────────────────── 4 · Pour ───────────────────────── */

export const Pour: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const surface = 930;
  const streamTop = ramp(f, 48, 70, 0, surface);
  const streamOn = f > 4;
  const streamBottom = ramp(f, 4, 16, 0, surface);
  const glass = 'M 330 700 L 750 700 L 718 1440 Q 716 1468 688 1468 L 392 1468 Q 364 1468 362 1440 Z';
  const clouds = Array.from({length: 16}, (_, i) => {
    const t0 = 14 + rng('ct', i) * 50;
    const p = Math.max(0, (f - t0) / (dur - t0));
    if (f < t0) return null;
    const dx = (rng('cx', i) - 0.5) * 300 * Math.min(1, p * 2.5);
    const dy = 40 + interpolate(p, [0, 1], [0, 280 + rng('cy', i) * 300], {easing: Easing.out(Easing.cubic)});
    const r = interpolate(p, [0, 1], [24, 70 + rng('cr', i) * 60], {easing: Easing.out(Easing.quad)});
    return <circle key={i} cx={540 + dx} cy={surface + dy} r={r} fill={rng('cc', i) > 0.4 ? C.matcha : C.matchaLight} opacity={0.42 - p * 0.18} />;
  });
  const ice = [
    {x: 430, y: 980, r: 12},
    {x: 560, y: 1010, r: -18},
    {x: 470, y: 1120, r: 30},
    {x: 610, y: 1150, r: 8},
  ];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#EFEADF 0%,#E4DDCC 70%,#D6CCB6 100%)'}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <filter id="swirl" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency={0.012 + f * 0.00004} numOctaves="3" seed="5" />
            <feDisplacementMap in="SourceGraphic" scale={90} />
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <clipPath id="glassIn">
            <path d={glass} />
          </clipPath>
          <linearGradient id="milk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F6F0E4" />
            <stop offset="1" stopColor="#E9DFCB" />
          </linearGradient>
          <linearGradient id="topgreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.matcha} />
            <stop offset="1" stopColor={C.matcha} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={0} y={1468} width={W} height={460} fill="#D3C6AC" />
        <ellipse cx={560} cy={1478} rx={260} ry={26} fill="rgba(60,45,25,0.3)" style={{filter: 'blur(14px)'}} />
        <g clipPath="url(#glassIn)">
          <rect x={300} y={surface} width={480} height={600} fill="url(#milk)" />
          <g filter="url(#swirl)">{clouds}</g>
          <rect x={300} y={surface} width={480} height={ramp(f, 20, dur, 0, 170)} fill="url(#topgreen)" opacity={0.75} />
          {ice.map((c, i) => {
            const bob = Math.sin(f / 14 + i) * 6;
            return (
              <g key={i} transform={`rotate(${c.r + bob / 2} ${c.x + 50} ${c.y + 50})`}>
                <rect x={c.x} y={c.y + bob} width={100} height={96} rx={18} fill="rgba(255,255,255,0.28)" stroke="rgba(255,255,255,0.75)" strokeWidth={3} />
                <rect x={c.x + 14} y={c.y + 12 + bob} width={30} height={10} rx={5} fill="white" opacity={0.7} />
              </g>
            );
          })}
          <ellipse cx={540} cy={surface} rx={200} ry={10} fill="white" opacity={0.35} />
        </g>
        {/* stream */}
        {streamOn && streamTop < surface && (
          <path
            d={`M ${532 + Math.sin(f / 3) * 3} ${streamTop} L ${548 + Math.sin(f / 3) * 3} ${streamTop} L ${546} ${streamBottom} L ${534} ${streamBottom} Z`}
            fill={C.matcha}
          />
        )}
        {f > 16 && f < 75 && (
          <ellipse cx={540} cy={surface} rx={40 + ((f * 7) % 50)} ry={8} fill="none" stroke={C.matchaLight} strokeWidth={4} opacity={0.6} />
        )}
        {/* glass */}
        <path d={glass} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.85)" strokeWidth={4} />
        <path d="M 360 730 L 392 1430" stroke="white" strokeWidth={16} opacity={0.5} style={{filter: 'blur(6px)'}} strokeLinecap="round" />
        <path d="M 708 760 L 690 1400" stroke="rgba(90,80,60,0.25)" strokeWidth={10} style={{filter: 'blur(5px)'}} />
        <ellipse cx={540} cy={700} rx={210} ry={16} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={4} />
      </svg>
      <Caption text="moments between moments" dur={dur} color={C.ink} y={0.8} />
    </AbsoluteFill>
  );
};

/* ───────────────────────── 5 · Product hero ───────────────────────── */

export const Product: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame: f - 4, fps, config: {damping: 16, mass: 1.1}});
  const y = interpolate(rise, [0, 1], [180, 0]);
  const tilt = Math.sin(f / 30) * 1.2;
  const leaves = Array.from({length: 9}, (_, i) => ({
    x: rng('fx', i) * W,
    y: 200 + rng('fy', i) * 1500,
    s: 0.6 + rng('fs', i),
    r: rng('fr', i) * 360,
    blur: 2 + rng('fb', i) * 12,
  }));
  return (
    <AbsoluteFill style={{background: `radial-gradient(70% 45% at 50% 42%, #A3B873 0%, ${C.matcha} 45%, #55693A 100%)`}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="drink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6F8C3F" />
            <stop offset="0.38" stopColor="#8EA95A" />
            <stop offset="0.55" stopColor="#CFD8B0" />
            <stop offset="0.7" stopColor="#F2ECDD" />
            <stop offset="1" stopColor="#EDE4D2" />
          </linearGradient>
          <clipPath id="cupIn">
            <path d="M 380 560 L 700 560 L 668 1250 Q 666 1282 636 1282 L 444 1282 Q 414 1282 412 1250 Z" />
          </clipPath>
        </defs>
        {leaves.map((l, i) => (
          <ellipse
            key={i}
            cx={l.x + Math.sin(f / 40 + i) * 20}
            cy={l.y - f * (0.4 + l.s * 0.3)}
            rx={40 * l.s}
            ry={16 * l.s}
            fill="#C9D69F"
            opacity={0.35}
            transform={`rotate(${l.r + f * 0.4} ${l.x} ${l.y - f * (0.4 + l.s * 0.3)})`}
            style={{filter: `blur(${l.blur}px)`}}
          />
        ))}
        <ellipse cx={540} cy={1320} rx={250 - y * 0.4} ry={34} fill="rgba(30,40,15,0.35)" style={{filter: 'blur(18px)'}} />
        <g transform={`translate(0 ${y}) rotate(${tilt} 540 900)`}>
          {/* straw */}
          <rect x={572} y={300} width={30} height={600} rx={8} fill="#EDE3CF" transform="rotate(8 587 600)" />
          <rect x={578} y={300} width={8} height={600} fill="white" opacity={0.5} transform="rotate(8 587 600)" />
          <g clipPath="url(#cupIn)">
            <rect x={360} y={600} width={360} height={700} fill="url(#drink)" />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={420 + i * 70} y={640 + (i % 2) * 60 + Math.sin(f / 15 + i) * 5} width={90} height={84} rx={16} fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth={3} transform={`rotate(${i * 17 - 10} ${460 + i * 70} 690)`} />
            ))}
          </g>
          <path d="M 380 560 L 700 560 L 668 1250 Q 666 1282 636 1282 L 444 1282 Q 414 1282 412 1250 Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.8)" strokeWidth={4} />
          {/* lid */}
          <path d="M 368 562 Q 540 440 712 562 Z" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.85)" strokeWidth={4} />
          <rect x={362} y={552} width={356} height={22} rx={10} fill="rgba(255,255,255,0.55)" />
          <path d="M 410 600 L 438 1240" stroke="white" strokeWidth={14} opacity={0.45} style={{filter: 'blur(5px)'}} strokeLinecap="round" />
          {/* label */}
          <text x={540} y={1100} textAnchor="middle" fontFamily={SERIF} fontSize={74} fill={C.ink}>
            sonder
          </text>
          <text x={540} y={1142} textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize={17} letterSpacing={6} fill={C.ink} opacity={0.8}>
            MATCHA SLOW BAR
          </text>
        </g>
      </svg>
      <AbsoluteFill style={{top: 1420, alignItems: 'center'}}>
        <div style={{fontFamily: SERIF, fontSize: 104, color: C.cream, opacity: ramp(f, 16, 34), translate: `0 ${ramp(f, 16, 38, 30, 0)}px`, letterSpacing: -1}}>
          iced matcha oat latte
        </div>
        <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 28, letterSpacing: 6, color: C.cream, marginTop: 18, opacity: ramp(f, 30, 50) * 0.9}}>
          CEREMONIAL GRADE · OAT MILK · SLOW-WHISKED
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────────────────── 6 · Checkout end card ───────────────────────── */

export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const word = 'sonder'.split('');
  const card = spring({frame: f - 30, fps, config: {damping: 18}});
  const press = f > 66 && f < 74 ? 0.95 : 1;
  const added = f >= 72;
  const ripple = ramp(f, 70, 92);
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 40%, #F7F3EA, ${C.cream} 60%, #E9E1D2)`, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 470, display: 'flex'}}>
        {word.map((ch, i) => (
          <span
            key={i}
            style={{
              fontFamily: SERIF,
              fontSize: 230,
              color: C.ink,
              letterSpacing: -2,
              opacity: ramp(f, 2 + i * 3, 20 + i * 3),
              translate: `0 ${ramp(f, 2 + i * 3, 26 + i * 3, 40, 0)}px`,
              filter: `blur(${ramp(f, 2 + i * 3, 20 + i * 3, 10, 0)}px)`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div style={{position: 'absolute', top: 770, fontFamily: SANS, fontWeight: 400, fontSize: 30, letterSpacing: 12, color: C.matchaDeep, opacity: ramp(f, 18, 34), paddingLeft: 12}}>
        MATCHA SLOW BAR
      </div>
      <div style={{position: 'absolute', top: 830, width: ramp(f, 22, 42, 0, 120), height: 2, background: C.matchaDeep, opacity: 0.5}} />

      {/* checkout card */}
      <div
        style={{
          position: 'absolute',
          top: 950,
          width: 760,
          padding: '40px 44px',
          borderRadius: 40,
          background: '#FFFCF6',
          boxShadow: '0 30px 80px rgba(60,45,20,0.16), 0 2px 6px rgba(60,45,20,0.08)',
          opacity: card,
          translate: `0 ${(1 - card) * 80}px`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{width: 110, height: 110, borderRadius: 28, background: `linear-gradient(180deg, ${C.matcha} 0%, ${C.matchaLight} 45%, ${C.oat} 70%)`}} />
          <div style={{flex: 1}}>
            <div style={{fontFamily: SERIF, fontSize: 52, color: C.ink, lineHeight: 1.05}}>iced matcha oat latte</div>
            <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 24, color: C.ink, opacity: 0.6, marginTop: 8, letterSpacing: 1}}>
              ceremonial grade · 16 oz · less sweet
            </div>
          </div>
        </div>
        <div style={{height: 1, background: 'rgba(42,40,35,0.12)', margin: '34px 0'}} />
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: 112,
            borderRadius: 56,
            background: added ? C.matchaDeep : C.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            scale: String(press),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 380 - 400 * ripple,
              top: 56 - 400 * ripple,
              width: 800 * ripple,
              height: 800 * ripple,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              opacity: 1 - ripple,
            }}
          />
          <span style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, letterSpacing: 3, color: C.cream}}>
            {added ? '✓  ADDED TO YOUR ORDER' : 'ORDER AHEAD'}
          </span>
        </div>
      </div>
      {/* tap cursor */}
      <div
        style={{
          position: 'absolute',
          top: 1290 + ramp(f, 46, 66, 140, 0),
          left: 560 + ramp(f, 46, 66, 120, 0),
          width: 64,
          height: 64,
          borderRadius: 32,
          background: 'rgba(42,40,35,0.25)',
          border: '3px solid rgba(255,255,255,0.9)',
          opacity: ramp(f, 46, 54) * (1 - ramp(f, 80, 90)),
          scale: String(press < 1 ? 0.8 : 1),
        }}
      />
      <div style={{position: 'absolute', top: 1560, fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: C.ink, opacity: ramp(f, 84, 102), translate: `0 ${ramp(f, 84, 106, 20, 0)}px`}}>
        see you at the slow bar
      </div>
      <div style={{position: 'absolute', top: 1650, fontFamily: SANS, fontWeight: 400, fontSize: 26, letterSpacing: 8, color: C.ink, opacity: ramp(f, 92, 110) * 0.7, paddingLeft: 8}}>
        LINK IN BIO
      </div>
    </AbsoluteFill>
  );
};
