import { IOutfitTheme, RenderContext } from '../../../../types/themes';
import { BaseTheme } from '../BaseTheme';

export class LabCoatOutfit extends BaseTheme implements IOutfitTheme {
  public id = 'outfit_labcoat';
  public name = 'Lab Coat';
  public priority = 20; // Drawn over the character base

  public drawTorsoOutfit(context: RenderContext, chestPos: { x: number; y: number; }, pelvisPos: { x: number; y: number; }): void {
    const { ctx, palette } = context;

    // Draw Lab Coat
    ctx.fillStyle = palette.primary; // White
    ctx.strokeStyle = palette.line; // Black
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(chestPos.x - 25, chestPos.y);
    ctx.lineTo(chestPos.x + 25, chestPos.y);
    ctx.lineTo(pelvisPos.x + 30, pelvisPos.y - 20); // coat flares out
    ctx.lineTo(pelvisPos.x - 30, pelvisPos.y - 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw Red Bow Tie at the neck (near chest)
    const neckPos = { x: chestPos.x, y: chestPos.y + 15 }; // Approximate neck
    ctx.fillStyle = palette.accent; // Red
    ctx.beginPath();
    ctx.moveTo(neckPos.x, neckPos.y);
    ctx.lineTo(neckPos.x - 10, neckPos.y + 10);
    ctx.lineTo(neckPos.x - 10, neckPos.y - 10);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(neckPos.x, neckPos.y);
    ctx.lineTo(neckPos.x + 10, neckPos.y + 10);
    ctx.lineTo(neckPos.x + 10, neckPos.y - 10);
    ctx.closePath();
    ctx.fill();
  }
}
