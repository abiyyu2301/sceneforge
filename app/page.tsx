import Link from 'next/link';
import { Film, Plus, ArrowRight } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { prisma } from '@/lib/db';

async function getProjects() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      scenes: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  return projects.map((project) => {
    const totalScenes = project.scenes.length;
    const doneScenes = project.scenes.filter(
      (s) => s.status === 'DONE'
    ).length;

    let status: 'PENDING' | 'RENDERING' | 'DONE' = 'PENDING';
    if (doneScenes === totalScenes && totalScenes > 0) {
      status = 'DONE';
    } else if (doneScenes > 0) {
      status = 'RENDERING';
    }

    return {
      id: project.id,
      title: project.title,
      sceneCount: totalScenes,
      createdAt: project.createdAt,
      status,
    };
  });
}

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Film className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">SceneForge</h1>
              <p className="text-sm text-text-secondary">AI Screenplay Visualizer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero / CTA Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-surface to-card border border-border rounded-2xl p-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                Transform Screenplays Into Cinematic Storyboards
              </h2>
              <p className="text-text-secondary text-lg mb-6">
                Upload your screenplay, define your cast, and let AI generate 
                video storyboards for each scene. Visualize your film before 
                production begins.
              </p>
              <Link
                href="/project/new"
                className="inline-flex items-center gap-2 bg-accent text-black font-semibold px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Project
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text-primary">
              Your Projects
            </h3>
            <span className="text-sm text-text-secondary">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">No projects yet. Start by creating your first screenplay project.</p>
              <Link
                href="/project/new"
                className="inline-flex items-center gap-2 bg-accent text-black font-semibold px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  sceneCount={project.sceneCount}
                  createdAt={project.createdAt}
                  status={project.status}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
