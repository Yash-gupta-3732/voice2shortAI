/**
 * @file AttachmentSystem.ts
 * @description Named anchor points for prop and effect attachment.
 *
 * Every attachment point is a named socket on the rig.
 * Props declare which socket they use (see types/assets.ts → anchorPoint).
 * The attachment system maps sockets to their parent bone + local transform.
 *
 * Socket naming mirrors the asset anchor point enum for 1-to-1 mapping.
 */

import { BoneId } from './Skeleton';
import { Transform } from './CoordinateSystem';

// ─── Socket IDs (mirrors AnchorPoint in types/assets.ts) ─────────────────────

export type SocketId =
  | 'socket_right_hand'
  | 'socket_left_hand'
  | 'socket_both_hands'   // virtual — uses left + right simultaneously
  | 'socket_head_top'     // hats, helmets
  | 'socket_head_face'    // glasses, masks
  | 'socket_neck'         // tie, scarf, collar
  | 'socket_back'         // backpack, cape, wings
  | 'socket_chest'        // badges, buttons, tie (chest)
  | 'socket_waist'        // belt, pouch
  | 'socket_left_foot'    // shoes, boots
  | 'socket_right_foot'   // shoes, boots
  | 'socket_world'        // not attached to character (ground props, scenery)
  | 'socket_shadow'       // shadow layer beneath character;

// ─── Attachment Socket Definition ────────────────────────────────────────────

export interface AttachmentSocket {
  socketId: SocketId;
  /** Human-readable label */
  label: string;
  /** The bone this socket is parented to */
  parentBone: BoneId;
  /**
   * Local transform relative to parent bone's pivot.
   * Defines where on the bone the prop visually attaches.
   */
  localTransform: Transform;
  /**
   * Whether only one prop can occupy this socket at a time.
   * E.g., right_hand = exclusive; world = non-exclusive.
   */
  exclusive: boolean;
  /** Which asset anchor point value maps to this socket */
  assetAnchorAlias: string; // matches AnchorPoint in types/assets.ts
  /** Tags describing what can attach here */
  compatibleCategories: string[];
  /** Draw order offset relative to the parent bone's draw order */
  drawOrderOffset: number;
}

// ─── Attachment Request / Result ──────────────────────────────────────────────

export interface AttachmentRequest {
  assetId: string;
  anchorPoint: string; // matches AnchorPoint
  overrideTransform?: Partial<Transform>;
}

export interface ResolvedAttachment {
  assetId: string;
  socket: AttachmentSocket;
  worldTransform: Transform; // resolved after skeleton pose is applied
  valid: boolean;
  rejectionReason?: string;
}

// ─── Body Occupancy State ────────────────────────────────────────────────────

export interface OccupancyState {
  right_hand: string | null;   // assetId occupying the slot, or null
  left_hand: string | null;
  head: string | null;
  back: string | null;
  world: string[];             // multiple world props allowed
}
