import { AnimationLayerType, FSMEvent, FSMStateDefinition, PoseId } from '../../../../types/rig/AnimationStandard';

export interface ActiveState {
  stateDef: FSMStateDefinition;
  timeInStateMs: number;
  weight: number; // 0.0 to 1.0 (for cross-fading)
}

export interface LayerState {
  currentState: ActiveState;
  previousState: ActiveState | null;
  blendProgress: number; // 0.0 to 1.0
  blendDurationMs: number;
}

export class AnimationFSM {
  private layers: Map<AnimationLayerType, LayerState> = new Map();
  private stateDefinitions: Map<string, FSMStateDefinition> = new Map();
  private blackboard: Record<string, any> = {};

  constructor() {
    this.initializeDefaultStates();
  }

  private initializeDefaultStates() {
    // ── Base Locomotion Layer ──
    this.addState({
      id: 'base_idle',
      layer: AnimationLayerType.BASE_LOCOMOTION,
      motionBehavior: 'idle',
      transitions: [
        { toState: 'base_walk', onEvent: 'START_WALK', blendDurationMs: 300 }
      ]
    });
    
    this.addState({
      id: 'base_walk',
      layer: AnimationLayerType.BASE_LOCOMOTION,
      motionBehavior: 'walk',
      transitions: [
        { toState: 'base_idle', onEvent: 'STOP_WALK', blendDurationMs: 400 }
      ]
    });

    // ── Upper Body Layer ──
    this.addState({
      id: 'upper_empty', // Transparent state, does nothing
      layer: AnimationLayerType.UPPER_BODY,
      transitions: [
        { toState: 'upper_wave', onEvent: 'PLAY_GESTURE', blendDurationMs: 250 }
      ]
    });

    this.addState({
      id: 'upper_wave',
      layer: AnimationLayerType.UPPER_BODY,
      fallbackPose: 'pose_wave',
      transitions: [
        // Hardcoded return to empty after some condition or event
        // In a real system, we might use a condition like `timeInStateMs > 2000`
        { toState: 'upper_empty', condition: (bb) => bb.timeInStateMs > 2000, blendDurationMs: 400 }
      ]
    });

    // Initial Active States
    this.forceSetState(AnimationLayerType.BASE_LOCOMOTION, 'base_idle');
    this.forceSetState(AnimationLayerType.UPPER_BODY, 'upper_empty');
  }

  public addState(def: FSMStateDefinition) {
    this.stateDefinitions.set(def.id, def);
  }

  private forceSetState(layerType: AnimationLayerType, stateId: string) {
    const def = this.stateDefinitions.get(stateId);
    if (!def) return;
    
    this.layers.set(layerType, {
      currentState: { stateDef: def, timeInStateMs: 0, weight: 1.0 },
      previousState: null,
      blendProgress: 1.0,
      blendDurationMs: 0
    });
  }

  public dispatchEvent(event: FSMEvent) {
    for (const [layerType, layerState] of this.layers.entries()) {
      const transitions = layerState.currentState.stateDef.transitions;
      const validTransition = transitions.find(t => t.onEvent === event);
      if (validTransition) {
        this.triggerTransition(layerType, validTransition);
      }
    }
  }

  public setBlackboardValue(key: string, value: any) {
    this.blackboard[key] = value;
  }

  public update(deltaMs: number) {
    for (const [layerType, layerState] of this.layers.entries()) {
      layerState.currentState.timeInStateMs += deltaMs;
      this.blackboard.timeInStateMs = layerState.currentState.timeInStateMs;

      // Evaluate condition-based transitions
      const transitions = layerState.currentState.stateDef.transitions;
      const validTransition = transitions.find(t => t.condition && t.condition(this.blackboard));
      if (validTransition) {
        this.triggerTransition(layerType, validTransition);
      }

      // Update blending
      if (layerState.blendProgress < 1.0) {
        layerState.blendProgress += deltaMs / layerState.blendDurationMs;
        if (layerState.blendProgress >= 1.0) {
          layerState.blendProgress = 1.0;
          layerState.previousState = null;
        }
        
        layerState.currentState.weight = layerState.blendProgress;
        if (layerState.previousState) {
           layerState.previousState.weight = 1.0 - layerState.blendProgress;
        }
      }
    }
  }

  private triggerTransition(layerType: AnimationLayerType, transition: import('../../../../types/rig/AnimationStandard').FSMTransition) {
    const targetDef = this.stateDefinitions.get(transition.toState);
    if (!targetDef) return;

    const layer = this.layers.get(layerType);
    if (!layer) return;

    // The current state becomes the previous state, fading out
    layer.previousState = { ...layer.currentState };
    
    // The new state begins fading in
    layer.currentState = {
      stateDef: targetDef,
      timeInStateMs: 0,
      weight: 0.0
    };
    
    layer.blendDurationMs = transition.blendDurationMs;
    layer.blendProgress = 0.0;
  }

  public getActiveLayers(): Map<AnimationLayerType, LayerState> {
    return this.layers;
  }
}
