/**
 * @file SceneGraph.ts
 * @description Specific node implementations for the Scene Graph.
 */

import { SceneNode } from './SceneNode';
export { SceneNode };
import { BoneDefinition } from '../../../types/rig/Skeleton';
import { RENDER_LAYERS, RenderLayer } from '../../../types/rig/RenderingRules';

export class SceneRootNode extends SceneNode {
  constructor(id: string) {
    super(id, 'SceneRoot', 'root');
  }
}

export class CharacterNode extends SceneNode {
  public characterId: string;
  public expressionId?: string;

  constructor(id: string, characterId: string) {
    super(id, `Character_${characterId}`, 'character');
    this.characterId = characterId;
    this.layer = RENDER_LAYERS.CHARACTER_TORSO; // Base layer
  }

  public override toJSON(): any {
    return {
      ...super.toJSON(),
      characterId: this.characterId,
      expressionId: this.expressionId
    };
  }
}

export class BoneNode extends SceneNode {
  public boneDef: BoneDefinition;

  constructor(boneDef: BoneDefinition) {
    super(`bone_${boneDef.id}`, boneDef.label, 'bone');
    this.boneDef = boneDef;
    this.layer = boneDef.drawOrder as RenderLayer; // We'll map this correctly later or use relative
    
    // Initial local transform comes from rest pose
    this.localTransform = {
      position: { ...boneDef.restTransform.position },
      rotation: { ...boneDef.restTransform.rotation },
      scale: { ...boneDef.restTransform.scale }
    };
  }

  public override toJSON(): any {
    return {
      ...super.toJSON(),
      boneId: this.boneDef.id
    };
  }
}

export class PropNode extends SceneNode {
  public assetId: string;
  public socketId: string;

  constructor(id: string, assetId: string, socketId: string) {
    super(id, `Prop_${assetId}`, 'prop');
    this.assetId = assetId;
    this.socketId = socketId;
  }

  public override toJSON(): any {
    return {
      ...super.toJSON(),
      assetId: this.assetId,
      socketId: this.socketId
    };
  }
}

export class CameraNode extends SceneNode {
  public zoom: number = 1.0;
  
  constructor(id: string) {
    super(id, 'MainCamera', 'camera');
  }

  public override toJSON(): any {
    return {
      ...super.toJSON(),
      zoom: this.zoom
    };
  }
}

export class BackgroundNode extends SceneNode {
  public assetId: string;

  constructor(id: string, assetId: string) {
    super(id, `Background_${assetId}`, 'background');
    this.assetId = assetId;
    this.layer = RENDER_LAYERS.BACKGROUND;
  }
}

export class EffectNode extends SceneNode {
  public assetId: string;

  constructor(id: string, assetId: string) {
    super(id, `Effect_${assetId}`, 'effect');
    this.assetId = assetId;
    this.layer = RENDER_LAYERS.EFFECTS;
  }
}
