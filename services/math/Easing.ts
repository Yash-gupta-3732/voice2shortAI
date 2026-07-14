/**
 * Deterministic Easing Functions for Animation and Tweening.
 * Input 't' is normalized time from 0.0 to 1.0.
 * Output is the eased value (typically 0.0 to 1.0, but can overshoot for elastic/bounce).
 */

export class Easing {
  public static linear(t: number): number {
    return t;
  }

  public static inQuad(t: number): number {
    return t * t;
  }

  public static outQuad(t: number): number {
    return t * (2 - t);
  }

  public static inOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  public static inCubic(t: number): number {
    return t * t * t;
  }

  public static outCubic(t: number): number {
    return --t * t * t + 1;
  }

  public static inOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  public static outElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  public static outBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
}

export type EasingFunction = (t: number) => number;
export type EasingType = keyof typeof Easing;
