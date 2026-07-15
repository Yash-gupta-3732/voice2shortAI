import React from 'react';
import { AppearanceState } from '../../../../types/visuals';

export interface AccessoryProps {
  appearance: AppearanceState;
}

export const AstronautHelmet: React.FC<AccessoryProps> = ({ appearance }) => {
  const stroke = appearance.strokeColor || '#334155';

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      {/* Large Glass Visor covering head from (100, 100) to (100, 30) */}
      <path 
        d="M 60 100 C 60 50, 140 50, 140 100 C 140 120, 120 125, 100 125 C 80 125, 60 120, 60 100 Z" 
        fill="#bae6fd" 
        fillOpacity="0.4"
        stroke={stroke} 
        strokeWidth="2" 
      />
      {/* Visor Glare / Reflection */}
      <path 
        d="M 75 75 C 80 65, 95 65, 110 70" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="3" 
        strokeLinecap="round" 
        opacity="0.8" 
      />
      {/* Helmet base ring around neck */}
      <path d="M 75 110 C 85 115, 115 115, 125 110" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};
