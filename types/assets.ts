// ─── Renderer Format ────────────────────────────────────────────────────────
// Future-ready: SVG, Lottie, Rive, Canvas, Spine, 2D skeletal, 3D
export type RendererFormat = 
  | 'metadata_only'  // Phase 2.5 placeholder – no graphics yet
  | 'svg'
  | 'lottie'
  | 'rive'
  | 'spine'
  | 'canvas'
  | 'skeletal_2d'
  | 'skeletal_3d'
  | 'png'
  | 'webm';

// ─── Asset Categories ────────────────────────────────────────────────────────
export type AssetCategory =
  | 'character'
  | 'expression'
  | 'animation'
  | 'background'
  | 'prop'
  | 'effect'
  | 'lighting'
  | 'camera';

export type AssetSubCategory =
  // character
  | 'human' | 'animal' | 'fantasy' | 'robot'
  // expression
  | 'positive' | 'negative' | 'neutral_expr' | 'complex'
  // animation
  | 'locomotion' | 'idle' | 'gesture' | 'interaction' | 'combat' | 'emote'
  // background
  | 'indoor' | 'outdoor' | 'abstract' | 'nature' | 'urban' | 'space'
  // prop
  | 'electronic' | 'weapon' | 'clothing' | 'food' | 'vehicle' | 'furniture' | 'tool'
  // effect
  | 'weather' | 'particle' | 'transition' | 'overlay'
  // lighting
  | 'natural' | 'artificial' | 'dramatic' | 'ambient'
  // camera
  | 'static' | 'dynamic' | 'cinematic';

export type AssetStatus = 'active' | 'deprecated' | 'draft' | 'review';

// ─── Anchor Points ───────────────────────────────────────────────────────────
// Standardized body attachment points for props & effects
export type AnchorPoint =
  | 'right_hand'
  | 'left_hand'
  | 'both_hands'
  | 'head'
  | 'back'
  | 'waist'
  | 'chest'
  | 'neck'
  | 'feet'
  | 'ground'
  | 'world'; // not attached to character

// Body occupancy flags to prevent impossible combos
export interface BodyOccupancy {
  rightHandOccupied: boolean;
  leftHandOccupied: boolean;
  backOccupied: boolean;
  headOccupied: boolean;
}

// ─── Bounding Box ───────────────────────────────────────────────────────────
export interface BoundingBox {
  width: number;   // relative units (0–1 of canvas)
  height: number;
  anchorX: number; // pivot point
  anchorY: number;
}

// ─── Animation Transition Graph ─────────────────────────────────────────────
// Which animations can smoothly flow from/to this one
export interface AnimationTransitions {
  canTransitionTo: string[];    // assetIds of compatible next animations
  canTransitionFrom: string[];  // assetIds of compatible previous animations
  transitionDuration: number;   // ms to blend between
}

// ─── Asset Variants ─────────────────────────────────────────────────────────
// A variant is a stylistic alternative of the same logical animation/prop
export interface AssetVariant {
  variantId: string;
  label: string;        // 'slow', 'fast', 'sneaking', 'business walk'
  tags: string[];
  speed?: 'slow' | 'normal' | 'fast';
}

// ─── Recommendation Hint ────────────────────────────────────────────────────
export interface RecommendationHint {
  missingAssetDescription: string;
  suggestedCategory: AssetCategory;
  suggestedTags: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ─── Validation Rule ────────────────────────────────────────────────────────
// A declarative rule that describes an impossible or invalid combination
export interface ValidationRule {
  ruleId: string;
  description: string; // human-readable: "Phone cannot be held while swimming"
  triggerCategory: AssetCategory;
  triggerTag: string;           // tag that activates the rule
  blockedCategory: AssetCategory;
  blockedTag: string;           // tag that is rejected
}

// ─── CORE ASSET METADATA ─────────────────────────────────────────────────────
export interface AssetMetadata {
  // Identity
  assetId: string;
  version: string;               // semver: '1.0.0'
  name: string;
  category: AssetCategory;
  subCategory: AssetSubCategory;
  status: AssetStatus;

  // Renderer
  type: RendererFormat;
  filePath?: string;             // relative path once actual files exist

  // Semantic intelligence
  tags: string[];                // general search tags
  semanticKeywords: string[];    // expanded synonym vocabulary for search
  emotion?: string[];
  action?: string[];
  environment?: string[];
  speed?: 'slow' | 'normal' | 'fast';
  direction?: ('left' | 'right' | 'forward' | 'backward')[];
  timeOfDay?: ('day' | 'night' | 'sunset' | 'sunrise' | 'any')[];

  // Compatibility — what this asset WORKS WITH
  compatibleCharacters: string[];     // assetIds, or ['any']
  compatibleExpressions: string[];    // assetIds, or ['any']
  compatibleAnimations: string[];     // assetIds, or ['any']
  compatibleBackgrounds: string[];    // assetIds, or ['any']
  compatibleProps: string[];          // assetIds, or ['any']
  compatibleEnvironments: string[];   // environment tags, or ['any']

  // Incompatibilities — hard rejects
  incompatibleCharacters: string[];
  incompatibleActions: string[];      // action tags that block this asset
  incompatibleEnvironments: string[];

  // Dependency system
  requiredAssets: string[];    // must have these assetIds to render correctly
  optionalAssets: string[];    // better with these, but not mandatory

  // Recommendation hints
  recommendedCamera: string[];    // camera assetIds that look best
  recommendedLighting: string[];  // lighting assetIds that look best

  // Prop attachment system (props & effects only)
  anchorPoint?: AnchorPoint;
  bodyOccupancy?: Partial<BodyOccupancy>;

  // Rendering layer system
  layer: number;    // 0 = background, 10 = character, 20 = prop, 30 = fg, 40 = effect, 50 = subtitle
  zIndex: number;   // fine-grained sort within same layer

  // Bounding box
  boundingBox?: BoundingBox;

  // Animation transition graph (animations only)
  animationTransitions?: AnimationTransitions;

  // Variant system
  variants: AssetVariant[];

  // Fallback chain (ordered: first = preferred)
  fallbackAssets: string[];   // assetIds to try in order if this asset not found

  // Ranking
  priority: number;   // 0.0–1.0: used by RankingEngine
  quality: number;    // 0.0–1.0: visual quality rating
  weight: number;     // 0.0–1.0: selection weight for diversity sampling

  // Usage stats (runtime, updated in-memory)
  usageCount: number;
  lastUsed?: number;   // unix timestamp

  // Versioning timestamps
  createdAt: string;   // ISO
  updatedAt: string;   // ISO
}

// ─── Validation Result ───────────────────────────────────────────────────────
export interface ValidationResult {
  valid: boolean;
  violations: { ruleId: string; message: string }[];
}

// ─── Composition Types ───────────────────────────────────────────────────────
export interface CompositionFallbackInfo {
  category: AssetCategory;
  requested: string;
  providedId: string;
  reason: string;
  fallbackScore: number; // 0.0–1.0: how close is the fallback
}

export interface AssetCompositionPlan {
  characterId: string;
  expressionId: string;
  animationId: string;
  backgroundId: string;
  propsIds: string[];
  cameraId: string;
  lightingId: string;

  // Rendering order resolved by layer/zIndex
  renderOrder: string[];   // assetIds in paint order

  // Matcher debug info
  confidence: number;
  fallbacks: CompositionFallbackInfo[];
  validationWarnings: string[];
}
