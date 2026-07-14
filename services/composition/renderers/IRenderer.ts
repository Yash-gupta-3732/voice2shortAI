import { SceneNode, CameraNode } from '../core/SceneGraph';
import { RenderContext } from '../../../types/themes';

/**
 * Interface for rendering backends (Canvas, Vector, WebGL).
 */
export interface IRenderer {
  /**
   * Renders the given scene graph using the specific backend implementation.
   */
  render(sceneRoot: SceneNode, camera: CameraNode, context: RenderContext): any;
}
