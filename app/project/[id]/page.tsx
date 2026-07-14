"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';
import { UploadScreen } from '@/components/editor/UploadScreen';
import { ProcessingScreen } from '@/components/editor/ProcessingScreen';
import { Storyboard } from '@/components/editor/Storyboard';
import { Timeline } from '@/components/editor/Timeline';
import { SceneDetails } from '@/components/editor/SceneDetails';
import { CompositionDetails } from '@/components/editor/CompositionDetails';
import { RemotionPreview } from '@/components/editor/RemotionPreview';
import { RenderTreeViewer } from '@/components/editor/RenderTreeViewer';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Play } from 'lucide-react';
import Link from 'next/link';

export default function ProjectEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  
  const project = useProjectStore(state => state.projects.find(p => p.id === id));
  const { setCurrentProject, updateProjectStatus, setAudioUrl, setScenes } = useProjectStore();
  
  const [processingStep, setProcessingStep] = useState(0);
  const [activeView, setActiveView] = useState<'preview' | 'storyboard'>('preview');
  const [rightActiveTab, setRightActiveTab] = useState<'scene' | 'composition' | 'rendertree'>('composition');
  const [showExportPanel, setShowExportPanel] = useState(false);

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    } else {
      router.push('/dashboard');
    }
  }, [project, setCurrentProject, router]);

  if (!project) return null;

  const handleUpload = async (file: File) => {
    updateProjectStatus(id, 'processing');
    setProcessingStep(0);
    
    const url = URL.createObjectURL(file);
    setAudioUrl(id, url, 30); // Placeholder duration
    
    const progressInterval = setInterval(() => {
      setProcessingStep(prev => (prev < 2 ? prev + 1 : prev));
    }, 4000);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();
      
      clearInterval(progressInterval);
      setProcessingStep(3);
      await new Promise(r => setTimeout(r, 1000));
      
      setScenes(id, data.scenes);
      if (data.audioUrl) {
        setAudioUrl(id, data.audioUrl, 30);
      }
      updateProjectStatus(id, 'ready');
    } catch (error) {
      console.error(error);
      clearInterval(progressInterval);
      updateProjectStatus(id, 'error');
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden">
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-medium text-sm">{project.name}</h1>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-zinc-800 text-zinc-400">
              {project.status}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={project.status !== 'ready'}>
            <Play className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button 
            size="sm" 
            className="bg-white text-black hover:bg-zinc-200" 
            disabled={project.status !== 'ready'}
            onClick={() => setShowExportPanel(true)}
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {project.status === 'draft' && (
          <UploadScreen onUpload={handleUpload} />
        )}
        
        {project.status === 'processing' && (
          <ProcessingScreen step={processingStep} />
        )}
        
        {project.status === 'ready' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Middle: Engine Preview / Storyboard and Timeline */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border-b border-zinc-800 shrink-0">
                <button 
                  onClick={() => setActiveView('preview')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeView === 'preview' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                >
                  Engine Preview
                </button>
                <button 
                  onClick={() => setActiveView('storyboard')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeView === 'storyboard' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                >
                  Storyboard Grid
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                {activeView === 'preview' ? (
                  <RemotionPreview projectId={id} />
                ) : (
                  <div className="flex-1 overflow-y-auto"><Storyboard projectId={id} /></div>
                )}
              </div>
              <Timeline projectId={id} />
            </div>
            {/* Right Panels Container */}
            <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full shrink-0">
              <div className="flex items-center p-2 gap-1 border-b border-zinc-800 shrink-0 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setRightActiveTab('scene')}
                  className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${rightActiveTab === 'scene' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
                >
                  Analysis
                </button>
                <button 
                  onClick={() => setRightActiveTab('composition')}
                  className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${rightActiveTab === 'composition' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
                >
                  Composition
                </button>
                <button 
                  onClick={() => setRightActiveTab('rendertree')}
                  className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${rightActiveTab === 'rendertree' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
                >
                  Render Tree
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                {rightActiveTab === 'scene' && (
                  <div className="h-full overflow-y-auto"><SceneDetails scene={project.scenes[0]} /></div>
                )}
                {rightActiveTab === 'composition' && (
                  <div className="h-full overflow-y-auto"><CompositionDetails scene={project.scenes[0]} /></div>
                )}
                {rightActiveTab === 'rendertree' && (
                  <div className="h-full overflow-y-auto"><RenderTreeViewer scene={project.scenes[0]} /></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showExportPanel && (
        <ExportPanel projectId={id} onClose={() => setShowExportPanel(false)} />
      )}
    </div>
  );
}
