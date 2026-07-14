/**
 * @file StickmanRig.ts
 * @description THE authoritative Voice2Short AI Stickman Rig v1.0.0
 *
 * This is the single source of truth for the character skeleton.
 * Every bone, constraint, pivot point, and draw order is defined here.
 *
 * Coordinate system: Y-up, origin at pelvis center.
 * All lengths are in canvas units (1080×1920 canvas; full character ≈ 200u tall).
 *
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │                    BONE HIERARCHY DIAGRAM                           │
 *  │                                                                     │
 *  │  root                                                               │
 *  │   └─ pelvis          (Y=0, origin)                                  │
 *  │       ├─ spine       (Y=+10)                                        │
 *  │       │   └─ chest   (Y=+35)                                        │
 *  │       │       ├─ neck (Y=+55)                                       │
 *  │       │       │   └─ head (Y=+65)                                   │
 *  │       │       ├─ left_shoulder  (X=-18, Y=+55)                      │
 *  │       │       │   └─ left_upper_arm  → left_lower_arm → left_hand   │
 *  │       │       └─ right_shoulder (X=+18, Y=+55)                      │
 *  │       │           └─ right_upper_arm → right_lower_arm → right_hand │
 *  │       ├─ left_hip    (X=-8, Y=0)                                    │
 *  │       │   └─ left_upper_leg → left_lower_leg → left_foot → left_toe │
 *  │       └─ right_hip   (X=+8, Y=0)                                    │
 *  │           └─ right_upper_leg→ right_lower_leg→right_foot→right_toe  │
 *  └─────────────────────────────────────────────────────────────────────┘
 */

import {
  SkeletonDefinition, BoneDefinition, BoneId,
} from '../../types/rig/Skeleton';
import { CURRENT_RIG_VERSION } from '../../types/rig/RigVersion';

// ─── Bone Factory ─────────────────────────────────────────────────────────────

function bone(
  id: BoneId,
  label: string,
  parentId: BoneId | null,
  childIds: BoneId[],
  posX: number,
  posY: number,
  pivX: number,
  pivY: number,
  lengthUnits: number,
  minRot: number,
  maxRot: number,
  drawOrder: number,
  freeRot = false,
): BoneDefinition {
  return {
    id,
    label,
    parentId,
    childIds,
    restTransform: {
      position: { x: posX, y: posY, z: 0 },
      rotation: { z: 0 },
      scale:    { x: 1,   y: 1    },
    },
    pivotOffset: { x: pivX, y: pivY, z: 0 },
    lengthUnits,
    rotationConstraint: { minZ: minRot, maxZ: maxRot, free: freeRot },
    translationConstraint: { allowTranslation: false },
    ik: {
      isEffector:  ['left_hand','right_hand','left_foot','right_foot'].includes(id),
      isChainRoot: ['left_shoulder','right_shoulder','left_hip','right_hip'].includes(id),
      chainLength: ['left_hand','right_hand'].includes(id) ? 3
                 : ['left_foot','right_foot'].includes(id) ? 3 : undefined,
    },
    drawOrder,
  };
}

// ─── Canonical Bone Table ─────────────────────────────────────────────────────
//
//  bone(id, label, parent, children, posX, posY, pivX, pivY, len, minRot, maxRot, drawOrder)
//
//  posX/posY  — local offset from parent pivot (canvas units)
//  pivX/pivY  — pivot point offset in LOCAL space (where the joint rotates from)
//  minRot/maxRot — Z rotation limits in degrees
//  drawOrder  — higher = drawn on top

