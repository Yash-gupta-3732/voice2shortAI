/**
 * Ranking Engine
 * Scores candidates using a multi-factor weighted formula:
 *   semantic similarity × 0.50
 *   quality            × 0.20
 *   priority           × 0.20
 *   weight (diversity) × 0.10
 */
import { AssetMetadata } from '../../../types/assets';

export class RankingEngine {
  /**
   * Ranks candidates by composite score.
   * semanticScores: map of assetId → 0.0–1.0 semantic match
   */
  public rank(assets: AssetMetadata[], semanticScores: Record<string, number>): AssetMetadata[] {
    const scored = assets.map(asset => ({
      asset,
      score: this.computeScore(asset, semanticScores[asset.assetId] ?? 0),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.asset);
  }

  private computeScore(asset: AssetMetadata, semanticScore: number): number {
    return (
      semanticScore        * 0.50 +
      (asset.quality ?? 0.5)   * 0.20 +
      (asset.priority ?? 0.5)  * 0.20 +
      (asset.weight ?? 0.5)    * 0.10
    );
  }

  /**
   * Returns the composite score for a single asset (used for debug/logging)
   */
  public score(asset: AssetMetadata, semanticScore: number): number {
    return this.computeScore(asset, semanticScore);
  }
}
