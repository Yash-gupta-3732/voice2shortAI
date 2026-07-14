'use client';
import { Player } from '@remotion/player';
import { MainComposition } from '../../remotion/MainComposition';
import { Project } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';

export function RemotionPreview({ projectId }: { projectId: string }) {
  const project = useProjectStore(state => state.projects.find(p => p.id === projectId));
  const audioUrl = project?.audioUrl || '';

  if (!project) return null;

  // Calculate total frames from all scenes, or default to 1
  let totalFrames = 0;
  for (const scene of project.scenes) {
    totalFrames += Math.round(scene.duration * 30); // scene.duration is in seconds
  }
  if (totalFrames === 0) totalFrames = 1;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-zinc-950" />
      
      <div className="relative z-10 w-full max-w-[400px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 ring-1 ring-white/10 bg-black">
        <Player
          component={MainComposition}
          inputProps={{
            project,
            baseAudioUrl: audioUrl || '',
          }}
          durationInFrames={totalFrames}
          compositionWidth={1080}
          compositionHeight={1920}
          fps={30}
          style={{ width: '100%', height: '100%' }}
          controls
          autoPlay
          loop
        />
      </div>
      
      <div className="relative z-10 mt-6 flex items-center gap-4 text-xs font-mono text-zinc-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Remotion Engine Active</span>
        <span>|</span>
        <span>Resolution: 1080x1920</span>
        <span>|</span>
        <span>FPS: 30</span>
      </div>
    </div>
  );
}
