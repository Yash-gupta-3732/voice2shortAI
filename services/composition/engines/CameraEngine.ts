/**
 * @file CameraEngine.ts
 * @description Modifies a CameraNode's transform based on camera semantic presets over time.
 */

import { CameraNode } from '../core/SceneGraph';
import { lerpTransform, lerp } from '../core/Math';
import { Transform } from '../../../types/rig/CoordinateSystem';

export class CameraEngine {
  private activeMovements: {
    camera: CameraNode;
    startTransform: Transform;
    endTransform: Transform;
    startZoom: number;
    endZoom: number;
    startTimeMs: number;
    durationMs: number;
  }[] = [];

  /**
   * Applies a static camera preset.
   */
  public applyStaticPreset(camera: CameraNode, preset: string): void {
    let zoom = 1.0;
    let yOffset = 0;

    switch (preset) {
      case 'close_up':
        zoom = 2.5;
        yOffset = 60; // Focus on face
        break;
      case 'medium':
        zoom = 1.5;
        yOffset = 30; // Waist up
        break;
      case 'wide':
        zoom = 0.8;
        yOffset = 0;
        break;
      case 'extreme_wide':
        zoom = 0.5;
        yOffset = 0;
        break;
      default:
        // 'static' or default
        zoom = 1.0;
        yOffset = 0;
        break;
    }

    camera.localTransform.position.y = yOffset;
    camera.zoom = zoom;
    camera.updateWorldMatrix(true);
  }

  /**
   * Triggers a dynamic camera movement.
   */
  public triggerMovement(
    camera: CameraNode, 
    movement: string, 
    startTimeMs: number, 
    durationMs: number
  ): void {
    const startT = { ...camera.localTransform };
    const startZ = camera.zoom;
    const endT = { ...startT };
    let endZ = startZ;

    switch (movement) {
      case 'pan_left':
        endT.position.x -= 100;
        break;
      case 'pan_right':
        endT.position.x += 100;
        break;
      case 'zoom_in':
        endZ *= 1.5;
        break;
      case 'zoom_out':
        endZ /= 1.5;
        break;
      case 'shake':
        // Shake is procedural, usually handled in update loop.
        // For now, we'll just vibrate around origin.
        break;
    }

    this.activeMovements.push({
      camera,
      startTransform: startT,
      endTransform: endT,
      startZoom: startZ,
      endZoom: endZ,
      startTimeMs,
      durationMs
    });
  }

  public update(currentTimeMs: number): void {
    for (let i = this.activeMovements.length - 1; i >= 0; i--) {
      const move = this.activeMovements[i];
      const elapsed = currentTimeMs - move.startTimeMs;
      
      if (elapsed >= 0) {
        let t = Math.min(1.0, elapsed / move.durationMs);
        
        // Easing function (smoothstep)
        t = t * t * (3 - 2 * t);

        const newTransform = lerpTransform(move.startTransform, move.endTransform, t);
        move.camera.localTransform = newTransform;
        move.camera.zoom = lerp(move.startZoom, move.endZoom, t);
        
        move.camera.updateWorldMatrix(true);

        if (t >= 1.0) {
          this.activeMovements.splice(i, 1);
        }
      }
    }
  }
}
