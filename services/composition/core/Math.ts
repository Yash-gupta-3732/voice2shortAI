/**
 * @file Math.ts
 * @description Math utilities for 2D transforms and hierarchical matrix operations.
 */

import { Transform, Vec3, Rotation, Scale } from '../../../types/rig/CoordinateSystem';

export class Matrix3 {
  public elements: Float32Array;

  constructor() {
    this.elements = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);
  }

  public identity(): Matrix3 {
    this.elements.set([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);
    return this;
  }

  public clone(): Matrix3 {
    const m = new Matrix3();
    m.elements.set(this.elements);
    return m;
  }

  public copy(m: Matrix3): Matrix3 {
    this.elements.set(m.elements);
    return this;
  }

  public multiply(m: Matrix3): Matrix3 {
    return this.multiplyMatrices(this, m);
  }

  public multiplyMatrices(a: Matrix3, b: Matrix3): Matrix3 {
    const ae = a.elements;
    const be = b.elements;
    const te = this.elements;

    const a11 = ae[0], a12 = ae[3], a13 = ae[6];
    const a21 = ae[1], a22 = ae[4], a23 = ae[7];
    const a31 = ae[2], a32 = ae[5], a33 = ae[8];

    const b11 = be[0], b12 = be[3], b13 = be[6];
    const b21 = be[1], b22 = be[4], b23 = be[7];
    const b31 = be[2], b32 = be[5], b33 = be[8];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31;
    te[3] = a11 * b12 + a12 * b22 + a13 * b32;
    te[6] = a11 * b13 + a12 * b23 + a13 * b33;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31;
    te[4] = a21 * b12 + a22 * b22 + a23 * b32;
    te[7] = a21 * b13 + a22 * b23 + a23 * b33;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31;
    te[5] = a31 * b12 + a32 * b22 + a33 * b32;
    te[8] = a31 * b13 + a32 * b23 + a33 * b33;

    return this;
  }

  public compose(position: Vec3, rotation: Rotation, scale: Scale): Matrix3 {
    const x = position.x, y = position.y;
    const sx = scale.x, sy = scale.y;
    const c = Math.cos(rotation.z * Math.PI / 180);
    const s = Math.sin(rotation.z * Math.PI / 180);

    const te = this.elements;

    te[0] = c * sx;
    te[3] = -s * sy;
    te[6] = x;

    te[1] = s * sx;
    te[4] = c * sy;
    te[7] = y;

    te[2] = 0;
    te[5] = 0;
    te[8] = 1;

    return this;
  }

  public applyToVec3(v: Vec3): Vec3 {
    const e = this.elements;
    const x = v.x, y = v.y;
    return {
      x: e[0] * x + e[3] * y + e[6],
      y: e[1] * x + e[4] * y + e[7],
      z: v.z // z is untransformed in 2D space
    };
  }
}

/** Linearly interpolate between two numbers */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Linearly interpolate two transforms */
export function lerpTransform(a: Transform, b: Transform, t: number): Transform {
  return {
    position: {
      x: lerp(a.position.x, b.position.x, t),
      y: lerp(a.position.y, b.position.y, t),
      z: lerp(a.position.z, b.position.z, t),
    },
    rotation: {
      z: lerpAngle(a.rotation.z, b.rotation.z, t),
    },
    scale: {
      x: lerp(a.scale.x, b.scale.x, t),
      y: lerp(a.scale.y, b.scale.y, t),
    }
  };
}

/** Safely interpolate angles (shortest path) */
export function lerpAngle(a: number, b: number, t: number): number {
  let delta = ((b - a) % 360 + 540) % 360 - 180;
  return a + delta * t;
}
