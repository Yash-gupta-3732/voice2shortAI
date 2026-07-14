import React from 'react';
import { AppearanceState, AnimationState } from '../../../types/visuals';

interface VectorProps {
  semanticId: string;
  appearance: AppearanceState;
  animationState: AnimationState;
}

export const VectorElementResolver: React.FC<VectorProps> = ({ semanticId, appearance, animationState }) => {
  // Extract base colors with fallbacks
  const fill = appearance.fillColor || '#94a3b8';
  const stroke = appearance.strokeColor || '#334155';

  // Head and Facial Rig Logic
  if (semanticId.includes('_head')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <rect width="40" height="40" rx="20" fill={fill} stroke={stroke} strokeWidth="2" />
        
        {/* Eyes: Blinking Logic */}
        {!animationState.isBlinking ? (
          <>
            <circle cx="12" cy="15" r="3" fill="#0f172a" />
            <circle cx="28" cy="15" r="3" fill="#0f172a" />
          </>
        ) : (
          <>
            <line x1="9" y1="15" x2="15" y2="15" stroke="#0f172a" strokeWidth="2" />
            <line x1="25" y1="15" x2="31" y2="15" stroke="#0f172a" strokeWidth="2" />
          </>
        )}

        {/* Mouth: Talking/Expression Logic */}
        {animationState.isTalking ? (
          <ellipse cx="20" cy="28" rx="6" ry="4" fill="#0f172a" />
        ) : (
          <path d="M 14 26 Q 20 32 26 26" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    );
  }

  // Generic Limbs / Torso / Props
  let label = semanticId.split('_').pop() || '';
  if (label === 'chest') label = 'torso';

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <rect width="40" height="40" rx="10" fill={fill} stroke={stroke} strokeWidth="2" />
      <text x="20" y="24" fontFamily="sans-serif" fontSize="8" textAnchor="middle" fill="#000">
        {label}
      </text>
    </svg>
  );
};
