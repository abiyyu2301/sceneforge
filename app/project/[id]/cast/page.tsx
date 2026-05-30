'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Users, UserCheck } from 'lucide-react';
import { CastCard } from '@/components/CastCard';

// Mock cast data for demo
const MOCK_CAST = [
  {
    id: '1',
    characterName: 'JANE',
    actorName: 'Emily Blunt',
    physicalDescription: '30s, tired appearance, sharp features, wearing casual business attire',
    referenceImagePath: undefined,
  },
  {
    id: '2',
    characterName: 'MARK',
    actorName: 'Oscar Isaac',
    physicalDescription: '40s, disheveled, unshaven, wearing a worn leather jacket',
    referenceImagePath: undefined,
  },
  {
    id: '3',
    characterName: 'DRIVER',
    actorName: '',
    physicalDescription: 'Mysterious figure, wearing sunglasses, always in shadows',
    referenceImagePath: undefined,
  },
];

interface CastMember {
  id: string;
  characterName: string;
  actorName?: string;
  physicalDescription?: string;
  referenceImagePath?: string;
}

interface Project {
  id: string;
  title: string;
  castMembers: CastMember[];
}

export default function CastPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    // Check if this is a mock project
    if (projectId.startsWith('mock-')) {
      setIsMock(true);
      setProject({
        id: projectId,
        title: 'The Last Witness',
        castMembers: MOCK_CAST,
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to load project');
      } else {
        const data = await res.json();
        setProject(data);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setProject(null);
      setError(error instanceof Error ? error.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleCastUpdate = async (characterName: string, data: {
    actorName?: string;
    physicalDescription?: string;
    image?: File;
  }) => {
    if (isMock) {
      // Just update local state for mock
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          castMembers: prev.castMembers.map(member =>
            member.characterName === characterName
              ? {
                  ...member,
                  actorName: data.actorName || member.actorName,
                  physicalDescription: data.physicalDescription || member.physicalDescription,
                }
              : member
          ),
        };
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('characterName', characterName);
      if (data.actorName) formData.append('actorName', data.actorName);
      if (data.physicalDescription) formData.append('physicalDescription', data.physicalDescription);
      if (data.image) formData.append('image', data.image);

      const res = await fetch('/api/cast', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update cast member');
      
      await fetchProject();
    } catch (error) {
      console.error('Error updating cast member:', error);
      setError(error instanceof Error ? error.message : 'Failed to update cast member');
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push(`/project/${projectId}/generate`);
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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="text-sm text-text-secondary">
              Step 2 of 4
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Cast Registry
              </h1>
              <p className="text-text-secondary">
                {project.title}
              </p>
            </div>
          </div>
          <p className="text-text-secondary mt-2 max-w-2xl">
            Upload a reference photo for each character. PixVerse will use these to maintain 
            actor appearance across scenes. This step is optional — you can skip it and continue.
          </p>
          {isMock && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-accent">
                Demo Mode: Using mock cast data. Connect to database for real functionality.
              </p>
            </div>
          )}
        </div>

        {/* Cast List */}
        <div className="space-y-4 mb-10">
          {project.castMembers.length === 0 ? (
            <div className="bg-surface border border-dashed border-border rounded-card p-8 text-center">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-text-secondary" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No characters detected
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                No character names were detected in your screenplay. 
                You can continue without cast registry, or go back and check your screenplay format.
              </p>
            </div>
          ) : (
            project.castMembers.map((member) => (
              <CastCard
                key={member.id}
                characterName={member.characterName}
                actorName={member.actorName}
                physicalDescription={member.physicalDescription}
                referenceImagePath={member.referenceImagePath}
                onUpdate={(data) => handleCastUpdate(member.characterName, data)}
              />
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Link
            href="/"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/project/${projectId}/generate`)}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Skip cast setup →
            </button>
            <button
              onClick={handleContinue}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-accent text-black font-semibold px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
