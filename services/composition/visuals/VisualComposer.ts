import { SceneNode, CharacterNode, BoneNode, PropNode, CameraNode } from '../core/SceneGraph';
import { VisualGraph, VisualElement, AppearanceState, AnimationState } from '../../../types/visuals';

export class VisualComposer {
  
  /**
   * Traverses the SceneGraph and generates a renderer-agnostic VisualGraph.
   */
  public compose(sceneRoot: SceneNode, camera: CameraNode, timeMs: number): VisualGraph {
    const rootElement = this.mapNode(sceneRoot, timeMs);
    return { root: rootElement };
  }

  private mapNode(node: SceneNode, timeMs: number): VisualElement {
    let type: 'group' | 'vector' | 'mesh' | 'sprite' = 'group';
    let semanticAssetId: string | undefined = undefined;
    const children: VisualElement[] = [];

    // Base Appearance
    const appearance: AppearanceState = {
      opacity: node.visible ? 1.0 : 0.0,
    };

    const animationState: AnimationState = {};

    if (node instanceof CharacterNode) {
      // Determine Character's base visual ID
      semanticAssetId = node.characterId;

      // Extract expression and lip-sync state for the facial rig
      const expr = node.expressionId || 'neutral';
      
      // Simple procedural blinking based on time
      const isBlinking = Math.sin(timeMs / 500) > 0.95;
      
      animationState.isBlinking = isBlinking;
      animationState.isTalking = expr === 'talking';

      // Example of mapping themes to appearance overrides
      if (node.characterId === 'astronaut') {
        appearance.fillColor = '#e2e8f0';
        appearance.strokeColor = '#334155';
      } else {
        appearance.fillColor = '#94a3b8';
      }
    } else if (node instanceof BoneNode) {
      type = 'vector'; // Bones typically represent renderable limbs/parts
      
      // Resolve semantic ID based on parent character and bone type
      const charNode = this.findParentCharacter(node);
      const prefix = charNode ? charNode.characterId : 'default';
      
      // Map bone ID to semantic asset ID (e.g. 'chest' -> 'astronaut_torso')
      semanticAssetId = `${prefix}_${node.boneDef.id}`;
      
    } else if (node instanceof PropNode) {
      type = 'vector';
      semanticAssetId = node.id; // Props usually carry their semantic ID directly
    }

    // Recursively map children
    for (const child of node.children) {
      if (child.visible) {
        children.push(this.mapNode(child, timeMs));
      }
    }

    return {
      id: node.id,
      type,
      semanticAssetId,
      transform: node.worldMatrix.clone(),
      appearance,
      animationState,
      children
    };
  }

  private findParentCharacter(node: SceneNode): CharacterNode | null {
    let current = node.parent;
    while (current) {
      if (current instanceof CharacterNode) return current;
      current = current.parent;
    }
    return null;
  }
}
