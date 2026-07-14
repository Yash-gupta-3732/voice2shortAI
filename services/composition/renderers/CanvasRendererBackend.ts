import { SceneNode, BoneNode, CharacterNode, PropNode, CameraNode } from '../core/SceneGraph';
import { ThemeComposition, RenderContext } from '../../../types/themes';
import { BoneId } from '../../../types/rig/Skeleton';
import { IRenderer } from './IRenderer';

export class CanvasRendererBackend implements IRenderer {
  private composition: ThemeComposition;

  constructor(composition: ThemeComposition) {
    this.composition = composition;
  }

  public render(sceneRoot: SceneNode, camera: CameraNode, context: RenderContext): void {
    const { ctx, width, height } = context;

    // 1. Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 2. Apply Global Style Rules
    this.composition.style.applyStyleRules(context);

    // 3. Render Background Environment
    this.composition.environment.drawBackground(context);

    // 4. Camera Transform
    ctx.save();
    ctx.translate(width / 2, height * 0.9); // Origin to center-bottom
    ctx.scale(camera.zoom, -camera.zoom); // Flip Y
    ctx.translate(-camera.localTransform.position.x, -camera.localTransform.position.y);

    // Collect Renderables
    const renderList: SceneNode[] = [];
    sceneRoot.traverse((node: SceneNode) => {
      if (node.visible && !(node === sceneRoot || node === camera)) {
        renderList.push(node);
      }
    });

    const characters: CharacterNode[] = renderList.filter((n): n is CharacterNode => n instanceof CharacterNode);
    const props = renderList.filter((n): n is PropNode => n instanceof PropNode);

    // 5. Draw Scene Elements (Back to Front)
    for (const prop of props) {
      this.drawProp(prop, context);
    }

    for (const char of characters) {
      this.drawComposedCharacter(char, context);
    }

    ctx.restore();

    // 6. Render Foreground Environment & Overlays (Weather, Lighting)
    this.composition.environment.drawForeground(context);
    
    if (this.composition.weather) {
      this.composition.weather.drawWeather(context);
    }
    if (this.composition.lighting) {
      this.composition.lighting.applyLighting(context);
    }
  }

  private drawComposedCharacter(char: CharacterNode, context: RenderContext): void {
    // Map character bones
    const bones = new Map<BoneId, BoneNode>();
    char.traverse((node) => {
      if (node instanceof BoneNode) {
        bones.set(node.boneDef.id, node);
      }
    });

    const getPos = (id: BoneId) => {
      const b = bones.get(id);
      if (!b) return { x: 0, y: 0 };
      const e = b.worldMatrix.elements;
      return { x: e[6], y: e[7] };
    };

    // A. Draw Back Limbs
    this.composition.character.drawLimb(context, [getPos('left_shoulder'), getPos('left_upper_arm'), getPos('left_lower_arm'), getPos('left_hand')]);
    this.composition.character.drawLimb(context, [getPos('left_hip'), getPos('left_upper_leg'), getPos('left_lower_leg'), getPos('left_foot')]);

    // B. Draw Torso (Base Character)
    this.composition.character.drawTorso(context, getPos('chest'), getPos('pelvis'));

    // C. Draw Outfit (Over Torso)
    if (this.composition.outfit) {
      this.composition.outfit.drawTorsoOutfit(context, getPos('chest'), getPos('pelvis'));
    }

    // D. Draw Front Limbs
    this.composition.character.drawLimb(context, [getPos('right_shoulder'), getPos('right_upper_arm'), getPos('right_lower_arm'), getPos('right_hand')]);
    this.composition.character.drawLimb(context, [getPos('right_hip'), getPos('right_upper_leg'), getPos('right_lower_leg'), getPos('right_foot')]);

    // E. Draw Head & Head Accessories
    const headNode = bones.get('head');
    if (headNode) {
      this.composition.character.drawHead(context, headNode, char.expressionId);
      if (this.composition.accessory) {
        this.composition.accessory.drawHeadAccessories(context, headNode);
      }
    }
    
    // F. Draw Body Accessories (e.g. Jetpack)
    if (this.composition.accessory) {
      this.composition.accessory.drawBodyAccessories(context, getPos('chest'), getPos('pelvis'));
    }
  }

  private drawProp(prop: PropNode, context: RenderContext): void {
    // Placeholder prop drawing logic using style palette
    const e = prop.worldMatrix.elements;
    const x = e[6];
    const y = e[7];

    context.ctx.save();
    context.ctx.translate(x, y);
    const angle = Math.atan2(e[1], e[0]);
    context.ctx.rotate(angle);

    context.ctx.fillStyle = context.palette.secondary;
    context.ctx.fillRect(-15, -15, 30, 30);
    
    context.ctx.restore();
  }
}
