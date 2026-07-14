/**
 * @file TimelineEngine.ts
 * @description Manages time, playback, and timeline events for the Scene.
 */

export interface TimelineEvent {
  id: string;
  timeMs: number;
  type: 'animation_trigger' | 'camera_trigger' | 'effect_trigger' | 'subtitle_change';
  payload: any;
}

export class TimelineEngine {
  public currentTimeMs: number = 0;
  public durationMs: number = 0;
  public fps: number = 30;
  public isPlaying: boolean = false;
  
  private events: TimelineEvent[] = [];
  private lastTime: number = 0;
  
  // Callbacks for the preview UI
  public onUpdate?: (timeMs: number, frameIndex: number) => void;
  public onEvent?: (event: TimelineEvent) => void;

  constructor(durationMs: number, fps: number = 30) {
    this.durationMs = durationMs;
    this.fps = fps;
  }

  public addEvent(event: TimelineEvent): void {
    this.events.push(event);
    this.events.sort((a, b) => a.timeMs - b.timeMs);
  }

  public getEventsInRange(startMs: number, endMs: number): TimelineEvent[] {
    return this.events.filter(e => e.timeMs >= startMs && e.timeMs < endMs);
  }

  public play(): void {
    if (this.isPlaying) return;
    if (this.currentTimeMs >= this.durationMs) {
      this.currentTimeMs = 0;
    }
    this.isPlaying = true;
    this.lastTime = performance.now();
    this.tick();
  }

  public pause(): void {
    this.isPlaying = false;
  }

  public seek(timeMs: number): void {
    this.currentTimeMs = Math.max(0, Math.min(timeMs, this.durationMs));
    this.emitUpdate();
  }

  private tick = (): void => {
    if (!this.isPlaying) return;

    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    const prevTime = this.currentTimeMs;
    this.currentTimeMs += dt;

    if (this.currentTimeMs >= this.durationMs) {
      this.currentTimeMs = this.durationMs;
      this.isPlaying = false;
    }

    // Fire events
    const triggeredEvents = this.getEventsInRange(prevTime, this.currentTimeMs);
    for (const ev of triggeredEvents) {
      if (this.onEvent) this.onEvent(ev);
    }

    this.emitUpdate();

    if (this.isPlaying) {
      requestAnimationFrame(this.tick);
    }
  };

  private emitUpdate(): void {
    if (this.onUpdate) {
      const frameIndex = Math.floor((this.currentTimeMs / 1000) * this.fps);
      this.onUpdate(this.currentTimeMs, frameIndex);
    }
  }

  public getFrameIndex(): number {
    return Math.floor((this.currentTimeMs / 1000) * this.fps);
  }
}
