/**
 * @file Skeleton.ts
 * @description Complete bone hierarchy, joint definitions, and constraints
 *              for the Voice2Short AI Universal Stickman Rig v1.
 *
 * Bone naming convention: snake_case, anatomically correct side prefix.
 * Every bone has exactly one parent (except Root) and zero or more children.
 */

import { Transform, Rotation, Vec3 } from './CoordinateSystem';

// ─── Bone IDs ─────────────────────────────────────────────────────────────────

export type BoneId =
  // ── Core ────────────────────────────────────────────────────────────────
  | 'root'
  | 'pelvis'
  | 'spine'
  | 'chest'
  // ── Head chain ──────────────────────────────────────────────────────────
  | 'neck'
  | 'head'
  // ── Left arm chain ──────────────────────────────────────────────────────
  | 'left_shoulder'
  | 'left_upper_arm'
  | 'left_lower_arm'
  | 'left_hand'
  // ── Right arm chain ─────────────────────────────────────────────────────
  | 'right_shoulder'
  | 'right_upper_arm'
  | 'right_lower_arm'
  | 'right_hand'
  // ── Left leg chain ──────────────────────────────────────────────────────
  | 'left_hip'
  | 'left_upper_leg'
  | 'left_lower_leg'
  | 'left_foot'
  | 'left_toe'
  // ── Right leg chain ─────────────────────────────────────────────────────
  | 'right_hip'
  | 'right_upper_leg'
  | 'right_lower_leg'
  | 'right_foot'
  | 'right_toe';

// ─── Rotation Constraints ────────────────────────────────────────────────────

export interface RotationConstraint {
  /** Minimum allowed rotation in degrees (local Z axis) */
  minZ: number;
  /** Maximum allowed rotation in degrees (local Z axis) */
  maxZ: number;
  /** If true, rotation wraps (full 360° allowed) */
  free: boolean;
}

// ─── Translation Constraints ─────────────────────────────────────────────────

export interface TranslationConstraint {
  /** Whether this bone can translate at all (most cannot — FK only) */
  allowTranslation: boolean;
  maxOffset?: Vec3; // max delta from rest position (if allowed)
}

// ─── IK Metadata (architecture only — no implementation yet) ─────────────────

export interface IKMetadata {
  /** This bone can serve as an IK end-effector */
  isEffector: boolean;
  /** This bone is the IK chain root */
  isChainRoot: boolean;
  /** Max chain length (bones from effector to root) */
  chainLength?: number;
  /** Reserved for future pole-vector constraint */
  poleVectorBone?: BoneId;
}

// ─── Bone Definition ─────────────────────────────────────────────────────────

export interface BoneDefinition {
  id: BoneId;
  /** Human-readable label */
  label: string;
  /** Parent bone (null for root) */
  parentId: BoneId | null;
  /** Direct children */
  childIds: BoneId[];

  /** Rest pose — local transform relative to parent */
  restTransform: Transform;

  /**
   * Pivot point in LOCAL space.
   * This is the point around which the bone rotates.
   * For joints: anatomically correct (shoulder, elbow, knee, ankle…)
   */
  pivotOffset: Vec3;

  /** Visual length of the bone in canvas units (for debug overlay rendering) */
  lengthUnits: number;

  /** Joint constraints */
  rotationConstraint: RotationConstraint;
  translationConstraint: TranslationConstraint;

  /** IK metadata (reserved) */
  ik: IKMetadata;

  /**
   * Draw order within the character.
   * Higher = drawn on top. Matches anatomical layering.
   */
  drawOrder: number;
}

// ─── Skeleton Type ───────────────────────────────────────────────────────────

export interface SkeletonDefinition {
  /** Must match RigVersion.version */
  rigVersion: string;
  bones: Record<BoneId, BoneDefinition>;
  /** Ordered flat list for traversal (breadth-first from root) */
  traversalOrder: BoneId[];
}
