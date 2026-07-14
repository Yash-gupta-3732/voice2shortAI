import { AbsoluteFill, Audio, Sequence, useVideoConfig } from 'remotion';
import { Voice2ShortProps } from './Root';
import { VectorRenderer } from './components/VectorRenderer';
import { SubtitleOverlay } from './components/SubtitleOverlay';

export const MainComposition: React.FC<Voice2ShortProps> = ({ project, baseAudioUrl }) => {
  const { fps } = useVideoConfig();

  if (!project || project.scenes.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: 'white', fontFamily: 'monospace' }}>No Project Data</h1>
      </AbsoluteFill>
    );
  }

  // Pre-calculate cumulative durations to determine where each sequence starts
  let cumulativeFrames = 0;
  const sceneSequences = project.scenes.map((scene) => {
    const durationFrames = Math.round(scene.duration * fps);
    const from = cumulativeFrames;
    cumulativeFrames += durationFrames;
    return {
      scene,
      from,
      durationFrames
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#09090b' }}>
      {/* 1. Main Background Audio */}
      {baseAudioUrl && (
        <Audio src={baseAudioUrl} />
      )}

      {/* 2. Scene Timeline */}
      {sceneSequences.map(({ scene, from, durationFrames }) => (
        <Sequence
          key={scene.id}
          from={from}
          durationInFrames={durationFrames}
        >
          {/* Phase 3 Renderer Bridged to React Vector DOM */}
          <AbsoluteFill>
            <VectorRenderer scene={scene} />
          </AbsoluteFill>

          {/* Subtitles Overlay */}
          <AbsoluteFill style={{ padding: '80px', justifyContent: 'flex-end', paddingBottom: '300px' }}>
            <SubtitleOverlay scene={scene} fps={fps} durationFrames={durationFrames} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
