/**
 * Recommendation Engine
 * Analyses selected assets and suggests missing, overused, or low-quality assets.
 */
import { AssetMetadata, AssetCategory, RecommendationHint } from '../../../types/assets';
import { AssetDatabase } from '../database';

export class RecommendationEngine {
  private db: AssetDatabase;

  constructor() {
    this.db = AssetDatabase.getInstance();
  }

  /**
   * Suggest new assets when there are gaps in the library
   */
  public suggestMissingAssets(
    requestedTags: Partial<Record<AssetCategory, string[]>>
  ): RecommendationHint[] {
    const hints: RecommendationHint[] = [];

    for (const [cat, tags] of Object.entries(requestedTags) as [AssetCategory, string[]][]) {
      const available = this.db.getByCategory(cat);
      for (const tag of tags) {
        const hasMatch = available.some(a =>
          a.tags.includes(tag) || a.semanticKeywords?.includes(tag)
        );
        if (!hasMatch) {
          hints.push({
            missingAssetDescription: `No ${cat} asset found for: "${tag}"`,
            suggestedCategory: cat,
            suggestedTags: [tag],
            priority: 'high',
          });
        }
      }
    }

    return hints;
  }

  /**
   * Flag overused assets (usageCount > threshold)
   */
  public flagOverusedAssets(threshold = 10): AssetMetadata[] {
    return this.db.getAll().filter(a => (a.usageCount ?? 0) > threshold);
  }

  /**
   * Flag low quality assets
   */
  public flagLowQualityAssets(threshold = 0.4): AssetMetadata[] {
    return this.db.getAll().filter(a => (a.quality ?? 1) < threshold);
  }

  /**
   * Suggest required assets missing from a composition
   */
  public suggestRequiredAssets(selectedAssets: AssetMetadata[]): RecommendationHint[] {
    const hints: RecommendationHint[] = [];
    const selectedIds = new Set(selectedAssets.map(a => a.assetId));

    for (const asset of selectedAssets) {
      for (const requiredId of asset.requiredAssets ?? []) {
        if (!selectedIds.has(requiredId)) {
          const requiredAsset = this.db.getById(requiredId);
          hints.push({
            missingAssetDescription: `Asset "${asset.assetId}" requires "${requiredId}" (${requiredAsset?.name ?? 'unknown'})`,
            suggestedCategory: requiredAsset?.category ?? 'prop',
            suggestedTags: requiredAsset?.tags ?? [requiredId],
            priority: 'critical',
          });
        }
      }
    }

    return hints;
  }
}
