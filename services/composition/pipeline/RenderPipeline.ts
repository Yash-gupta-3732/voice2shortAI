import { VisualGraph } from '../../../types/visuals';

export interface IRenderPass {
  id: string;
  enabled: boolean;
  priority: number; // Lower number means executed earlier in the pipeline
  process(graph: VisualGraph, timeMs: number): VisualGraph;
}

export class RenderPipeline {
  private passes: Map<string, IRenderPass> = new Map();

  public addPass(pass: IRenderPass): void {
    this.passes.set(pass.id, pass);
  }

  public removePass(id: string): void {
    this.passes.delete(id);
  }

  public enablePass(id: string, enabled: boolean): void {
    const pass = this.passes.get(id);
    if (pass) {
      pass.enabled = enabled;
    }
  }

  public getSortedPasses(): IRenderPass[] {
    return Array.from(this.passes.values()).sort((a, b) => a.priority - b.priority);
  }

  public execute(graph: VisualGraph, timeMs: number): VisualGraph {
    let currentGraph = graph;
    const sorted = this.getSortedPasses();
    
    for (const pass of sorted) {
      if (pass.enabled) {
        currentGraph = pass.process(currentGraph, timeMs);
      }
    }
    
    return currentGraph;
  }
}
