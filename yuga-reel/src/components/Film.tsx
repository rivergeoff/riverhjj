import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {clamp} from '../theme';

// Animated 35mm-style grain: a fresh turbulence seed every frame.
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.11}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity, pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.75}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

// Subtle projector gate weave + exposure flicker, applied to the whole picture.
export const GateWeave: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const x = (random(`wx${Math.floor(frame / 2)}`) - 0.5) * 1.6;
  const y = (random(`wy${Math.floor(frame / 2)}`) - 0.5) * 1.6;
  const flicker = 1 + (random(`fl${frame}`) - 0.5) * 0.025;
  return (
    <AbsoluteFill style={{translate: `${x}px ${y}px`, filter: `brightness(${flicker})`}}>{children}</AbsoluteFill>
  );
};

// Warm anamorphic-ish light leak sweeping across the frame.
export const LightLeak: React.FC<{start: number; duration: number; hue?: string}> = ({
  start,
  duration,
  hue = '255,190,120',
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + duration], [0, 1], clamp);
  const o = interpolate(p, [0, 0.35, 1], [0, 0.55, 0], clamp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        opacity: o,
        background: `radial-gradient(ellipse 60% 45% at ${interpolate(p, [0, 1], [-10, 110])}% ${interpolate(
          p,
          [0, 1],
          [20, 60],
        )}%, rgba(${hue},0.9) 0%, rgba(${hue},0.25) 40%, rgba(0,0,0,0) 75%)`,
      }}
    />
  );
};
