import { useProjectStore } from '@/store/useProjectStore';

export function Timeline({ projectId }: { projectId: string }) {
  const project = useProjectStore(state => state.projects.find(p => p.id === projectId));
  const scenes = project?.scenes || [];
  const totalDuration = project?.duration || 100;

  return (
    <div className="h-48 border-t border-zinc-800 bg-zinc-950 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-zinc-400">Timeline</h3>
        <span className="text-xs text-zinc-500">Total: {totalDuration}s</span>
      </div>
      
      <div className="flex-1 relative bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-x-auto overflow-y-hidden">
        <div className="absolute inset-0 flex items-center px-4 min-w-max">
          {scenes.map((scene, index) => {
            const widthPercentage = (scene.duration / totalDuration) * 100;
            return (
              <div 
                key={scene.id}
                className="h-20 bg-zinc-800 border-r border-zinc-900 hover:bg-zinc-700 transition-colors flex items-center justify-center cursor-pointer min-w-[100px]"
                style={{ width: `${Math.max(widthPercentage, 10)}%` }}
              >
                <span className="text-xs text-zinc-400">S{index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
