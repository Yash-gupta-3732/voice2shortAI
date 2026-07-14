"use client";

import { useProjectStore } from '@/store/useProjectStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Video, Trash2, Copy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { projects, createProject } = useProjectStore();
  const router = useRouter();

  const handleCreateProject = () => {
    const project = createProject(`Project ${projects.length + 1}`);
    router.push(`/project/${project.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-8 pt-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Manage your video projects</p>
        </div>
        <Button onClick={handleCreateProject} className="bg-white text-black hover:bg-zinc-200">
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <Video className="w-12 h-12 text-zinc-600 mb-4" />
          <h3 className="text-xl font-medium">No projects yet</h3>
          <p className="text-zinc-500 mt-1 mb-6">Create your first project to get started.</p>
          <Button onClick={handleCreateProject} variant="secondary">Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="p-6 group relative overflow-hidden transition-all hover:border-zinc-700 hover:bg-zinc-900/80">
              <Link href={`/project/${project.id}`} className="block">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    <Video className="w-5 h-5 text-zinc-300" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-zinc-800 text-zinc-300 rounded-full capitalize transition-opacity duration-200 group-hover:opacity-0">
                    {project.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold truncate">{project.name}</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </Link>
              
              <div className="absolute top-5 right-5 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-2">
                <button className="p-2 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-red-900/50 rounded-md text-zinc-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
