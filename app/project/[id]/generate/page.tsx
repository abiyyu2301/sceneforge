'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Play, 
  Loader2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Film,
  Video
} from 'lucide-react';

interface Scene {
  id: string;
  sceneNumber: number;
  heading: string;
  location: string;
  timeOfDay: string;
  status: string;
  videoUrl?: string;
  errorMessage?: string;
}

interface Project {
  id: string;
  title: string;
  scenes: Scene[];
}

export default function GeneratePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      const data = await res.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Poll for status updates when generating
  useEffect(() => {
    if (!generating) return;

    const interval = setInterval(() => {
      fetchProject();
    }, 3000);

    return () => clearInterval(interval);
  }, [generating, fetchProject]);

  const generateAllScenes = async () => {
    if (!project) return;
    
    setGenerating(true);
    
    const pendingScenes = project.scenes.filter(
      s => s.status === 'PENDING' || s.status === 'FAILED'
    );

    for (let i = 0; i < pendingScenes.length; i++) {
      const scene = pendingScenes[i];
      setCurrentSceneIndex(i);
      
      try {
        // Step 1: Generate prompt
        await fetch('/api/scenes/generate-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sceneId: scene.id }),
        });

        // Step 2: Submit to PixVerse
        await fetch('/api/scenes/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sceneId: scene.id }),
        });
      } catch (error) {
        console.error(`Error generating scene ${scene.id}:`, error);
      }
    }

    setCurrentSceneIndex(null);
    setGenerating(false);
    fetchProject();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'FAILED':
        return <AlertCircle className="w-5 h-5 text-error" />;
      case 'RENDERING':
      case 'SUBMITTING':
      case 'GENERATING_PROMPT':
        return <Loader2 className="w-5 h-5 text-accent animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-border" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'Pending',
      'GENERATING_PROMPT': 'Generating Prompt',
      'SUBMITTING': 'Submitting',
      'RENDERING': 'Rendering',
      'DONE': 'Complete',
      'FAILED': 'Failed',
    };
    return labels[status] || status;
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

  const pendingCount = project.scenes.filter(s => s.status === 'PENDING').length;
  const doneCount = project.scenes.filter(s => s.status === 'DONE').length;
  const hasVideos = doneCount > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/project/${projectId}/cast`}
                className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="font-semibold text-text-primary">{project.title}</h1>
                <p className="text-sm text-text-secondary">
                  Step 3 of 4 • {project.scenes.length} scenes
                </p>
              </div>
            </div>
            {hasVideos && (
              <Link
                href={`/project/${projectId}/storyboard`}
                className="inline-flex items-center gap-2 bg-accent text-black font-semibold px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
              >
                <Video className="w-4 h-4" />
                View Storyboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-card p-4">
            <div className="text-2xl font-bold text-text-primary">{project.scenes.length}</div>
            <div className="text-sm text-text-secondary">Total Scenes</div>
          </div>
          <div className="bg-card border border-border rounded-card p-4">
            <div className="text-2xl font-bold text-success">{doneCount}</div>
            <div className="text-sm text-text-secondary">Complete</div>
          </div>
          <div className="bg-card border border-border rounded-card p-4">
            <div className="text-2xl font-bold text-warning">{pendingCount}</div>
            <div className="text-sm text-text-secondary">Pending</div>
          </div>
          <div className="bg-card border border-border rounded-card p-4">
            <div className="text-2xl font-bold text-text-primary">
              {generating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                doneCount
              )}
            </div>
            <div className="text-sm text-text-secondary">
              {generating ? 'Generating...' : 'Videos Ready'}
            </div>
          </div>
        </div>

        {/* Generate All Button */}
        {pendingCount > 0 && !generating && (
          <div className="mb-8">
            <button
              onClick={generateAllScenes}
              className="w-full bg-accent text-black font-semibold py-4 rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Generate All {pendingCount} Scenes
            </button>
          </div>
        )}

        {generating && (
          <div className="mb-8 bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
              <div>
                <p className="font-medium text-text-primary">
                  Generating scenes...
                </p>
                <p className="text-sm text-text-secondary">
                  {currentSceneIndex !== null 
                    ? `Processing scene ${currentSceneIndex + 1} of ${project?.scenes.filter(s => s.status === 'PENDING' || s.status === 'FAILED').length}`
                    : 'Initializing...'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scenes List */}
        <div className="space-y-3">
          {project?.scenes.map((scene) => (
            <div
              key={scene.id}
              className="bg-card border border-border rounded-card p-4 flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-surface rounded-lg flex items-center justify-center font-mono text-lg font-bold text-text-secondary">
                {scene.sceneNumber}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text-primary truncate">
                  {scene.heading}
                </h3>
                <p className="text-sm text-text-secondary truncate">
                  {scene.location} • {scene.timeOfDay}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {getStatusIcon(scene.status)}
                <span className={`text-sm font-medium ${
                  scene.status === 'DONE' ? 'text-success' :
                  scene.status === 'FAILED' ? 'text-error' :
                  scene.status === 'PENDING' ? 'text-text-secondary' :
                  'text-accent'
                }`}>
                  {getStatusLabel(scene.status)}
                </span>
              </div>

              {scene.status === 'FAILED' && (
                <button
                  onClick={() => {/* Retry logic */}}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                  title="Retry"
                >
                  <RefreshCw className="w-4 h-4 text-text-secondary" />
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
