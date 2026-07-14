import { IRenderPass } from '../RenderPipeline';
import { VisualGraph, VisualElement } from '../../../../types/visuals';

export class LightingPass implements IRenderPass {
  public id = 'lighting_pass';
  public enabled = true;
  public priority = 20; // High priority (before stylization)

  public process(graph: VisualGraph, timeMs: number): VisualGraph {
    // A simple simulation of ambient lighting pulsing
    const intensity = 0.5 + Math.sin(timeMs / 1000) * 0.2; // Pulses between 0.3 and 0.7

    const applyLighting = (element: VisualElement): VisualElement => {
      const newAppearance = { ...element.appearance };
      
      // We pass the global ambient intensity to the renderer
      newAppearance.ambientLightIntensity = intensity;

      return {
        ...element,
        appearance: newAppearance,
        children: element.children.map(applyLighting)
      };
    };

    return {
      root: applyLighting(graph.root)
    };
  }
}
