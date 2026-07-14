import { SceneNode, BoneNode, CharacterNode, PropNode, CameraNode } from '../core/SceneGraph';
import { BoneId } from '../../../types/rig/Skeleton';

export class StickmanEngine {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public render(sceneRoot: SceneNode, camera: CameraNode): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw Chalkboard Background
    this.ctx.fillStyle = '#2a2a2a'; // dark charcoal
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Add some subtle noise/chalk texture (optional/placeholder)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 100; i++) {
      this.ctx.fillRect(Math.random() * this.width, Math.random() * this.height, 2, 2);
    }

    // Apply Camera Transform
    this.ctx.save();
    
    // Move origin to center-bottom
    this.ctx.translate(this.width / 2, this.height * 0.9);
    
    // Apply camera zoom and pan (Invert y so positive Y goes UP)
    this.ctx.scale(camera.zoom, -camera.zoom);
    this.ctx.translate(-camera.localTransform.position.x, -camera.localTransform.position.y);

    // Collect all renderable nodes
    const renderList: SceneNode[] = [];
    sceneRoot.traverse((node: SceneNode) => {
      if (node.visible && !(node === sceneRoot || node === camera)) {
        renderList.push(node);
      }
    });

    // We'll extract characters to render them as cohesive objects
    const characters: CharacterNode[] = renderList.filter((n): n is CharacterNode => n instanceof CharacterNode);
    const props = renderList.filter((n): n is PropNode => n instanceof PropNode);

    // Draw Props first (background effects/items)
    for (const prop of props) {
      this.drawProp(prop);
    }

    // Draw Characters
    for (const char of characters) {
      this.drawCharacter(char);
    }

    this.ctx.restore();
  }

  private drawCharacter(char: CharacterNode): void {
    // Collect all bones for this character
    const bones = new Map<BoneId, BoneNode>();
    char.traverse((node) => {
      if (node instanceof BoneNode) {
        bones.set(node.boneDef.id, node);
      }
    });

    // Helper to get world pos of a bone
    const getPos = (id: BoneId) => {
      const b = bones.get(id);
      if (!b) return { x: 0, y: 0 };
      const e = b.worldMatrix.elements;
      return { x: e[6], y: e[7] }; // e[6] = tx, e[7] = ty
    };

    // Draw order matters!
    
    // 1. Draw back limbs (left arm, left leg)
    this.drawLimb([getPos('left_shoulder'), getPos('left_upper_arm'), getPos('left_lower_arm'), getPos('left_hand')], 8);
    this.drawLimb([getPos('left_hip'), getPos('left_upper_leg'), getPos('left_lower_leg'), getPos('left_foot')], 8);

    // 2. Draw Torso (Lab Coat)
    const chest = getPos('chest');
    const pelvis = getPos('pelvis');
    const neck = getPos('neck');
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(chest.x - 25, chest.y);
    this.ctx.lineTo(chest.x + 25, chest.y);
    this.ctx.lineTo(pelvis.x + 30, pelvis.y - 20); // coat flares out
    this.ctx.lineTo(pelvis.x - 30, pelvis.y - 20);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // 3. Draw front limbs (right arm, right leg)
    this.drawLimb([getPos('right_shoulder'), getPos('right_upper_arm'), getPos('right_lower_arm'), getPos('right_hand')], 8);
    this.drawLimb([getPos('right_hip'), getPos('right_upper_leg'), getPos('right_lower_leg'), getPos('right_foot')], 8);

    // 4. Draw Red Bow Tie at the neck
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.moveTo(neck.x, neck.y);
    this.ctx.lineTo(neck.x - 10, neck.y + 10);
    this.ctx.lineTo(neck.x - 10, neck.y - 10);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.moveTo(neck.x, neck.y);
    this.ctx.lineTo(neck.x + 10, neck.y + 10);
    this.ctx.lineTo(neck.x + 10, neck.y - 10);
    this.ctx.closePath();
    this.ctx.fill();

    // 5. Draw Head
    const headNode = bones.get('head');
    if (headNode) {
      const headPos = getPos('head');
      const e = headNode.worldMatrix.elements;
      const angle = Math.atan2(e[1], e[0]); // Get head rotation
      
      this.ctx.save();
      this.ctx.translate(headPos.x, headPos.y);
      this.ctx.rotate(angle);
      
      // Draw Head Circle
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.arc(0, 30, 25, 0, Math.PI * 2); // 30 units offset up (in local y)
      this.ctx.fill();
      this.ctx.stroke();

      // Messy Hair
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i + Math.PI; // top half
        const px = Math.cos(a) * 25;
        const py = Math.sin(a) * 25 + 30;
        this.ctx.moveTo(px, py);
        this.ctx.lineTo(px * 1.5, py + (Math.random() * 10) + 15);
      }
      this.ctx.stroke();

      // Glasses
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(-8, 35, 8, 0, Math.PI * 2); // left lens
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(12, 35, 8, 0, Math.PI * 2); // right lens
      this.ctx.stroke();
      
      // Bridge
      this.ctx.beginPath();
      this.ctx.moveTo(0, 35);
      this.ctx.lineTo(4, 35);
      this.ctx.stroke();
      
      // Eyes (Pupils)
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(-8, 35, 2, 0, Math.PI * 2);
      this.ctx.arc(12, 35, 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Mouth (surprised/talking based on expression, defaults to small open mouth)
      this.ctx.beginPath();
      if (char.expressionId === 'talking') {
        this.ctx.ellipse(2, 20, 4, 6, 0, 0, Math.PI * 2);
      } else {
        this.ctx.arc(2, 20, 3, 0, Math.PI * 2);
      }
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  private drawLimb(points: {x: number, y: number}[], thickness: number): void {
    if (points.length < 2) return;
    this.ctx.strokeStyle = '#000000'; // Pure black for limbs
    this.ctx.lineWidth = thickness;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.stroke();
  }

  private drawProp(prop: PropNode): void {
    const e = prop.worldMatrix.elements;
    const x = e[6];
    const y = e[7];

    this.ctx.save();
    this.ctx.translate(x, y);
    const angle = Math.atan2(e[1], e[0]);
    this.ctx.rotate(angle);

    // Stylized prop/effect
    this.ctx.strokeStyle = '#f472b6'; // pink neon effect
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    
    // Draw some explosion lines if it's an effect
    if (prop.assetId === 'explosion') {
      for (let i = 0; i < 8; i++) {
        this.ctx.beginPath();
        this.ctx.rotate(Math.PI / 4);
        this.ctx.moveTo(10, 0);
        this.ctx.lineTo(30, 0);
        this.ctx.stroke();
      }
    } else {
      // Default prop box
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.fillRect(-15, -15, 30, 30);
    }
    
    this.ctx.restore();
  }
}
