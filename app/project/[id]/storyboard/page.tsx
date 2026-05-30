'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Video, RefreshCw } from 'lucide-react';
import { StoryboardSidebar } from './components/StoryboardSidebar';
import { SceneViewer } from './components/SceneViewer';
import { AdjustPanel } from './components/AdjustPanel';

interface Scene {
  id: string;
  sceneNumber: number;
  heading: string;
  location: string;
  timeOfDay: string;
  actionText: string;
  characters: string[];
  dialogueJson: any[];
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  pixversePrompt?: string;
  audioAmbient?: string;
  audioMusic?: string;
  audioPacing?: string;
  shotType?: string;
  cameraMovement?: string;
  mood?: string;
  lightingDesc?: string;
}

interface Project {
  id: string;
  title: string;
  scenes: Scene[];
}

export default function StoryboardPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      const data = await res.json();
      setProject(data);
      
      // Select first scene by default if none selected
      if (!selectedScene && data.scenes.length > 0) {
        setSelectedScene(data.scenes[0]);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedScene]);

  useEffect(() => {
    fetchProject();
    
    // Set up polling for updates
    const interval = setInterval(fetchProject, 5000);
    return () => clearInterval(interval);
  }, [fetchProject]);

  const handleSceneSelect = (scene: Scene) => {
    setSelectedScene(scene);
  };

  const handleSceneUpdate = async (updates: Partial<Scene>) => {
    if (!selectedScene) return;

    try {
      const res = await fetch(`/api/scenes/${selectedScene.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update scene');

      // Refresh project data
      await fetchProject();
    } catch (error) {
      console.error('Error updating scene:', error);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedScene) return;
    setIsRegenerating(true);

    try {
      // Reset scene status
      await fetch(`/api/scenes/${selectedScene.id}/regenerate`, {
        method: 'POST',
      });

      // Start generation process
      await fetch('/api/scenes/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId: selectedScene.id }),
      });

      await fetch('/api/scenes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId: selectedScene.id }),
      });

      // Refresh to show status
      await fetchProject();
    } catch (error) {
      console.error('Error regenerating scene:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Project not found</p>
          <Link href="/" className="text-accent hover:underline mt-2 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/project/${projectId}/generate`}
                className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h1 className="font-semibold text-text-primary">{project.title}</h1>
                  <p className="text-sm text-text-secondary">
                    Step 4 of 4 • {project.scenes.length} scenes
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchProject}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-text-secondary" />
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-surface hover:bg-card text-text-primary px-4 py-2 rounded-lg transition-colors"
              >
                Done
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Three Column Layout */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* Left Sidebar - Scene List */}
          <div className="w-72 flex-shrink-0 bg-card border border-border rounded-card overflow-hidden">
            <StoryboardSidebar
              scenes={project.scenes}
              selectedScene={selectedScene}
              onSceneSelect={handleSceneSelect}
            />
          </div>

          {/* Center - Scene Viewer */}
          <div className="flex-1 bg-card border border-border rounded-card overflow-hidden">
            {selectedScene ? (
              <SceneViewer
                scene={selectedScene}
                onRegenerate={handleRegenerate}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-text-secondary">Select a scene to view</p>
              </div>
            )}
          </div>

          {/* Right Panel - Adjust Controls */}
          <div className="w-80 flex-shrink-0 bg-card border border-border rounded-card overflow-hidden">
            {selectedScene ? (
              <AdjustPanel
                scene={selectedScene}
                onUpdate={handleSceneUpdate}
                onRegenerate={handleRegenerate}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <p className="text-text-secondary text-center">
                  Select a scene to adjust parameters
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
