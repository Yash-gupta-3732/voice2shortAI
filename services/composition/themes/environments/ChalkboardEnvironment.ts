import { IEnvironmentTheme, RenderContext } from '../../../../types/themes';

export class ChalkboardEnvironment implements IEnvironmentTheme {
  public id = 'env_chalkboard';
  public name = 'Chalkboard';
  public priority = -10; // Drawn before anything else

  public drawBackground(context: RenderContext): void {
    const { ctx, width, height, palette } = context;
    
    // Draw Chalkboard Background
    ctx.fillStyle = palette.background; // e.g. dark charcoal #2a2a2a
    ctx.fillRect(0, 0, width, height);
    
    // Subtle noise/chalk texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 100; i++) {
      // In a real optimized engine we'd bake this into an offscreen canvas, 
      // but for proof of concept procedural drawing this works!
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
  }

  public drawForeground(context: RenderContext): void {
    // No foreground for chalkboard
  }
}
