import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {Reel, TOTAL} from './Reel';
import {loadFonts} from './theme';

const WithFonts: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    loadFonts().then(() => continueRender(handle));
  }, [handle]);
  return <Reel />;
};

export const RemotionRoot: React.FC = () => (
  <Composition id="YugaReel" component={WithFonts} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
