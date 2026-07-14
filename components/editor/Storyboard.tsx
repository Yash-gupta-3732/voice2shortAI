import { useProjectStore } from '@/store/useProjectStore';
import { Card } from '@/components/ui/card';
import { Clock, Image as ImageIcon } from 'lucide-react';
import { Scene } from '@/types';

export function Storyboard({ projectId }: { projectId: string }) {
  const project = useProjectStore(state => state.projects.find(p => p.id === projectId));
  const scenes = project?.scenes || [];

  if (scenes.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/50">
      <h2 className="text-xl font-semibold mb-6 px-2">Storyboard</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {scenes.map((scene: Scene, index: number) => (
          <Card key={scene.id} className="p-4 hover:border-zinc-700 cursor-pointer transition-colors bg-zinc-900/60">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                Scene {scene.sceneNumber || index + 1}
              </span>
              <div className="flex items-center text-xs text-zinc-500">
                <Clock className="w-3 h-3 mr-1" />
                {scene.startTime}s - {scene.endTime}s
              </div>
            </div>
            
            <div className="aspect-video bg-zinc-800/50 rounded-lg mb-4 flex items-center justify-center border border-zinc-800">
              <ImageIcon className="w-8 h-8 text-zinc-700" />
            </div>

            <p className="text-sm font-medium text-zinc-200 mb-2">"{scene.subtitle || scene.narration}"</p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs px-2 py-1 rounded bg-blue-900/20 text-blue-400 border border-blue-900/50">
                {scene.emotion}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-purple-900/20 text-purple-400 border border-purple-900/50 truncate max-w-[150px]">
                {scene.environment}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
