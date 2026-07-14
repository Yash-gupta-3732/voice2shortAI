import { IRenderPass } from '../RenderPipeline';
import { VisualGraph, VisualElement } from '../../../../types/visuals';

export class StylizationPass implements IRenderPass {
  public id = 'stylization_pass';
  public enabled = true;
  public priority = 50; // Middle priority

  public process(graph: VisualGraph, timeMs: number): VisualGraph {
    // Traverse the visual graph and apply a global stylization
    const applyStyle = (element: VisualElement): VisualElement => {
      const newAppearance = { ...element.appearance };
      
      // Example: Neon style stylization globally forces a thick neon outline
      newAppearance.strokeColor = '#0ea5e9'; // Neon blue outline
      newAppearance.strokeWidth = 3;

      return {
        ...element,
        appearance: newAppearance,
        children: element.children.map(applyStyle)
      };
    };

    return {
      root: applyStyle(graph.root)
    };
  }
}
