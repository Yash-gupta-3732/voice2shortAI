import { SceneNode, CharacterNode, PropNode } from '../core/SceneGraph';
import { SemanticAction } from '../../../types';
import { AnimationEngine } from './AnimationEngine';
import { Tween, TweenConfig } from '../../math/Tween';
import { Spline, Point2D } from '../../math/Spline';
import { EasingType } from '../../math/Easing';

export class InteractionEngine {
  private animationEngine: AnimationEngine;
  private actions: SemanticAction[] = [];

  constructor(animationEngine: AnimationEngine) {
    this.animationEngine = animationEngine;
  }

  public registerActions(actions: SemanticAction[]): void {
    this.actions = actions;
  }

  public update(timeMs: number, sceneRoot: SceneNode): void {
    const characters = new Map<string, CharacterNode>();
    const props = new Map<string, PropNode>();
    
    sceneRoot.traverse((node) => {
      if (node instanceof CharacterNode) characters.set(node.id, node);
      if (node instanceof PropNode) props.set(node.id, node);
    });

    for (const action of this.actions) {
      if (timeMs >= action.startTimeMs && timeMs <= action.startTimeMs + action.durationMs) {
        
        for (const subjectId of action.subjectIds) {
          const subject = characters.get(subjectId);
          if (!subject) continue;

          switch (action.type) {
            case 'WalkTo':
              this.handleWalkTo(subject, action, timeMs, characters, props);
              break;
            case 'LookAt':
              this.handleLookAt(subject, action, characters, props);
              break;
          }
        }
      } else if (timeMs > action.startTimeMs + action.durationMs) {
         // After action completes, ensure we transition back to idle if needed
         for (const subjectId of action.subjectIds) {
            const subject = characters.get(subjectId);
            if (subject && action.type === 'WalkTo') {
                subject.userData = { ...subject.userData, velocity: 0 };
                const fsm = this.animationEngine.getFSM(subject.id);
                fsm.dispatchEvent('STOP_WALK');
            }
         }
      }
    }
  }

  private handleWalkTo(subject: CharacterNode, action: SemanticAction, timeMs: number, characters: Map<string, CharacterNode>, props: Map<string, PropNode>): void {
    if (!action.targetId) return;

    let targetX = 0;
    const targetChar = characters.get(action.targetId);
    const targetProp = props.get(action.targetId);
    
    if (targetChar) {
      targetX = targetChar.localTransform.position.x;
      targetX += (subject.localTransform.position.x < targetX) ? -100 : 100;
    } else if (targetProp) {
      targetX = targetProp.localTransform.position.x;
    } else if (action.targetId === 'center') {
      targetX = 0;
    }

    // Determine start position (assuming entry from -600 for proof of concept)
    // In a real system, we capture the initial state when the tween starts.
    const startX = subject.userData?.startX ?? -600;
    const startY = subject.userData?.startY ?? 0;
    
    if (subject.userData?.startX === undefined) {
      subject.userData = { ...subject.userData, startX, startY };
    }

    // Set up a curved path using a Spline if we want, or just Tween X
    // Let's add a slight Y-curve (parabola) to simulate walking up a hill or around an obstacle
    const controlPointX = (startX + targetX) / 2;
    const controlPointY = startY - 100; // Curve upwards slightly (closer to camera / background)

    const p0: Point2D = { x: startX, y: startY };
    const p1: Point2D = { x: controlPointX, y: controlPointY };
    const p2: Point2D = { x: targetX, y: startY }; // assuming flat ground at target

    // Calculate progress using Tween with Easing
    const progress = Tween.getProgress(timeMs, action.startTimeMs, action.durationMs, 'inOutQuad');

    // Evaluate spline
    const currentPos = Spline.getQuadraticBezierPoint(progress, p0, p1, p2);

    // Calculate delta for root-motion synchronization
    const prevX = subject.localTransform.position.x;
    subject.localTransform.position.x = currentPos.x;
    subject.localTransform.position.y = currentPos.y;

    const velocity = Math.abs(currentPos.x - prevX);

    // Provide state to AnimationEngine via userData
    subject.userData = {
      ...subject.userData,
      velocity: velocity,
      direction: currentPos.x > prevX ? 1 : -1
    };
    
    // Dispatch FSM Event
    const fsm = this.animationEngine.getFSM(subject.id);
    fsm.dispatchEvent('START_WALK');

    if (currentPos.x > prevX) {
      subject.localTransform.scale.x = 1;
    } else if (currentPos.x < prevX) {
      subject.localTransform.scale.x = -1;
    }
  }

  private handleLookAt(subject: CharacterNode, action: SemanticAction, characters: Map<string, CharacterNode>, props: Map<string, PropNode>): void {
    if (!action.targetId) return;
    
    let targetX = 0;
    const targetChar = characters.get(action.targetId);
    const targetProp = props.get(action.targetId);
    
    if (targetChar) targetX = targetChar.localTransform.position.x;
    else if (targetProp) targetX = targetProp.localTransform.position.x;

    const diff = targetX - subject.localTransform.position.x;
    if (diff < 0) {
      subject.localTransform.scale.x = -1; // Face left
    } else {
      subject.localTransform.scale.x = 1; // Face right
    }

    // Trigger Upper Body look logic / gesture if we had one
    // const fsm = this.animationEngine.getFSM(subject.id);
    // fsm.dispatchEvent('LOOK_AT_TARGET');
  }
}
