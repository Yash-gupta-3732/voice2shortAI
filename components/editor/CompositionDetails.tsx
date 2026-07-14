'use client';
import { Scene } from '@/types';
import { AlertTriangle, Layers, ChevronRight, Anchor, Eye, ShieldAlert } from 'lucide-react';

export function CompositionDetails({ scene }: { scene?: Scene }) {
  if (!scene || !scene.composition) {
    return (
      <div className="w-80 border-l border-zinc-800 bg-zinc-950 p-6 flex flex-col items-center justify-center text-center">
        <Layers className="h-8 w-8 text-zinc-600 mb-4" />
        <h3 className="text-zinc-400 font-medium">No Composition</h3>
        <p className="text-sm text-zinc-600 mt-2">Select a scene to view its asset composition plan.</p>
      </div>
    );
  }

  const { composition } = scene;
  const conf = Math.round(composition.confidence * 100);

  const confColor =
    conf >= 90 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' :
    conf >= 70 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                 'text-red-400 bg-red-400/10 border-red-400/30';

  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full overflow-y-auto text-sm">

      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
        <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
          <Layers className="h-4 w-4 text-violet-400" /> Asset Plan
        </h2>
        <span className={`px-2 py-0.5 text-xs rounded border font-mono font-bold ${confColor}`}>
          {conf}%
        </span>
      </div>

      <div className="p-4 space-y-5">

        {/* Validation Warnings */}
        {composition.validationWarnings && composition.validationWarnings.length > 0 && (
          <section className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-1">
            <h4 className="text-xs font-semibold text-red-400 flex items-center gap-1.5 mb-2">
              <ShieldAlert className="h-3.5 w-3.5" /> Validation Errors
            </h4>
            {composition.validationWarnings.map((w, i) => (
              <p key={i} className="text-xs text-red-300/80">{w}</p>
            ))}
          </section>
        )}

        {/* Fallback Warnings */}
        {composition.fallbacks && composition.fallbacks.length > 0 && (
          <section className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5" /> Semantic Fallbacks
            </h4>
            {composition.fallbacks.map((fb, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 px-1 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 font-mono capitalize shrink-0">{fb.category}</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {fb.reason}
                  {fb.fallbackScore !== undefined && (
                    <span className="ml-1 text-zinc-600">({Math.round(fb.fallbackScore * 100)}%)</span>
                  )}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Core Assets */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Core Assets</h3>
          <AssetRow icon="👤" label="Character"  value={composition.characterId} />
          <AssetRow icon="😊" label="Expression" value={composition.expressionId} />
          <AssetRow icon="🎬" label="Animation"  value={composition.animationId} />
          <AssetRow icon="🌄" label="Background" value={composition.backgroundId} />
          <AssetRow icon="💡" label="Lighting"   value={composition.lightingId} />
          <AssetRow icon="🎥" label="Camera"     value={composition.cameraId} />
        </section>

        {/* Props */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Props</h3>
          {composition.propsIds && composition.propsIds.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {composition.propsIds.map((pid, idx) => (
                <span key={`${pid}-${idx}`} className="text-xs bg-zinc-800/80 border border-zinc-700 text-zinc-300 px-2 py-1 rounded-md font-mono">
                  {pid}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-600 italic">No props in this scene</p>
          )}
        </section>

        {/* Render Order */}
        {composition.renderOrder && composition.renderOrder.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="h-3 w-3" /> Render Order
            </h3>
            <div className="space-y-1">
              {composition.renderOrder.map((id, i) => (
                <div key={`${id}-${i}`} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-600 w-4 text-right">{i + 1}</span>
                  <ChevronRight className="h-3 w-3 text-zinc-700 shrink-0" />
                  <span className="text-xs text-zinc-400 font-mono truncate">{id}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

function AssetRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-base shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</p>
        <p className="text-xs text-zinc-200 font-mono truncate">{value}</p>
      </div>
    </div>
  );
}
