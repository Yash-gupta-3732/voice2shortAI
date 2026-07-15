/**
 * @file VectorRenderer.tsx
 * @description The top-level Remotion renderer component.
 *
 * Pipeline:
 *   SceneComposer → root SceneNode
 *   → VisualComposer → VisualGraph
 *   → RenderPipeline (passes) → finalRenderGraph
 *   → SplineBodyRenderer (body splines) + VectorElementRenderer (effects/bg)
 */

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { Scene } from '../../types';
import { SceneComposer } from '../../services/composition/core/SceneComposer';
import { VisualComposer } from '../../services/composition/visuals/VisualComposer';
import { VisualElement } from '../../types/visuals';
import { SplineBodyRenderer } from './SplineBodyRenderer';

import { RenderPipeline } from '../../services/composition/pipeline/RenderPipeline';
import { StylizationPass } from '../../services/composition/pipeline/passes/StylizationPass';
import { LightingPass } from '../../services/composition/pipeline/passes/LightingPass';
import { ScreenEffectsPass } from '../../services/composition/pipeline/passes/ScreenEffectsPass';

export const VectorRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const timeMs = (frame / fps) * 1000;

  // Initialize the full engine pipeline once per scene
  const { composer, root, camera, visualComposer, renderPipeline } = useMemo(() => {
    const comp = new SceneComposer(scene.duration * 1000);
    const { root, camera } = comp.compose(scene.id, scene.composition as any);

    const vc = new VisualComposer();

    const pipeline = new RenderPipeline();
    pipeline.addPass(new LightingPass());
    pipeline.addPass(new StylizationPass());
    pipeline.addPass(new ScreenEffectsPass()); // disabled by default

    return { composer: comp, root, camera, visualComposer: vc, renderPipeline: pipeline };
  }, [scene]);

  // Advance animation / IK / kinematics
  composer.timelineEngine.seek(timeMs);
  composer.update(timeMs, root, camera);

  // Build renderer-agnostic VisualGraph
  const baseVisualGraph = visualComposer.compose(root, camera, timeMs);

  // Apply modular render passes (lighting, stylization, screen effects)
  const finalRenderGraph = renderPipeline.execute(baseVisualGraph, timeMs);

  // ── Camera / World Transform ─────────────────────────────────────────────
  // Character full height ≈ 190 world units (pelvis at 0 → head at ~190).
  // We scale so the character takes up roughly 65% of screen height.
  const baseScale = (height * 0.65) / 190;
  const scaleX =  camera.zoom * baseScale;
  const scaleY = -camera.zoom * baseScale; // flip Y (engine is Y-up, CSS is Y-down)

  const camX = -camera.localTransform.position.x * scaleX;
  const camY = -camera.localTransform.position.y * Math.abs(scaleY);

  // Anchor point: bottom-center of the character sits at 78% down the screen
  const worldTransform = `translate(${width / 2}px, ${height * 0.78}px) scale(${scaleX}, ${scaleY}) translate(${camX}px, ${camY}px)`;

  // Find the character visual element (type='vector', first child of root)
  const charElement = findCharacterElement(finalRenderGraph.root);
  const charAppearance = charElement?.appearance ?? { opacity: 1 };

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#0f172a' }}>
      {/* ── Soft gradient background ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 100%, #1e293b 0%, #0f172a 70%)',
      }} />

      {/* ── World-space container ── */}
      <div style={{
        transform: worldTransform,
        transformOrigin: '0 0',
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}>
        {/* Body: single SVG of smooth tapered splines + modular face */}
        <SplineBodyRenderer
          root={finalRenderGraph.root}
          appearance={charAppearance}
        />
      </div>

      {/* ── Screen-space overlays (effects, subtitles bg, etc.) ── */}
      <ScreenSpaceEffects root={finalRenderGraph.root} />
    </AbsoluteFill>
  );
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Find the first 'vector' typed element in the VisualGraph (the character root) */
function findCharacterElement(el: VisualElement): VisualElement | null {
  if (el.type === 'vector') return el;
  for (const child of el.children) {
    const found = findCharacterElement(child);
    if (found) return found;
  }
  return null;
}

/** Render screen-space overlay effects (flash, vignette) that live outside world transform */
const ScreenSpaceEffects: React.FC<{ root: VisualElement }> = ({ root }) => {
  const effects = collectSpriteEffects(root);
  if (effects.length === 0) return null;

  return (
    <>
      {effects.map(el => {
        const opacity = el.appearance.opacity ?? 1;
        if (opacity === 0) return null;

        let background = 'transparent';
        if (el.semanticAssetId === 'effect_flash') {
          background = el.appearance.fillColor || '#ffffff';
        } else if (el.semanticAssetId === 'effect_vignette') {
          background = 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 150%)';
        }

        return (
          <div
            key={el.id}
            style={{
              position: 'absolute', inset: 0,
              background,
              opacity,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        );
      })}
    </>
  );
};

function collectSpriteEffects(el: VisualElement): VisualElement[] {
  const out: VisualElement[] = [];
  if (el.type === 'sprite' && el.semanticAssetId) out.push(el);
  for (const child of el.children) out.push(...collectSpriteEffects(child));
  return out;
}
