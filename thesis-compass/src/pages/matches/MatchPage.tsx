import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ChevronRight, 
  Target, 
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  UserCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { matchGoldenTriangle } from '@/lib/matching-engine';
import { evaluateMatchWithQA } from '@/lib/agents/qa-agent';
import type { QAMatchResult } from '@/lib/agents/qa-agent';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data imports
import topicsData from '@/mock-data/topics.json';
import supervisorsData from '@/mock-data/supervisors.json';
import companiesData from '@/mock-data/companies.json';
import fieldsData from '@/mock-data/fields.json';
import universitiesData from '@/mock-data/universities.json';

import type { GoldenTriangleMatch } from '@/types/profile';

/**
 * MatchPage — Displays personalized thesis opportunities
 * Enhanced with the QA Match Agent for deep reality checks.
 */
export default function MatchPage() {
  const navigate = useNavigate();
  const { studentProfile } = useOnboardingStore();
  const [matches, setMatches] = useState<GoldenTriangleMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<GoldenTriangleMatch | null>(null);
  const [qaResult, setQaResult] = useState<QAMatchResult | null>(null);
  const [isQaLoading, setIsQaLoading] = useState(false);

  // 1. Initial Match Calculation
  useEffect(() => {
    async function getMatches() {
      if (!studentProfile) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('MatchPage: Fetching matches for:', studentProfile.id);
        const response = await fetch('http://localhost:3001/api/match-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: studentProfile,
            topK: 6
          })
        });

        if (!response.ok) throw new Error('Failed to fetch matches');

        const { matches } = await response.json();
        console.log(`MatchPage: Found ${matches.length} matches`);
        setMatches(matches);
      } catch (err) {
        console.error('Matching failed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    getMatches();
  }, [studentProfile]);

  // 2. Trigger the QA Agent on Selection
  const handleSelectMatch = async (match: GoldenTriangleMatch) => {
    setSelectedMatch(match);
    setQaResult(null);
    setIsQaLoading(true);

    if (!studentProfile) return;

    try {
      // Find the full topic object from mock data
      const fullTopic = (topicsData as any[]).find(t => t.id === match.topic.id);
      
      // Run the "Academic Critic" (Claude-powered QA)
      const result = await evaluateMatchWithQA(
        studentProfile,
        fullTopic,
        match.triangleScore * 100
      );
      setQaResult(result);
    } catch (err) {
      console.error('QA Evaluation failed:', err);
    } finally {
      setIsQaLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Computing your Golden Triangle matches...</p>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Profile Missing</h2>
        <p className="text-muted-foreground mb-6">Please complete your onboarding to see matches.</p>
        <Button onClick={() => navigate('/')}>Complete Onboarding</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Thesis Matches</h1>
          <p className="text-muted-foreground max-w-2xl">
            We've analyzed your GitHub activity, CV, and priorities against {topicsData.length} opportunities. 
            Select a match for a deep AI-powered reality check.
          </p>
        </div>
        
        <div className="hidden lg:flex flex-col items-end">
          <Badge variant="outline" className="px-3 py-1 gap-1.5 border-primary/20 bg-primary/5 text-primary">
            <Sparkles className="w-3 h-3" /> {matches.length} matches found
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Match List (Left/Main) ── */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {matches.map((match, i) => (
              <motion.button
                key={match.topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSelectMatch(match)}
                className={cn(
                  "w-full group relative p-6 rounded-2xl border bg-card text-left transition-all duration-300",
                  "hover:shadow-lg hover:border-primary/30 hover:bg-primary/[0.01]",
                  selectedMatch?.topic.id === match.topic.id 
                    ? "border-primary ring-1 ring-primary/20 bg-primary/[0.02]" 
                    : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/15 border-none">
                         {Math.round(match.triangleScore * 100)}% Match
                       </Badge>
                       {match.topic.employment === 'yes' && (
                         <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none">
                           Paid / Employment
                         </Badge>
                       )}
                    </div>
                    
                    <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                      {match.topic.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> {match.topic.company}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" /> {match.supervisor.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-full flex items-center">
                    <ChevronRight className={cn(
                      "w-5 h-5 transition-all duration-300",
                      selectedMatch?.topic.id === match.topic.id ? "translate-x-1 text-primary" : "text-muted-foreground/30"
                    )} />
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Deep QA Analysis (Right Sidebar/Detail) ── */}
        <div className="relative">
          <div className="sticky top-24">
            <AnimatePresence mode="wait">
              {!selectedMatch ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center gap-4 min-h-[400px]"
                >
                  <Target className="w-12 h-12 text-muted-foreground/20" />
                  <p className="text-muted-foreground text-sm max-w-[200px]">
                    Select a topic to start the <span className="font-bold text-foreground">QA Match Validator</span>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedMatch.topic.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden flex flex-col h-full overflow-y-auto max-h-[75vh]"
                >
                  {/* Card Header: Topic Info */}
                  <div className="p-6 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent border-b border-border">
                    <h3 className="font-bold text-lg mb-4">{selectedMatch.topic.title}</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 rounded-lg bg-primary/10 text-primary">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Company</p>
                          <p className="text-sm font-medium">{selectedMatch.topic.company}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 rounded-lg bg-blue-500/10 text-blue-500">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Academic Supervisor</p>
                          <p className="text-sm font-medium">{selectedMatch.supervisor.name}</p>
                          <p className="text-[11px] text-muted-foreground">{selectedMatch.supervisor.university}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body: QA Analysis */}
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-6">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <h4 className="font-bold tracking-tight">AI Reality Check</h4>
                      {isQaLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
                    </div>

                    {isQaLoading ? (
                      <div className="space-y-6">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-20 w-full bg-muted/50 animate-pulse rounded-xl" />
                        <div className="space-y-2">
                          <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ) : qaResult ? (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                      >
                        {/* Final Confidence Score */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                          <span className="text-sm font-bold">QA Confidence Score</span>
                          <span className={cn(
                            "text-xl font-black",
                            qaResult.final_confidence_score > 70 ? "text-emerald-500" : "text-amber-500"
                          )}>
                            {qaResult.final_confidence_score}%
                          </span>
                        </div>

                        {/* Rationale */}
                        <div>
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Academic Critic's Rationale</p>
                          <div className="text-sm text-foreground leading-relaxed p-4 rounded-2xl bg-primary/[0.02] border border-primary/5 italic">
                            "{qaResult.student_facing_rationale}"
                          </div>
                        </div>

                        {/* Gaps & Assets */}
                        <div className="grid grid-cols-1 gap-4 mt-6">
                          {qaResult.technical_reality_check.strongest_assets.length > 0 && (
                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                              <p className="text-[11px] font-bold text-emerald-600 uppercase mb-2">Strongest Assets</p>
                              <ul className="space-y-1">
                                {qaResult.technical_reality_check.strongest_assets.map((asset, idx) => (
                                  <li key={idx} className="text-[12px] flex items-start gap-2">
                                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                                    <span>{asset}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {qaResult.technical_reality_check.identified_gaps.length > 0 && (
                            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                              <p className="text-[11px] font-bold text-amber-600 uppercase mb-2">Identified Gaps</p>
                              <ul className="space-y-1">
                                {qaResult.technical_reality_check.identified_gaps.map((gap, idx) => (
                                  <li key={idx} className="text-[12px] flex items-start gap-2">
                                    <AlertCircle className="w-3 h-3 mt-0.5 text-amber-500 flex-shrink-0" />
                                    <span>{gap}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Match Tier Badge */}
                        <div className="pt-4 border-t border-border">
                          <div className={cn(
                             "w-full py-3 rounded-xl text-center font-bold text-sm",
                             qaResult.match_tier === 'Perfect Fit' ? "bg-emerald-500 text-white" :
                             qaResult.match_tier === 'Strong Candidate' ? "bg-blue-600 text-white" :
                             qaResult.match_tier === 'Stretch Goal' ? "bg-amber-100 text-amber-700" :
                             "bg-rose-100 text-rose-700"
                          )}>
                            Match Status: {qaResult.match_tier}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-10 opacity-40">
                         <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                         <p className="text-xs">Select a match to start analysis</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
