import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Wand2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full px-4 text-center mt-24">
      <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-300 mb-8 backdrop-blur-sm">
        <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
        Voice2Short AI MVP Phase 1
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent max-w-4xl">
        Turn your voice into <br /> viral short-form videos.
      </h1>
      
      <p className="mt-6 text-lg text-zinc-400 max-w-2xl">
        Simply upload a voice recording. Our AI automatically transcribes, plans scenes, and generates a complete storyboard for your vertical video.
      </p>

      <div className="mt-10 flex items-center gap-4">
        <Link href="/dashboard">
          <Button size="lg" className="rounded-full bg-white text-black hover:bg-zinc-200">
            Get Started <Wand2 className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Button size="lg" variant="outline" className="rounded-full">
          <Play className="w-4 h-4 mr-2" /> Watch Demo
        </Button>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {[
          { title: "1. Upload Voice", desc: "Drop your audio file. We support MP3, WAV, and M4A." },
          { title: "2. AI Processing", desc: "We transcribe and analyze your narration to plan logical scenes." },
          { title: "3. Storyboard Generated", desc: "Review your scenes on a timeline with visual prompts and actions." }
        ].map((feature, i) => (
          <div key={i} className="flex flex-col items-start p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm text-left">
            <h3 className="text-xl font-semibold text-zinc-100">{feature.title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
