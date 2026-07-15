import React from 'react';
import { AppearanceState } from '../../../../types/visuals';

export interface OutfitProps {
  appearance: AppearanceState;
  limbType?: string;
}

export const AstronautTorso: React.FC<OutfitProps> = ({ appearance }) => {
  const fill = appearance.fillColor || '#f8fafc'; // White suit
  const stroke = appearance.strokeColor || '#334155';

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      {/* Bulky spacesuit torso from pelvis (100,100) to shoulders (100,40) */}
      <path 
        d="M 60 100 L 140 100 C 150 100, 150 50, 140 40 C 140 30, 60 30, 60 40 C 50 50, 50 100, 60 100 Z" 
        fill={fill} 
        stroke={stroke} 
        strokeWidth="2" 
        strokeLinejoin="round" 
      />
      {/* Spacesuit chest pack */}
      <rect x="75" y="55" width="50" height="30" rx="5" fill="#cbd5e1" stroke={stroke} strokeWidth="2" />
      <circle cx="85" cy="70" r="5" fill="#ef4444" />
      <circle cx="115" cy="70" r="5" fill="#3b82f6" />
      
      {/* Suit seams */}
      <path d="M 60 80 L 75 80 M 125 80 L 140 80" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
};

export const AstronautLimb: React.FC<OutfitProps> = ({ appearance, limbType }) => {
  const fill = appearance.fillColor || '#f8fafc';
  const stroke = appearance.strokeColor || '#334155';

  let d = "M 80 100 L 120 100 Q 130 100 130 110 L 130 130 Q 130 140 120 140 L 80 140 Q 70 140 70 130 L 70 110 Q 70 100 80 100 Z";

  if (limbType?.includes('hand')) {
    // Bulky space glove
    d = "M 80 100 L 120 100 Q 130 100 130 110 L 130 120 Q 130 130 100 130 Q 70 130 70 120 L 70 110 Q 70 100 80 100 Z";
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <path d={d} fill="#94a3b8" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 75 110 L 125 110" stroke={stroke} strokeWidth="2" opacity="0.5" />
      </svg>
    );
  } else if (limbType?.includes('foot') || limbType?.includes('toe')) {
    // Space boot
    d = "M 70 100 L 130 100 Q 140 100 140 120 L 140 130 Q 140 140 120 140 L 60 140 Q 50 140 50 130 Z";
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <path d={d} fill="#64748b" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 65 115 L 135 115" stroke={stroke} strokeWidth="2" opacity="0.5" />
      </svg>
    );
  }

  // Regular bulky limb
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <path d={d} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      {/* Space joint creases */}
      <path d="M 75 115 L 125 115 M 75 125 L 125 125" stroke={stroke} strokeWidth="2" opacity="0.3" strokeLinecap="round" />
    </svg>
  );
};
