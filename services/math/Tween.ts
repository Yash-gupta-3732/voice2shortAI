import { Easing, EasingType } from './Easing';

export interface TweenConfig {
  from: number;
  to: number;
  startTime: number;
  duration: number;
  easing?: EasingType;
}

export class Tween {
  /**
   * Evaluates a tween configuration at a specific time.
   * Returns the interpolated value.
   */
  public static evaluate(timeMs: number, config: TweenConfig): number {
    if (timeMs <= config.startTime) return config.from;
    if (timeMs >= config.startTime + config.duration) return config.to;
    
    const rawProgress = (timeMs - config.startTime) / config.duration;
    
    // Apply easing
    const easedProgress = config.easing 
      ? (Easing[config.easing] as Function)(rawProgress)
      : Easing.linear(rawProgress);

    return config.from + (config.to - config.from) * easedProgress;
  }

  /**
   * Evaluates a progress percentage [0, 1] for an active tween.
   * Useful for syncing other systems to a tween's state.
   */
  public static getProgress(timeMs: number, startTime: number, duration: number, easing: EasingType = 'linear'): number {
    if (timeMs <= startTime) return 0;
    if (timeMs >= startTime + duration) return 1;
    const rawProgress = (timeMs - startTime) / duration;
    return (Easing[easing] as Function)(rawProgress);
  }
}
