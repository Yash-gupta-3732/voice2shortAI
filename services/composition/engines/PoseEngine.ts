/**
 * @file PoseEngine.ts
 * @description Applies Pose snapshots to a CharacterNode's bone hierarchy.
 */

import { CharacterNode, BoneNode } from '../core/SceneGraph';
import { POSE_LIBRARY } from '../../rig/PoseLibrary';
import { PoseId, PoseSnapshot } from '../../../types/rig/AnimationStandard';
import { STICKMAN_RIG } from '../../rig/StickmanRig';

export class PoseEngine {
  /**
   * Applies a specific pose snapshot to a character node.
   * Bones not defined in the pose are reset to their rest transform.
   */
  public applyPose(character: CharacterNode, poseId: PoseId): void {
    const pose = POSE_LIBRARY[poseId];
    if (!pose) {
      console.warn(`[PoseEngine] Unknown pose: ${poseId}`);
      return;
    }

    this.applySnapshot(character, pose);
  }

  /**
   * Applies a given PoseSnapshot directly.
   */
  public applySnapshot(character: CharacterNode, snapshot: PoseSnapshot): void {
    character.traverse(node => {
      if (node instanceof BoneNode) {
        const boneId = node.boneDef.id;
        const targetTransform = snapshot[boneId];

        if (targetTransform) {
          node.localTransform = {
            position: { ...targetTransform.position },
            rotation: { ...targetTransform.rotation },
            scale: { ...targetTransform.scale }
          };
        } else {
          // Reset to rest pose
          const rest = STICKMAN_RIG.bones[boneId].restTransform;
          node.localTransform = {
            position: { ...rest.position },
            rotation: { ...rest.rotation },
            scale: { ...rest.scale }
          };
        }
      }
    });

    // Update world matrices after changing local transforms
    character.updateWorldMatrix(true);
  }
}
