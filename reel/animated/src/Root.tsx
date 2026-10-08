import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, FilmLook, ramp, Shot, TopMark, useFonts} from './fx';
import {EndCard, Morning, Pour, Product, Sift, Whisk} from './scenes';

const FPS = 30;
// [from, duration] in frames; neighbours overlap by 16 frames for soft dissolves
const T = {
  morning: [0, 112],
  sift: [96, 118],
  whisk: [198, 118],
  pour: [300, 132],
  product: [416, 120],
  end: [520, 122],
} as const;
const TOTAL = T.end[0] + T.end[1];

// Brand mark stays put across dissolves: ink on light scenes, cream on the product shot
const Mark: React.FC = () => {
  const f = useCurrentFrame();
  const p = T.product[0];
  const cream = Math.min(ramp(f, p, p + 16), 1 - ramp(f, p + T.product[1] - 16, p + T.product[1]));
  const out = 1 - ramp(f, T.end[0], T.end[0] + 16);
  return (
    <AbsoluteFill style={{opacity: ramp(f, 4, 24) * out}}>
      <AbsoluteFill style={{opacity: 1 - cream}}><TopMark /></AbsoluteFill>
      <AbsoluteFill style={{opacity: cream}}><TopMark color={C.cream} /></AbsoluteFill>
    </AbsoluteFill>
  );
};

const Reel: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{backgroundColor: '#F3EEE4'}}>
      <Sequence from={T.morning[0]} durationInFrames={T.morning[1]} premountFor={FPS}>
        <Shot dur={T.morning[1]} seed={1}><Morning dur={T.morning[1]} /></Shot>
      </Sequence>
      <Sequence from={T.sift[0]} durationInFrames={T.sift[1]} premountFor={FPS}>
        <Shot dur={T.sift[1]} seed={2} push={0.08}><Sift dur={T.sift[1]} /></Shot>
      </Sequence>
      <Sequence from={T.whisk[0]} durationInFrames={T.whisk[1]} premountFor={FPS}>
        <Shot dur={T.whisk[1]} seed={3}><Whisk dur={T.whisk[1]} /></Shot>
      </Sequence>
      <Sequence from={T.pour[0]} durationInFrames={T.pour[1]} premountFor={FPS}>
        <Shot dur={T.pour[1]} seed={4} push={0.07}><Pour dur={T.pour[1]} /></Shot>
      </Sequence>
      <Sequence from={T.product[0]} durationInFrames={T.product[1]} premountFor={FPS}>
        <Shot dur={T.product[1]} seed={5} push={0.05}><Product dur={T.product[1]} /></Shot>
      </Sequence>
      <Sequence from={T.end[0]} durationInFrames={T.end[1]} premountFor={FPS}>
        <Shot dur={T.end[1] + 40} seed={6} push={0.03}><EndCard /></Shot>
      </Sequence>
      <Mark />
      <FilmLook />
      <Audio src={staticFile('score.wav')} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition id="SonderReel" component={Reel} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
);
