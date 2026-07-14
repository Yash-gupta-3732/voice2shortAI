/**
 * @file RigBuilder.ts
 * @description Constructs the hierarchical Scene Graph for a character using the universal rig specification.
 */

import { STICKMAN_RIG } from '../../rig/StickmanRig';
import { BoneId, BoneDefinition } from '../../../types/rig/Skeleton';
import { CharacterNode, BoneNode } from '../core/SceneGraph';

export class RigBuilder {
  /**
   * Instantiates a new CharacterNode with a full hierarchy of BoneNodes.
   * @param id Unique ID for this instance in the scene graph
   * @param characterId The semantic assetId of the character
   */
  public buildCharacter(id: string, characterId: string): CharacterNode {
    const charNode = new CharacterNode(id, characterId);
    
    const nodeMap = new Map<BoneId, BoneNode>();

    // 1. Create all bone nodes
    for (const boneId of STICKMAN_RIG.traversalOrder) {
      const def = STICKMAN_RIG.bones[boneId];
      if (def) {
        const node = new BoneNode(def);
        nodeMap.set(boneId, node);
      }
    }

    // 2. Build hierarchy
    for (const boneId of STICKMAN_RIG.traversalOrder) {
      const def = STICKMAN_RIG.bones[boneId];
      const node = nodeMap.get(boneId)!;

      if (def.parentId === null) {
        // Root bone attaches directly to CharacterNode
        charNode.add(node);
      } else {
        // Attach to parent bone
        const parentNode = nodeMap.get(def.parentId);
        if (parentNode) {
          parentNode.add(node);
        }
      }
    }

    // Compute initial world matrices (rest pose)
    charNode.updateWorldMatrix(true);

    return charNode;
  }
}
