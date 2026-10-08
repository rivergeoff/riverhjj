import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C, EASE_IN_OUT, EASE_OUT, F, clamp} from '../theme';

const R = 300;
const CIRC = 2 * Math.PI * R;

// Ensō: several offset, slightly varied strokes read as bristles of one brush.
const BRISTLES = new Array(14).fill(0).map((_, i) => ({
  dr: (random(`er${i}`) - 0.5) * 34,
  w: 4 + random(`ew${i}`) * 14,
  o: 0.45 + random(`eo${i}`) * 0.55,
  lag: random(`el${i}`) * 0.06,
  end: 0.88 + random(`ee${i}`) * 0.07,
}));

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [6, 52], [0, 1], {...clamp, easing: EASE_IN_OUT});
  const kanji = interpolate(frame, [34, 64], [0, 1], {...clamp, easing: EASE_OUT});
  const word = interpolate(frame, [52, 82], [0, 1], {...clamp, easing: EASE_OUT});
  const tag = interpolate(frame, [70, 100], [0, 1], {...clamp, easing: EASE_OUT});
  const seal = interpolate(frame, [58, 66], [0, 1], {...clamp, easing: EASE_OUT});
  const drift = interpolate(frame, [0, 150], [1.04, 1], clamp);

  return (
    <AbsoluteFill style={{background: C.cream, overflow: 'hidden'}}>
      {/* washi paper */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <filter id="washi">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves={4} seed={11} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.4  0 0 0 0.16 0" />
        </filter>
        <filter id="fibres">
          <feTurbulence type="turbulence" baseFrequency="0.06 0.006" numOctaves={2} seed={4} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.97  0 0 0 0.35 -0.05" />
        </filter>
        <rect width={1080} height={1920} filter="url(#washi)" />
        <rect width={1080} height={1920} filter="url(#fibres)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(255,252,240,0.6), rgba(0,0,0,0) 70%)'}} />

      <AbsoluteFill style={{scale: drift}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id="brush" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} seed={9} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="14" />
            </filter>
          </defs>
          <g transform="translate(540 760) rotate(-62)" filter="url(#brush)">
            {BRISTLES.map((b, i) => {
              const p = Math.max(0, draw - b.lag) * b.end;
              return (
                <circle
                  key={i}
                  r={R + b.dr}
                  fill="none"
                  stroke={C.moss}
                  strokeOpacity={b.o}
                  strokeWidth={b.w * (1 + (1 - draw) * 0.6)}
                  strokeLinecap="round"
                  strokeDasharray={`${p * CIRC} ${CIRC}`}
                />
              );
            })}
          </g>
        </svg>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 760 - 190,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              writingMode: 'vertical-rl',
              fontFamily: F.jp,
              fontWeight: 600,
              fontSize: 160,
              letterSpacing: '0.1em',
              color: C.moss,
              opacity: kanji,
              filter: `blur(${(1 - kanji) * 10}px)`,
            }}
          >
            悠雅
          </div>
        </div>
        {/* hanko seal stamped */}
        <div
          style={{
            position: 'absolute',
            left: 540 + 205,
            top: 760 + 170,
            width: 74,
            height: 74,
            background: C.seal,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: F.jp,
            fontWeight: 600,
            fontSize: 46,
            color: C.cream,
            opacity: seal * 0.92,
            scale: interpolate(seal, [0, 1], [1.5, 1]),
            rotate: '4deg',
          }}
        >
          茶
        </div>

        <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center'}}>
          <div
            style={{
              fontFamily: F.serif,
              fontWeight: 500,
              fontSize: 150,
              letterSpacing: interpolate(word, [0, 1], [0.5, 0.28]) + 'em',
              paddingLeft: '0.28em',
              color: C.moss,
              opacity: word,
              filter: `blur(${(1 - word) * 8}px)`,
            }}
          >
            YUGA
          </div>
          <div
            style={{
              margin: '26px auto 0',
              width: interpolate(word, [0, 1], [0, 140]),
              height: 1.5,
              background: C.gold,
            }}
          />
          <div
            style={{
              marginTop: 34,
              fontFamily: F.sans,
              fontWeight: 300,
              fontSize: 26,
              letterSpacing: '0.55em',
              paddingLeft: '0.55em',
              color: C.moss,
              opacity: word * 0.85,
            }}
          >
            CEREMONIAL MATCHA
          </div>
          <div
            style={{
              marginTop: 120,
              fontFamily: F.serif,
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 64,
              color: '#4E6B2E',
              opacity: tag,
              translate: `0px ${(1 - tag) * 20}px`,
              filter: `blur(${(1 - tag) * 8}px)`,
            }}
          >
            Slow is a flavour.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
