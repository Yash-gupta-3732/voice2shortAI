import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Scene } from '../../types';

export const SubtitleOverlay: React.FC<{ scene: Scene, fps: number, durationFrames: number }> = ({ scene, fps, durationFrames }) => {
  const frame = useCurrentFrame();
  const text = scene.subtitle || '';
  
  if (!text) return null;

  // Simple typewriter effect for Phase 4:
  // Calculate how many characters to show based on the current frame relative to duration
  // We want the text to finish typing at about 80% of the scene duration so it lingers.
  const typeDurationFrames = durationFrames * 0.8;
  const charsToShow = Math.min(
    text.length,
    Math.floor((frame / typeDurationFrames) * text.length)
  );
  
  const displayedText = text.substring(0, charsToShow);

  return (
    <div style={{
      width: '100%',
      textAlign: 'center',
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '64px',
      fontWeight: 'bold',
      color: 'white',
      textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.8)',
      lineHeight: '1.2',
    }}>
      {/* 
        Phase 4: We're rendering the text as a single block. 
        In Phase 5+, this structure easily supports word-level timestamps 
        by wrapping each word in a <span> and highlighting it based on frame time.
      */}
      {displayedText}
    </div>
  );
};
