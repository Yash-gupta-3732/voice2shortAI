import { Matrix3 } from '../services/composition/core/Math';

export type VisualElementType = 'group' | 'mesh' | 'sprite' | 'vector';

export interface AppearanceState {
  fillColor?: string;
  strokeColor?: string;
  opacity?: number;
  [key: string]: any; // Allow extensibility for shaders/materials
}

export interface AnimationState {
  // Runtime visual overrides not strictly handled by bone transforms
  isBlinking?: boolean;
  isTalking?: boolean;
  damageLevel?: number; // 0.0 to 1.0
  dirtLevel?: number;   // 0.0 to 1.0
}

/**
 * A purely semantic representation of what needs to be rendered, decoupled from HOW it is rendered.
 */
export interface VisualElement {
  id: string;
  type: VisualElementType;
  semanticAssetId?: string; // E.g., 'astro_head', 'eyes_happy'
  transform: Matrix3;
  appearance: AppearanceState;
  animationState: AnimationState;
  children: VisualElement[];
}

export interface VisualGraph {
  root: VisualElement;
}
