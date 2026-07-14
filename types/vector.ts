export type VectorFormat = 'svg' | 'lottie' | 'rive';

export interface VectorAsset {
  id: string;
  format: VectorFormat;
  url: string; // The path to the asset file, or inline SVG string
}

export interface VectorFacialRig {
  head_base: VectorAsset;
  hair?: VectorAsset;
  eyes: VectorAsset; // Should support swapping for blinking/closing
  eyebrows: VectorAsset; // Should support expressions (angry, sad, neutral)
  mouth: VectorAsset; // Should support phonemes or expressions (smile, talk, sad)
  facial_accessories?: VectorAsset; // Glasses, etc.
}

export interface LayeredCharacterAsset {
  id: string;
  name: string;

  // Core Body
  torso: VectorAsset;
  left_upper_arm: VectorAsset;
  left_lower_arm: VectorAsset;
  left_hand: VectorAsset;
  right_upper_arm: VectorAsset;
  right_lower_arm: VectorAsset;
  right_hand: VectorAsset;
  left_upper_leg: VectorAsset;
  left_lower_leg: VectorAsset;
  left_foot: VectorAsset;
  right_upper_leg: VectorAsset;
  right_lower_leg: VectorAsset;
  right_foot: VectorAsset;

  // Facial Rig
  facial_rig: VectorFacialRig;

  // Customization
  clothing_torso?: VectorAsset;
  accessories?: VectorAsset;
}
