'use client';

import { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { AudioDirectionPanel } from './AudioDirectionPanel';
import { PromptInspector } from './PromptInspector';
import { FileText, Music, Code, ChevronDown, ChevronUp } from 'lucide-react';
import type { StoryboardScene } from '../types';

interface SceneViewerProps {
  scene: StoryboardScene;
  onRegenerate: () => void;
}

export function SceneViewer({ scene, onRegenerate }: SceneViewerProps) {
  const [activeTab, setActiveTab] = useState<'screenplay' | 'audio' | 'prompt'>('screenplay');
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const formatDialogue = (dialogue: any[]) => {
    if (!dialogue || dialogue.length === 0) return null;
    
    return dialogue.map((item, index) => (
      <div key={index} className="mb-3">
        <p className="text-[#F0F0F0] font-bold uppercase text-sm">{item.character}</p>
        <p className="text-[#888888] italic pl-4">{item.line}</p>
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#00E599]">#{scene.sceneNumber}</span>
              <span className="text-xs text-[#888888]">•</span>
              <span className="text-xs text-[#888888]">{scene.location}</span>
              <span className="text-xs text-[#888888]">•</span>
              <span className="text-xs text-[#888888]">{scene.timeOfDay}</span>
            </div>
            <h1 className="text-lg font-semibold text-[#F0F0F0]">{scene.heading}</h1>
          </div>
          <div className="flex items-center gap-2">
            {scene.shotType && (
              <span className="px-2 py-1 bg-[#1C1C1C] rounded text-xs text-[#888888]">
                {scene.shotType}
              </span>
            )}
            {scene.mood && (
              <span className="px-2 py-1 bg-[#1C1C1C] rounded text-xs text-[#888888]">
                {scene.mood}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="p-4">
        <VideoPlayer 
          videoUrl={scene.videoUrl ?? undefined} 
          thumbnailUrl={scene.thumbnailUrl ?? undefined}
          isLoading={scene.status === 'RENDERING' || scene.status === 'GENERATING_PROMPT' || scene.status === 'SUBMITTING'}
        />
      </div>

      {/* Tabs */}
      <div className="px-4 border-b border-[#2A2A2A]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('screenplay')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'screenplay'
                ? 'text-[#00E599] border-[#00E599]'
                : 'text-[#888888] border-transparent hover:text-[#F0F0F0]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Screenplay
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'audio'
                ? 'text-[#00E599] border-[#00E599]'
                : 'text-[#888888] border-transparent hover:text-[#F0F0F0]'
            }`}
          >
            <Music className="w-4 h-4" />
            Audio Direction
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'prompt'
                ? 'text-[#00E599] border-[#00E599]'
                : 'text-[#888888] border-transparent hover:text-[#F0F0F0]'
            }`}
          >
            <Code className="w-4 h-4" />
            Prompt
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'screenplay' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#F0F0F0] mb-2">Action</h3>
              <p className="text-[#888888] text-sm leading-relaxed whitespace-pre-wrap">
                {scene.actionText || 'No action text available.'}
              </p>
            </div>
            {scene.characters && scene.characters.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#F0F0F0] mb-2">Characters</h3>
                <div className="flex flex-wrap gap-2">
                  {scene.characters.map((char, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#1C1C1C] rounded text-xs text-[#888888]">
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {scene.dialogueJson && scene.dialogueJson.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#F0F0F0] mb-2">Dialogue</h3>
                <div className="space-y-3">
                  {formatDialogue(scene.dialogueJson)}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'audio' && (
          <AudioDirectionPanel
            ambient={scene.audioAmbient ?? undefined}
            music={scene.audioMusic ?? undefined}
            pacing={scene.audioPacing ?? undefined}
          />
        )}

        {activeTab === 'prompt' && (
          <PromptInspector
            prompt={scene.pixversePrompt ?? undefined}
            isOpen={isPromptOpen}
            onToggle={() => setIsPromptOpen(!isPromptOpen)}
          />
        )}
      </div>
    </div>
  );
}
