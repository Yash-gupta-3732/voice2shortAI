/**
 * @file CoordinateSystem.ts
 * @description Global coordinate system for the Voice2Short AI stickman rig.
 *
 * STANDARD:
 *   Origin  — character root (base of pelvis), world position (0, 0, 0)
 *   X-axis  — horizontal, positive = RIGHT
 *   Y-axis  — vertical,   positive = UP
 *   Z-axis  — depth,      positive = TOWARD viewer (canvas front)
 *
 *   Rotations — degrees, right-hand rule, counter-clockwise = positive
 *   Scale     — uniform 1.0 = natural stickman height of 200 canvas units
 *   Canvas    — 1080 × 1920 (9:16 portrait), origin at canvas BOTTOM-CENTER
 *
 * All transforms are stored in LOCAL space relative to parent bone.
 * World transforms are computed by traversing the bone hierarchy to the root.
 */

// ─── Primitives ───────────────────────────────────────────────────────────────

export interface Vec2 {
  x: number; // canvas units (px-equivalent)
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Rotation in degrees (local space) */
export interface Rotation {
  z: number; // primary 2D rotation axis
  /** Reserved for future 3D support — always 0 in 2D mode */
  x?: number;
  y?: number;
}

/** Non-uniform scale (x/y independent for squash & stretch) */
export interface Scale {
  x: number; // 1.0 = natural
  y: number;
}

/** Full local transform of a bone */
export interface Transform {
  position: Vec3;   // local offset from parent pivot
  rotation: Rotation;
  scale: Scale;
}

/** AABB bounding box in local space */
export interface BoundingBox {
  min: Vec2;
  max: Vec2;
}

// ─── Canvas Specification ────────────────────────────────────────────────────

export const CANVAS_SPEC = {
  width: 1080,
  height: 1920,
  aspectRatio: '9:16',
  /** Character occupies this fraction of canvas height at rest */
  characterHeightRatio: 0.55,
  /** Natural stickman height in canvas units */
  characterHeightUnits: 200,
  /** Origin is at bottom-center of canvas */
  originX: 540,
  originY: 0,
} as const;

export type CoordSpace = 'local' | 'world' | 'canvas';
