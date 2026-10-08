import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, EASE_OUT, F, clamp} from '../theme';

// A line of type that rises out of a soft blur, then dissolves away.
export const RevealLine: React.FC<{
  text: string;
  at: number;
  out?: number;
  size?: number;
  italic?: boolean;
  color?: string;
  family?: string;
  weight?: number;
  tracking?: string;
  style?: React.CSSProperties;
}> = ({text, at, out, size = 96, italic, color = C.cream, family = F.serif, weight = 300, tracking = '-0.01em', style}) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [at, at + 28], [0, 1], {...clamp, easing: EASE_OUT});
  const outP = out === undefined ? 0 : interpolate(frame, [out, out + 18], [0, 1], clamp);
  return (
    <div
      style={{
        fontFamily: family,
        fontStyle: italic ? 'italic' : 'normal',
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: tracking,
        color,
        opacity: inP * (1 - outP),
        translate: `0px ${interpolate(inP, [0, 1], [34, 0]) - outP * 14}px`,
        filter: `blur(${interpolate(inP, [0, 1], [14, 0]) + outP * 8}px)`,
        whiteSpace: 'pre',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// Small editorial chapter mark: "01 — SHADE"
export const Chapter: React.FC<{num: string; label: string; at?: number; out?: number}> = ({num, label, at = 8, out}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 30], [0, 1], {...clamp, easing: EASE_OUT});
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 15], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top: 150,
        left: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        fontFamily: F.sans,
        fontWeight: 300,
        fontSize: 24,
        letterSpacing: '0.42em',
        color: C.cream,
        opacity: p * o * 0.85,
      }}
    >
      <span>{num}</span>
      <span style={{width: interpolate(p, [0, 1], [0, 90]), height: 1, background: C.cream, opacity: 0.6}} />
      <span>{label}</span>
    </div>
  );
};
