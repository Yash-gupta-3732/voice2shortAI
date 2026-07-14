import React, { useEffect, useState, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { Scene } from '../../types';
import { SceneComposer } from '../../services/composition/core/SceneComposer';
import { AssetResolver } from '../../services/assets/AssetResolver';
import { SceneNode, CharacterNode, BoneNode, PropNode } from '../../services/composition/core/SceneGraph';

export const VectorRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const timeMs = (frame / fps) * 1000;
  
  // Initialize composer and resolver once
  const { composer, root, camera, resolver } = useMemo(() => {
    const comp = new SceneComposer(scene.duration * 1000);
    const { root, camera } = comp.compose(scene.id, scene.composition);
    const res = new AssetResolver();
    return { composer: comp, root, camera, resolver: res };
  }, [scene]);

  // Force a re-render on every frame by updating the rig state
  // In Remotion, useCurrentFrame() triggers the re-render, so we just update the composer mathematically
  composer.timelineEngine.seek(timeMs);
  composer.update(timeMs, root, camera);

  // Compute Camera Transform
  // Origin is center-bottom. We use CSS transform to move the "world" container.
  const scaleY = -camera.zoom; // Flip Y for traditional 2D cartesian coordinate system mapping
  const scaleX = camera.zoom;
  const camX = -camera.localTransform.position.x;
  const camY = -camera.localTransform.position.y;
  
  const worldTransform = `translate(${width / 2}px, ${height * 0.9}px) scale(${scaleX}, ${scaleY}) translate(${camX}px, ${camY}px)`;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#09090b' }}>
      {/* World Container with Camera Transform applied */}
      <div style={{ transform: worldTransform, transformOrigin: '0 0', position: 'absolute', width: '100%', height: '100%' }}>
        
        {/* We would render background layers here (parallax) */}

        {/* Traverse and Render SceneGraph */}
        <SceneNodeRenderer node={root} resolver={resolver} />

        {/* Foreground / Overlays would go here */}
      </div>
    </AbsoluteFill>
  );
};

const SceneNodeRenderer: React.FC<{ node: SceneNode, resolver: AssetResolver }> = ({ node, resolver }) => {
  if (!node.visible) return null;

  const children = Array.from(node.children).map(child => (
    <SceneNodeRenderer key={child.id} node={child} resolver={resolver} />
  ));

  if (node instanceof CharacterNode) {
    return <CharacterRenderer character={node} resolver={resolver}>{children}</CharacterRenderer>;
  }

  if (node instanceof PropNode) {
    return <PropRenderer prop={node} resolver={resolver}>{children}</PropRenderer>;
  }

  // Base node (Group)
  return <>{children}</>;
};

const CharacterRenderer: React.FC<{ character: CharacterNode, resolver: AssetResolver, children: React.ReactNode }> = ({ character, resolver, children }) => {
  // Resolve character assets based on ID and Expression
  const layeredAsset = resolver.resolveCharacter(character.characterId, 'svg');
  const facialRig = resolver.resolveExpression(character.expressionId || 'neutral', layeredAsset.facial_rig, 'svg');

  // We map specific bones to their vector assets
  // In a robust system, this mapping would be driven by metadata.
  const boneAssetMap: Record<string, any> = {
    'head': facialRig.head_base,
    'chest': layeredAsset.torso,
    'left_upper_arm': layeredAsset.left_upper_arm,
    'left_lower_arm': layeredAsset.left_lower_arm,
    'left_hand': layeredAsset.left_hand,
    'right_upper_arm': layeredAsset.right_upper_arm,
    'right_lower_arm': layeredAsset.right_lower_arm,
    'right_hand': layeredAsset.right_hand,
    'left_upper_leg': layeredAsset.left_upper_leg,
    'left_lower_leg': layeredAsset.left_lower_leg,
    'left_foot': layeredAsset.left_foot,
    'right_upper_leg': layeredAsset.right_upper_leg,
    'right_lower_leg': layeredAsset.right_lower_leg,
    'right_foot': layeredAsset.right_foot,
  };

  // We need to render the bones. But bones are children of CharacterNode in the SceneGraph.
  // We can intercept BoneNodes and render the mapped asset inside them.
  const renderBone = (node: SceneNode): React.ReactNode => {
    if (!node.visible) return null;

    let content = null;
    if (node instanceof BoneNode) {
      const boneId = node.boneDef.id;
      const asset = boneAssetMap[boneId];
      
      // Calculate CSS Matrix from worldMatrix
      const e = node.worldMatrix.elements;
      // Matrix3 elements: [a, b, c,  d, e, f,  g, h, i]
      // CSS matrix(a, b, c, d, tx, ty) -> a=e[0], b=e[1], c=e[3], d=e[4], tx=e[6], ty=e[7]
      const cssMatrix = `matrix(${e[0]}, ${e[1]}, ${e[3]}, ${e[4]}, ${e[6]}, ${e[7]})`;

      if (asset) {
        content = (
          <div 
            key={node.id}
            style={{
              position: 'absolute',
              transform: cssMatrix,
              transformOrigin: '0 0',
              // Center the image on the bone's origin
              marginLeft: '-20px', 
              marginTop: '-20px',
              width: '40px',
              height: '40px',
            }}
          >
            <img src={asset.url} alt={boneId} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            
            {/* If it's the head, render facial features as sub-layers */}
            {boneId === 'head' && (
              <>
                {facialRig.eyes && <img src={facialRig.eyes.url} style={overlayStyle} />}
                {facialRig.eyebrows && <img src={facialRig.eyebrows.url} style={overlayStyle} />}
                {facialRig.mouth && <img src={facialRig.mouth.url} style={overlayStyle} />}
                {facialRig.hair && <img src={facialRig.hair.url} style={overlayStyle} />}
                {facialRig.facial_accessories && <img src={facialRig.facial_accessories.url} style={overlayStyle} />}
              </>
            )}
          </div>
        );
      }
    }

    const boneChildren = Array.from(node.children).map(child => renderBone(child));
    
    return (
      <React.Fragment key={node.id}>
        {content}
        {boneChildren}
      </React.Fragment>
    );
  };

  return <>{Array.from(character.children).map(child => renderBone(child))}</>;
};

const PropRenderer: React.FC<{ prop: PropNode, resolver: AssetResolver, children: React.ReactNode }> = ({ prop, resolver, children }) => {
  const e = prop.worldMatrix.elements;
  const cssMatrix = `matrix(${e[0]}, ${e[1]}, ${e[3]}, ${e[4]}, ${e[6]}, ${e[7]})`;
  
  // Fallback prop asset
  const asset = resolver.resolveCharacter('default').torso; // Mocking with a torso square

  return (
    <div 
      style={{
        position: 'absolute',
        transform: cssMatrix,
        transformOrigin: '0 0',
        marginLeft: '-15px', 
        marginTop: '-15px',
        width: '30px',
        height: '30px',
      }}
    >
      <img src={asset.url} alt={prop.id} style={{ width: '100%', height: '100%' }} />
      {children}
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain'
};
