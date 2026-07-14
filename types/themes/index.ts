import { BoneNode } from '../../services/composition/core/SceneGraph';

/**
 * Context provided to themes during rendering.
 * Contains global state, active palettes, and camera info.
 */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  palette: ColorPalette;
  timeMs: number;
}

/**
 * Common color palette format used by styles and themes.
 */
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  line: string;
  [key: string]: string;
}

/**
 * Base interface for all themes.
 */
export interface IThemeLayer {
  id: string;
  name: string;
  priority: number; // For rendering order if needed
}

// ─── Character Layers ────────────────────────────────────────────────────────

/**
 * CharacterTheme determines the core procedural shape of the character
 * (e.g. head shape, skin color, limb thickness, anatomical proportions).
 */
export interface ICharacterTheme extends IThemeLayer {
  drawHead(context: RenderContext, headBone: BoneNode, expressionId?: string): void;
  drawLimb(context: RenderContext, points: {x: number, y: number}[]): void;
  drawTorso(context: RenderContext, chestPos: {x: number, y: number}, pelvisPos: {x: number, y: number}): void;
}

/**
 * OutfitTheme overlays clothing onto the CharacterTheme.
 */
export interface IOutfitTheme extends IThemeLayer {
  drawTorsoOutfit(context: RenderContext, chestPos: {x: number, y: number}, pelvisPos: {x: number, y: number}): void;
  // future: drawSleeves, drawPants, etc.
}

/**
 * AccessoryTheme draws attachable items on the character (e.g., glasses, jetpack).
 */
export interface IAccessoryTheme extends IThemeLayer {
  drawHeadAccessories(context: RenderContext, headBone: BoneNode): void;
  drawBodyAccessories(context: RenderContext, chestPos: {x: number, y: number}, pelvisPos: {x: number, y: number}): void;
}

// ─── Environment & Atmosphere Layers ─────────────────────────────────────────

/**
 * EnvironmentTheme draws the background scene.
 */
export interface IEnvironmentTheme extends IThemeLayer {
  drawBackground(context: RenderContext): void;
  drawForeground(context: RenderContext): void;
}

/**
 * WeatherTheme draws particle overlays (rain, snow, dust).
 */
export interface IWeatherTheme extends IThemeLayer {
  drawWeather(context: RenderContext): void;
}

/**
 * LightingTheme modifies the global composite operation or draws lighting overlays.
 */
export interface ILightingTheme extends IThemeLayer {
  applyLighting(context: RenderContext): void;
}

// ─── Style Layers ────────────────────────────────────────────────────────────

/**
 * StyleTheme overrides the global rendering technique (e.g., Whiteboard, Neon).
 * It provides the ColorPalette and any global canvas context modifiers (like lineCap).
 */
export interface IStyleTheme extends IThemeLayer {
  getPalette(): ColorPalette;
  applyStyleRules(context: RenderContext): void;
}

/**
 * The final resolved composition of all visual layers for a Scene.
 */
export interface ThemeComposition {
  character: ICharacterTheme;
  outfit?: IOutfitTheme;
  accessory?: IAccessoryTheme;
  environment: IEnvironmentTheme;
  weather?: IWeatherTheme;
  lighting?: ILightingTheme;
  style: IStyleTheme;
}
