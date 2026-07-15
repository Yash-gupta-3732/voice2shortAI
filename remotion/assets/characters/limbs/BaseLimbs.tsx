import React from 'react';
import { AppearanceState } from '../../../../types/visuals';

export interface LimbProps {
  appearance: AppearanceState;
  limbType: string; 
}

export const BaseLimb: React.FC<LimbProps> = ({ appearance, limbType }) => {
  const fill = appearance.fillColor || '#fcd5ce'; 
  const stroke = appearance.strokeColor || '#334155';

  // Generic capsule from pivot (100,100) to (100,135)
  let d = "M 85 100 L 115 100 Q 120 100 120 105 L 120 130 Q 120 135 115 135 L 85 135 Q 80 135 80 130 L 80 105 Q 80 100 85 100 Z";

  if (limbType.includes('hand')) {
    // Hand from pivot (100,100) to (100,115)
    d = "M 85 100 L 115 100 Q 120 100 120 105 L 120 115 Q 120 120 115 120 L 85 120 Q 80 120 80 115 L 80 105 Q 80 100 85 100 Z";
  } else if (limbType.includes('foot') || limbType.includes('toe')) {
    // Foot extending slightly forward
    d = "M 85 100 L 115 100 Q 120 100 120 110 L 120 115 Q 120 120 110 120 L 70 120 Q 65 120 65 115 L 65 110 Q 65 100 85 100 Z";
  } else if (limbType.includes('upper_arm') || limbType.includes('lower_arm')) {
    // Thinner capsule for arms
    d = "M 90 100 L 110 100 Q 115 100 115 105 L 115 130 Q 115 135 110 135 L 90 135 Q 85 135 85 130 L 85 105 Q 85 100 90 100 Z";
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <path d={d} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
};
