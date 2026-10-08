import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const C = {
  cream: '#F3EEE4',
  paper: '#E8DFCF',
  linen: '#DCD2C0',
  ink: '#2A2823',
  matcha: '#7E9A4C',
  matchaLight: '#A9BF78',
  matchaDeep: '#4E6233',
  foam: '#C7D59C',
  oat: '#F1EADB',
  ceramic: '#D8CCB8',
  wood: '#B4946C',
};

export const SERIF = 'Instrument Serif';
export const SANS = 'Inter';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.33, 0, 0.15, 1);

export const ramp = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing: ease});

// Load brand fonts before the first frame renders
export const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [
      new FontFace(SERIF, `url(${staticFile('instrument-serif-latin-400-normal.ttf')})`),
      new FontFace(SERIF, `url(${staticFile('instrument-serif-latin-400-italic.ttf')})`, {style: 'italic'}),
      new FontFace(SANS, `url(${staticFile('Inter-Light.otf')})`, {weight: '300'}),
      new FontFace(SANS, `url(${staticFile('Inter-Regular.otf')})`, {weight: '400'}),
      new FontFace(SANS, `url(${staticFile('Inter-Medium.otf')})`, {weight: '500'}),
    ];
    Promise.all(faces.map((f) => f.load().then(() => document.fonts.add(f)))).then(() => continueRender(handle));
  }, [handle]);
};

// A scene that fades in/out over its edges and drifts like a slow handheld camera
export const Shot: React.FC<{dur: number; children: React.ReactNode; push?: number; seed?: number}> = ({
  dur,
  children,
  push = 0.06,
  seed = 0,
}) => {
  const f = useCurrentFrame();
  const fade = 16;
  const opacity = Math.min(ramp(f, 0, fade), 1 - ramp(f, dur - fade, dur));
  const p = f / dur;
  const scale = 1 + push * interpolate(p, [0, 1], [0, 1], {easing: Easing.out(Easing.quad)});
  const dx = Math.sin(f / 37 + seed) * 6 + Math.sin(f / 13 + seed * 2) * 1.5;
  const dy = Math.cos(f / 41 + seed) * 7 + Math.cos(f / 17 + seed) * 1.5;
  const rot = Math.sin(f / 53 + seed) * 0.25;
  return (
    <AbsoluteFill style={{opacity}}>
      <AbsoluteFill style={{scale: String(scale), translate: `${dx}px ${dy}px`, rotate: `${rot}deg`}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Caption: React.FC<{text: string; dur: number; color?: string; y?: number}> = ({
  text,
  dur,
  color = C.cream,
  y = 0.74,
}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  const out = 1 - ramp(f, dur - 22, dur - 8);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', top: `${y * 100}%`, opacity: out}}>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 92,
          color,
          letterSpacing: -0.5,
          textShadow: color === C.cream ? '0 2px 18px rgba(0,0,0,0.25)' : 'none',
          display: 'flex',
          gap: 22,
        }}
      >
        {words.map((w, i) => {
          const s = 14 + i * 6;
          return (
            <span
              key={i}
              style={{
                opacity: ramp(f, s, s + 18),
                translate: `0 ${ramp(f, s, s + 22, 26, 0)}px`,
                filter: `blur(${ramp(f, s, s + 18, 8, 0)}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const TopMark: React.FC<{color?: string}> = ({color = C.ink}) => (
  <AbsoluteFill style={{alignItems: 'center', top: 150}}>
    <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 28, letterSpacing: 14, color, opacity: 0.8, paddingLeft: 14}}>
      SONDER
    </div>
  </AbsoluteFill>
);

// Animated film grain, light leaks and lens vignette laid over everything
export const FilmLook: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const leakX = 30 + Math.sin(f / 70) * 25;
  const leakY = 20 + Math.cos(f / 90) * 15;
  const flicker = 0.97 + Math.sin(f * 1.7) * 0.012 + Math.sin(f * 0.53) * 0.01;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 40% at ${leakX}% ${leakY}%, rgba(255,190,120,0.22), rgba(255,190,120,0) 70%),
                       radial-gradient(50% 35% at ${100 - leakX}% ${100 - leakY / 2}%, rgba(255,150,110,0.10), rgba(0,0,0,0) 70%)`,
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill
        style={{background: 'radial-gradient(85% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(30,22,12,0.38) 100%)'}}
      />
      <AbsoluteFill style={{backgroundColor: `rgba(0,0,0,${1 - flicker})`}} />
      <svg width={width} height={height} style={{position: 'absolute', mixBlendMode: 'overlay', opacity: 0.5}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 24} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
