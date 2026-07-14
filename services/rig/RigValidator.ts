/**
 * @file RigValidator.ts
 * @description Validates animation clips and assets against the canonical rig spec.
 *
 * Called at asset load time (startup) and at composition time (runtime).
 * Ensures every asset that enters the pipeline conforms to the rig standard.
 */

import { STICKMAN_RIG } from './StickmanRig';
import { BoneId } from '../../types/rig/Skeleton';
import { CURRENT_RIG_VERSION } from '../../types/rig/RigVersion';
import { AnimationClipMetadata } from '../../types/rig/AnimationStandard';
import { ATTACHMENT_SOCKETS } from './AttachmentSystem';
import { POSE_LIBRARY } from './PoseLibrary';

export interface RigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class RigValidator {

  /**
   * Validate an animation clip against the current rig.
   */
  public validateClip(clip: AnimationClipMetadata): RigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Rig version compatibility
    if (!this.isVersionCompatible(clip.rigVersion)) {
      errors.push(`Clip "${clip.clipId}" authored for rig v${clip.rigVersion}, current rig is v${CURRENT_RIG_VERSION}.`);
    }

    // 2. Required bones exist
    for (const boneId of clip.requiredBones) {
      if (!STICKMAN_RIG.bones[boneId as BoneId]) {
        errors.push(`Clip "${clip.clipId}" requires bone "${boneId}" which does not exist in rig v${CURRENT_RIG_VERSION}.`);
      }
    }

    // 3. Entry/exit poses are registered
    if (!POSE_LIBRARY[clip.entryPose]) {
      errors.push(`Clip "${clip.clipId}" declares unknown entry pose: "${clip.entryPose}".`);
    }
    if (!POSE_LIBRARY[clip.exitPose]) {
      errors.push(`Clip "${clip.clipId}" declares unknown exit pose: "${clip.exitPose}".`);
    }

    // 4. Timing sanity
    const expectedDuration = (clip.totalFrames / clip.fps) * 1000;
    if (Math.abs(expectedDuration - clip.durationMs) > 1) {
      warnings.push(`Clip "${clip.clipId}" durationMs (${clip.durationMs}) does not match totalFrames/fps (${expectedDuration.toFixed(0)}ms).`);
    }

    // 5. Loop frame range
    if (clip.loopStartFrame >= clip.loopEndFrame) {
      errors.push(`Clip "${clip.clipId}" has invalid loop range: ${clip.loopStartFrame} → ${clip.loopEndFrame}.`);
    }

    // 6. Track bones exist
    for (const track of clip.tracks) {
      if (!STICKMAN_RIG.bones[track.boneId]) {
        warnings.push(`Track bone "${track.boneId}" in clip "${clip.clipId}" is not in the rig — track will be ignored.`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate a prop attachment request.
   */
  public validateAttachment(anchorAlias: string, assetId: string): RigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const socket = Object.values(ATTACHMENT_SOCKETS).find(s => s.assetAnchorAlias === anchorAlias);
    if (!socket) {
      errors.push(`Asset "${assetId}" requests unknown anchor point: "${anchorAlias}".`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate a full scene's bone rotations against constraint tables.
   */
  public validatePoseConstraints(poseOverrides: Partial<Record<string, { rotation: { z: number } }>>): RigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [boneId, transform] of Object.entries(poseOverrides)) {
      const bone = STICKMAN_RIG.bones[boneId as BoneId];
      if (!bone) continue;

      const rot = transform?.rotation?.z ?? 0;
      const { minZ, maxZ, free } = bone.rotationConstraint;

      if (!free && (rot < minZ || rot > maxZ)) {
        errors.push(`Bone "${boneId}" rotation ${rot}° violates constraint [${minZ}°, ${maxZ}°].`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private isVersionCompatible(assetRigVersion: string): boolean {
    // Simple major version check — minor/patch are always compatible
    const currentMajor = parseInt(CURRENT_RIG_VERSION.split('.')[0]);
    const assetMajor   = parseInt(assetRigVersion.split('.')[0]);
    return assetMajor <= currentMajor;
  }
}
