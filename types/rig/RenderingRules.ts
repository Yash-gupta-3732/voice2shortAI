/**
 * @file RenderingRules.ts
 * @description Deterministic rendering layer order for every scene element.
 *
 * The layer system ensures consistent paint order across ALL renderer backends.
 * Every asset category maps to a specific layer number.
 * Within a layer, zIndex provides fine-grained sorting.
 *
 * Paint order: lower layer number = painted first (further from viewer).
 */

// ─── Layer Constants ──────────────────────────────────────────────────────────

export const RENDER_LAYERS = {
  /** Sky/distant background scenery */
  BACKGROUND_FAR:    0,
  /** Main environment background (park, office…) */
  BACKGROUND:        10,
  /** Lighting & atmosphere overlay (placed behind character) */
  LIGHTING_BACK:     15,
  /** Ground / floor plane */
  GROUND:            18,
  /** Character shadow */
  SHADOW:            19,
  /** Behind-character props (e.g. backpack, cape) */
  PROP_BACK:         20,
  /** Character body — lower body (legs) */
  CHARACTER_LOWER:   30,
  /** Character body — torso */
  CHARACTER_TORSO:   31,
  /** Character body — arms (behind) */
  CHARACTER_ARM_BACK: 32,
  /** Character body — head */
  CHARACTER_HEAD:    33,
  /** Character body — arms (front) */
  CHARACTER_ARM_FRONT: 34,
  /** In-front-of-body props (phone, sword) */
  PROP_FRONT:        40,
  /** Foreground scenery (trees in front, etc.) */
  FOREGROUND:        50,
  /** Atmospheric / particle effects */
  EFFECTS:           60,
  /** Lighting overlay (in front of character) */
  LIGHTING_FRONT:    65,
  /** Subtitle band */
  SUBTITLE:          70,
  /** UI debug overlays (rig skeleton view) */
  DEBUG_OVERLAY:     999,
} as const;

export type RenderLayer = typeof RENDER_LAYERS[keyof typeof RENDER_LAYERS];

// ─── Body Part Draw Order ─────────────────────────────────────────────────────

/**
 * Canonical draw order for character body parts within the CHARACTER layers.
 * Lower = painted first. This determines which limb appears "in front" of another.
 * Based on standard 2D side-view character rendering conventions.
 */
export const BODY_PART_DRAW_ORDER = {
  // Far-side limbs (painted first, partially hidden)
  right_upper_leg:  0,
  right_lower_leg:  1,
  right_foot:       2,
  right_toe:        3,
  right_upper_arm:  4,
  right_lower_arm:  5,
  right_hand:       6,

  // Core body
  pelvis:           10,
  spine:            11,
  chest:            12,

  // Head stack
  neck:             20,
  head:             21,

  // Near-side limbs (painted on top)
  left_upper_leg:   30,
  left_lower_leg:   31,
  left_foot:        32,
  left_toe:         33,
  left_shoulder:    34,
  right_shoulder:   35,
  left_upper_arm:   36,
  left_lower_arm:   37,
  left_hand:        38,
} as const;

// ─── Scene Render Plan ────────────────────────────────────────────────────────

/**
 * A fully resolved rendering plan for a single frame.
 * Produced by the Composition Engine, consumed by the Renderer.
 */
export interface SceneRenderPlan {
  frameIndex: number;
  /** All render items sorted by layer then zIndex */
  items: RenderItem[];
}

export type RenderItemType =
  | 'background'
  | 'ground'
  | 'shadow'
  | 'prop_back'
  | 'bone'
  | 'prop_front'
  | 'foreground'
  | 'effect'
  | 'lighting'
  | 'subtitle'
  | 'debug';

export interface RenderItem {
  id: string;
  type: RenderItemType;
  layer: RenderLayer;
  zIndex: number;
  /** Resolved world-space transform at this frame */
  transform: import('./CoordinateSystem').Transform;
  /** Asset or bone identifier */
  sourceId: string;
  /** Renderer-specific payload (SVG node id, Lottie layer name…) */
  rendererPayload?: unknown;
}
