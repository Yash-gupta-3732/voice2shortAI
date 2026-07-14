export interface Point2D { x: number; y: number; }

export class Spline {
  /**
   * Evaluates a Quadratic Bezier curve at t (0..1)
   */
  public static getQuadraticBezierPoint(t: number, p0: Point2D, p1: Point2D, p2: Point2D): Point2D {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    
    return {
      x: uu * p0.x + 2 * u * t * p1.x + tt * p2.x,
      y: uu * p0.y + 2 * u * t * p1.y + tt * p2.y
    };
  }

  /**
   * Evaluates a Cubic Bezier curve at t (0..1)
   */
  public static getCubicBezierPoint(t: number, p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D): Point2D {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
  }

  /**
   * Linear Interpolation
   */
  public static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  public static lerp2D(start: Point2D, end: Point2D, t: number): Point2D {
    return {
      x: this.lerp(start.x, end.x, t),
      y: this.lerp(start.y, end.y, t)
    };
  }
}
