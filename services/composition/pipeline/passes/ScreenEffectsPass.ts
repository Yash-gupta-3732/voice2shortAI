import { IRenderPass } from '../RenderPipeline';
import { VisualGraph, VisualElement } from '../../../../types/visuals';
import { Matrix3 } from '../../core/Math';

export class ScreenEffectsPass implements IRenderPass {
  public id = 'screen_effects_pass';
  public enabled = false;
  public priority = 90; // Lowest priority (executed last to be on top)

  public process(graph: VisualGraph, timeMs: number): VisualGraph {
    // Add a cinematic vignette/flash node on top of everything
    
    // Simulate a screen flash at the beginning (e.g. thunder)
    let flashOpacity = 0;
    if (timeMs > 1000 && timeMs < 1200) {
      flashOpacity = 1.0 - (timeMs - 1000) / 200; // Fade out from 1 to 0 over 200ms
    }

    const vignetteElement: VisualElement = {
      id: 'vignette_overlay',
      type: 'sprite', // A screen-space overlay
      semanticAssetId: 'effect_vignette',
      transform: new Matrix3(), // Identity matrix (covers screen)
      appearance: {
        opacity: 0.5, // Constant vignette
      },
      animationState: {},
      children: []
    };
    
    const flashElement: VisualElement = {
      id: 'flash_overlay',
      type: 'sprite',
      semanticAssetId: 'effect_flash',
      transform: new Matrix3(),
      appearance: {
        opacity: Math.max(0, flashOpacity),
        fillColor: '#ffffff'
      },
      animationState: {},
      children: []
    };

    // We clone the root and append these effects as its children 
    // so they are drawn last (on top)
    const newRoot = {
      ...graph.root,
      children: [
        ...graph.root.children,
        vignetteElement,
        flashElement
      ]
    };

    return { root: newRoot };
  }
}
