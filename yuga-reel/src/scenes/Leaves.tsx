import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C, EASE_SOFT, clamp} from '../theme';
import {Chapter, RevealLine} from '../components/Type';

// Procedural camellia sinensis leaf: serrated ellipse with a pointed tip.
const leafPath = (L: number, W: number, teeth = 34) => {
  const N = 220;
  const right: [number, number][] = [];
  const left: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let w = W * Math.sin(Math.PI * Math.pow(t, 0.72)) * (1 - 0.18 * t);
    const saw = ((t * teeth) % 1) ** 2;
    if (t > 0.08 && t < 0.97) w *= 1 - 0.035 * saw;
    const y = -t * L;
    right.push([w, y]);
    left.push([-w * 0.96, y]);
  }
  const pts = [...right, ...left.reverse()];
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
};

const veins = (L: number, W: number) => {
  const out: string[] = [];
  for (let i = 1; i <= 9; i++) {
    const t = i / 11;
    const y = -t * L;
    const w = W * Math.sin(Math.PI * Math.pow(t, 0.72)) * 0.82;
    for (const s of [1, -1]) {
      out.push(`M0,${y} Q${s * w * 0.45},${y - L * 0.05} ${s * w},${y - L * 0.13}`);
    }
  }
  return out;
};

const Leaf: React.FC<{L: number; W: number; light?: number; id: string}> = ({L, W, light = 1, id}) => {
  const d = useMemo(() => leafPath(L, W), [L, W]);
  const v = useMemo(() => veins(L, W), [L, W]);
  return (
    <g>
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#1E3A12" />
          <stop offset="0.45" stopColor={light > 0.8 ? '#4F7A1E' : '#355A18'} />
          <stop offset="0.55" stopColor={light > 0.8 ? '#6E9A2A' : '#3F6A1C'} />
          <stop offset="1" stopColor="#24451A" />
        </linearGradient>
        <radialGradient id={`sheen${id}`} cx="0.35" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#F4FFD0" stopOpacity={0.35 * light} />
          <stop offset="1" stopColor="#F4FFD0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#lg${id})`} />
      <path d={d} fill={`url(#sheen${id})`} />
      {v.map((p, i) => (
        <path key={i} d={p} stroke="#B9D77A" strokeOpacity={0.28 * light} strokeWidth={2.2} fill="none" />
      ))}
      <path d={`M0,0 L0,${-L * 0.97}`} stroke="#CFE59A" strokeOpacity={0.55 * light} strokeWidth={5} />
      <path d={d} fill="none" stroke="#C9E58C" strokeOpacity={0.25 * light} strokeWidth={2} />
    </g>
  );
};

const BOKEH = new Array(26).fill(0).map((_, i) => ({
  x: random(`bx${i}`) * 1200 - 60,
  y: random(`by${i}`) * 2000 - 40,
  r: 40 + random(`br${i}`) * 140,
  o: 0.15 + random(`bo${i}`) * 0.45,
  warm: random(`bw${i}`) > 0.6,
}));

export const Leaves: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 150], [0, 1], {...clamp, easing: EASE_SOFT});
  const sway = Math.sin(frame / 34) * 1.6;
  const ray = interpolate(frame, [10, 140], [-600, 1400], clamp);
  const drop = interpolate(frame, [0, 150], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: '#0A170C', overflow: 'hidden'}}>
      {/* sun through shade cloth: drifting bokeh */}
      <AbsoluteFill style={{filter: 'blur(26px)', translate: `${-t * 60}px ${t * 30}px`}}>
        {BOKEH.map((b, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: '50%',
              background: b.warm ? 'rgba(236,224,150,1)' : 'rgba(150,196,80,1)',
              opacity: b.o * (0.6 + 0.4 * Math.sin(frame / 25 + i)),
            }}
          />
        ))}
      </AbsoluteFill>
      {/* shade-cloth weave, very faint */}
      <AbsoluteFill
        style={{
          opacity: 0.08,
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(0,0,0,0.9) 0 2px, transparent 2px 9px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.9) 0 2px, transparent 2px 9px)',
          maskImage: 'linear-gradient(180deg, black, transparent 60%)',
        }}
      />

      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* far leaves, defocused */}
        <g filter="url(#far)" opacity={0.75} transform={`translate(${140 - t * 40} ${1700 + t * 20}) rotate(${-38 + sway})`}>
          <Leaf L={900} W={230} light={0.5} id="a" />
        </g>
        <g filter="url(#far)" opacity={0.7} transform={`translate(${1060 - t * 30} ${700}) rotate(${-150 - sway})`}>
          <Leaf L={760} W={200} light={0.5} id="b" />
        </g>
        {/* hero leaf, in focus */}
        <g transform={`translate(${380 + t * 30} ${1500 - t * 40}) rotate(${28 + sway * 0.6}) scale(${1 + t * 0.12})`}>
          <g filter="url(#shadow)">
            <Leaf L={1050} W={290} light={1} id="hero" />
          </g>
          {/* dew drop slowly gathering */}
          <g transform={`translate(${80} ${-560 + drop * 30})`}>
            <ellipse cx={0} cy={0} rx={30 + drop * 6} ry={34 + drop * 8} fill="rgba(210,240,170,0.18)" stroke="rgba(240,255,220,0.5)" strokeWidth={1.5} />
            <ellipse cx={-10} cy={-14} rx={9} ry={6} fill="#FFFFFF" opacity={0.85} />
            <ellipse cx={8} cy={20} rx={14} ry={5} fill="#E9FFB8" opacity={0.35} />
          </g>
        </g>
        {/* foreground leaf, heavily defocused, sweeping */}
        <g filter="url(#near)" opacity={0.92} transform={`translate(${-120 + t * 90} ${600 - t * 60}) rotate(${70 + sway})`}>
          <Leaf L={1100} W={320} light={0.35} id="c" />
        </g>
        <defs>
          <filter id="far" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="near" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="38" />
          </filter>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="30" stdDeviation="30" floodColor="#000" floodOpacity="0.55" />
          </filter>
        </defs>
      </svg>

      {/* sun ray sweeping across */}
      <div
        style={{
          position: 'absolute',
          left: ray,
          top: -400,
          width: 380,
          height: 2800,
          rotate: '24deg',
          mixBlendMode: 'screen',
          filter: 'blur(60px)',
          background: 'linear-gradient(90deg, transparent, rgba(255,240,190,0.35), transparent)',
        }}
      />

      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(4,10,5,0.85) 100%)'}} />
      <Chapter num="01" label="SHADE" />
      <div style={{position: 'absolute', left: 90, bottom: 300}}>
        <RevealLine text="Grown in shade," at={26} size={104} />
        <RevealLine text="picked by hand." at={42} size={104} italic color={C.froth} />
      </div>
    </AbsoluteFill>
  );
};
