/**
 * @file TransitionGraph.ts
 * @description Valid animation transition graph.
 *
 * Defines which animations can follow which.
 * The Stickman Engine uses this to sequence scenes smoothly and
 * to reject jarring animation jumps (e.g. walking → sleeping).
 *
 * Every edge is: FROM animation → TO animation, with blend time override.
 * If an edge is not listed, the transition is INVALID and requires
 * falling back through an intermediate pose (e.g. walk → stand → sit).
 */

import { PoseId } from '../../types/rig/AnimationStandard';

// ─── Transition Edge ─────────────────────────────────────────────────────────

export interface TransitionEdge {
  from: string;          // animation clipId (matches assetId)
  to: string;            // animation clipId
  blendMs: number;       // cross-fade duration in ms
  requiresIntermediatePose?: PoseId; // if set, this pose is inserted between
  condition?: string;    // future: state machine parameter condition
}

// ─── Transition Graph ────────────────────────────────────────────────────────

export const TRANSITION_GRAPH: TransitionEdge[] = [

  // ── Standing ↔ Walking ─────────────────────────────────────────────────
  { from: 'anim_standing_idle', to: 'anim_walking_loop',   blendMs: 250 },
  { from: 'anim_standing_loop', to: 'anim_walking_loop',   blendMs: 250 },
  { from: 'anim_walking_idle',  to: 'anim_standing_idle',  blendMs: 300 },
  { from: 'anim_walking_loop',  to: 'anim_standing_idle',  blendMs: 350, requiresIntermediatePose: 'pose_idle_standing' },
  { from: 'anim_walking_fast',  to: 'anim_standing_idle',  blendMs: 450, requiresIntermediatePose: 'pose_idle_standing' },

  // ── Walking ↔ Running ──────────────────────────────────────────────────
  { from: 'anim_walking_loop',  to: 'anim_running_loop',   blendMs: 200 },
  { from: 'anim_walking_fast',  to: 'anim_running_loop',   blendMs: 150 },
  { from: 'anim_running_loop',  to: 'anim_walking_loop',   blendMs: 250 },
  { from: 'anim_running_fast',  to: 'anim_walking_loop',   blendMs: 300 },
  { from: 'anim_running_loop',  to: 'anim_standing_idle',  blendMs: 500, requiresIntermediatePose: 'pose_idle_standing' },

  // ── Standing → Sitting ─────────────────────────────────────────────────
  { from: 'anim_standing_idle', to: 'anim_sitting_idle',   blendMs: 400, requiresIntermediatePose: 'pose_sit_forward' },
  { from: 'anim_sitting_idle',  to: 'anim_standing_idle',  blendMs: 400, requiresIntermediatePose: 'pose_idle_standing' },

  // ── Standing → Jumping ─────────────────────────────────────────────────
  { from: 'anim_standing_idle', to: 'anim_jumping_idle',   blendMs: 150 },
  { from: 'anim_walking_loop',  to: 'anim_jumping_idle',   blendMs: 150 },
  { from: 'anim_running_loop',  to: 'anim_jumping_idle',   blendMs: 100 },
  { from: 'anim_jumping_idle',  to: 'anim_standing_idle',  blendMs: 300, requiresIntermediatePose: 'pose_jump_land' },
  { from: 'anim_jumping_fast',  to: 'anim_running_loop',   blendMs: 200 },

  // ── Talking ───────────────────────────────────────────────────────────
  { from: 'anim_standing_idle', to: 'anim_talking_idle',   blendMs: 200 },
  { from: 'anim_talking_idle',  to: 'anim_standing_idle',  blendMs: 200 },
  { from: 'anim_talking_idle',  to: 'anim_listening_idle', blendMs: 150 },
  { from: 'anim_sitting_idle',  to: 'anim_talking_idle',   blendMs: 200 },

  // ── Listening ─────────────────────────────────────────────────────────
  { from: 'anim_listening_idle', to: 'anim_talking_idle',  blendMs: 150 },
  { from: 'anim_listening_idle', to: 'anim_thinking_idle', blendMs: 250 },
  { from: 'anim_listening_idle', to: 'anim_standing_idle', blendMs: 200 },

  // ── Thinking ──────────────────────────────────────────────────────────
  { from: 'anim_thinking_idle', to: 'anim_standing_idle',  blendMs: 300 },
  { from: 'anim_thinking_idle', to: 'anim_talking_idle',   blendMs: 200 },
  { from: 'anim_standing_idle', to: 'anim_thinking_idle',  blendMs: 250 },

  // ── Pointing ──────────────────────────────────────────────────────────
  { from: 'anim_standing_idle', to: 'anim_pointing_idle',  blendMs: 200 },
  { from: 'anim_pointing_idle', to: 'anim_standing_idle',  blendMs: 200 },
  { from: 'anim_talking_idle',  to: 'anim_pointing_idle',  blendMs: 150 },

  // ── Waving ────────────────────────────────────────────────────────────
  { from: 'anim_standing_idle', to: 'anim_waving_idle',    blendMs: 200 },
  { from: 'anim_waving_idle',   to: 'anim_standing_idle',  blendMs: 200 },
  { from: 'anim_walking_loop',  to: 'anim_waving_idle',    blendMs: 150 },

  // ── Dancing ───────────────────────────────────────────────────────────
  { from: 'anim_standing_idle', to: 'anim_dancing_idle',   blendMs: 300 },
  { from: 'anim_dancing_idle',  to: 'anim_standing_idle',  blendMs: 400 },

  // ── Sitting variants ──────────────────────────────────────────────────
  { from: 'anim_sitting_idle',  to: 'anim_typing_idle',    blendMs: 300 },
  { from: 'anim_typing_idle',   to: 'anim_sitting_idle',   blendMs: 300 },
  { from: 'anim_sitting_idle',  to: 'anim_eating_idle',    blendMs: 250 },

  // ── Sleeping ──────────────────────────────────────────────────────────
  { from: 'anim_sitting_idle',  to: 'anim_sleeping_idle',  blendMs: 600, requiresIntermediatePose: 'pose_idle_lying' },
  { from: 'anim_sleeping_idle', to: 'anim_sitting_idle',   blendMs: 600, requiresIntermediatePose: 'pose_idle_sitting' },
  { from: 'anim_sleeping_idle', to: 'anim_standing_idle',  blendMs: 800, requiresIntermediatePose: 'pose_idle_standing' },
];

