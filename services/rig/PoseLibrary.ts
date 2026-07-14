/**
 * @file PoseLibrary.ts
 * @description Standard pose snapshots that every animation must use at entry/exit.
 *
 * A PoseSnapshot defines the local transform of each affected bone.
 * Bones not listed remain at their rest pose (all zeros / scale 1).
 *
 * These poses are the "keyframes" shared between animations to ensure
 * seamless blending (Walking exit → Running entry share the same stride pose).
 */

import { PoseId, PoseSnapshot } from '../../types/rig/AnimationStandard';

// ─── Pose Definitions ─────────────────────────────────────────────────────────

const restPos  = (x=0, y=0, z=0) => ({ x, y, z });
const restRot  = (z=0)           => ({ z });
const restScale = ()             => ({ x: 1, y: 1 });
const T = (x=0, y=0, rz=0)      => ({
  position: restPos(x, y),
  rotation: restRot(rz),
  scale:    restScale(),
});

export const POSE_LIBRARY: Record<PoseId, PoseSnapshot> = {

  // ── Idle Standing ──────────────────────────────────────────────────────
  pose_idle_standing: {
    pelvis:         T(0,   0,  0),
    spine:          T(0,  10,  0),
    chest:          T(0,  35,  2),   // slight forward lean
    neck:           T(0,  55,  0),
    head:           T(0,  65,  0),
    left_shoulder:  T(-18, 55, 5),
    right_shoulder: T( 18, 55,-5),
    left_upper_arm: T(-18, 49, 15),  // arms hanging slightly forward
    right_upper_arm:T( 18, 49,-15),
    left_lower_arm: T(0, -24, -5),
    right_lower_arm:T(0, -24,  5),
    left_hip:       T(-8,  0, -2),
    right_hip:      T( 8,  0,  2),
    left_upper_leg: T(-8,-10,  3),
    right_upper_leg:T( 8,-10, -3),
    left_lower_leg: T(0, -30,  0),
    right_lower_leg:T(0, -30,  0),
    left_foot:      T(0, -28, 10),
    right_foot:     T(0, -28,-10),
  },

  // ── Idle Sitting ───────────────────────────────────────────────────────
  pose_idle_sitting: {
    pelvis:         T(0,   0,  0),
    spine:          T(0,  10,  0),
    chest:          T(0,  35,  5),
    neck:           T(0,  55,  0),
    head:           T(0,  65,  0),
    left_upper_leg: T(-8,-10, 85),   // thigh horizontal
    right_upper_leg:T( 8,-10,-85),
    left_lower_leg: T(0, -30,-90),   // shin hanging down
    right_lower_leg:T(0, -30, 90),
    left_foot:      T(0, -28,  5),
    right_foot:     T(0, -28, -5),
  },

  // ── Idle Lying ────────────────────────────────────────────────────────
  pose_idle_lying: {
    root:           T(0, 0, -90), // whole body rotated horizontal
    pelvis:         T(0, 0,  0),
    left_upper_leg: T(-8,-10,  5),
    right_upper_leg:T( 8,-10, -5),
    left_lower_leg: T(0,-30,  -5),
    right_lower_leg:T(0,-30,   5),
  },

  // ── Walk Stride — Left foot forward ───────────────────────────────────
  pose_walk_stride_left: {
    chest:           T(0, 35,  5),
    left_upper_leg:  T(-8,-10, -30),  // left leg forward
    left_lower_leg:  T(0, -30,  15),
    left_foot:       T(0, -28,  -5),
    right_upper_leg: T( 8,-10,  30),  // right leg back
    right_lower_leg: T(0, -30,   5),
    right_foot:      T(0, -28,  10),
    left_upper_arm:  T(-18, 49,  25), // arms swing opposite
    right_upper_arm: T( 18, 49, -25),
  },

  // ── Walk Stride — Right foot forward ──────────────────────────────────
  pose_walk_stride_right: {
    chest:           T(0, 35, -5),
    left_upper_leg:  T(-8,-10,  30),
    left_lower_leg:  T(0, -30,   5),
    left_foot:       T(0, -28,  10),
    right_upper_leg: T( 8,-10, -30),
    right_lower_leg: T(0, -30,  15),
    right_foot:      T(0, -28,  -5),
    left_upper_arm:  T(-18, 49, -25),
    right_upper_arm: T( 18, 49,  25),
  },

  // ── Run Stride — Left ─────────────────────────────────────────────────
  pose_run_stride_left: {
    chest:           T(0, 35, 12),   // forward lean
    left_upper_leg:  T(-8,-10, -55),
    left_lower_leg:  T(0, -30,  30),
    left_foot:       T(0, -28, -10),
    right_upper_leg: T( 8,-10,  45),
    right_lower_leg: T(0, -30,  10),
    left_upper_arm:  T(-18, 49,  55),
    left_lower_arm:  T(0,  -24, -30),
    right_upper_arm: T( 18, 49, -55),
    right_lower_arm: T(0,  -24,  30),
  },

  // ── Run Stride — Right ────────────────────────────────────────────────
  pose_run_stride_right: {
    chest:           T(0, 35,-12),
    left_upper_leg:  T(-8,-10,  45),
    left_lower_leg:  T(0, -30,  10),
    right_upper_leg: T( 8,-10, -55),
    right_lower_leg: T(0, -30,  30),
    right_foot:      T(0, -28, -10),
    left_upper_arm:  T(-18, 49, -55),
    left_lower_arm:  T(0,  -24,  30),
    right_upper_arm: T( 18, 49,  55),
    right_lower_arm: T(0,  -24, -30),
  },

  // ── Jump Takeoff ──────────────────────────────────────────────────────
  pose_jump_takeoff: {
    chest:           T(0, 35, 10),
    left_upper_leg:  T(-8,-10,-20),
    right_upper_leg: T( 8,-10,-20),
    left_lower_leg:  T(0,-30,  30),
    right_lower_leg: T(0,-30,  30),
    left_upper_arm:  T(-18,49, -40),
    right_upper_arm: T( 18,49,  40),
  },

  // ── Jump Apex ─────────────────────────────────────────────────────────
  pose_jump_apex: {
    left_upper_leg:  T(-8,-10, -10),
    right_upper_leg: T( 8,-10, -10),
    left_lower_leg:  T(0,-30,  50),
    right_lower_leg: T(0,-30,  50),
    left_upper_arm:  T(-18,49, -80),
    right_upper_arm: T( 18,49,  80),
  },

  // ── Jump Land ─────────────────────────────────────────────────────────
  pose_jump_land: {
    chest:           T(0,35, 15),
    left_upper_leg:  T(-8,-10,-50),
    right_upper_leg: T( 8,-10,-50),
    left_lower_leg:  T(0,-30, 70),
    right_lower_leg: T(0,-30, 70),
  },

  // ── Talk Open (mouth open frame) ──────────────────────────────────────
  pose_talk_open: {
    chest:           T(0, 35,  3),
    neck:            T(0, 55,  0),
    head:            T(0, 65,  5),
    right_upper_arm: T( 18,49, -10),
    right_lower_arm: T(0,-24,   5),
  },

  // ── Talk Closed (mouth closed frame) ──────────────────────────────────
  pose_talk_closed: {
    chest:           T(0, 35,  3),
    head:            T(0, 65,  3),
  },

  // ── Think ──────────────────────────────────────────────────────────────
  pose_think: {
    chest:           T(0, 35, -5),
    head:            T(0, 65, -10),
    right_upper_arm: T( 18,49, -20),
    right_lower_arm: T(0,-24,  -80),
    right_hand:      T(0,-22,   10),
  },

  // ── Point Right ───────────────────────────────────────────────────────
  pose_point_right: {
    right_upper_arm: T( 18,49,  -30),
    right_lower_arm: T(0,-24,    10),
    right_hand:      T(0,-22,    -5),
  },

  // ── Point Left ────────────────────────────────────────────────────────
  pose_point_left: {
    left_upper_arm:  T(-18,49, 30),
    left_lower_arm:  T(0, -24, -10),
    left_hand:       T(0, -22,   5),
  },

  // ── Wave ──────────────────────────────────────────────────────────────
  pose_wave: {
    right_upper_arm: T( 18,49, -120),
    right_lower_arm: T(0,-24,   -30),
    right_hand:      T(0,-22,    20),
  },

  // ── Sit Forward ───────────────────────────────────────────────────────
  pose_sit_forward: {
    chest:           T(0,35,   8),
    left_upper_leg:  T(-8,-10, 85),
    right_upper_leg: T( 8,-10,-85),
    left_lower_leg:  T(0,-30, -90),
    right_lower_leg: T(0,-30,  90),
    left_upper_arm:  T(-18,49,  15),
    right_upper_arm: T( 18,49, -15),
  },

  // ── Read ──────────────────────────────────────────────────────────────
  pose_read: {
    chest:           T(0,35,  10),
    head:            T(0,65, -15),
    left_upper_arm:  T(-18,49,  20),
    left_lower_arm:  T(0,-24,  -50),
    right_upper_arm: T( 18,49, -20),
    right_lower_arm: T(0,-24,   50),
  },

  // ── Type ──────────────────────────────────────────────────────────────
  pose_type: {
    chest:           T(0,35,  5),
    head:            T(0,65, -5),
    left_upper_arm:  T(-18,49, 15),
    left_lower_arm:  T(0,-24,-60),
    right_upper_arm: T( 18,49,-15),
    right_lower_arm: T(0,-24, 60),
  },

  // ── Celebrate ─────────────────────────────────────────────────────────
  pose_celebrate: {
    left_upper_arm:  T(-18,49, -140),
    left_lower_arm:  T(0,-24,  -20),
    right_upper_arm: T( 18,49,  140),
    right_lower_arm: T(0,-24,   20),
    left_upper_leg:  T(-8,-10, -10),
    right_upper_leg: T( 8,-10,  10),
  },

  // ── Fall ──────────────────────────────────────────────────────────────
  pose_fall: {
    root:            T(0,0, -45),
    left_upper_arm:  T(-18,49,  80),
    right_upper_arm: T( 18,49, -80),
  },

  // ── Sleep ─────────────────────────────────────────────────────────────
  pose_sleep: {
    root:            T(0,0,-90),
    chest:           T(0,35,  3),
    head:            T(0,65, 15),
    left_upper_arm:  T(-18,49, 0),
    left_lower_arm:  T(0,-24, 0),
    right_upper_arm: T( 18,49, 0),
    left_upper_leg:  T(-8,-10, 10),
    right_upper_leg: T( 8,-10,-10),
    left_lower_leg:  T(0,-30,  20),
    right_lower_leg: T(0,-30, -20),
  },
};

/** Quick lookup for a single pose */
export function getPose(id: PoseId): PoseSnapshot {
  const p = POSE_LIBRARY[id];
  if (!p) throw new Error(`[PoseLibrary] Unknown pose: ${id}`);
  return p;
}
