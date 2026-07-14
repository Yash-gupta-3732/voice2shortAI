import { IStyleTheme, RenderContext, ColorPalette } from '../../../../types/themes';

export class NeonStyle implements IStyleTheme {
  public id = 'style_neon';
  public name = 'Neon Style';
  public priority = 0;

  private palette: ColorPalette = {
    primary: '#ffffff', // White core lines
    secondary: '#3b82f6', // Neon blue
    accent: '#ef4444', // Neon red
    background: '#2a2a2a', // Charcoal
    line: '#000000', // Black line overlays
    glow: '#f472b6' // Pink neon glow
  };

  public getPalette(): ColorPalette {
    return this.palette;
  }

  public applyStyleRules(context: RenderContext): void {
    const { ctx } = context;
    // Neon style implies glowing effects, but for now we just set baseline rules
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // We could add global shadows here if we wanted a real glow effect
    // ctx.shadowColor = this.palette.glow;
    // ctx.shadowBlur = 10;
  }
}
