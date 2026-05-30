'use client';

import { Volume2, Music, Wind, Clock } from 'lucide-react';

interface AudioDirectionPanelProps {
  ambient?: string;
  music?: string;
  pacing?: string;
}

export function AudioDirectionPanel({ ambient, music, pacing }: AudioDirectionPanelProps) {
  const audioData = [
    {
      icon: Wind,
      label: 'Ambient',
      value: ambient || 'Not specified',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      icon: Music,
      label: 'Music',
      value: music || 'Not specified',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      icon: Clock,
      label: 'Pacing',
      value: pacing || 'Not specified',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-4 h-4 text-[#00E599]" />
        <h3 className="text-sm font-semibold text-[#F0F0F0]">Audio Direction</h3>
      </div>

      <div className="space-y-3">
        {audioData.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-[#141414] rounded-lg border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#888888] uppercase tracking-wide mb-1">
                  {item.label}
                </p>
                <p className="text-sm text-[#F0F0F0] leading-relaxed">
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-[#00E599]/5 rounded-lg border border-[#00E599]/20">
        <p className="text-xs text-[#888888]">
          <span className="text-[#00E599]">💡 Tip:</span> These audio cues are used by PixVerse V6's native audio generation to match the scene's mood and pacing.
        </p>
      </div>
    </div>
  );
}
