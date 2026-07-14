/**
 * @file AttachmentSystem.ts  (service layer)
 * @description Resolves prop attachment requests to concrete socket definitions.
 *
 * The canonical socket table maps every AnchorPoint in types/assets.ts
 * to a parent bone, local transform, and compatibility rules.
 */

import { AttachmentSocket, OccupancyState, ResolvedAttachment, AttachmentRequest, SocketId } from '../../types/rig/AttachmentSystem';
import { STICKMAN_RIG } from './StickmanRig';

// ─── Canonical Socket Table ───────────────────────────────────────────────────

export const ATTACHMENT_SOCKETS: Record<SocketId, AttachmentSocket> = {

  socket_right_hand: {
    socketId: 'socket_right_hand',
    label: 'Right Hand',
    parentBone: 'right_hand',
    localTransform: {
      position: { x: 0, y: -4, z: 1 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: true,
    assetAnchorAlias: 'right_hand',
    compatibleCategories: ['prop'],
    drawOrderOffset: 2,
  },

  socket_left_hand: {
    socketId: 'socket_left_hand',
    label: 'Left Hand',
    parentBone: 'left_hand',
    localTransform: {
      position: { x: 0, y: -4, z: 1 },
      rotation: { z: 0 },
      scale:    { x: -1, y: 1 }, // mirrored for left side
    },
    exclusive: true,
    assetAnchorAlias: 'left_hand',
    compatibleCategories: ['prop'],
    drawOrderOffset: 2,
  },

  socket_both_hands: {
    socketId: 'socket_both_hands',
    label: 'Both Hands (virtual)',
    parentBone: 'chest',   // virtual: engine routes to both hands individually
    localTransform: {
      position: { x: 0, y: 0, z: 1 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: true,
    assetAnchorAlias: 'both_hands',
    compatibleCategories: ['prop'],
    drawOrderOffset: 2,
  },

  socket_head_top: {
    socketId: 'socket_head_top',
    label: 'Head Top (Hat)',
    parentBone: 'head',
    localTransform: {
      position: { x: 0, y: 12, z: 0 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: true,
    assetAnchorAlias: 'head',
    compatibleCategories: ['prop'],
    drawOrderOffset: 5,
  },

  socket_head_face: {
    socketId: 'socket_head_face',
    label: 'Head Face (Glasses, Mask)',
    parentBone: 'head',
    localTransform: {
      position: { x: 0, y: 2, z: 2 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: false,
    assetAnchorAlias: 'head',
    compatibleCategories: ['prop', 'effect'],
    drawOrderOffset: 6,
  },

  socket_neck: {
    socketId: 'socket_neck',
    label: 'Neck (Tie, Scarf)',
    parentBone: 'neck',
    localTransform: {
      position: { x: 0, y: 0, z: 1 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: false,
    assetAnchorAlias: 'neck',
    compatibleCategories: ['prop'],
    drawOrderOffset: 3,
  },

  socket_back: {
    socketId: 'socket_back',
    label: 'Back (Backpack, Cape)',
    parentBone: 'chest',
    localTransform: {
      position: { x: 0, y: 5, z: -2 }, // behind character
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: true,
    assetAnchorAlias: 'back',
    compatibleCategories: ['prop'],
    drawOrderOffset: -5, // render behind character
  },

  socket_chest: {
    socketId: 'socket_chest',
    label: 'Chest (Badge, Tie)',
    parentBone: 'chest',
    localTransform: {
      position: { x: 0, y: 0, z: 2 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: false,
    assetAnchorAlias: 'chest',
    compatibleCategories: ['prop'],
    drawOrderOffset: 4,
  },

  socket_waist: {
    socketId: 'socket_waist',
    label: 'Waist (Belt, Pouch)',
    parentBone: 'pelvis',
    localTransform: {
      position: { x: 0, y: 5, z: 1 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: false,
    assetAnchorAlias: 'waist',
    compatibleCategories: ['prop'],
    drawOrderOffset: 1,
  },

  socket_left_foot: {
    socketId: 'socket_left_foot',
    label: 'Left Foot (Shoe)',
    parentBone: 'left_foot',
    localTransform: {
      position: { x: 0, y: -4, z: 0 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: false,
    assetAnchorAlias: 'feet',
    compatibleCategories: ['prop'],
    drawOrderOffset: 1,
  },

  socket_right_foot: {
    socketId: 'socket_right_foot',
    label: 'Right Foot (Shoe)',
    parentBone: 'right_foot',
    localTransform: {
      position: { x: 0, y: -4, z: 0 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: false,
    assetAnchorAlias: 'feet',
    compatibleCategories: ['prop'],
    drawOrderOffset: 1,
  },

  socket_world: {
    socketId: 'socket_world',
    label: 'World (Ground Props)',
    parentBone: 'root',
    localTransform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 1 },
    },
    exclusive: false,
    assetAnchorAlias: 'world',
    compatibleCategories: ['prop', 'effect', 'background'],
    drawOrderOffset: -100,
  },

  socket_shadow: {
    socketId: 'socket_shadow',
    label: 'Shadow',
    parentBone: 'root',
    localTransform: {
      position: { x: 0, y: -1, z: -1 },
      rotation: { z: 0 },
      scale:    { x: 1, y: 0.3 },
    },
    exclusive: false,
    assetAnchorAlias: 'ground',
    compatibleCategories: ['effect'],
    drawOrderOffset: -200,
  },
};

// ─── Attachment Service ───────────────────────────────────────────────────────

export class AttachmentService {
  private occupancy: OccupancyState = {
    right_hand: null,
    left_hand: null,
    head: null,
    back: null,
    world: [],
  };

  /** Find the socket matching an AnchorPoint alias */
  public resolveSocket(anchorAlias: string): AttachmentSocket | undefined {
    return Object.values(ATTACHMENT_SOCKETS).find(
      s => s.assetAnchorAlias === anchorAlias
    );
  }

  /** Attempt to attach an asset; returns resolved attachment or rejection reason */
  public attach(request: AttachmentRequest): ResolvedAttachment {
    const socket = this.resolveSocket(request.anchorPoint);
    if (!socket) {
      return { assetId: request.assetId, socket: ATTACHMENT_SOCKETS.socket_world, worldTransform: ATTACHMENT_SOCKETS.socket_world.localTransform, valid: false, rejectionReason: `Unknown anchor point: ${request.anchorPoint}` };
    }

    // Check occupancy for exclusive sockets
    if (socket.exclusive) {
      const key = request.anchorPoint as keyof OccupancyState;
      if (this.occupancy[key] && this.occupancy[key] !== null) {
        return { assetId: request.assetId, socket, worldTransform: socket.localTransform, valid: false, rejectionReason: `Socket "${socket.label}" already occupied by ${this.occupancy[key]}` };
      }
      // Mark occupied
      if (key in this.occupancy && key !== 'world') {
        (this.occupancy as any)[key] = request.assetId;
      }
    } else if (request.anchorPoint === 'world') {
      this.occupancy.world.push(request.assetId);
    }

    // Apply any transform override
    const finalTransform = request.overrideTransform
      ? { ...socket.localTransform, ...request.overrideTransform }
      : socket.localTransform;

    return { assetId: request.assetId, socket, worldTransform: finalTransform, valid: true };
  }

  public resetOccupancy(): void {
    this.occupancy = { right_hand: null, left_hand: null, head: null, back: null, world: [] };
  }

  public getOccupancy(): OccupancyState {
    return { ...this.occupancy };
  }
}
