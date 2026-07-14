import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Scene } from '../../types';
import { SceneComposer } from '../../services/composition/core/SceneComposer';
import { CanvasRendererBackend } from '../../services/composition/renderers/CanvasRendererBackend';
import { VisualDirector } from '../../services/semantic/VisualDirector';

export const CanvasRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Convert current frame into milliseconds for the engine
  const timeMs = (frame / fps) * 1000;

  useEffect(() => {
    if (!canvasRef.current || !scene.composition) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // We instantiate the engine here. 
    // In a real optimized system, we would memoize the `root` node 
    // instead of recomposing the rig from scratch every frame.
    // However, since Remotion calls useEffect for every frame anyway 
    // in concurrent rendering mode, this ensures determinism for now.
    const composer = new SceneComposer(scene.duration * 1000);
    const { root, camera } = composer.compose(scene.id, scene.composition);

    // Update timeline and animation logic
    composer.timelineEngine.seek(timeMs);
    composer.update(timeMs, root, camera);

    // Clear and draw
    ctx.clearRect(0, 0, width, height);

    const director = new VisualDirector();
    const themeComposition = director.getThemeComposition(scene);

    const renderer = new CanvasRendererBackend(themeComposition);
    renderer.render(root, camera, {
      ctx,
      width,
      height,
      palette: themeComposition.style.getPalette(),
      timeMs
    });

  }, [frame, fps, scene, timeMs, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      style={{ width: '100%', height: '100%' }}
    />
  );
};
