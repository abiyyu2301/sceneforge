export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  heading: string;
  location: string;
  timeOfDay: string;
  actionText: string;
  characters: string[];
  dialogueJson: Array<{ character: string; line: string }>;
  status: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  pixversePrompt?: string | null;
  audioAmbient?: string | null;
  audioMusic?: string | null;
  audioPacing?: string | null;
  shotType?: string | null;
  cameraMovement?: string | null;
  mood?: string | null;
  lightingDesc?: string | null;
  duration?: number;
}
