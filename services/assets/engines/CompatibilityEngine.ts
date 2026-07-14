/**
 * Validation Rules Engine
 * Declarative rules that prevent impossible/absurd asset combinations.
 * This is the single source of truth for composition validity.
 */
import { ValidationRule, ValidationResult, AssetMetadata } from '../../../types/assets';

export const VALIDATION_RULES: ValidationRule[] = [
  // ── Locomotion vs static poses ──────────────────────────────────────────
  { ruleId: 'VR-001', description: 'Cannot sleep while walking', triggerCategory: 'animation', triggerTag: 'walking', blockedCategory: 'animation', blockedTag: 'sleeping' },
  { ruleId: 'VR-002', description: 'Cannot swim while walking', triggerCategory: 'animation', triggerTag: 'walking', blockedCategory: 'animation', blockedTag: 'swimming' },
  { ruleId: 'VR-003', description: 'Cannot run while sitting', triggerCategory: 'animation', triggerTag: 'running', blockedCategory: 'animation', blockedTag: 'sitting' },
  { ruleId: 'VR-004', description: 'Cannot lie down while running', triggerCategory: 'animation', triggerTag: 'running', blockedCategory: 'animation', blockedTag: 'lying' },

  // ── Environment vs animation ─────────────────────────────────────────────
  { ruleId: 'VR-010', description: 'Cannot run indoors in a bed environment', triggerCategory: 'background', triggerTag: 'bedroom', blockedCategory: 'animation', blockedTag: 'running' },
  { ruleId: 'VR-011', description: 'Cannot swim in an office', triggerCategory: 'background', triggerTag: 'office', blockedCategory: 'animation', blockedTag: 'swimming' },

  // ── Prop anchor conflicts ────────────────────────────────────────────────
  { ruleId: 'VR-020', description: 'Phone cannot be attached to head', triggerCategory: 'prop', triggerTag: 'phone', blockedCategory: 'prop', blockedTag: 'hat' },
  { ruleId: 'VR-021', description: 'Sword cannot be used while swimming', triggerCategory: 'animation', triggerTag: 'swimming', blockedCategory: 'prop', blockedTag: 'sword' },
  { ruleId: 'VR-022', description: 'Shield cannot be used while swimming', triggerCategory: 'animation', triggerTag: 'swimming', blockedCategory: 'prop', blockedTag: 'shield' },
  { ruleId: 'VR-023', description: 'Backpack not compatible with swimming', triggerCategory: 'animation', triggerTag: 'swimming', blockedCategory: 'prop', blockedTag: 'bag' },
];

export class CompatibilityEngine {
  private rules = VALIDATION_RULES;

  /**
   * Basic per-asset compatibility check (fast path used by SemanticMatcher)
   */
  public isCompatible(asset: AssetMetadata, sceneContext: { character: string; environment: string; action: string }): boolean {
    // Hard character exclusions
    if (asset.incompatibleCharacters.includes(sceneContext.character)) return false;

    // Character whitelist (if defined, must be in it)
    if (
      asset.compatibleCharacters.length > 0 &&
      !asset.compatibleCharacters.includes('any') &&
      !asset.compatibleCharacters.includes(sceneContext.character)
    ) return false;

    // Environment whitelist (if defined, must be in it)
    if (
      asset.compatibleEnvironments.length > 0 &&
      !asset.compatibleEnvironments.includes('any') &&
      !asset.compatibleEnvironments.includes(sceneContext.environment)
    ) return false;

    // Environment hard exclusions
    if (asset.incompatibleEnvironments.includes(sceneContext.environment)) return false;

    // Action hard exclusions
    if (asset.incompatibleActions.some(a => sceneContext.action.includes(a))) return false;

    return true;
  }

  /**
   * Full composition validation — run once after all assets are selected
   * Returns structured list of violations with rule IDs
   */
  public validateComposition(selectedAssets: AssetMetadata[]): ValidationResult {
    const violations: { ruleId: string; message: string }[] = [];
    const allTags = selectedAssets.flatMap(a => [...a.tags, ...(a.action || [])]);

    for (const rule of this.rules) {
      const triggerPresent = allTags.includes(rule.triggerTag);
      const blockedPresent = allTags.includes(rule.blockedTag);
      if (triggerPresent && blockedPresent) {
        violations.push({ ruleId: rule.ruleId, message: rule.description });
      }
    }

    // Body occupancy check — prevent dual right-hand props
    const propsWithAnchor = selectedAssets.filter(a => a.category === 'prop' && a.anchorPoint);
    const rightHandProps = propsWithAnchor.filter(a => a.anchorPoint === 'right_hand');
    const leftHandProps = propsWithAnchor.filter(a => a.anchorPoint === 'left_hand');
    const bothHandProps = propsWithAnchor.filter(a => a.anchorPoint === 'both_hands');

    if (rightHandProps.length > 1) {
      violations.push({ ruleId: 'BO-001', message: `Right hand occupied by multiple props: ${rightHandProps.map(p => p.assetId).join(', ')}` });
    }
    if (leftHandProps.length > 1) {
      violations.push({ ruleId: 'BO-002', message: `Left hand occupied by multiple props: ${leftHandProps.map(p => p.assetId).join(', ')}` });
    }
    if (bothHandProps.length > 0 && (rightHandProps.length > 0 || leftHandProps.length > 0)) {
      violations.push({ ruleId: 'BO-003', message: `Both-hands prop conflicts with single-hand prop` });
    }

    return { valid: violations.length === 0, violations };
  }

  /**
   * Resolves the render order for a set of selected assets using layer + zIndex
   */
  public resolveRenderOrder(assets: AssetMetadata[]): string[] {
    return [...assets]
      .sort((a, b) => a.layer !== b.layer ? a.layer - b.layer : a.zIndex - b.zIndex)
      .map(a => a.assetId);
  }
}
