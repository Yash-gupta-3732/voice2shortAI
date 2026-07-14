import { LayeredCharacterAsset, VectorAsset, VectorFormat, VectorFacialRig } from '../../types/vector';

export class AssetResolver {
  /**
   * Resolves a character ID into a format-agnostic layered character asset.
   * This allows hot-swapping themes, outfits, and procedural facial rigs.
   */
  public resolveCharacter(characterId: string, format: VectorFormat = 'svg'): LayeredCharacterAsset {
    // Mock implementation for the 'astronaut' character
    if (characterId === 'astronaut') {
      return this.createMockAstronaut(format);
    }
    
    // Default fallback
    return this.createMockDefaultCharacter(format);
  }

  /**
   * Resolves a specific facial expression (e.g., blinking, smiling, angry) 
   * into the appropriate facial rig layer overrides.
   */
  public resolveExpression(expressionId: string, baseRig: VectorFacialRig, format: VectorFormat = 'svg'): VectorFacialRig {
    const updatedRig = { ...baseRig };
    
    switch (expressionId) {
      case 'blink':
        updatedRig.eyes = { id: 'eyes_closed', format, url: this.getMockAssetUrl('eyes_closed', format) };
        break;
      case 'smile':
        updatedRig.mouth = { id: 'mouth_smile', format, url: this.getMockAssetUrl('mouth_smile', format) };
        updatedRig.eyes = { id: 'eyes_happy', format, url: this.getMockAssetUrl('eyes_happy', format) };
        break;
      case 'angry':
        updatedRig.eyebrows = { id: 'brows_angry', format, url: this.getMockAssetUrl('brows_angry', format) };
        updatedRig.mouth = { id: 'mouth_frown', format, url: this.getMockAssetUrl('mouth_frown', format) };
        break;
      case 'talking':
        updatedRig.mouth = { id: 'mouth_open', format, url: this.getMockAssetUrl('mouth_open', format) };
        break;
      // 'neutral' or unmapped leaves the base rig as-is
    }

    return updatedRig;
  }

  private createMockAstronaut(format: VectorFormat): LayeredCharacterAsset {
    return {
      id: 'astronaut',
      name: 'Space Explorer',
      torso: this.createAsset('astro_torso', format),
      left_upper_arm: this.createAsset('astro_upper_arm_l', format),
      left_lower_arm: this.createAsset('astro_lower_arm_l', format),
      left_hand: this.createAsset('astro_hand_l', format),
      right_upper_arm: this.createAsset('astro_upper_arm_r', format),
      right_lower_arm: this.createAsset('astro_lower_arm_r', format),
      right_hand: this.createAsset('astro_hand_r', format),
      left_upper_leg: this.createAsset('astro_upper_leg_l', format),
      left_lower_leg: this.createAsset('astro_lower_leg_l', format),
      left_foot: this.createAsset('astro_foot_l', format),
      right_upper_leg: this.createAsset('astro_upper_leg_r', format),
      right_lower_leg: this.createAsset('astro_lower_leg_r', format),
      right_foot: this.createAsset('astro_foot_r', format),
      facial_rig: {
        head_base: this.createAsset('astro_head', format),
        eyes: this.createAsset('eyes_neutral', format),
        eyebrows: this.createAsset('brows_neutral', format),
        mouth: this.createAsset('mouth_neutral', format),
        facial_accessories: this.createAsset('astro_helmet_visor', format), // Transparent visor over face
      }
    };
  }

  private createMockDefaultCharacter(format: VectorFormat): LayeredCharacterAsset {
    return {
      id: 'default',
      name: 'Default Human',
      torso: this.createAsset('default_torso', format),
      left_upper_arm: this.createAsset('default_upper_arm_l', format),
      left_lower_arm: this.createAsset('default_lower_arm_l', format),
      left_hand: this.createAsset('default_hand_l', format),
      right_upper_arm: this.createAsset('default_upper_arm_r', format),
      right_lower_arm: this.createAsset('default_lower_arm_r', format),
      right_hand: this.createAsset('default_hand_r', format),
      left_upper_leg: this.createAsset('default_upper_leg_l', format),
      left_lower_leg: this.createAsset('default_lower_leg_l', format),
      left_foot: this.createAsset('default_foot_l', format),
      right_upper_leg: this.createAsset('default_upper_leg_r', format),
      right_lower_leg: this.createAsset('default_lower_leg_r', format),
      right_foot: this.createAsset('default_foot_r', format),
      facial_rig: {
        head_base: this.createAsset('default_head', format),
        hair: this.createAsset('default_hair', format),
        eyes: this.createAsset('eyes_neutral', format),
        eyebrows: this.createAsset('brows_neutral', format),
        mouth: this.createAsset('mouth_neutral', format),
      }
    };
  }

  private createAsset(id: string, format: VectorFormat): VectorAsset {
    return {
      id,
      format,
      url: this.getMockAssetUrl(id, format)
    };
  }

  private getMockAssetUrl(id: string, format: VectorFormat): string {
    // In production, this would resolve to actual files in public/assets or a CDN
    // For now, we will return inline SVG data URIs if format is svg, just to make it renderable
    if (format === 'svg') {
      const color = id.includes('astro') ? '%23e2e8f0' : '%2394a3b8'; // Slate colors
      const rect = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="${color}" stroke="%23334155" stroke-width="2"/><text x="20" y="25" font-family="sans-serif" font-size="6" text-anchor="middle" fill="%23000">${id.split('_')[1] || id}</text></svg>`;
      return `data:image/svg+xml;utf8,${rect}`;
    }
    return `/assets/${format}/${id}.${format}`;
  }
}
