import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame} from 'remotion';
import {C, EASE_IN_OUT, EASE_OUT, clamp} from '../theme';
import {Chapter, RevealLine} from '../components/Type';

const CX = 540;
const CY = 880;
const LIQ = 330;
const W_START = 18;
const W_END = 150;

const BUBBLES = new Array(260).fill(0).map((_, i) => {
  const r = Math.sqrt(random(`br${i}`)) * (LIQ - 18);
  const a = random(`ba${i}`) * Math.PI * 2;
  return {x: Math.cos(a) * r, y: Math.sin(a) * r, s: 2 + random(`bs${i}`) ** 2 * 11, at: random(`bt${i}`), pop: random(`bp${i}`)};
});

// Whisk path: the classic fast "M/W" stroke across the bowl
const whiskPos = (f: number) => {
  const ramp = interpolate(f, [W_START, W_START + 25, W_END - 20, W_END], [0, 1, 1, 0.3], clamp);
  const phase = (f - W_START) * 0.62 * (0.4 + ramp * 0.6);
  return {x: Math.sin(phase) * 165 * ramp + Math.sin(f / 9) * 20, y: Math.sin(phase * 2) * 55 * ramp + Math.cos(f / 13) * 30, ramp};
};

const Chasen: React.FC<{x: number; y: number; o: number; scale?: number}> = ({x, y, o, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={o}>
    <circle r={92} fill="rgba(0,0,0,0.35)" transform="translate(26 30)" filter="url(#soft)" />
    {new Array(72).fill(0).map((_, i) => {
      const a = (i / 72) * Math.PI * 2;
      return (
        <line
          key={i}
          x1={Math.cos(a) * 34}
          y1={Math.sin(a) * 34}
          x2={Math.cos(a + 0.05) * 86}
          y2={Math.sin(a + 0.05) * 86}
          stroke={i % 2 ? '#E8D8AE' : '#CDB98A'}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      );
    })}
    {new Array(36).fill(0).map((_, i) => {
      const a = (i / 36) * Math.PI * 2 + 0.04;
      return (
        <line key={i} x1={Math.cos(a) * 20} y1={Math.sin(a) * 20} x2={Math.cos(a) * 46} y2={Math.sin(a) * 46} stroke="#BFA878" strokeWidth={2} />
      );
    })}
    <circle r={30} fill="url(#bamboo)" />
    <circle r={30} fill="none" stroke="#8E7748" strokeWidth={2} />
    <circle r={8} fill="#A88F5E" opacity={0.6} />
  </g>
);

export const Whisk: React.FC = () => {
  const frame = useCurrentFrame();
  const foam = interpolate(frame, [W_START + 5, W_END], [0, 1], {...clamp, easing: EASE_IN_OUT});
  const liquid = interpolateColors(foam, [0, 0.5, 1], ['#33501A', '#6E9330', '#A3C452']);
  const rot = interpolate(frame, [0, 200], [-8, 5], clamp);
  const zoom = interpolate(frame, [0, 200], [1.16, 1.0], {...clamp, easing: EASE_OUT});
  const lift = interpolate(frame, [W_END - 6, W_END + 26], [0, 1], {...clamp, easing: EASE_IN_OUT});
  const enter = interpolate(frame, [0, W_START], [0, 1], {...clamp, easing: EASE_OUT});
  const shimmerSeed = Math.min(frame, W_END);
  const swirl = interpolate(frame, [W_START, W_END + 40], [0, 160], {...clamp, easing: EASE_OUT});
  const wp = whiskPos(frame);

  return (
    <AbsoluteFill style={{background: '#100E0B', overflow: 'hidden'}}>
      {/* soft window light pooling on dark linen */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 60% at 25% 20%, rgba(232,214,170,0.22) 0%, rgba(16,14,11,0) 65%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="linen">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves={2} seed={3} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.6  0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0.18 0" />
          </filter>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="foam" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={4} seed={Math.floor(shimmerSeed / 2)} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.86  0 0 0 0 0.93  0 0 0 0 0.62  2.4 0 0 0 -1.05" />
          </filter>
          <filter id="microfoam" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="turbulence" baseFrequency="0.5" numOctaves={2} seed={Math.floor(shimmerSeed / 3) + 7} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.92  0 0 0 0 0.97  0 0 0 0 0.75  2.2 0 0 0 -0.6" />
          </filter>
          <radialGradient id="bowl" cx="0.42" cy="0.38" r="0.7">
            <stop offset="0" stopColor="#3C342C" />
            <stop offset="0.6" stopColor="#221D19" />
            <stop offset="1" stopColor="#0D0B0A" />
          </radialGradient>
          <radialGradient id="glaze" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.82" stopColor="#6B5A44" stopOpacity="0" />
            <stop offset="0.9" stopColor="#7C6A50" stopOpacity="0.55" />
            <stop offset="1" stopColor="#2A231C" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wall" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.8" stopColor="#1A1613" />
            <stop offset="1" stopColor="#3B332B" />
          </radialGradient>
          <radialGradient id="liqshade" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.7" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
          <radialGradient id="spec" cx="0.3" cy="0.28" r="0.35">
            <stop offset="0" stopColor="#FFF8E0" stopOpacity="0.32" />
            <stop offset="1" stopColor="#FFF8E0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bamboo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E3CF9E" />
            <stop offset="1" stopColor="#A88E5C" />
          </linearGradient>
          <linearGradient id="scoop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D9C08C" />
            <stop offset="1" stopColor="#8C7244" />
          </linearGradient>
          <clipPath id="liq">
            <circle cx={0} cy={0} r={LIQ} />
          </clipPath>
        </defs>
        <rect width={1080} height={1920} filter="url(#linen)" />

        <g transform={`translate(${CX} ${CY}) rotate(${rot}) scale(${zoom})`}>
          {/* chashaku (bamboo scoop) resting beside the bowl, with a dusting of powder */}
          <g transform="translate(250 520) rotate(-32)" opacity={enter}>
            <rect x={-12} y={-280} width={24} height={520} rx={12} fill="rgba(0,0,0,0.5)" transform="translate(18 22)" filter="url(#soft)" />
            <rect x={-11} y={-280} width={22} height={520} rx={11} fill="url(#scoop)" />
            <rect x={-11} y={-20} width={22} height={6} fill="#7A6238" opacity={0.7} />
            <ellipse cx={0} cy={-262} rx={13} ry={18} fill="#8DB33A" opacity={0.9} />
          </g>

          {/* bowl shadow, body, glaze */}
          <circle r={440} fill="rgba(0,0,0,0.7)" transform="translate(40 50)" filter="url(#soft)" />
          <circle r={430} fill="url(#bowl)" />
          <circle r={430} fill="url(#glaze)" />
          <circle r={428} fill="none" stroke="#E9DCC4" strokeOpacity={0.18} strokeWidth={3} strokeDasharray="900 1800" transform="rotate(200)" />
          <circle r={392} fill="url(#wall)" />

          {/* the tea */}
          <g clipPath="url(#liq)">
            <circle r={LIQ} fill={liquid} />
            {/* undissolved powder before whisking */}
            <g opacity={1 - foam * 1.4}>
              {new Array(40).fill(0).map((_, i) => (
                <circle
                  key={i}
                  cx={(random(`cx${i}`) - 0.5) * 220}
                  cy={(random(`cy${i}`) - 0.5) * 220}
                  r={6 + random(`cr${i}`) * 20}
                  fill="#5E7F24"
                  opacity={0.7}
                />
              ))}
            </g>
            <g transform={`rotate(${swirl})`}>
              <rect x={-LIQ} y={-LIQ} width={LIQ * 2} height={LIQ * 2} filter="url(#foam)" opacity={foam * 0.85} />
              <rect x={-LIQ} y={-LIQ} width={LIQ * 2} height={LIQ * 2} filter="url(#microfoam)" opacity={foam * 0.5} />
            </g>
            {/* coarse bubbles appear early, then are whisked finer */}
            {BUBBLES.map((b, i) => {
              const appear = W_START + 8 + b.at * 70;
              const o = interpolate(frame, [appear, appear + 8], [0, 1], clamp) * interpolate(foam, [0.55 + b.pop * 0.35, 0.95], [1, 0.25], clamp);
              if (o <= 0.01) return null;
              const s = b.s * interpolate(foam, [0, 1], [1.1, 0.45], clamp);
              return (
                <g key={i} transform={`rotate(${swirl * 0.9}) translate(${b.x} ${b.y})`} opacity={o}>
                  <circle r={s} fill="rgba(220,240,170,0.25)" stroke="rgba(245,255,215,0.75)" strokeWidth={1.2} />
                  <circle cx={-s * 0.35} cy={-s * 0.35} r={s * 0.25} fill="#FFFFF0" opacity={0.9} />
                </g>
              );
            })}
            {/* motion ripples around the whisk */}
            {wp.ramp > 0.05 &&
              [0, 1, 2].map((k) => (
                <ellipse
                  key={k}
                  cx={wp.x}
                  cy={wp.y}
                  rx={110 + k * 28 + ((frame * 6) % 28)}
                  ry={100 + k * 26 + ((frame * 6) % 28)}
                  fill="none"
                  stroke="#EAF5C8"
                  strokeOpacity={0.12 * wp.ramp * (1 - k / 3)}
                  strokeWidth={3}
                />
              ))}
            <circle r={LIQ} fill="url(#liqshade)" />
            <circle r={LIQ} fill="url(#spec)" />
          </g>
          <circle r={LIQ} fill="none" stroke="#0A0807" strokeOpacity={0.6} strokeWidth={6} />

          {/* chasen with motion-blur ghosts */}
          {lift < 1 &&
            [4, 3, 2, 1, 0].map((g) => {
              const p = whiskPos(frame - g * 0.35);
              return (
                <Chasen
                  key={g}
                  x={p.x}
                  y={p.y - lift * 60}
                  scale={1 + lift * 0.7}
                  o={(g === 0 ? 1 : 0.18) * enter * (1 - lift)}
                />
              );
            })}
        </g>
      </svg>

      {/* steam haze */}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: interpolate(frame, [60, 200], [0, 0.35], clamp)}}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 300 + i * 140 + Math.sin(frame / 30 + i) * 40,
              top: 600 - ((frame * (0.9 + i * 0.2)) % 260),
              width: 260,
              height: 420,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(255,255,245,0.35), rgba(255,255,245,0) 70%)',
              filter: 'blur(30px)',
            }}
          />
        ))}
      </AbsoluteFill>

      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.85) 100%)'}} />
      <Chapter num="03" label="RITUAL" />
      <div style={{position: 'absolute', left: 90, bottom: 300}}>
        <RevealLine text="Whisked," at={40} size={104} />
        <RevealLine text="never hurried." at={56} size={104} italic color={C.froth} />
      </div>
    </AbsoluteFill>
  );
};
