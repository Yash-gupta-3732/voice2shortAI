import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UploadScreenProps {
  onUpload: (file: File) => void;
}

export function UploadScreen({ onUpload }: UploadScreenProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-8">
      <Card 
        className="w-full aspect-video flex flex-col items-center justify-center border-dashed border-2 border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById('audio-upload')?.click()}
      >
        <UploadCloud className="w-12 h-12 text-zinc-500 mb-4" />
        <h3 className="text-xl font-medium">Upload Voiceover</h3>
        <p className="text-zinc-500 mt-2 text-sm">Drag and drop your audio file here, or click to browse</p>
        <p className="text-zinc-600 mt-1 text-xs">Supports MP3, WAV, M4A</p>
        <input 
          id="audio-upload" 
          type="file" 
          accept="audio/*" 
          className="hidden" 
          onChange={handleChange}
        />
        <Button className="mt-6 bg-zinc-100 text-black hover:bg-zinc-200 pointer-events-none">Select File</Button>
      </Card>
    </div>
  );
}
