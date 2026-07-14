import fs from 'fs';
import path from 'path';
import { AssetMetadata, AssetCategory } from '../../types/assets';

export class AssetDatabase {
  private assets: AssetMetadata[] = [];
  // Category-indexed lookup for O(1) filtering
  private byCategory: Map<AssetCategory, AssetMetadata[]> = new Map();
  private byId: Map<string, AssetMetadata> = new Map();
  private static instance: AssetDatabase;

  private constructor() {
    this.loadAssets();
  }

  public static getInstance(): AssetDatabase {
    if (!AssetDatabase.instance) {
      AssetDatabase.instance = new AssetDatabase();
    }
    return AssetDatabase.instance;
  }

  private loadAssets() {
    try {
      const filePath = path.join(process.cwd(), 'data', 'assets.json');
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        this.assets = JSON.parse(data);
        this.buildIndices();
      } else {
        console.warn('[AssetDatabase] data/assets.json not found. Run: npx tsx scripts/generateAssets.ts');
      }
    } catch (e) {
      console.error('[AssetDatabase] Failed to load:', e);
    }
  }

  private buildIndices() {
    this.byId.clear();
    this.byCategory.clear();

    for (const asset of this.assets) {
      this.byId.set(asset.assetId, asset);
      if (!this.byCategory.has(asset.category)) {
        this.byCategory.set(asset.category, []);
      }
      this.byCategory.get(asset.category)!.push(asset);
    }

    console.log(`[AssetDatabase] Loaded ${this.assets.length} assets across ${this.byCategory.size} categories.`);
  }

  public getByCategory(category: AssetCategory): AssetMetadata[] {
    return this.byCategory.get(category) ?? [];
  }

  public getById(assetId: string): AssetMetadata | undefined {
    return this.byId.get(assetId);
  }

  public getAll(): AssetMetadata[] {
    return this.assets;
  }

  /** Increment usage count in-memory (future: persist to DB) */
  public recordUsage(assetId: string): void {
    const asset = this.byId.get(assetId);
    if (asset) {
      asset.usageCount = (asset.usageCount ?? 0) + 1;
      asset.lastUsed = Date.now();
    }
  }
}
