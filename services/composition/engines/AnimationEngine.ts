/**
 * @file AnimationEngine.ts
 * @description Handles time-based blending of poses and animation playback on CharacterNodes.
 */

import { SceneNode, CharacterNode, BoneNode } from '../core/SceneGraph';
import { PoseEngine } from './PoseEngine';
import { lerpTransform } from '../core/Math';
import { POSE_LIBRARY } from '../../rig/PoseLibrary';
import { STICKMAN_RIG } from '../../rig/StickmanRig';
import { PoseSnapshot, PoseId, MotionBehaviorConfig, LAYER_BONE_MASKS, AnimationLayerType } from '../../../types/rig/AnimationStandard';
import { BoneId } from '../../../types/rig/Skeleton';
import { MotionBehaviorLibrary } from './behaviors/MotionBehaviorLibrary';
import { Noise } from '../../math/Noise';
import { AnimationFSM, ActiveState } from './fsm/AnimationFSM';

export interface ActiveAnimation {
  id: string;
  character: CharacterNode;
  fromPose: PoseId;
  toPose: PoseId;
  startTimeMs: number;
  durationMs: number;
  loop: boolean;
}

export class AnimationEngine {
  private poseEngine: PoseEngine;
  private fsms: Map<string, AnimationFSM> = new Map();

  constructor(poseEngine: PoseEngine) {
    this.poseEngine = poseEngine;
  }

  public getFSM(characterId: string): AnimationFSM {
    let fsm = this.fsms.get(characterId);
    if (!fsm) {
      fsm = new AnimationFSM();
      this.fsms.set(characterId, fsm);
    }
    return fsm;
  }

  /**
   * Called every tick by the TimelineEngine to update all characters.
   */
  public update(currentTimeMs: number): void {
    // Deprecated: ActiveAnimations manual blending is replaced by FSM Layers.
  }

  public updateBehaviors(currentTimeMs: number, sceneRoot: SceneNode, deltaMs: number = 16): void {
    sceneRoot.traverse((node) => {
      if (node instanceof CharacterNode) {
        const fsm = this.getFSM(node.id);
        fsm.update(deltaMs);
        this.composeLayers(node, fsm, currentTimeMs);
      }
    });
  }

  private composeLayers(character: CharacterNode, fsm: AnimationFSM, timeMs: number): void {
    // We start with a base rest pose, then apply layers from lowest priority to highest.
    const finalSnapshot: PoseSnapshot = {};
    
    // Fill with rest pose initially
    for (const boneId of STICKMAN_RIG.traversalOrder) {
      finalSnapshot[boneId] = STICKMAN_RIG.bones[boneId].restTransform;
    }

    const layers = Array.from(fsm.getActiveLayers().entries())
      .sort((a, b) => a[0] - b[0]); // Sort by layer priority enum (0, 10, 20...)

    for (const [layerType, layerState] of layers) {
      const allowedBones = LAYER_BONE_MASKS[layerType]; // undefined = all bones

      // Evaluate the current state
      const currentPose = this.evaluateState(character, layerState.currentState, timeMs);
      
      // Evaluate previous state if cross-fading
      let layerSnapshot = currentPose;
      if (layerState.previousState && layerState.blendProgress < 1.0) {
         const prevPose = this.evaluateState(character, layerState.previousState, timeMs);
         layerSnapshot = this.blendTwoPoses(prevPose, currentPose, layerState.blendProgress);
      }

      // Apply the evaluated layer snapshot to the final snapshot (Override Masking)
      for (const boneId of STICKMAN_RIG.traversalOrder) {
        if (!allowedBones || allowedBones.includes(boneId)) {
          if (layerSnapshot[boneId]) {
            finalSnapshot[boneId] = layerSnapshot[boneId];
          }
        }
      }
    }

    this.poseEngine.applySnapshot(character, finalSnapshot);

    // Apply procedural secondary motion globally on top (root node scale/bounce)
    this.applyGlobalSecondaryMotion(character, fsm, timeMs);
  }

  private evaluateState(character: CharacterNode, state: ActiveState, timeMs: number): PoseSnapshot {
     if (state.stateDef.id === 'upper_empty') {
       return {}; // Transparent state outputs nothing
     }
     
     if (state.stateDef.fallbackPose) {
        return POSE_LIBRARY[state.stateDef.fallbackPose] || {};
     }

     if (state.stateDef.motionBehavior) {
        return this.evaluateLocomotion(character, state.stateDef.motionBehavior, state.timeInStateMs);
     }

     return {};
  }

  private evaluateLocomotion(character: CharacterNode, style: string, timeInStateMs: number): PoseSnapshot {
    const config = MotionBehaviorLibrary.getBehavior('locomotion', style);
    
    // In Phase 7 we used real delta velocity. Since we don't have delta velocity accessible right here easily,
    // we simulate a standard time-based phase for FSM fallback, OR we read it from userData if InteractionEngine set it.
    const velocity = character.userData.velocity || 0;
    const strideLength = config.strideLength || 100;
    
    if (velocity > 0) {
      const phaseDelta = velocity / strideLength;
      character.userData.phase = (character.userData.phase || 0) + phaseDelta;
    }

    let t = (character.userData.phase || 0) % 1.0;
    if ((character.userData.phase || 0) % 2.0 > 1.0) t = 1 - t;

    let fromPose: PoseId = 'pose_walk_stride_left';
    let toPose: PoseId = 'pose_walk_stride_right';
    if (style === 'run') {
       fromPose = 'pose_run_stride_left';
       toPose = 'pose_run_stride_right';
    } else if (style === 'idle') {
       return POSE_LIBRARY['pose_idle_standing'] || {};
    }

    return this.blendTwoPoses(POSE_LIBRARY[fromPose] || {}, POSE_LIBRARY[toPose] || {}, t);
  }

  private blendTwoPoses(fromPose: PoseSnapshot, toPose: PoseSnapshot, t: number): PoseSnapshot {
    const blendedSnapshot: PoseSnapshot = {};
    for (const boneId of STICKMAN_RIG.traversalOrder) {
      const rest = STICKMAN_RIG.bones[boneId].restTransform;
      const fromT = fromPose[boneId] || rest;
      const toT = toPose[boneId] || rest;
      blendedSnapshot[boneId] = lerpTransform(fromT, toT, t);
    }
    return blendedSnapshot;
  }

  private applyGlobalSecondaryMotion(character: CharacterNode, fsm: AnimationFSM, timeMs: number): void {
     // Check if base layer is idle to apply breathing
     const baseLayer = fsm.getActiveLayers().get(AnimationLayerType.BASE_LOCOMOTION);
     if (baseLayer && baseLayer.currentState.stateDef.motionBehavior === 'idle') {
         const breathe = Noise.rhythmic(timeMs, 0.25, 0.02);
         character.localTransform.scale.y = 1.0 + breathe;
         character.localTransform.scale.x = 1.0 - (breathe * 0.5);
     } else {
         character.localTransform.scale.y = 1.0;
         character.localTransform.scale.x = 1.0;
     }
  }

  // Obsolete specific logic removed, using multi-layer FSM now


}
