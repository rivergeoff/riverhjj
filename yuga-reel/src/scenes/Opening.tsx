import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C, EASE_IN_OUT, EASE_OUT, F, clamp} from '../theme';

const DUST = new Array(110).fill(0).map((_, i) => ({
  x: random(`dx${i}`) * 1080,
  y: random(`dy${i}`) * 1920,
  r: 1 + random(`dr${i}`) ** 3 * 7,
  z: random(`dz${i}`),
  s: 0.2 + random(`ds${i}`) * 0.6,
  ph: random(`dp${i}`) * Math.PI * 2,
}));

// Is a point inside the diagonal light shaft? Returns 0..1
const inBeam = (x: number, y: number) => {
  // beam axis from (900,-100) to (250,2000)
  const ax = 900, ay = -100, bx = 250, by = 2000;
  const dx = bx - ax, dy = by - ay;
  const t = ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy);
  const px = ax + t * dx, py = ay + t * dy;
  const d = Math.hypot(x - px, y - py);
  return Math.max(0, 1 - d / 260);
};

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const beam = interpolate(frame, [0, 45], [0, 1], {...clamp, easing: EASE_IN_OUT});
  const push = interpolate(frame, [0, 130], [1, 1.07], clamp);
  const kanji = interpolate(frame, [22, 78], [0, 1], {...clamp, easing: EASE_IN_OUT});
  const word = interpolate(frame, [62, 95], [0, 1], {...clamp, easing: EASE_OUT});

  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <AbsoluteFill style={{scale: push}}>
        {/* deep ambient glow */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 80% 55% at 55% 40%, rgba(40,70,40,${0.55 * beam}) 0%, rgba(5,9,6,0) 70%)`,
          }}
        />
        {/* volumetric light shaft */}
        <div
          style={{
            position: 'absolute',
            left: 575 - 230,
            top: -300,
            width: 460,
            height: 2600,
            rotate: '17deg',
            opacity: beam * 0.55,
            filter: 'blur(40px)',
            background:
              'linear-gradient(90deg, rgba(255,236,190,0) 0%, rgba(255,236,190,0.35) 35%, rgba(255,240,205,0.55) 50%, rgba(255,236,190,0.35) 65%, rgba(255,236,190,0) 100%)',
            maskImage: 'linear-gradient(180deg, black 0%, rgba(0,0,0,0.6) 55%, transparent 95%)',
          }}
        />
        {/* drifting dust motes */}
        {DUST.map((d, i) => {
          const y = (d.y - frame * (0.6 + d.s * 1.4) + 1920 * 4) % 1920;
          const x = d.x + Math.sin(frame / 40 + d.ph) * 18 * d.s;
          const lit = inBeam(x, y);
          const o = (0.12 + lit * 0.9) * beam;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: d.r * 2,
                height: d.r * 2,
                borderRadius: '50%',
                background: lit > 0.3 ? '#FFF3D6' : '#B9CF86',
                opacity: o,
                filter: `blur(${(1 - d.z) * 4 + (d.r > 5 ? 3 : 0)}px)`,
                boxShadow: lit > 0.3 ? '0 0 12px rgba(255,230,180,0.8)' : 'none',
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* 悠雅 — brushed in from top to bottom */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            writingMode: 'vertical-rl',
            fontFamily: F.jp,
            fontWeight: 600,
            fontSize: 300,
            letterSpacing: '0.12em',
            color: C.cream,
            marginTop: -140,
            textShadow: '0 0 60px rgba(255,236,190,0.18)',
            filter: `blur(${interpolate(kanji, [0, 1], [10, 0])}px)`,
            maskImage: `linear-gradient(180deg, black ${kanji * 120 - 15}%, transparent ${kanji * 120 + 5}%)`,
            WebkitMaskImage: `linear-gradient(180deg, black ${kanji * 120 - 15}%, transparent ${kanji * 120 + 5}%)`,
          }}
        >
          悠雅
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1390,
            fontFamily: F.sans,
            fontWeight: 300,
            fontSize: 40,
            letterSpacing: interpolate(word, [0, 1], [1.4, 0.9]) + 'em',
            paddingLeft: '0.9em',
            color: C.cream,
            opacity: word,
            filter: `blur(${(1 - word) * 6}px)`,
          }}
        >
          YUGA
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1460,
            fontFamily: F.serif,
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 38,
            color: C.gold,
            opacity: interpolate(frame, [80, 105], [0, 0.9], clamp),
          }}
        >
          the art of slow
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