// ─── Transition Service ───────────────────────────────────────────────────────

export class TransitionGraph {
  /** Get all valid next clips from a given clip */
  public getValidTransitions(fromClipId: string): TransitionEdge[] {
    return TRANSITION_GRAPH.filter(e => e.from === fromClipId);
  }

  /** Check if a specific transition is valid */
  public isValidTransition(from: string, to: string): boolean {
    return TRANSITION_GRAPH.some(e => e.from === from && e.to === to);
  }

  /** Get edge details for a specific transition */
  public getEdge(from: string, to: string): TransitionEdge | undefined {
    return TRANSITION_GRAPH.find(e => e.from === from && e.to === to);
  }

  /**
   * Find the shortest valid path between two animations.
   * Used when a direct transition doesn't exist (BFS through graph).
   */
  public findPath(from: string, to: string): string[] {
    if (from === to) return [from];

    const visited = new Set<string>();
    const queue: { node: string; path: string[] }[] = [{ node: from, path: [from] }];

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      if (visited.has(node)) continue;
      visited.add(node);

      for (const edge of this.getValidTransitions(node)) {
        if (edge.to === to) return [...path, to];
        if (!visited.has(edge.to)) {
          queue.push({ node: edge.to, path: [...path, edge.to] });
        }
      }
    }

    // No path found — return direct (engine will use a hard cut)
    return [from, to];
  }
}
