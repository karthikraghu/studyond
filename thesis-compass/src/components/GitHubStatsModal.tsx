import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info, Loader2, GitCommit, Code2, Hash } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

/**
 * Clean Architecture Note: 
 * We extract this complex Modal into its own component rather than bloating 
 * the form files. This ensures reusability across Onboarding and Settings pages.
 */
export function GithubStatsModal({ username }: { username?: string }) {
  const { githubStats, fetchGithubStats, isFetchingGithub } = useOnboardingStore();
  const [open, setOpen] = useState(false);

  // When the modal opens, if we don't have stats for this user, fetch them.
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && username && githubStats?.username !== username) {
      fetchGithubStats(username);
    }
  };

  if (!username) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button 
          type="button" 
          className="ml-2 text-muted-foreground hover:text-foreground transition-colors outline-none"
          title="View GitHub Stats"
        >
          <Info className="w-4 h-4" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            @{username}'s Developer Profile
          </DialogTitle>
        </DialogHeader>

        {isFetchingGithub ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Analyzing GitHub activity...</p>
          </div>
        ) : githubStats && githubStats.username === username ? (
          <div className="space-y-6 mt-4">
            
            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
                <GitCommit className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{githubStats.totalCommitsYear}</div>
                <div className="text-xs text-muted-foreground">Recent Commits</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
                <Code2 className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{Object.keys(githubStats.languageStats).length}</div>
                <div className="text-xs text-muted-foreground">Languages</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
                <Hash className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{githubStats.topics.length}</div>
                <div className="text-xs text-muted-foreground">Topics</div>
              </div>
            </div>

            {/* Language Stats */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4" /> Language Distribution
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(githubStats.languageStats)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 8)
                  .map(([lang, bytes]) => {
                    const total = Object.values(githubStats.languageStats).reduce((a: any, b: any) => a + b, 0) as number;
                    const percent = ((Number(bytes) / total) * 100).toFixed(1);
                    return (
                      <div key={lang} className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md text-sm">
                        <span className="font-medium text-foreground">{lang}</span>
                        <span className="text-muted-foreground ml-2">{percent}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Topics/Tags */}
            {githubStats.topics.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Focus Areas
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {githubStats.topics.map((topic: string) => (
                    <span key={topic} className="px-2.5 py-1 bg-muted rounded-full text-xs text-foreground font-medium">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Could not load GitHub stats. Please verify the username.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
