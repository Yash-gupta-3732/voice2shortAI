/**
 * @file AttachmentEngine.ts
 * @description Attaches props to specific anchor points/sockets on a CharacterNode.
 */

import { CharacterNode, PropNode, BoneNode } from '../core/SceneGraph';
import { AttachmentService } from '../../rig/AttachmentSystem';
import { SocketId } from '../../../types/rig/AttachmentSystem';

export class AttachmentEngine {
  private attachmentService: AttachmentService;

  constructor() {
    this.attachmentService = new AttachmentService();
  }

  /**
   * Attaches a PropNode to a CharacterNode at the given socket alias (e.g. 'right_hand').
   */
  public attachProp(character: CharacterNode, prop: PropNode, anchorAlias: string): boolean {
    const request = { assetId: prop.assetId, anchorPoint: anchorAlias };
    const result = this.attachmentService.attach(request);

    if (!result.valid) {
      console.warn(`[AttachmentEngine] Failed to attach ${prop.assetId}: ${result.rejectionReason}`);
      return false;
    }

    const socket = result.socket;
    
    // Find the parent bone in the character's hierarchy
    let parentBoneNode: BoneNode | null = null;
    character.traverse(node => {
      if (node instanceof BoneNode && node.boneDef.id === socket.parentBone) {
        parentBoneNode = node as BoneNode;
      }
    });

    if (parentBoneNode) {
      // Set the prop's local transform to match the socket offset
      prop.localTransform = {
        position: { ...socket.localTransform.position },
        rotation: { ...socket.localTransform.rotation },
        scale: { ...socket.localTransform.scale }
      };
      
      prop.layer = ((parentBoneNode as BoneNode).layer + socket.drawOrderOffset) as import('../../../types/rig/RenderingRules').RenderLayer;
      
      (parentBoneNode as BoneNode).add(prop);
      prop.updateWorldMatrix(true);
      return true;
    } else {
      console.error(`[AttachmentEngine] Parent bone ${socket.parentBone} not found on character ${character.id}.`);
      return false;
    }
  }

  public reset(): void {
    this.attachmentService.resetOccupancy();
  }
}
