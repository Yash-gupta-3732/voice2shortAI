import React from 'react';
import { AppearanceState, AnimationState } from '../../../types/visuals';

// Import our new premium modular assets
import { ModularHead } from '../../assets/characters/heads/Head';
import { BaseTorso } from '../../assets/characters/torsos/BaseTorso';
import { BaseLimb } from '../../assets/characters/limbs/BaseLimbs';
import { AstronautTorso, AstronautLimb } from '../../assets/characters/outfits/AstronautOutfit';
import { AstronautHelmet } from '../../assets/characters/accessories/Accessories';

export interface VectorProps {
  semanticId: string;
  appearance: AppearanceState;
  animationState: AnimationState;
}

export const VectorElementResolver: React.FC<VectorProps> = (props) => {
  const { semanticId, appearance, animationState } = props;

  // The semanticId format is typically '{theme}_{boneId}' (e.g. 'astronaut_chest' or 'default_left_lower_arm')
  const parts = semanticId.split('_');
  const theme = parts[0]; // 'astronaut' or 'default'
  const boneType = parts.slice(1).join('_'); // 'chest', 'left_lower_arm', 'head'

  // --- 1. HEAD RESOLUTION ---
  if (boneType === 'head') {
    return (
      <div style={{ position: 'relative', width: 40, height: 40 }}>
        {/* Base Modular Head (Face, Eyes, Mouth, Hair) */}
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <ModularHead appearance={appearance} animationState={animationState} />
        </div>
        
        {/* Accessory Overlays based on theme */}
        {theme === 'astronaut' && (
          <div style={{ position: 'absolute', top: 0, left: 0 }}>
            <AstronautHelmet appearance={appearance} />
          </div>
        )}
      </div>
    );
  }

  // --- 2. TORSO RESOLUTION ---
  if (boneType === 'chest' || boneType === 'torso') {
    if (theme === 'astronaut') {
      return <AstronautTorso appearance={appearance} />;
    }
    // Fallback or 'default' theme
    return <BaseTorso appearance={appearance} />;
  }

  // --- 3. LIMB RESOLUTION ---
  // Covers upper_arm, lower_arm, hand, upper_leg, lower_leg, foot, toe
  if (theme === 'astronaut') {
    return <AstronautLimb appearance={appearance} limbType={boneType} />;
  }
  
  // Fallback to bare skin/simple limbs
  return <BaseLimb appearance={appearance} limbType={boneType} />;
};
