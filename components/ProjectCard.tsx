import Link from 'next/link';
import { Film, Calendar, ChevronRight } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  title: string;
  sceneCount: number;
  createdAt: Date;
  status: string;
}

export function ProjectCard({ id, title, sceneCount, createdAt, status }: ProjectCardProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      'PENDING': { color: 'bg-gray-500/20 text-gray-400', label: 'Pending' },
      'GENERATING_PROMPT': { color: 'bg-blue-500/20 text-blue-400', label: 'Generating' },
      'SUBMITTING': { color: 'bg-yellow-500/20 text-yellow-400', label: 'Submitting' },
      'RENDERING': { color: 'bg-orange-500/20 text-orange-400', label: 'Rendering' },
      'DONE': { color: 'bg-green-500/20 text-green-400', label: 'Complete' },
      'FAILED': { color: 'bg-red-500/20 text-red-400', label: 'Failed' },
    };
    const { color, label } = statusMap[status] || { color: 'bg-gray-500/20 text-gray-400', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  return (
    <Link href={`/project/${id}/storyboard`}>
      <div className="group bg-card border border-border rounded-card p-5 hover:border-accent transition-all duration-200 hover:shadow-lg hover:shadow-accent/5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                {title}
              </h3>
              <p className="text-sm text-text-secondary flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                {new Date(createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              {sceneCount} {sceneCount === 1 ? 'scene' : 'scenes'}
            </span>
          </div>
          {getStatusBadge(status)}
        </div>
      </div>
    </Link>
  );
}
