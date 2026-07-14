export interface Project {
  id: string;
  name: string;
  createdAt: number;
  status: 'draft' | 'processing' | 'ready' | 'error';
  duration: number; // in seconds
  audioUrl?: string;
  scenes: Scene[];
}

export interface Character {
  id: string; // e.g., character_001
  type: 'main' | 'supporting' | 'animal' | 'object' | 'narrator_only' | 'crowd';
  description?: string;
}

export * from './assets';
import { AssetCompositionPlan } from './assets';

export type CinematicShotType = 
  | 'establishing' 
  | 'close_up' 
  | 'medium_shot' 
  | 'tracking' 
  | 'dolly_in' 
  | 'dolly_out' 
  | 'over_the_shoulder' 
  | 'orbit' 
  | 'reveal' 
  | 'hero_shot'
  | 'static_wide';

export interface CameraMove {
  type: CinematicShotType;
  targetId?: string; // Character or Prop ID to focus on
  durationMs: number;
}

export type InteractionType = 
  | 'WalkTo' 
  | 'PickUp' 
  | 'PutDown' 
  | 'Sit' 
  | 'Stand' 
  | 'LookAt' 
  | 'PointAt' 
  | 'TalkTo' 
  | 'Wave' 
  | 'OpenDoor' 
  | 'PressButton';

export interface SemanticAction {
  type: InteractionType;
  subjectIds: string[]; // Characters performing the action (supports groups)
  targetId?: string; // Target prop or character
  startTimeMs: number;
  durationMs: number;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
  narration: string;
  subtitle: string;
  summary: string;
  emotion: string;
  emotionConfidence: number; // 0 to 1
  characters: string[]; // references Character.id
  actions: SemanticAction[];
  environment: string;
  props: string[];
  camera: CameraMove;
  visualPrompt: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'generating' | 'completed' | 'error';
  composition?: AssetCompositionPlan;
}

export interface TimelineAsset {
  id: string;
  sceneId: string;
  type: 'video' | 'audio' | 'overlay';
  url: string;
}

export interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
}
