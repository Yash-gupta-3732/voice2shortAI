import { MotionBehaviorConfig, LocomotionStyle } from '../../../../types/rig/AnimationStandard';

export class MotionBehaviorLibrary {
  private static behaviors: Record<string, MotionBehaviorConfig> = {
    'locomotion_walk': {
      type: 'locomotion',
      style: 'walk',
      strideLength: 120, // pixels per cycle
      cycleDurationMs: 800,
      bounceAmplitude: 4,
      swayAmplitude: 0.1,
      noiseMultiplier: 0.5,
      easeIn: 'inOutQuad',
      easeOut: 'outQuad',
    },
    'locomotion_run': {
      type: 'locomotion',
      style: 'run',
      strideLength: 250,
      cycleDurationMs: 500,
      bounceAmplitude: 12,
      swayAmplitude: 0.2,
      noiseMultiplier: 0.8,
      easeIn: 'inQuad',
      easeOut: 'outCubic',
    },
    'locomotion_sneak': {
      type: 'locomotion',
      style: 'sneak',
      strideLength: 80,
      cycleDurationMs: 1200,
      bounceAmplitude: 2,
      swayAmplitude: 0.05,
      noiseMultiplier: 0.2,
      easeIn: 'linear',
      easeOut: 'linear',
    },
    'locomotion_confident': {
      type: 'locomotion',
      style: 'confident',
      strideLength: 150,
      cycleDurationMs: 900,
      bounceAmplitude: 6,
      swayAmplitude: 0.15,
      noiseMultiplier: 0.4,
      easeIn: 'outCubic',
      easeOut: 'outCubic',
    },
    'locomotion_tired': {
      type: 'locomotion',
      style: 'tired',
      strideLength: 70,
      cycleDurationMs: 1500,
      bounceAmplitude: 3,
      swayAmplitude: 0.3, // Lots of torso swaying
      noiseMultiplier: 1.0, // High noise = unstable
      easeIn: 'inQuad',
      easeOut: 'linear',
    },
    'idle_breathing': {
      type: 'idle',
      bounceAmplitude: 2,
      swayAmplitude: 0.02,
      noiseMultiplier: 0.3,
    }
  };

  public static getBehavior(type: 'locomotion' | 'idle', style: string = 'walk'): MotionBehaviorConfig {
    const key = `${type}_${style}`;
    if (this.behaviors[key]) return this.behaviors[key];
    
    // Fallback
    return type === 'locomotion' ? this.behaviors['locomotion_walk'] : this.behaviors['idle_breathing'];
  }
}
