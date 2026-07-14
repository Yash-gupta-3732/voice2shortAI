'use client';
import { useState, useEffect } from 'react';
import { Download, Loader2, Video, FileJson, Settings2, AlertTriangle, Bug } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

export function ExportPanel({ projectId, onClose }: { projectId: string, onClose: () => void }) {
  const project = useProjectStore(state => state.projects.find(p => p.id === projectId));
  const [status, setStatus] = useState<'idle' | 'rendering' | 'done' | 'failed'>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);
  const [diagnosticsUrl, setDiagnosticsUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<'draft' | 'standard' | 'hq'>('standard');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'rendering' && jobId) {
      interval = setInterval(async () => {
        const res = await fetch(`/api/export?jobId=${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setProgress(data.progress * 100);
          if (data.status === 'done') {
            setStatus('done');
            setOutputUrl(data.outputFile);
            setManifestUrl(data.manifestFile);
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setStatus('failed');
            setDiagnosticsUrl(data.diagnosticsFile);
            clearInterval(interval);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, jobId]);

  const handleExport = async () => {
    setStatus('rendering');
    setProgress(0);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, quality })
      });
      const data = await res.json();
      if (data.success) {
        setJobId(data.jobId);
      } else {
        setStatus('failed');
      }
    } catch (e) {
      setStatus('failed');
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-[480px] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-violet-400" /> Export Engine
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
        </div>

        {status === 'idle' && (
          <div className="space-y-6">
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Quality</span>
                <select 
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-700 text-sm rounded px-2 py-1 text-white outline-none focus:border-violet-500"
                >
                  <option value="draft">Draft (Fast, CRF 28)</option>
                  <option value="standard">Standard (CRF 22)</option>
                  <option value="hq">High Quality (Slow, CRF 16)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Resolution</span>
                <span className="text-sm text-zinc-100 font-mono">1080x1920 (9:16)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Engine</span>
                <span className="text-sm text-zinc-100 font-mono">Remotion + FFmpeg</span>
              </div>
            </div>
            
            <button 
              onClick={handleExport}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Start Render Queue
            </button>
          </div>
        )}

        {status === 'rendering' && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <p className="text-sm text-zinc-400 animate-pulse">Preloading assets & encoding frames...</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-zinc-500">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-500 transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="space-y-6 py-4 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
              <Download className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Export Complete</h3>
            <p className="text-sm text-zinc-400">Your video and manifest are ready.</p>
            
            <div className="flex gap-3 mt-6">
              {outputUrl && (
                <a href={outputUrl} download className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center justify-center gap-2">
                  <Video className="w-4 h-4" /> Save MP4
                </a>
              )}
              {manifestUrl && (
                <a href={manifestUrl} download className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-medium flex items-center justify-center gap-2 border border-zinc-700">
                  <FileJson className="w-4 h-4" /> Manifest
                </a>
              )}
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6 py-4 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Export Failed</h3>
            <p className="text-sm text-zinc-400 px-4">An error occurred during FFmpeg encoding. The system attempted to recover but reached the maximum retry limit.</p>
            
            <div className="flex gap-3 mt-6 justify-center">
              {diagnosticsUrl ? (
                <a href={diagnosticsUrl} download className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-medium flex items-center justify-center gap-2 border border-zinc-700">
                  <Bug className="w-4 h-4" /> Download Diagnostics Bundle
                </a>
              ) : (
                <span className="text-xs text-zinc-500">Diagnostics unavailable</span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
