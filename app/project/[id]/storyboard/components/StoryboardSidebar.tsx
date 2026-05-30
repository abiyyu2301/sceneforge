'use client';

import { CheckCircle2, AlertCircle, Clock, Film, Loader2 } from 'lucide-react';

interface Scene {
  id: string;
  sceneNumber: number;
  heading: string;
  location: string;
  timeOfDay: string;
  status: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

interface StoryboardSidebarProps {
  scenes: Scene[];
  selectedScene: Scene | null;
  onSceneSelect: (scene: Scene) => void;
}

export function StoryboardSidebar({
  scenes,
  selectedScene,
  onSceneSelect,
}: StoryboardSidebarProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'RENDERING':
      case 'GENERATING_PROMPT':
      case 'SUBMITTING':
        return <Loader2 className="w-4 h-4 text-[#00E599] animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'Complete';
      case 'FAILED':
        return 'Failed';
      case 'PENDING':
        return 'Pending';
      case 'RENDERING':
        return 'Rendering';
      case 'GENERATING_PROMPT':
        return 'Generating';
      case 'SUBMITTING':
        return 'Submitting';
      default:
        return status;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#2A2A2A]">
        <h2 className="text-sm font-semibold text-[#F0F0F0] uppercase tracking-wide">
          Scenes
        </h2>
        <p className="text-xs text-[#888888] mt-1">
          {scenes.length} total • {scenes.filter(s => s.status === 'DONE').length} complete
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => onSceneSelect(scene)}
            className={`w-full text-left p-3 border-b border-[#2A2A2A] transition-all ${
              selectedScene?.id === scene.id
                ? 'bg-[#00E599]/10 border-l-4 border-l-[#00E599]'
                : 'hover:bg-[#1C1C1C] border-l-4 border-l-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-[#141414] rounded-lg flex items-center justify-center overflow-hidden">
                {scene.thumbnailUrl || scene.videoUrl ? (
                  <img
                    src={scene.thumbnailUrl || scene.videoUrl}
                    alt={`Scene ${scene.sceneNumber}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Film className="w-5 h-5 text-[#888888]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#00E599]">
                    #{scene.sceneNumber}
                  </span>
                  {getStatusIcon(scene.status)}
                  <span className={`text-xs ${
                    scene.status === 'DONE' ? 'text-green-400' :
                    scene.status === 'FAILED' ? 'text-red-400' :
                    scene.status === 'PENDING' ? 'text-gray-400' :
                    'text-[#00E599]'
                  }`}>
                    {getStatusLabel(scene.status)}
                  </span>
                </div>
                <p className="text-sm text-[#F0F0F0] font-medium mt-1 truncate">
                  {scene.heading}
                </p>
                <p className="text-xs text-[#888888] truncate">
                  {scene.location} • {scene.timeOfDay}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
