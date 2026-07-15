import React from 'react';
import { AppearanceState } from '../../../../types/visuals';

export interface TorsoProps {
  appearance: AppearanceState;
}

export const BaseTorso: React.FC<TorsoProps> = ({ appearance }) => {
  const fill = appearance.fillColor || '#e2e8f0'; 
  const stroke = appearance.strokeColor || '#334155';

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      {/* Torso from pelvis (100,100) to shoulders (100, 40) */}
      <path 
        d="M 80 100 L 120 100 C 130 100, 130 50, 120 40 C 115 35, 85 35, 80 40 C 70 50, 70 100, 80 100 Z" 
        fill={fill} 
        stroke={stroke} 
        strokeWidth="2" 
        strokeLinejoin="round" 
      />
      {/* Simple collar detail at shoulders */}
      <path d="M 85 40 Q 100 50 115 40" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
