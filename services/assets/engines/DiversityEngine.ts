/**
 * Diversity Engine
 * Prevents repetitive asset selection across a project's scenes.
 * Uses a bounded LRU-style window to track recently used assets per category.
 */
import { AssetCategory } from '../../../types/assets';

const WINDOW_SIZE = 5; // remember last N uses per category
const PENALTY = 0.30;  // score reduction for recently used

export class DiversityEngine {
  // Per-category ring buffer of recently used assetIds
  private recentByCategory: Map<string, string[]> = new Map();

  private getWindow(category: AssetCategory): string[] {
    if (!this.recentByCategory.has(category)) {
      this.recentByCategory.set(category, []);
    }
    return this.recentByCategory.get(category)!;
  }

  public markUsed(assetId: string, category: AssetCategory): void {
    const window = this.getWindow(category);
    // Prepend and trim to window size
    window.unshift(assetId);
    if (window.length > WINDOW_SIZE) window.pop();
    this.recentByCategory.set(category, window);
  }

  /**
   * Reduces score if the asset was used recently.
   * More recently used = bigger penalty.
   */
  public penalizeScoreForRecentUsage(assetId: string, category: AssetCategory, currentScore: number): number {
    const window = this.getWindow(category);
    const recency = window.indexOf(assetId); // 0 = most recent
    if (recency === -1) return currentScore;
    
    // Linear penalty decay: most recent = full penalty, oldest in window = 10% penalty
    const penaltyFactor = PENALTY * (1 - recency / WINDOW_SIZE);
    return Math.max(0, currentScore - penaltyFactor);
  }

  /**
   * Returns stats about asset usage for the recommendation engine
   */
  public getUsageStats(): { category: string; recentlyUsed: string[] }[] {
    return Array.from(this.recentByCategory.entries()).map(([category, ids]) => ({
      category,
      recentlyUsed: ids,
    }));
  }
}
