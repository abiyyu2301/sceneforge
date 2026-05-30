'use client';

import { useState } from 'react';
import { RefreshCw, Wand2, Settings2 } from 'lucide-react';
import type { StoryboardScene } from '../types';

interface AdjustPanelProps {
  scene: StoryboardScene;
  onUpdate: (updates: Partial<StoryboardScene>) => void;
  onRegenerate: () => void;
}

const SHOT_TYPES = [
  'Wide Shot',
  'Medium Shot',
  'Close Up',
  'Extreme Close Up',
  'Two Shot',
  'Establishing Shot',
  'Over the Shoulder',
  'POV Shot',
];

const CAMERA_MOVEMENTS = [
  'Static',
  'Slow Push-In',
  'Pull Back',
  'Tracking',
  'Handheld',
  'Crane Up',
  'Crane Down',
  'Pan Left',
  'Pan Right',
  'Tilt Up',
  'Tilt Down',
  'Dolly In',
  'Dolly Out',
];

const MOODS = [
  'Tense',
  'Intimate',
  'Dramatic',
  'Contemplative',
  'Action',
  'Horror',
  'Comedic',
  'Romantic',
  'Melancholic',
  'Hopeful',
  'Mysterious',
  'Energetic',
  'Calm',
  'Chaotic',
];

const LIGHTING_OPTIONS = [
  'Natural Daylight',
  'Golden Hour',
  'Night Practical',
  'Fluorescent Interior',
  'Hard Side Light',
  'Soft Diffused',
  'Silhouette',
  'Neon/Cyberpunk',
  'Candlelight',
  'Overcast',
  'Backlit',
  'Dappled Sunlight',
  'Volumetric/God Rays',
  'Chiaroscuro',
];

const DURATIONS = [3, 5, 7, 10, 15];

export function AdjustPanel({ scene, onUpdate, onRegenerate }: AdjustPanelProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localValues, setLocalValues] = useState({
    shotType: scene.shotType || 'Medium Shot',
    cameraMovement: scene.cameraMovement || 'Static',
    mood: scene.mood || 'Dramatic',
    lighting: scene.lightingDesc || 'Natural Daylight',
    duration: scene.duration || 5,
  });

  const handleChange = (field: string, value: string | number) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onUpdate({
      shotType: localValues.shotType,
      cameraMovement: localValues.cameraMovement,
      mood: localValues.mood,
      lightingDesc: localValues.lighting,
      duration: localValues.duration,
    });
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    handleApply();
    await new Promise(resolve => setTimeout(resolve, 500));
    onRegenerate();
    setIsRegenerating(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-[#00E599]" />
          <h2 className="text-sm font-semibold text-[#F0F0F0] uppercase tracking-wide">
            Adjust Scene
          </h2>
        </div>
        <p className="text-xs text-[#888888] mt-1">
          Change parameters and regenerate
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Shot Type */}
        <div>
          <label className="block text-xs font-medium text-[#888888] uppercase tracking-wide mb-2">
            Shot Type
          </label>
          <select
            value={localValues.shotType}
            onChange={(e) => handleChange('shotType', e.target.value)}
            className="w-full bg-[#141414] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F0F0F0] focus:outline-none focus:border-[#00E599] transition-colors"
          >
            {SHOT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Camera Movement */}
        <div>
          <label className="block text-xs font-medium text-[#888888] uppercase tracking-wide mb-2">
            Camera Movement
          </label>
          <select
            value={localValues.cameraMovement}
            onChange={(e) => handleChange('cameraMovement', e.target.value)}
            className="w-full bg-[#141414] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F0F0F0] focus:outline-none focus:border-[#00E599] transition-colors"
          >
            {CAMERA_MOVEMENTS.map(movement => (
              <option key={movement} value={movement}>{movement}</option>
            ))}
          </select>
        </div>

        {/* Mood */}
        <div>
          <label className="block text-xs font-medium text-[#888888] uppercase tracking-wide mb-2">
            Mood
          </label>
          <select
            value={localValues.mood}
            onChange={(e) => handleChange('mood', e.target.value)}
            className="w-full bg-[#141414] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F0F0F0] focus:outline-none focus:border-[#00E599] transition-colors"
          >
            {MOODS.map(mood => (
              <option key={mood} value={mood}>{mood}</option>
            ))}
          </select>
        </div>

        {/* Lighting */}
        <div>
          <label className="block text-xs font-medium text-[#888888] uppercase tracking-wide mb-2">
            Lighting
          </label>
          <select
            value={localValues.lighting}
            onChange={(e) => handleChange('lighting', e.target.value)}
            className="w-full bg-[#141414] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F0F0F0] focus:outline-none focus:border-[#00E599] transition-colors"
          >
            {LIGHTING_OPTIONS.map(light => (
              <option key={light} value={light}>{light}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-[#888888] uppercase tracking-wide mb-2">
            Duration
          </label>
          <div className="flex gap-2">
            {DURATIONS.map(duration => (
              <button
                key={duration}
                onClick={() => handleChange('duration', duration)}
                className={`flex-1 py-2 text-sm rounded transition-colors ${
                  localValues.duration === duration
                    ? 'bg-[#00E599] text-black font-medium'
                    : 'bg-[#141414] text-[#888888] hover:text-[#F0F0F0]'
                }`}
              >
                {duration}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Regenerate Button */}
      <div className="p-4 border-t border-[#2A2A2A]">
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="w-full bg-[#00E599] hover:bg-[#00CC88] text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Regenerate Scene
            </>
          )}
        </button>
        <p className="text-xs text-[#888888] text-center mt-2">
          This will overwrite the current video
        </p>
      </div>
    </div>
  );
}
