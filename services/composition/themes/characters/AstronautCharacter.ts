import { ICharacterTheme, RenderContext } from '../../../../types/themes';
import { BaseTheme } from '../BaseTheme';
import { BoneNode } from '../../core/SceneGraph';

export class AstronautCharacter extends BaseTheme implements ICharacterTheme {
  public id = 'character_astronaut';
  public name = 'Astronaut';
  public priority = 10;

  public drawHead(context: RenderContext, headBone: BoneNode, expressionId?: string): void {
    const { ctx, palette } = context;
    const e = headBone.worldMatrix.elements;
    const headPos = { x: e[6], y: e[7] };
    const angle = Math.atan2(e[1], e[0]);

    ctx.save();
    ctx.translate(headPos.x, headPos.y);
    ctx.rotate(angle);
    
    // Draw Astronaut Helmet (White sphere with gold visor)
    ctx.fillStyle = palette.primary; // White helmet
    ctx.strokeStyle = palette.line; // Black outline
    ctx.lineWidth = 4;
    
    // Helmet outer
    ctx.beginPath();
    ctx.arc(0, 30, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Visor (Gold/Orange)
    ctx.fillStyle = '#f59e0b'; // Gold
    ctx.beginPath();
    ctx.ellipse(5, 30, 20, 15, 0, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.stroke();

    // Some visor reflection
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(8, 38, 5, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  public drawLimb(context: RenderContext, points: { x: number; y: number; }[]): void {
    // The spacesuit makes limbs thicker
    this.drawLimbPath(context, points, 14, context.palette.primary);
    // Draw outline
    this.drawLimbPath(context, points, 14, 'transparent');
    
    // Stroke manually over the limb path for outlines
    const { ctx, palette } = context;
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  public drawTorso(context: RenderContext, chestPos: { x: number; y: number; }, pelvisPos: { x: number; y: number; }): void {
    // Thick white body
    this.drawLimbPath(context, [chestPos, pelvisPos], 24, context.palette.primary);
  }
}
