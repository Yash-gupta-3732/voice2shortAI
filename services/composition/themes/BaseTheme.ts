import { BoneNode } from '../core/SceneGraph';
import { RenderContext } from '../../../types/themes';

/**
 * Base Theme provides common drawing utilities for the generic rendering engine.
 * It is not meant to be instantiated directly, but extended by specific themes.
 */
export class BaseTheme {
  
  /**
   * Utility to draw a limb connecting a series of points.
   */
  protected drawLimbPath(context: RenderContext, points: {x: number, y: number}[], thickness: number, color: string): void {
    if (points.length < 2) return;
    const { ctx } = context;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  /**
   * Utility to get the world coordinates of a bone.
   */
  protected getBonePos(bones: Map<string, BoneNode>, id: string): {x: number, y: number} {
    const b = bones.get(id);
    if (!b) return { x: 0, y: 0 };
    const e = b.worldMatrix.elements;
    return { x: e[6], y: e[7] }; // e[6] = tx, e[7] = ty
  }

  /**
   * Utility to get the rotation of a bone in radians.
   */
  protected getBoneRotation(bones: Map<string, BoneNode>, id: string): number {
    const b = bones.get(id);
    if (!b) return 0;
    const e = b.worldMatrix.elements;
    return Math.atan2(e[1], e[0]);
  }
}
