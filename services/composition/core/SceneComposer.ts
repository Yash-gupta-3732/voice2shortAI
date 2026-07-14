/**
 * @file SceneComposer.ts
 * @description Orchestrator that takes an AssetCompositionPlan and builds the complete Scene Graph.
 */

import { AssetCompositionPlan } from '../../../types/assets';
import { SceneRootNode, CameraNode, PropNode } from '../core/SceneGraph';
import { RigBuilder } from '../engines/RigBuilder';
import { PoseEngine } from '../engines/PoseEngine';
import { AnimationEngine } from '../engines/AnimationEngine';
import { AttachmentEngine } from '../engines/AttachmentEngine';
import { CinematicCameraDirector } from '../engines/CinematicCameraDirector';
import { TimelineEngine } from '../engines/TimelineEngine';
import { InteractionEngine } from '../engines/InteractionEngine';
import { PoseId } from '../../../types/rig/AnimationStandard';

export class SceneComposer {
  public rigBuilder: RigBuilder;
  public poseEngine: PoseEngine;
  public animationEngine: AnimationEngine;
  public attachmentEngine: AttachmentEngine;
  public cameraDirector: CinematicCameraDirector;
  public timelineEngine: TimelineEngine;
  public interactionEngine: InteractionEngine;

  constructor(durationMs: number) {
    this.rigBuilder = new RigBuilder();
    this.poseEngine = new PoseEngine();
    this.animationEngine = new AnimationEngine(this.poseEngine);
    this.attachmentEngine = new AttachmentEngine();
    this.cameraDirector = new CinematicCameraDirector();
    this.timelineEngine = new TimelineEngine(durationMs);
    this.interactionEngine = new InteractionEngine(this.animationEngine);
  }

  /**
   * Constructs the initial Scene Graph from a Composition Plan.
   */
  public compose(sceneId: string, plan: AssetCompositionPlan): { root: SceneRootNode, camera: CameraNode } {
    const root = new SceneRootNode(sceneId);

    // 1. Setup Camera
    const camera = new CameraNode(`cam_${sceneId}`);
    // Register the single camera move defined in the plan for this mock
    if (plan.cameraId) {
      this.cameraDirector.registerShots([{ type: plan.cameraId as any, durationMs: 10000, targetId: `char_0` }]);
    }
    root.add(camera);

    // 2. Build Character(s) - The architecture supports multiple, but plan currently has one main character.
    const charNode = this.rigBuilder.buildCharacter(`char_0`, plan.characterId);
    charNode.expressionId = plan.expressionId;
    root.add(charNode);

    // 3. Initialize Animation FSM
    const fsm = this.animationEngine.getFSM(charNode.id);
    
    if (plan.animationId.includes('walk') || plan.animationId.includes('run')) {
      fsm.dispatchEvent('START_WALK');
    }
    
    // Dispatch a test gesture to verify Upper Body layer overriding Base Locomotion
    fsm.dispatchEvent('PLAY_GESTURE');

    // Force immediate apply
    this.animationEngine.updateBehaviors(0, root, 0);

    // 4. Attach Props
    this.attachmentEngine.reset();
    for (let i = 0; i < plan.propsIds.length; i++) {
      const propId = plan.propsIds[i];
      const propNode = new PropNode(`prop_${i}`, propId, 'socket_right_hand'); // Defaulting to right hand for now without metadata
      // In a real system, we'd lookup the AssetMetadata to get the exact anchorPoint alias
      this.attachmentEngine.attachProp(charNode, propNode, 'right_hand');
    }

    // 5. Register Semantic Interactions (Mocked for testing Phase 6)
    // Normally this comes from Scene.actions, but for the Composer plan we inject a test
    this.interactionEngine.registerActions([
      { type: 'WalkTo', subjectIds: ['char_0'], targetId: 'center', startTimeMs: 0, durationMs: 2000 }
    ]);

    // Update all world matrices
    root.updateWorldMatrix(true);

    return { root, camera };
  }

  /**
   * Main update loop for the engine.
   * Call this from requestAnimationFrame or the TimelineEngine onUpdate.
   */
  public update(timeMs: number, root: SceneRootNode, camera: CameraNode): void {
    this.interactionEngine.update(timeMs, root);
    this.animationEngine.update(timeMs);
    this.animationEngine.updateBehaviors(timeMs, root);
    
    // Always update world matrices before camera evaluates tracking targets
    root.updateWorldMatrix(true);
    
    this.cameraDirector.update(timeMs, camera, root);
    
    // Always update world matrices after local transforms change
    root.updateWorldMatrix(true);
  }
}
