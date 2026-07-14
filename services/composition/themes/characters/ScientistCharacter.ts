import { ICharacterTheme, RenderContext } from '../../../../types/themes';
import { BaseTheme } from '../BaseTheme';
import { BoneNode } from '../../core/SceneGraph';

export class ScientistCharacter extends BaseTheme implements ICharacterTheme {
  public id = 'character_scientist';
  public name = 'Scientist';
  public priority = 10; // Base layers

  public drawHead(context: RenderContext, headBone: BoneNode, expressionId?: string): void {
    const { ctx, palette } = context;
    const e = headBone.worldMatrix.elements;
    const headPos = { x: e[6], y: e[7] };
    const angle = Math.atan2(e[1], e[0]);

    ctx.save();
    ctx.translate(headPos.x, headPos.y);
    ctx.rotate(angle);
    
    // Draw Head Circle
    ctx.fillStyle = palette.primary; // White
    ctx.strokeStyle = palette.line; // Black
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 30, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Messy Hair
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i + Math.PI; // top half
      const px = Math.cos(a) * 25;
      const py = Math.sin(a) * 25 + 30;
      ctx.moveTo(px, py);
      ctx.lineTo(px * 1.5, py + (Math.random() * 10) + 15);
    }
    ctx.stroke();

    // Eyes (Pupils)
    ctx.fillStyle = palette.line;
    ctx.beginPath();
    ctx.arc(-8, 35, 2, 0, Math.PI * 2);
    ctx.arc(12, 35, 2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.beginPath();
    if (expressionId === 'talking') {
      ctx.ellipse(2, 20, 4, 6, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(2, 20, 3, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.restore();
  }

  public drawLimb(context: RenderContext, points: { x: number; y: number; }[]): void {
    this.drawLimbPath(context, points, 8, context.palette.line);
  }

  public drawTorso(context: RenderContext, chestPos: { x: number; y: number; }, pelvisPos: { x: number; y: number; }): void {
    // Base character torso is just a thick line. 
    // The outfit will draw the actual lab coat over it.
    this.drawLimbPath(context, [chestPos, pelvisPos], 8, context.palette.line);
  }
}
