import { Composition } from "remotion";
import { Teaser } from "./Teaser";
import T from "./timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Teaser"
      component={Teaser}
      durationInFrames={T.duration * T.fps}
      fps={T.fps}
      width={1920}
      height={1080}
    />
  );
};
