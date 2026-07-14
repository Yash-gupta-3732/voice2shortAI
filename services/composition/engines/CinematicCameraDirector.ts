import { CameraNode, SceneNode, CharacterNode, PropNode } from '../core/SceneGraph';
import { CameraMove } from '../../../types';

export class CinematicCameraDirector {
  private cameraMoves: CameraMove[] = [];

  public registerShots(moves: CameraMove[]): void {
    this.cameraMoves = moves;
  }

  public update(timeMs: number, camera: CameraNode, sceneRoot: SceneNode): void {
    // Collect targets
    const targets = new Map<string, SceneNode>();
    sceneRoot.traverse((node) => {
      if (node instanceof CharacterNode || node instanceof PropNode) {
        targets.set(node.id, node);
      }
    });

    // Find active shot
    let activeShot: CameraMove | null = null;
    let accumulatedTime = 0;
    
    // Simple chronological sequencer for proof-of-concept
    for (const move of this.cameraMoves) {
      if (timeMs >= accumulatedTime && timeMs <= accumulatedTime + move.durationMs) {
        activeShot = move;
        break;
      }
      accumulatedTime += move.durationMs;
    }

    if (!activeShot) return;

    // Apply Cinematic Framing
    switch (activeShot.type) {
      case 'establishing':
      case 'static_wide':
        camera.zoom = 1.0;
        camera.localTransform.position.x = 0;
        camera.localTransform.position.y = 0;
        break;
        
      case 'close_up':
        this.frameCloseUp(camera, activeShot, targets);
        break;

      case 'tracking':
        this.frameTracking(camera, activeShot, targets);
        break;

      // Add more shot types...
    }
  }

  private frameCloseUp(camera: CameraNode, shot: CameraMove, targets: Map<string, SceneNode>): void {
    if (!shot.targetId) return;
    const target = targets.get(shot.targetId);
    if (!target) return;

    // A close up zooms in and pans to the head/chest area
    camera.zoom = 2.0;
    camera.localTransform.position.x = target.localTransform.position.x;
    camera.localTransform.position.y = target.localTransform.position.y + 150; // Offset up to face
  }

  private frameTracking(camera: CameraNode, shot: CameraMove, targets: Map<string, SceneNode>): void {
    if (!shot.targetId) return;
    const target = targets.get(shot.targetId);
    if (!target) return;

    // A tracking shot matches the target's X position, keeping them centered
    camera.zoom = 1.2;
    camera.localTransform.position.x = target.localTransform.position.x;
    camera.localTransform.position.y = 50; // Slight tilt up
  }
}
