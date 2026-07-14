/**
 * @file AnimationStandard.ts
 * @description Universal Animation Specification for the Voice2Short AI platform.
 *
 * EVERY animation asset — regardless of renderer format (SVG, Lottie, Rive…) —
 * MUST declare this metadata. The Stickman Engine uses it to:
 *   1. Verify rig compatibility before playback
 *   2. Sequence transitions between animations
 *   3. Blend poses at entry/exit boundaries
 *   4. Enforce timing and loop contracts
 */

import { BoneId } from './Skeleton';
import { Transform } from './CoordinateSystem';

// ─── Pose Snapshot ────────────────────────────────────────────────────────────

/**
 * A complete snapshot of every bone's local transform.
 * Used for entry/exit poses and the Pose Library.
 */
export type PoseSnapshot = Partial<Record<BoneId, Transform>>;

// ─── Pose ID ─────────────────────────────────────────────────────────────────

export type PoseId =
  | 'pose_idle_standing'
  | 'pose_idle_sitting'
  | 'pose_idle_lying'
  | 'pose_walk_stride_left'
  | 'pose_walk_stride_right'
  | 'pose_run_stride_left'
  | 'pose_run_stride_right'
  | 'pose_jump_takeoff'
  | 'pose_jump_apex'
  | 'pose_jump_land'
  | 'pose_talk_open'
  | 'pose_talk_closed'
  | 'pose_think'
  | 'pose_point_right'
  | 'pose_point_left'
  | 'pose_wave'
  | 'pose_sit_forward'
  | 'pose_read'
  | 'pose_type'
  | 'pose_celebrate'
  | 'pose_fall'
  | 'pose_sleep';

// ─── Animation Loop Type ─────────────────────────────────────────────────────

export type LoopType =
  | 'none'       // plays once and holds last frame
  | 'loop'       // plays continuously from start
  | 'ping_pong'  // plays forward then backward
  | 'clamp';     // plays once then freezes (same as none but explicit)

// ─── Animation Track ─────────────────────────────────────────────────────────

/**
 * Describes which bones are driven by this animation.
 * Bones NOT listed are assumed to be in their rest pose.
 */
export interface AnimationTrack {
  boneId: BoneId;
  /** Whether this track drives rotation */
  drivesRotation: boolean;
  /** Whether this track drives translation (rare — usually false) */
  drivesTranslation: boolean;
  /** Whether this track drives scale (squash & stretch) */
  drivesScale: boolean;
}

// ─── Animation Clip Metadata ─────────────────────────────────────────────────

export interface AnimationClipMetadata {
  /** Unique clip identifier — matches assetId in AssetMetadata */
  clipId: string;

  /** Human-readable name */
  label: string;

  /** Must match StickmanRigDefinition.version */
  rigVersion: string;

  // ── Timing ────────────────────────────────────────────────────────────
  fps: number;               // frames per second (standard: 24 or 30)
  totalFrames: number;
  durationMs: number;        // derived: (totalFrames / fps) * 1000
  loopType: LoopType;

  /** Frame at which the animation loop point begins (for seamless loops) */
  loopStartFrame: number;
  /** Frame at which the animation loop point ends */
  loopEndFrame: number;

  // ── Rig Contract ──────────────────────────────────────────────────────
  /** All bones this clip actively drives — others stay in rest pose */
  tracks: AnimationTrack[];
  /** Subset of bones REQUIRED to exist in the rig for this clip to play */
  requiredBones: BoneId[];

  // ── Blend & Transition ────────────────────────────────────────────────
  /**
   * Standardised entry pose.
   * The blending system uses this to smoothly cross-fade from any preceding clip.
   */
  entryPose: PoseId;
  /**
   * Standardised exit pose.
   * The transition graph uses this to determine valid next clips.
   */
  exitPose: PoseId;
  /** Default blend-in time in ms when this clip starts */
  blendInMs: number;
  /** Default blend-out time in ms when this clip ends */
  blendOutMs: number;

