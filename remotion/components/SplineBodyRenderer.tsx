/**
 * @file SplineBodyRenderer.tsx
 * @description Renders the stickman body as a single unified SVG using smooth
 * tapered Bézier spline paths driven by the VisualGraph bone world positions.
 *
 * Only the BODY is drawn here. Face and accessories are rendered separately
 * by the modular VectorComponents system.
 */

import React from 'react';
import { VisualElement, AppearanceState } from '../../types/visuals';
import { ModularHead } from '../assets/characters/heads/Head';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BonePos {
  id: string;
  x: number;
  y: number;
  parentId: string | null;
}

// ─── Face bone IDs — rendered by modular SVG, NOT as splines ─────────────────
const FACE_BONES = new Set(['head', 'neck']);

// ─── Bone radii: [proximal, distal] in world units ───────────────────────────
const BONE_RADII: Record<string, [number, number]> = {
  pelvis:          [10, 9],
  spine:           [9,  8],
  chest:           [8,  7],
  left_shoulder:   [6,  6],
  right_shoulder:  [6,  6],
  left_upper_arm:  [7,  5],
  right_upper_arm: [7,  5],
  left_lower_arm:  [5,  4],
  right_lower_arm: [5,  4],
  left_hand:       [4,  3],
  right_hand:      [4,  3],
  left_hip:        [7,  7],
  right_hip:       [7,  7],
  left_upper_leg:  [10, 8],
  right_upper_leg: [10, 8],
  left_lower_leg:  [8,  6],
  right_lower_leg: [8,  6],
  left_foot:       [5,  4],
  right_foot:      [5,  4],
  left_toe:        [4,  3],
  right_toe:       [4,  3],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Walk the VisualGraph tree and collect world positions of all body bones.
 * The transform matrix stores translation at elements[6] (x) and elements[7] (y).
 */
function collectBones(
  el: VisualElement,
  bones: Map<string, BonePos>,
  parentBoneId: string | null = null,
): void {
  if (el.type === 'vector' && el.semanticAssetId) {
    // semanticAssetId is like "default_chest" or "astronaut_left_upper_arm"
    // Strip the theme prefix to get the bare bone ID
    const parts = el.semanticAssetId.split('_');
    const boneId = parts.slice(1).join('_') || parts[0];
    const e = el.transform.elements;

    bones.set(boneId, {
      id: boneId,
      x: e[6],
      y: e[7],
      parentId: parentBoneId,
    });

    for (const child of el.children) {
      collectBones(child, bones, boneId);
    }
  } else {
    for (const child of el.children) {
      collectBones(child, bones, parentBoneId);
    }
  }
}

/**
 * Build the SVG path string for a smooth tapered capsule between two points.
 * The shape is wider at A (proximal joint) and narrower at B (distal joint).
 */
function taperedLimb(
  ax: number, ay: number,
  bx: number, by: number,
  rA: number, rB: number,
): string {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.5) return '';

  // Unit direction and perpendicular
  const nx = dx / len;
  const ny = dy / len;
  const px = -ny;
  const py =  nx;

  // Midpoint radius (linear taper)
  const rM = (rA + rB) / 2;
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;

  // Bézier control points sit slightly inside midpoint so limb bows naturally
  const cx1 = mx + px * rM * 0.2;
  const cy1 = my + py * rM * 0.2;
  const cx2 = mx - px * rM * 0.2;
  const cy2 = my - py * rM * 0.2;

  return [
    `M ${ax + px * rA} ${ay + py * rA}`,
    `Q ${cx1} ${cy1} ${bx + px * rB} ${by + py * rB}`,
    `A ${rB} ${rB} 0 0 1 ${bx - px * rB} ${by - py * rB}`,
    `Q ${cx2} ${cy2} ${ax - px * rA} ${ay - py * rA}`,
    `A ${rA} ${rA} 0 0 1 ${ax + px * rA} ${ay + py * rA}`,
    'Z',
  ].join(' ');
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SplineBodyRendererProps {
  root: VisualElement;
  appearance: AppearanceState;
}

export const SplineBodyRenderer: React.FC<SplineBodyRendererProps> = ({ root, appearance }) => {
  // Collect all bone world positions from the VisualGraph
  const boneMap = new Map<string, BonePos>();
  collectBones(root, boneMap, null);

  // Theme-driven colors with modern flat palette
  const bodyFill   = appearance.fillColor   || '#e2e8f0'; // Light slate
  const jointFill  = appearance.strokeColor || '#94a3b8'; // Slightly darker slate
  const strokeCol  = '#334155';                            // Dark outline

  // Find the head bone for face positioning
  const headBone = boneMap.get('head');

  // Build limb paths: for each bone (except face bones), draw parent→child
  const limbPaths: React.ReactNode[] = [];
  const jointCircles: React.ReactNode[] = [];

  for (const [boneId, bone] of boneMap.entries()) {
    // Skip face bones — handled below
    if (FACE_BONES.has(boneId)) continue;

    // Joint circle at every non-face bone
    const [rA] = BONE_RADII[boneId] ?? [6, 5];
    jointCircles.push(
      <circle
        key={`joint_${boneId}`}
        cx={bone.x}
        cy={bone.y}
        r={rA * 0.9}
        fill={jointFill}
        stroke={strokeCol}
        strokeWidth={0.8}
      />
    );

    // Tapered limb from parent → this bone
    if (bone.parentId && !FACE_BONES.has(bone.parentId)) {
      const parentBone = boneMap.get(bone.parentId);
      if (parentBone) {
        const [proxR] = BONE_RADII[bone.parentId] ?? [6, 5];
        const [, distR] = BONE_RADII[boneId] ?? [6, 5];
        const d = taperedLimb(parentBone.x, parentBone.y, bone.x, bone.y, proxR, distR);
        if (d) {
          limbPaths.push(
            <path
              key={`limb_${boneId}`}
              d={d}
              fill={bodyFill}
              stroke={strokeCol}
              strokeWidth={0.8}
              strokeLinejoin="round"
            />
          );
        }
      }
    }
  }

  // The SVG uses overflow="visible" and has no viewBox —
  // all coordinates are in world space. The parent CSS world transform handles
  // scaling and flipping.
  return (
    <>
      {/* Body splines rendered in world coordinate space */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible',
          width: 0,
          height: 0,
        }}
      >
        {/* Draw limbs first (behind joints) */}
        {limbPaths}
        {/* Then joints on top for clean look */}
        {jointCircles}
      </svg>

      {/* Modular face at head bone position */}
      {headBone && (
        <div
          style={{
            position: 'absolute',
            // Translate to head bone world position, center the 200x200 face SVG
            transform: `translate(${headBone.x - 100}px, ${headBone.y - 100}px) scaleY(-1)`,
            transformOrigin: `${headBone.x}px ${headBone.y}px`,
            width: '200px',
            height: '200px',
          }}
        >
          <ModularHead
            appearance={appearance}
            animationState={root.animationState}
          />
        </div>
      )}
    </>
  );
};
