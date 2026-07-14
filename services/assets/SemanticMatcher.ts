import { Scene } from '../../types';
import { AssetCompositionPlan, AssetCategory, AssetMetadata, CompositionFallbackInfo } from '../../types/assets';
import { AssetDatabase } from './database';
import { CompatibilityEngine } from './engines/CompatibilityEngine';
import { FallbackEngine } from './engines/FallbackEngine';
import { RankingEngine } from './engines/RankingEngine';
import { DiversityEngine } from './engines/DiversityEngine';

export class SemanticMatcher {
  private db: AssetDatabase;
  private compatibility: CompatibilityEngine;
  private fallback: FallbackEngine;
  private ranking: RankingEngine;
  private diversity: DiversityEngine;

  constructor() {
    this.db = AssetDatabase.getInstance();
    this.compatibility = new CompatibilityEngine();
    this.fallback = new FallbackEngine();
    this.ranking = new RankingEngine();
    this.diversity = new DiversityEngine();
  }

  public generateCompositionPlan(scene: Scene): AssetCompositionPlan {
    const fallbacks: CompositionFallbackInfo[] = [];

    const targetEmotion = (scene.emotion || 'neutral').toLowerCase();
    const targetActions = (scene.actions || []).map(a => (a.type || 'standing').toLowerCase());
    const targetEnvironment = (scene.environment || '').toLowerCase();
    const primaryAction = targetActions[0] || 'standing';

    // Resolve each asset category
    const characterId = this.findBestMatch(
      'character', ['default'],
      { character: 'default', environment: targetEnvironment, action: primaryAction },
      fallbacks
    );

    const expressionId = this.findBestMatch(
      'expression', [targetEmotion],
      { character: characterId, environment: targetEnvironment, action: primaryAction },
      fallbacks
    );

    const animationId = this.findBestMatch(
      'animation', [primaryAction],
      { character: characterId, environment: targetEnvironment, action: primaryAction },
      fallbacks
    );

    const backgroundId = this.findBestMatch(
      'background', [targetEnvironment],
      { character: characterId, environment: targetEnvironment, action: primaryAction },
      fallbacks
    );

    const propsIds: string[] = [];
    for (const prop of (scene.props || [])) {
      const propId = this.findBestMatch(
        'prop', [prop.toLowerCase()],
        { character: characterId, environment: targetEnvironment, action: primaryAction },
        fallbacks
      );
      if (propId && !propId.startsWith('placeholder') && !propsIds.includes(propId)) {
        propsIds.push(propId);
      }
    }

    const cameraStr = scene.camera?.type
      ? scene.camera.type.toLowerCase().replace(/ /g, '_')
      : 'medium';
    const cameraId = this.findBestMatch(
      'camera', [cameraStr],
      { character: characterId, environment: targetEnvironment, action: primaryAction },
      fallbacks
    );

    const lightingId = this.findBestMatch(
      'lighting', ['day_soft'],
      { character: characterId, environment: targetEnvironment, action: primaryAction },
      fallbacks
    );

    // ── Full composition validation ──────────────────────────────────────────
    const allSelectedIds = [characterId, expressionId, animationId, backgroundId, ...propsIds, cameraId, lightingId];
    const allSelectedAssets = allSelectedIds
      .map(id => this.db.getById(id))
      .filter(Boolean) as AssetMetadata[];

    const validationResult = this.compatibility.validateComposition(allSelectedAssets);
    const validationWarnings = validationResult.violations.map(v => `[${v.ruleId}] ${v.message}`);

    // ── Render order ────────────────────────────────────────────────────────
    const renderOrder = this.compatibility.resolveRenderOrder(allSelectedAssets);

    // ── Confidence ──────────────────────────────────────────────────────────
    const fallbackPenalty = fallbacks.length * 0.08;
    const violationPenalty = validationResult.violations.length * 0.12;
    const confidence = Math.max(0.30, 1.0 - fallbackPenalty - violationPenalty);

    return {
      characterId,
      expressionId,
      animationId,
      backgroundId,
      propsIds,
      cameraId,
      lightingId,
      renderOrder,
      confidence,
      fallbacks,
      validationWarnings,
    };
  }

  private findBestMatch(
    category: AssetCategory,
    targetTerms: string[],
    context: { character: string; environment: string; action: string },
    fallbacksList: CompositionFallbackInfo[]
  ): string {
    const candidates = this.db.getByCategory(category);
    if (candidates.length === 0) return `placeholder_${category}`;

    // Build full semantic chain using FallbackEngine
    const chain = this.fallback.getChain(targetTerms);

    const semanticScores: Record<string, number> = {};

    const compatibleCandidates = candidates.filter(asset => {
      if (!this.compatibility.isCompatible(asset, context)) return false;

      let maxScore = 0;

      // Score against each term in the fallback chain
      for (const { term, score: chainScore } of chain) {
        for (const tag of [...asset.tags, ...(asset.semanticKeywords ?? [])]) {
          const dist = this.fallback.getDistance(term, tag);
          const adjusted = dist * chainScore; // chain score decays for synonyms
          if (adjusted > maxScore) maxScore = adjusted;
        }
        // Exact field matches (highest confidence)
        if (asset.emotion?.includes(term)) maxScore = Math.max(maxScore, chainScore);
        if (asset.action?.includes(term)) maxScore = Math.max(maxScore, chainScore);
        if (asset.environment?.includes(term)) maxScore = Math.max(maxScore, chainScore);
      }

      if (maxScore > 0) {
        // Apply diversity penalty (category-scoped)
        semanticScores[asset.assetId] = this.diversity.penalizeScoreForRecentUsage(
          asset.assetId, category, maxScore
        );
        return true;
      }
      return false;
    });

    // Hard fallback: nothing matched → use first available
    if (compatibleCandidates.length === 0) {
      const defaultAsset = candidates[0];
      fallbacksList.push({
        category,
        requested: targetTerms.join(', '),
        providedId: defaultAsset.assetId,
        reason: 'No compatible match found — defaulting to first available.',
        fallbackScore: 0.1,
      });
      this.diversity.markUsed(defaultAsset.assetId, category);
      this.db.recordUsage(defaultAsset.assetId);
      return defaultAsset.assetId;
    }

    // Rank and select
    const ranked = this.ranking.rank(compatibleCandidates, semanticScores);
    const bestAsset = ranked[0];
    const bestScore = semanticScores[bestAsset.assetId] ?? 0;

    // Record a fallback if score is not a perfect match
    if (bestScore < 0.95) {
      fallbacksList.push({
        category,
        requested: targetTerms.join(', '),
        providedId: bestAsset.assetId,
        reason: `Semantic match via synonym chain (score: ${bestScore.toFixed(2)})`,
        fallbackScore: bestScore,
      });
    }

    this.diversity.markUsed(bestAsset.assetId, category);
    this.db.recordUsage(bestAsset.assetId);
    return bestAsset.assetId;
  }
}
