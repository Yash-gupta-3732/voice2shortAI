import { IEnvironmentTheme, RenderContext } from '../../../../types/themes';

export class MarsEnvironment implements IEnvironmentTheme {
  public id = 'env_mars';
  public name = 'Mars Surface';
  public priority = -10;

  public drawBackground(context: RenderContext): void {
    const { ctx, width, height } = context;
    
    // Mars sky (Dusty Orange)
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, width, height);

    // Distant mountains
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    ctx.lineTo(width * 0.3, height * 0.4);
    ctx.lineTo(width * 0.7, height * 0.5);
    ctx.lineTo(width, height * 0.3);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // Ground
    ctx.fillStyle = '#c2410c'; // Rust orange
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
  }

  public drawForeground(context: RenderContext): void {
    // Maybe draw some rocks in the foreground
  }
}