  // ── Compatibility ─────────────────────────────────────────────────────
  /** Animation clipIds that can validly follow this one */
  canTransitionTo: string[];
  /** Animation clipIds that can validly precede this one */
  canTransitionFrom: string[];

  // ── Body Parts ────────────────────────────────────────────────────────
  /** Which body regions are visually affected — for LOD and partial blending */
  affectedRegions: AnimationRegion[];

  // ── Renderer ──────────────────────────────────────────────────────────
  supportedFormats: AnimationFormat[];
}

// ─── Animation Region (for LOD / partial body blending) ──────────────────────

export type AnimationRegion =
  | 'full_body'
  | 'upper_body'
  | 'lower_body'
  | 'head_only'
  | 'arms_only'
  | 'legs_only'
  | 'right_arm'
  | 'left_arm'
  | 'right_leg'
  | 'left_leg';

// ─── Supported Renderer Formats ──────────────────────────────────────────────

export type AnimationFormat =
  | 'lottie'
  | 'rive'
  | 'svg_smil'
  | 'canvas_js'
  | 'spine_json'
  | 'css_keyframes'
  | 'json_keyframes'  // custom Voice2Short keyframe format (Phase 3)
  | 'skeletal_2d'
  | 'skeletal_3d';    // future

// ─── Blend Tree Node (reserved for future state machine) ─────────────────────

export interface BlendTreeNode {
  clipId: string;
  weight: number; // 0.0–1.0
  blendParameter?: string; // e.g., 'speed', 'direction'
}

// ─── Phase 7: Motion Behavior Library Types ─────────────────────────────────

export type MotionBehaviorType = 'locomotion' | 'action' | 'reaction' | 'idle';
export type LocomotionStyle = 'walk' | 'run' | 'sneak' | 'limp' | 'confident' | 'tired' | 'jump' | 'climb';

export interface MotionBehaviorConfig {
  type: MotionBehaviorType;
  style?: LocomotionStyle;
  strideLength?: number;     // How far the character moves per cycle
  cycleDurationMs?: number;  // How long one full animation cycle takes
  bounceAmplitude?: number;  // Y-axis procedural bounce
  swayAmplitude?: number;    // Torso procedural rotation sway
  noiseMultiplier?: number;  // How much secondary organic noise to apply
  easeIn?: string;           // Easing function for start (e.g. 'outQuad')
  easeOut?: string;          // Easing function for stop
}

// ─── Phase 8: Animation Layers & FSM ────────────────────────────────────────
export enum AnimationLayerType {
  BASE_LOCOMOTION = 0,    // Full body, lowest priority
  UPPER_BODY = 10,        // Spine upwards (overrides base)
  HEAD_LOOK = 20,         // Neck/Head only (overrides upper body)
  FACIAL = 30,            // Facial features
  ADDITIVE_NOISE = 100    // Additive noise (breathing, sway) applied on top of all overrides
}

/**
 * Maps a layer to the bones it is allowed to control.
 * If empty/undefined, it affects all bones (e.g., BASE_LOCOMOTION).
 */
export const LAYER_BONE_MASKS: Record<number, BoneId[]> = {
  [AnimationLayerType.UPPER_BODY]: [
    'spine', 'chest', 'neck', 'head', 
    'left_shoulder', 'left_upper_arm', 'left_lower_arm', 'left_hand',
    'right_shoulder', 'right_upper_arm', 'right_lower_arm', 'right_hand'
  ],
  [AnimationLayerType.HEAD_LOOK]: [
    'neck', 'head'
  ]
};

export type FSMEvent = 'START_WALK' | 'STOP_WALK' | 'START_RUN' | 'JUMP' | 'PLAY_GESTURE' | 'LOOK_AT_TARGET';

export interface FSMStateDefinition {
  id: string;
  layer: AnimationLayerType;
  motionBehavior?: string; // Links back to MotionBehaviorLibrary
  fallbackPose?: PoseId;   // Static pose if no behavior
  transitions: FSMTransition[];
}

export interface FSMTransition {
  toState: string;
  onEvent?: FSMEvent;
  condition?: (blackboard: Record<string, any>) => boolean;
  blendDurationMs: number;
}
