import { IOutfitTheme, RenderContext } from '../../../../types/themes';
import { BaseTheme } from '../BaseTheme';

export class SpaceSuitOutfit extends BaseTheme implements IOutfitTheme {
  public id = 'outfit_spacesuit';
  public name = 'Space Suit';
  public priority = 20;

  public drawTorsoOutfit(context: RenderContext, chestPos: { x: number; y: number; }, pelvisPos: { x: number; y: number; }): void {
    const { ctx, palette } = context;

    // Draw Space Suit Torso (Bulky rectangle with tech bits)
    ctx.fillStyle = palette.primary; // White
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 4;
    
    ctx.beginPath();
    ctx.moveTo(chestPos.x - 30, chestPos.y - 10); // wide shoulders
    ctx.lineTo(chestPos.x + 30, chestPos.y - 10);
    ctx.lineTo(pelvisPos.x + 25, pelvisPos.y); // bulky hips
    ctx.lineTo(pelvisPos.x - 25, pelvisPos.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Chest Box (Life support control panel)
    ctx.fillStyle = '#1f2937'; // Dark gray
    ctx.fillRect(chestPos.x - 15, chestPos.y + 10, 30, 20);
    ctx.strokeRect(chestPos.x - 15, chestPos.y + 10, 30, 20);

    // Red button
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(chestPos.x - 5, chestPos.y + 20, 3, 0, Math.PI * 2);
    ctx.fill();

    // Blue button
    ctx.fillStyle = palette.secondary;
    ctx.beginPath();
    ctx.arc(chestPos.x + 5, chestPos.y + 20, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
