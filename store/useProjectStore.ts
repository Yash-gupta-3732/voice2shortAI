import { create } from 'zustand';
import { Project, Scene } from '@/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string) => Project;
  updateProjectStatus: (id: string, status: Project['status']) => void;
  setAudioUrl: (id: string, url: string, duration: number) => void;
  setScenes: (projectId: string, scenes: Scene[]) => void;
  updateScene: (projectId: string, sceneId: string, updates: Partial<Scene>) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  createProject: (name) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      status: 'draft',
      duration: 0,
      scenes: [],
    };
    set((state) => ({ 
      projects: [newProject, ...state.projects],
      currentProject: newProject
    }));
    return newProject;
  },
  
  updateProjectStatus: (id, status) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, status } : p),
    currentProject: state.currentProject?.id === id ? { ...state.currentProject, status } : state.currentProject
  })),

  setAudioUrl: (id, url, duration) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, audioUrl: url, duration } : p),
    currentProject: state.currentProject?.id === id ? { ...state.currentProject, audioUrl: url, duration } : state.currentProject
  })),

  setScenes: (projectId, scenes) => set((state) => ({
    projects: state.projects.map(p => p.id === projectId ? { ...p, scenes } : p),
    currentProject: state.currentProject?.id === projectId ? { ...state.currentProject, scenes } : state.currentProject
  })),

  updateScene: (projectId, sceneId, updates) => set((state) => {
    const updateProjectScenes = (project: Project) => ({
      ...project,
      scenes: project.scenes.map(s => s.id === sceneId ? { ...s, ...updates } : s)
    });
    return {
      projects: state.projects.map(p => p.id === projectId ? updateProjectScenes(p) : p),
      currentProject: state.currentProject?.id === projectId ? updateProjectScenes(state.currentProject) : state.currentProject
    };
  })
}));
