'use client';
import { useEffect, useRef, useState } from 'react';
import { Scene } from '@/types';
import { Play, Pause, Square, ZoomIn, ZoomOut, Maximize, Clock } from 'lucide-react';
import { SceneComposer } from '@/services/composition/core/SceneComposer';
import { PreviewEngine } from '@/services/composition/engines/PreviewEngine';

export function AnimationPreview({ scene }: { scene?: Scene }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [fps, setFps] = useState(0);
  const composerRef = useRef<SceneComposer | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);
  const reqRef = useRef<number>(0);
  const [duration, setDuration] = useState(3000); // ms

  useEffect(() => {
    if (!scene || !scene.composition || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas size for aspect ratio 9:16 based on coordinate spec
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const compDuration = scene.duration * 1000;
    setDuration(compDuration);

    const composer = new SceneComposer(compDuration);
    composerRef.current = composer;

    const { root, camera } = composer.compose(scene.id, scene.composition);
    const previewEngine = new PreviewEngine(ctx, width, height);

    composer.timelineEngine.onUpdate = (t) => {
      setCurrentTime(t);
      composer.update(t, root, camera);
      
      const startRender = performance.now();
      previewEngine.render(root, camera);
      const endRender = performance.now();
      
      // Calculate FPS
      framesRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        setFps(framesRef.current);
        framesRef.current = 0;
        lastTimeRef.current = now;
      }
    };

    // Force initial render
    composer.timelineEngine.seek(0);

    return () => {
      composer.timelineEngine.pause();
    };
  }, [scene]);

  useEffect(() => {
    const loop = () => {
      // The timeline engine handles its own tick, we just need to re-render if it's playing
      // Actually TimelineEngine uses requestAnimationFrame internally, but we can hook if needed.
      // Wait, TimelineEngine uses its own requestAnimationFrame for tick.
      // We don't need a loop here if TimelineEngine drives it.
    };
  }, []);

  const togglePlay = () => {
    if (!composerRef.current) return;
    if (isPlaying) {
      composerRef.current.timelineEngine.pause();
      setIsPlaying(false);
    } else {
      composerRef.current.timelineEngine.play();
      setIsPlaying(true);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!composerRef.current) return;
    const val = Number(e.target.value);
    composerRef.current.timelineEngine.seek(val);
    setCurrentTime(val);
    if (isPlaying) {
      composerRef.current.timelineEngine.pause();
      setIsPlaying(false);
    }
  };

  if (!scene || !scene.composition) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
        <Square className="h-10 w-10 mb-4 opacity-50" />
        <p>No Scene Composition Available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950">
      
      {/* Viewport */}
      <div className="flex-1 overflow-hidden flex items-center justify-center relative p-4">
        {/* Canvas wrapper to maintain aspect ratio (9:16) */}
        <div className="relative h-full aspect-[9/16] bg-black border border-zinc-800 rounded shadow-2xl overflow-hidden">
          <canvas 
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
          {/* Debug Overlay */}
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-emerald-400">
            FPS: {fps} | Engine: Phase 3 Canvas
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="h-16 border-t border-zinc-800 bg-zinc-900/50 flex items-center px-4 gap-4">
        <button 
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white transition-colors"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
        </button>
        
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Clock className="h-3.5 w-3.5 text-zinc-500" />
          <span>{(currentTime / 1000).toFixed(2)}s</span>
          <span className="text-zinc-600">/</span>
          <span>{(duration / 1000).toFixed(2)}s</span>
        </div>

        <input 
          type="range" 
          min="0" 
          max={duration} 
          value={currentTime}
          onChange={handleScrub}
          className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
        
        <div className="flex gap-2">
          <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"><ZoomOut className="h-4 w-4" /></button>
          <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"><ZoomIn className="h-4 w-4" /></button>
          <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"><Maximize className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
