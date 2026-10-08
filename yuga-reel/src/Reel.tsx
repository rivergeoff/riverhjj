import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {Opening} from './scenes/Opening';
import {Footage} from './scenes/Footage';
import {EndCard} from './scenes/EndCard';
import {GateWeave, Grain, LightLeak, Vignette} from './components/Film';

export const T = 12; // transition length (frames)
export const SCENES = {opening: 120, leaves: 150, powder: 150, whisk: 200, hero: 190, end: 150};
export const TOTAL = Object.values(SCENES).reduce((a, b) => a + b, 0) - T * (Object.keys(SCENES).length - 1);

const tr = () => <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: T})} />;

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const endStart = TOTAL - SCENES.end;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <GateWeave>
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={SCENES.opening} premountFor={30}>
            <Opening />
          </TransitionSeries.Sequence>
          {tr()}
          <TransitionSeries.Sequence durationInFrames={SCENES.leaves} premountFor={30}>
            <Footage src="shots/leaves.mp4" chapter={["01", "SHADE"]} lines={["Grown in shade,", "picked by hand."]} at={26} />
          </TransitionSeries.Sequence>
          {tr()}
          <TransitionSeries.Sequence durationInFrames={SCENES.powder} premountFor={30}>
            <Footage src="shots/powder.mp4" chapter={["02", "STONE"]} lines={["Stone-milled", "to a fine whisper."]} at={44} push={0.02} />
          </TransitionSeries.Sequence>
          {tr()}
          <TransitionSeries.Sequence durationInFrames={SCENES.whisk} premountFor={30}>
            <Footage src="shots/whisk.mp4" chapter={["03", "RITUAL"]} lines={["Whisked,", "never hurried."]} at={40} />
          </TransitionSeries.Sequence>
          {tr()}
          <TransitionSeries.Sequence durationInFrames={SCENES.hero} premountFor={30}>
            <Footage src="shots/hero.mp4" kicker="CEREMONIAL GRADE" lines={["A quiet ritual,", "kept in a tin."]} at={78} align="center" push={0} />
          </TransitionSeries.Sequence>
          {tr()}
          <TransitionSeries.Sequence durationInFrames={SCENES.end} premountFor={30}>
            <EndCard />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </GateWeave>
      <LightLeak start={102} duration={36} />
      <LightLeak start={372} duration={40} hue="200,235,150" />
      <LightLeak start={560} duration={40} />
      <LightLeak start={738} duration={34} hue="255,225,170" />
      <Vignette strength={frame >= endStart + 6 ? 0.28 : 0.75} />
      <Grain opacity={frame >= endStart + 6 ? 0.16 : 0.11} />
      <Audio src={staticFile('score.wav')} />
    </AbsoluteFill>
  );
};
