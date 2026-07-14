import { motion } from 'framer-motion';
import { FileAudio, Wand2, SplitSquareHorizontal, Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProcessingScreenProps {
  step: number; // 0 to 3
}

export function ProcessingScreen({ step }: ProcessingScreenProps) {
  const steps = [
    { icon: FileAudio, label: "Uploading Audio" },
    { icon: Wand2, label: "Transcribing Narration" },
    { icon: SplitSquareHorizontal, label: "Planning Scenes" },
    { icon: Layers, label: "Generating Storyboard" }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      <Card className="w-full max-w-lg p-10 bg-zinc-950 border-zinc-800 flex flex-col items-center shadow-2xl shadow-black/50">
        <h2 className="text-2xl font-semibold mb-8 text-white">Processing your voice</h2>
        
        <div className="flex flex-col gap-6 w-full">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === step;
            const isCompleted = index < step;
            
            return (
              <div key={index} className={`flex items-center gap-4 transition-all duration-500 ${isCompleted || isActive ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`p-3 rounded-full ${isActive ? 'bg-blue-900/50 text-blue-400' : isCompleted ? 'bg-green-900/50 text-green-400' : 'bg-zinc-900 text-zinc-500'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isActive ? 'text-white' : 'text-zinc-400'}`}>{s.label}</p>
                </div>
                {isActive && (
                  <motion.div 
                    className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
