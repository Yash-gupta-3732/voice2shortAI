import React from 'react';
import { AppearanceState, AnimationState } from '../../../../types/visuals';

export interface ModuleProps {
  appearance: AppearanceState;
  animationState?: AnimationState;
}

export const HeadBase: React.FC<ModuleProps> = ({ appearance }) => {
  const fill = appearance.fillColor || '#fcd5ce'; // Default skin tone
  const stroke = appearance.strokeColor || '#334155';
  
  return (
    <>
      {/* Neck base extending up from pivot (100, 100) */}
      <path d="M 90 100 L 90 80 L 110 80 L 110 100 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      {/* Main Head Shape centered at (100, 65) */}
      <path d="M 70 65 C 70 30, 130 30, 130 65 C 130 95, 120 100, 100 100 C 80 100, 70 95, 70 65 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
    </>
  );
};

export const EyesBase: React.FC<ModuleProps> = ({ appearance, animationState }) => {
  const isBlinking = animationState?.isBlinking;
  const eyeColor = '#0f172a';

  if (isBlinking) {
    return (
      <>
        {/* Curved closed eyes */}
        <path d="M 85 65 Q 90 70 95 65" fill="none" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" />
        <path d="M 105 65 Q 110 70 115 65" fill="none" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }

  return (
    <>
      {/* Open eyes */}
      <ellipse cx="90" cy="60" rx="3" ry="5" fill={eyeColor} />
      <ellipse cx="110" cy="60" rx="3" ry="5" fill={eyeColor} />
      
      {/* Eyebrows */}
      <path d="M 82 50 Q 90 48 95 50" fill="none" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" />
      <path d="M 105 50 Q 110 48 118 50" fill="none" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" />
    </>
  );
};

export const MouthBase: React.FC<ModuleProps> = ({ appearance, animationState }) => {
  const isTalking = animationState?.isTalking;
  const mouthColor = '#0f172a';
  const tongueColor = '#fca5a5';

  if (isTalking) {
    return (
      <>
        <path d="M 95 80 C 95 80, 100 90, 105 80 Z" fill={mouthColor} stroke={mouthColor} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 97 84 C 97 84, 100 88, 103 84 Z" fill={tongueColor} />
      </>
    );
  }

  // Neutral smile
  return (
    <path d="M 93 82 Q 100 87 107 82" fill="none" stroke={mouthColor} strokeWidth="2" strokeLinecap="round" />
  );
};

export const HairBase: React.FC<ModuleProps> = ({ appearance }) => {
  const hairColor = '#1e293b'; 
  return (
    <path d="M 68 65 C 68 40, 85 25, 115 30 C 130 32, 135 50, 132 55 C 128 40, 110 35, 90 45 C 80 50, 75 55, 68 65 Z" fill={hairColor} />
  );
};

export const ModularHead: React.FC<ModuleProps> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <HeadBase {...props} />
      <EyesBase {...props} />
      <MouthBase {...props} />
      <HairBase {...props} />
    </svg>
  );
};
