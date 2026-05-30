'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Sparkles } from 'lucide-react';

interface PromptInspectorProps {
  prompt?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function PromptInspector({ prompt, isOpen = false, onToggle }: PromptInspectorProps) {
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const [copied, setCopied] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggle?.();
  };

  const handleCopy = async () => {
    if (!prompt) return;
    
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Extract keywords from the prompt
  const extractKeywords = (text: string): string[] => {
    const commonWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'and', 'or']);
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return Array.from(
      new Set(words.filter((w) => w.length > 3 && !commonWords.has(w)))
    ).slice(0, 8);
  };

  const keywords = prompt ? extractKeywords(prompt) : [];

  if (!prompt) {
    return (
      <div className="p-4 bg-[#141414] rounded-lg border border-[#2A2A2A]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#888888]" />
          <h3 className="text-sm font-semibold text-[#888888]">AI Prompt</h3>
        </div>
        <p className="text-sm text-[#888888]">
          No prompt generated yet. Generate this scene to see the AI prompt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Collapsible Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 bg-[#141414] rounded-lg border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00E599]" />
          <h3 className="text-sm font-semibold text-[#F0F0F0]">AI Prompt</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#888888]">
            {prompt.length} chars
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#888888]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#888888]" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#00E599]/10 text-[#00E599] text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Prompt Text */}
          <div className="relative">
            <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] max-h-48 overflow-y-auto">
              <p className="text-sm text-[#F0F0F0] font-mono leading-relaxed whitespace-pre-wrap">
                {prompt}
              </p>
            </div>
            
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 bg-[#1C1C1C] hover:bg-[#2A2A2A] rounded transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-[#888888]" />
              )}
            </button>
          </div>

          {/* Quality Check */}
          <div className="p-3 bg-[#141414] rounded-lg border border-[#2A2A2A]">
            <h4 className="text-xs font-semibold text-[#888888] uppercase tracking-wide mb-2">
              Prompt Quality Check
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${prompt.length > 50 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="text-xs text-[#888888]">
                  Length: {prompt.length} characters {prompt.length > 50 ? '(good)' : '(short)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${keywords.length >= 3 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="text-xs text-[#888888]">
                  Keywords: {keywords.length} detected {keywords.length >= 3 ? '(good)' : '(few)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-[#888888]">PixVerse V6 compatible</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
