import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { Scene } from '../../types';
import { SceneComposer } from '../../services/composition/core/SceneComposer';
import { VisualComposer } from '../../services/composition/visuals/VisualComposer';
import { VisualElement } from '../../types/visuals';
import { VectorElementResolver } from './VectorRenderer/VectorComponents';

import { RenderPipeline } from '../../services/composition/pipeline/RenderPipeline';
import { StylizationPass } from '../../services/composition/pipeline/passes/StylizationPass';
import { LightingPass } from '../../services/composition/pipeline/passes/LightingPass';
import { ScreenEffectsPass } from '../../services/composition/pipeline/passes/ScreenEffectsPass';

export const VectorRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const timeMs = (frame / fps) * 1000;
  
  // Initialize composer, visual composer, and pipeline once
  const { composer, root, camera, visualComposer, renderPipeline } = useMemo(() => {
    const comp = new SceneComposer(scene.duration * 1000);
    const { root, camera } = comp.compose(scene.id, scene.composition);
    
    const vc = new VisualComposer();
    
    const pipeline = new RenderPipeline();
    pipeline.addPass(new LightingPass());
    pipeline.addPass(new StylizationPass());
    pipeline.addPass(new ScreenEffectsPass());

    return { composer: comp, root, camera, visualComposer: vc, renderPipeline: pipeline };
  }, [scene]);

  // Update animation/kinematics engine
  composer.timelineEngine.seek(timeMs);
  composer.update(timeMs, root, camera);

  // Generate the renderer-agnostic VisualGraph
  const baseVisualGraph = visualComposer.compose(root, camera, timeMs);

  // Apply Render Passes (Lighting, Stylization, Screen Effects)
  const finalRenderGraph = renderPipeline.execute(baseVisualGraph, timeMs);

  // Compute Camera Transform for World Container
  // The character is ~200 units tall. Scale it so it fills a reasonable portion of the screen.
  const baseScale = height / 450; 
  const scaleY = -camera.zoom * baseScale; // Flip Y
  const scaleX = camera.zoom * baseScale;
  
  const camX = -camera.localTransform.position.x * scaleX;
  const camY = -camera.localTransform.position.y * Math.abs(scaleY);
  
  const worldTransform = `translate(${width / 2}px, ${height * 0.8}px) scale(${scaleX}, ${scaleY}) translate(${camX}px, ${camY}px)`;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#09090b' }}>
      <div style={{ transform: worldTransform, transformOrigin: '0 0', position: 'absolute', width: '100%', height: '100%' }}>
        <VisualElementRenderer element={finalRenderGraph.root} />
      </div>
    </AbsoluteFill>
  );
};

const VisualElementRenderer: React.FC<{ element: VisualElement }> = ({ element }) => {
  if (element.appearance.opacity === 0) return null;

  const children = element.children.map(child => (
    <VisualElementRenderer key={child.id} element={child} />
  ));

  const opacity = element.appearance.opacity !== undefined ? element.appearance.opacity : 1;

  if (element.type === 'sprite' && element.semanticAssetId) {
    let background = 'transparent';
    if (element.semanticAssetId === 'effect_flash') {
      background = element.appearance.fillColor || '#ffffff';
    } else if (element.semanticAssetId === 'effect_vignette') {
      background = 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 150%)';
    }

    return (
      <>
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background,
            opacity,
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
        {children}
      </>
    );
  }

  if (element.type === 'vector' && element.semanticAssetId) {
    const e = element.transform.elements;
    const cssMatrix = `matrix(${e[0]}, ${e[1]}, ${e[3]}, ${e[4]}, ${e[6]}, ${e[7]})`;

    return (
      <>
        <div 
          style={{
            position: 'absolute',
            transform: cssMatrix,
            transformOrigin: '0 0',
            marginLeft: '-20px', 
            marginTop: '-20px',
            width: '40px',
            height: '40px',
            opacity,
          }}
        >
          <div style={{ transform: 'scaleY(-1)', width: '100%', height: '100%' }}>
            <VectorElementResolver 
              semanticId={element.semanticAssetId} 
              appearance={element.appearance} 
              animationState={element.animationState} 
            />
          </div>
        </div>
        {children}
      </>
    );
  }

  // Base group node
  return <>{children}</>;
};