const BONES: BoneDefinition[] = [

  // ── Root & Core ─────────────────────────────────────────────────────────
  bone('root',   'Root',   null,   ['pelvis'],               0,   0,  0,  0,   0, -180, 180, -1, true),
  bone('pelvis', 'Pelvis', 'root', ['spine','left_hip','right_hip'],
                                                              0,   0,  0,  0,  18,  -30,  30, 10),
  bone('spine',  'Spine',  'pelvis', ['chest'],               0,  10,  0, -5,  25,  -20,  20, 11),
  bone('chest',  'Chest',  'spine',  ['neck','left_shoulder','right_shoulder'],
                                                              0,  35,  0,-12,  20,  -15,  15, 12),

  // ── Head chain ──────────────────────────────────────────────────────────
  bone('neck',   'Neck',  'chest', ['head'],                  0,  55,  0, -8,   8,  -30,  30, 20),
  bone('head',   'Head',  'neck',  [],                        0,  65,  0, -4,  22,  -45,  45, 21),

  // ── Left arm chain ──────────────────────────────────────────────────────
  bone('left_shoulder',  'L Shoulder', 'chest',          ['left_upper_arm'],
                                                            -18,  55, 0,  0,   6, -170, 170, 34, true),
  bone('left_upper_arm', 'L Upper Arm','left_shoulder',  ['left_lower_arm'],
                                                            -18,  49, 0,  0,  24,   -5, 170, 36),
  bone('left_lower_arm', 'L Lower Arm','left_upper_arm', ['left_hand'],
                                                              0, -24, 0,  0,  22,    0, 150, 37),
  bone('left_hand',      'L Hand',     'left_lower_arm', [],
                                                              0, -22, 0,  0,   8,  -60,  60, 38),

  // ── Right arm chain ─────────────────────────────────────────────────────
  bone('right_shoulder',  'R Shoulder', 'chest',          ['right_upper_arm'],
                                                             18,  55, 0,  0,   6, -170, 170, 35, true),
  bone('right_upper_arm', 'R Upper Arm','right_shoulder', ['right_lower_arm'],
                                                             18,  49, 0,  0,  24, -170,   5,  4),
  bone('right_lower_arm', 'R Lower Arm','right_upper_arm',['right_hand'],
                                                              0, -24, 0,  0,  22, -150,   0,  5),
  bone('right_hand',      'R Hand',     'right_lower_arm',[],
                                                              0, -22, 0,  0,   8,  -60,  60,  6),

  // ── Left leg chain ──────────────────────────────────────────────────────
  bone('left_hip',       'L Hip',      'pelvis',         ['left_upper_leg'],
                                                             -8,   0, 0,  0,   4, -140, 140, 30, true),
  bone('left_upper_leg', 'L Upper Leg','left_hip',        ['left_lower_leg'],
                                                             -8, -10, 0,  0,  30, -120,  45, 30),
  bone('left_lower_leg', 'L Lower Leg','left_upper_leg',  ['left_foot'],
                                                              0, -30, 0,  0,  28,    0, 140, 31),
  bone('left_foot',      'L Foot',     'left_lower_leg',  ['left_toe'],
                                                              0, -28, 0,  0,  12,  -30,  30, 32),
  bone('left_toe',       'L Toe',      'left_foot',       [],
                                                             12,   0, 0,  0,   6,  -20,  20, 33),

  // ── Right leg chain ─────────────────────────────────────────────────────
  bone('right_hip',       'R Hip',      'pelvis',         ['right_upper_leg'],
                                                              8,   0, 0,  0,   4, -140, 140,  0, true),
  bone('right_upper_leg', 'R Upper Leg','right_hip',       ['right_lower_leg'],
                                                              8, -10, 0,  0,  30,  -45, 120,  0),
  bone('right_lower_leg', 'R Lower Leg','right_upper_leg', ['right_foot'],
                                                              0, -30, 0,  0,  28, -140,   0,  1),
  bone('right_foot',      'R Foot',     'right_lower_leg', ['right_toe'],
                                                              0, -28, 0,  0,  12,  -30,  30,  2),
  bone('right_toe',       'R Toe',      'right_foot',      [],
                                                             12,   0, 0,  0,   6,  -20,  20,  3),
];

// ─── Traversal Order (breadth-first from root) ────────────────────────────────

const TRAVERSAL_ORDER: BoneId[] = [
  'root',
  'pelvis',
  'spine', 'left_hip', 'right_hip',
  'chest', 'left_upper_leg', 'right_upper_leg',
  'neck', 'left_shoulder', 'right_shoulder', 'left_lower_leg', 'right_lower_leg',
  'head', 'left_upper_arm', 'right_upper_arm', 'left_foot', 'right_foot',
  'left_lower_arm', 'right_lower_arm', 'left_toe', 'right_toe',
  'left_hand', 'right_hand',
];

// ─── Export: The Canonical Rig ────────────────────────────────────────────────

export const STICKMAN_RIG: SkeletonDefinition = {
  rigVersion: CURRENT_RIG_VERSION,
  bones: Object.fromEntries(BONES.map(b => [b.id, b])) as Record<BoneId, BoneDefinition>,
  traversalOrder: TRAVERSAL_ORDER,
};

/** Convenience: get a single bone definition */
export function getBone(id: BoneId): BoneDefinition {
  const b = STICKMAN_RIG.bones[id];
  if (!b) throw new Error(`[StickmanRig] Unknown bone: ${id}`);
  return b;
}

/** Get all bones parented to a given bone */
export function getChildren(id: BoneId): BoneDefinition[] {
  return getBone(id).childIds.map(getBone);
}

/** Get the full ancestor chain from a bone up to root */
export function getAncestors(id: BoneId): BoneDefinition[] {
  const chain: BoneDefinition[] = [];
  let current = getBone(id);
  while (current.parentId !== null) {
    current = getBone(current.parentId);
    chain.push(current);
  }
  return chain;
}
