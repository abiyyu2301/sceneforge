'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, FileText } from 'lucide-react';

// Mock screenplay data for demo
const MOCK_SCREENPLAY = `INT. COFFEE SHOP - DAY

JANE (30s, tired) sits at a corner table, nursing a cold cup of coffee. She checks her watch for the third time.

JANE
(to herself)
He's not coming.

She stands up, grabbing her bag, when the door CHIMES.

MARK (40s, disheveled) rushes in, scanning the room. His eyes land on Jane.

MARK
Jane! Wait!

JANE
(turning back)
You're forty minutes late, Mark. I told you I had a flight.

MARK
I know, I know. But you need to see this.

He pulls out a weathered NOTEBOOK from his jacket. Jane's expression shifts from annoyance to curiosity.

JANE
What is that?

MARK
It's dad's. Everything he was working on before he died.

Jane slowly sits back down. Mark slides into the seat across from her.

JANE
I thought he destroyed all of his research.

MARK
So did I. But last week, I found this hidden in the attic.

He opens the notebook. Inside are handwritten NOTES, diagrams, and newspaper clippings.

MARK (CONT'D)
He was onto something, Jane. Something big. And I think that's why he was killed.

Jane looks up at him, her eyes wide.

JANE
Mark, dad died in a car accident.

MARK
(shaking his head)
That's what they wanted everyone to believe.

EXT. COFFEE SHOP - DAY

A BLACK SEDAN pulls up across the street. The DRIVER, wearing sunglasses, watches the coffee shop through the window.

INT. COFFEE SHOP - CONTINUOUS

Mark leans in closer to Jane, lowering his voice.

MARK
I need you to help me finish what he started. You were always the brilliant one. The code breaker.

JANE
That was a long time ago, Mark. I'm not that person anymore.

MARK
I know about Singapore. About what happened.

Jane's face goes pale.

JANE
You don't know anything about Singapore.

MARK
I know you walked away from everything because you discovered something you weren't supposed to. Just like dad.

A long beat. Jane stares at him, her eyes searching his face.

JANE
(quietly)
What do you want from me, Mark?

MARK
Help me crack the code in this notebook. And then... help me find the truth about what really happened to dad.

Jane looks down at the notebook, then back up at Mark. She slowly reaches out and touches the weathered cover.

JANE
If we do this... if we really do this... there's no going back. They'll find us. Just like they found dad.

MARK
I know. That's why I came to you. Because you're the only one I trust.

Jane takes a deep breath, then nods slowly.

JANE
Okay. Okay, Mark. I'll help you.

She opens the notebook and begins to examine the pages. Mark watches her, a mixture of relief and determination on his face.

Outside, the black sedan remains parked across the street. The driver lifts a phone to his ear.

DRIVER
(into phone)
He's with her. Just like you predicted.

The driver hangs up and continues watching the coffee shop.

FADE OUT.

THE END`;

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [screenplay, setScreenplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a project title');
      return;
    }

    if (!screenplay.trim()) {
      setError('Please paste your screenplay');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!projectRes.ok) {
        const payload = await projectRes.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to create project');
      }

      const { id: projectId } = await projectRes.json();

      // Then parse the screenplay
      const parseRes = await fetch('/api/screenplay/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, screenplayText: screenplay }),
      });

      if (!parseRes.ok) {
        const payload = await parseRes.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to parse screenplay');
      }

      // Redirect to cast page
      router.push(`/project/${projectId}/cast`);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong while creating the project');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoScreenplay = () => {
    setTitle('The Last Witness');
    setScreenplay(MOCK_SCREENPLAY);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Create New Project
          </h1>
          <p className="text-text-secondary">
            Start by giving your project a title and pasting your screenplay
          </p>
        </div>

        {/* Demo Button */}
        <div className="mb-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <p className="text-sm text-text-secondary mb-2">
            Want to see how it works? Load a demo screenplay.
          </p>
          <button
            onClick={loadDemoScreenplay}
            className="text-sm text-accent hover:text-accent-hover font-medium"
          >
            Load Demo Screenplay →
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
              Project Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Last Witness"
              className="w-full bg-surface border border-border rounded-input px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Screenplay Text */}
          <div>
            <label htmlFor="screenplay" className="block text-sm font-medium text-text-primary mb-2">
              Screenplay <span className="text-error">*</span>
            </label>
            <div className="relative">
              <textarea
                id="screenplay"
                value={screenplay}
                onChange={(e) => setScreenplay(e.target.value)}
                placeholder="Paste your screenplay in standard format...&#10;&#10;INT. COFFEE SHOP - DAY&#10;&#10;JANE sits at a corner table, nursing a cold cup of coffee. She checks her watch for the third time.&#10;&#10;JANE&#10;(to herself)&#10;He's not coming.&#10;&#10;She stands up, grabbing her bag--"
                rows={16}
                className="w-full bg-surface border border-border rounded-input px-4 py-4 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors font-mono text-sm resize-y min-h-[400px]"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-text-secondary">
                <FileText className="w-3 h-3" />
                {screenplay.length.toLocaleString()} chars
              </div>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              Standard screenplay format supported. Scene headings (INT./EXT.) are used as scene boundaries.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-input px-4 py-3">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <Link
              href="/"
              className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-accent text-black font-semibold px-8 py-3 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Parsing Screenplay...</span>
                </>
              ) : (
                <>
                  <span>Parse Screenplay</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
