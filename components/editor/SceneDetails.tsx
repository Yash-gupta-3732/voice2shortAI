import { Scene } from '@/types';

export function SceneDetails({ scene }: { scene?: Scene }) {
  if (!scene) {
    return (
      <div className="w-80 border-l border-zinc-800 bg-zinc-950 p-6 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-zinc-500">Select a scene to view details</p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-950 p-6 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Scene {scene.sceneNumber || 1}</h3>
        <span className={`text-xs px-2 py-1 rounded border capitalize ${
          scene.priority === 'high' ? 'bg-red-900/20 text-red-400 border-red-900/50' :
          scene.priority === 'medium' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50' :
          'bg-zinc-800 text-zinc-400 border-zinc-700'
        }`}>
          {scene.priority || 'Medium'}
        </span>
      </div>
      
      <div className="space-y-6 pb-20">
        <div>
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Subtitle</label>
          <p className="mt-1 text-sm text-zinc-300 font-medium italic">"{scene.subtitle || scene.narration}"</p>
        </div>

        <div>
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Narration</label>
          <p className="mt-1 text-sm text-zinc-400">{scene.narration}</p>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Emotion</label>
            <span className="text-xs text-zinc-500">{scene.emotionConfidence ? Math.round(scene.emotionConfidence * 100) : 100}% Conf.</span>
          </div>
          <div className="mt-1 text-sm text-zinc-300 capitalize">{scene.emotion}</div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Characters</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {scene.characters?.map((c, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">
                {c}
              </span>
            ))}
            {(!scene.characters || scene.characters.length === 0) && (
              <span className="text-sm text-zinc-500">None detected</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Actions</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {scene.actions?.map((a, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">
                {a.type} {a.targetId ? `-> ${a.targetId}` : ''}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Environment</label>
          <div className="mt-1 p-2 bg-zinc-900 rounded border border-zinc-800 text-sm text-zinc-300">
            {scene.environment}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Props</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {scene.props?.map((p, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Camera Plan</label>
          <div className="mt-1 p-3 bg-zinc-900 rounded border border-zinc-800 text-sm text-zinc-300 space-y-2">
            <div><span className="text-zinc-500">Shot:</span> {scene.camera?.type || 'Static'}</div>
            <div><span className="text-zinc-500">Target:</span> {scene.camera?.targetId || 'None'}</div>
          </div>
        </div>
        
        <div>
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Visual Prompt</label>
          <p className="mt-1 text-sm text-zinc-400 bg-zinc-900 p-3 rounded border border-zinc-800">{scene.visualPrompt}</p>
        </div>
      </div>
    </div>
  );
}
