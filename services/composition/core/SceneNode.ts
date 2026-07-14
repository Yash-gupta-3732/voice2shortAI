/**
 * @file SceneNode.ts
 * @description Base class for all nodes in the Composition Scene Graph.
 */

import { Transform } from '../../../types/rig/CoordinateSystem';
import { Matrix3 } from './Math';
import { RenderLayer } from '../../../types/rig/RenderingRules';

export abstract class SceneNode {
  public id: string;
  public name: string;
  public type: string;
  
  public parent: SceneNode | null = null;
  public children: SceneNode[] = [];
  
  public localTransform: Transform;
  public worldMatrix: Matrix3 = new Matrix3();
  
  public visible: boolean = true;
  public layer: RenderLayer = 0; // Default background far
  public zIndex: number = 0;
  public userData: Record<string, any> = {};

  constructor(id: string, name: string, type: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.localTransform = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { z: 0 },
      scale: { x: 1, y: 1 }
    };
  }

  public add(child: SceneNode): void {
    if (child.parent) {
      child.parent.remove(child);
    }
    child.parent = this;
    this.children.push(child);
  }

  public remove(child: SceneNode): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.parent = null;
      this.children.splice(index, 1);
    }
  }

  /**
   * Recursively update world matrices based on local transforms.
   */
  public updateWorldMatrix(force: boolean = false): void {
    // In a real engine, we'd cache this and use dirty flags.
    const localMatrix = new Matrix3().compose(
      this.localTransform.position,
      this.localTransform.rotation,
      this.localTransform.scale
    );

    if (this.parent) {
      this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, localMatrix);
    } else {
      this.worldMatrix.copy(localMatrix);
    }

    for (const child of this.children) {
      child.updateWorldMatrix(force);
    }
  }

  /**
   * Traverse the graph depth-first.
   */
  public traverse(callback: (node: SceneNode) => void): void {
    callback(this);
    for (const child of this.children) {
      child.traverse(callback);
    }
  }

  /**
   * Serialize this node and its children to JSON for debugging and export.
   */
  public toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      visible: this.visible,
      layer: this.layer,
      zIndex: this.zIndex,
      localTransform: this.localTransform,
      children: this.children.map(c => c.toJSON())
    };
  }
}
