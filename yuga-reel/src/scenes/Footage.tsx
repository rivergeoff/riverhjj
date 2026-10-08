import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, F, clamp} from '../theme';
import {Chapter, RevealLine} from '../components/Type';

// A rendered 3D shot with its editorial type: chapter mark + two-line caption.
export const Footage: React.FC<{
  src: string;
  chapter?: [string, string];
  lines: [string, string];
  at?: number;
  align?: 'left' | 'center';
  kicker?: string;
  push?: number;
}> = ({src, chapter, lines, at = 30, align = 'left', kicker, push = 0.04}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{scale: interpolate(frame, [0, 200], [1, 1 + push], clamp)}}>
        <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.78) 100%)'}}
      />
      {chapter && <Chapter num={chapter[0]} label={chapter[1]} />}
      {kicker && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center'}}>
          <RevealLine text={kicker} at={at - 8} size={26} family={F.sans} tracking="0.5em" color={C.gold} style={{paddingLeft: '0.5em'}} />
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: align === 'left' ? 90 : 0,
          right: align === 'left' ? undefined : 0,
          bottom: 280,
          textAlign: align,
          textShadow: '0 2px 30px rgba(0,0,0,0.5)',
        }}
      >
        <RevealLine text={lines[0]} at={at} size={align === 'left' ? 104 : 96} />
        <RevealLine text={lines[1]} at={at + 16} size={align === 'left' ? 104 : 96} italic color={C.froth} />
      </div>
    </AbsoluteFill>
  );
};
