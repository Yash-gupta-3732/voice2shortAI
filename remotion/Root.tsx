import { Composition } from 'remotion';
import { MainComposition } from './MainComposition';
import { Project } from '../types';

export type Voice2ShortProps = {
  project: Project | null;
  baseAudioUrl: string;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Voice2ShortMovie"
        component={MainComposition}
        durationInFrames={30 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          project: null,
          baseAudioUrl: ''
        }}
      />
    </>
  );
};
