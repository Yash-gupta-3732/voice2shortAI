/**
 * @file PreviewEngine.ts
 * @description Renders a Scene Graph to an HTML5 Canvas Context. (Debug Renderer)
 */

import { SceneNode, BoneNode, CharacterNode, PropNode, CameraNode } from '../core/SceneGraph';
import { CANVAS_SPEC } from '../../../types/rig/CoordinateSystem';

export class PreviewEngine {
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
    
    // Fill background
    this.ctx.fillStyle = '#111111'; // dark background for debug
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Apply Camera Transform
    this.ctx.save();
    
    // Move origin to center-bottom as per Coordinate System spec
    this.ctx.translate(this.width / 2, this.height * 0.9);
    
    // Apply camera zoom and pan (Invert y so positive Y goes UP)
    this.ctx.scale(camera.zoom, -camera.zoom); // Flip Y axis for math coordinate system
    this.ctx.translate(-camera.localTransform.position.x, -camera.localTransform.position.y);

    // Collect all renderable nodes
    const renderList: SceneNode[] = [];
    sceneRoot.traverse((node: SceneNode) => {
      if (node.visible && !(node instanceof CharacterNode || node === sceneRoot || node === camera)) {
        renderList.push(node);
      }
    });

    // Sort by Layer, then zIndex (painter's algorithm)
    renderList.sort((a, b) => {
      if (a.layer !== b.layer) return a.layer - b.layer;
      return a.zIndex - b.zIndex;
    });

    // Draw
    for (const node of renderList) {
      if (node instanceof BoneNode) {
        this.drawBone(node);
      } else if (node instanceof PropNode) {
        this.drawProp(node);
      }
      // Future: handle backgrounds, effects, lighting overlays
    }

    this.ctx.restore();
  }

  private drawBone(bone: BoneNode): void {
    const parentNode = bone.parent;
    if (!parentNode || !(parentNode instanceof BoneNode)) return; // Don't draw root to pelvis bone typically, or just draw joints

    const worldMatrix = bone.worldMatrix.elements;
    const parentMatrix = parentNode.worldMatrix.elements;

    // Bone origin in world space
    const x1 = parentMatrix[6];
    const y1 = parentMatrix[7];

    // Bone tip in world space
    const x2 = worldMatrix[6];
    const y2 = worldMatrix[7];

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = '#8b5cf6'; // Violet color for bones
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Draw joint
    this.ctx.beginPath();
    this.ctx.arc(x1, y1, 3, 0, Math.PI * 2);
    this.ctx.fillStyle = '#c4b5fd';
    this.ctx.fill();
  }

  private drawProp(prop: PropNode): void {
    const e = prop.worldMatrix.elements;
    const x = e[6];
    const y = e[7];

    this.ctx.save();
    this.ctx.translate(x, y);
    // Extract rotation from matrix (atan2(m12, m11))
    const angle = Math.atan2(e[1], e[0]);
    this.ctx.rotate(angle);

    this.ctx.fillStyle = 'rgba(34, 197, 94, 0.5)'; // Green box for props
    this.ctx.strokeStyle = '#22c55e';
    this.ctx.lineWidth = 2;
    
    // Draw a placeholder box centered on the anchor
    this.ctx.fillRect(-15, -15, 30, 30);
    this.ctx.strokeRect(-15, -15, 30, 30);
    
    // Label
    this.ctx.scale(1, -1); // flip text right side up
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(prop.assetId, 0, 5);
    
    this.ctx.restore();
  }
}
