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
  CheckCircle2,
  Mail,
  Send,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { evaluateMatchWithQA } from '@/lib/agents/qa-agent';
import type { QAMatchResult } from '@/lib/agents/qa-agent';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data imports
import topicsData from '@/mock-data/topics.json';
import supervisorsData from '@/mock-data/supervisors.json';

import type { GoldenTriangleMatch } from '@/types/profile';

// Re-using the supervisor matching logic from engine if needed, or simple local filter
function findOtherSupervisors(topicFieldIds: string[], currentSupId: string, allSupervisors: any[]) {
   return allSupervisors
     .filter(s => s.id !== currentSupId)
     .map(s => {
        const overlap = s.fieldIds.filter((f: string) => topicFieldIds.includes(f)).length;
        return { ...s, overlap };
     })
     .filter(s => s.overlap > 0)
     .sort((a, b) => b.overlap - a.overlap)
     .slice(0, 3);
}

/**
 * MatchPage — Displays personalized thesis opportunities
 * Enhanced with the QA Match Agent for deep reality checks.
 */
export default function MatchPage() {
  const navigate = useNavigate();
  const { studentProfile, trackApplication } = useOnboardingStore();
  const [matches, setMatches] = useState<GoldenTriangleMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<GoldenTriangleMatch | null>(null);
  const [qaResult, setQaResult] = useState<QAMatchResult | null>(null);
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasSent, setHasSent] = useState<Record<string, boolean>>({}); // tracking sent status per topic id
  const [activeSupervisorId, setActiveSupervisorId] = useState<string | null>(null);

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
    setActiveSupervisorId(match.supervisor.id);
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

  const handleContactSupervisor = () => {
    setIsContactModalOpen(true);
  };

  const handleSendMessage = () => {
    setIsSending(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSending(false);
      setIsContactModalOpen(false);
      if (selectedMatch && activeSupervisorId) {
         setHasSent(prev => ({ ...prev, [`${selectedMatch.topic.id}-${activeSupervisorId}`]: true }));
         
         // Record in trackable activity
         const supRaw = activeSupervisorId === selectedMatch.supervisor.id 
           ? selectedMatch.supervisor 
           : supervisorsData.find(s => s.id === activeSupervisorId);
           
         // Normalize name
         let supName = 'Supervisor';
         if (supRaw) {
            if ('name' in supRaw) supName = supRaw.name;
            else if ('firstName' in supRaw) supName = `${supRaw.title || ''} ${supRaw.firstName} ${supRaw.lastName}`.trim();
         }
           
         trackApplication({
           topicId: selectedMatch.topic.id,
           topicTitle: selectedMatch.topic.title,
           supervisorId: activeSupervisorId,
           supervisorName: supName,
           companyName: selectedMatch.topic.company
         });
      }
    }, 1500);
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
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 w-full">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-3 max-w-2xl">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-2 uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
            Your Thesis Matches
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium mt-3">
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
                  className="space-y-6"
                >
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="p-12 rounded-[3rem] border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-center gap-6 min-h-[400px] bg-muted/[0.02]">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                      <Target className="w-16 h-16 text-muted-foreground/40 relative z-10" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">Discover Your Future</h3>
                      <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                        Select a match from the list to initiate a <span className="text-primary font-black italic">Deep AI Reality Check</span> and connect with supervisors.
                      </p>
                    </div>
                  </div>
                </motion.div>
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

                        {/* Supervisor Selection */}
                        <div className="mt-8 pt-6 border-t border-border">
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Select Academic Supervisor</p>
                          <div className="space-y-3">
                             {/* The Primary Match */}
                             <button 
                               onClick={() => setActiveSupervisorId(selectedMatch.supervisor.id)}
                               className={cn(
                                 "w-full p-4 rounded-2xl border transition-all duration-300 text-left space-y-3",
                                 activeSupervisorId === selectedMatch.supervisor.id 
                                   ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20" 
                                   : "bg-muted/30 border-border hover:border-primary/20"
                               )}
                             >
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 font-bold text-xs uppercase">
                                         Primary
                                      </div>
                                      <div>
                                         <p className="text-sm font-bold">{selectedMatch.supervisor.name}</p>
                                         <p className="text-[10px] text-muted-foreground">{selectedMatch.supervisor.university}</p>
                                      </div>
                                   </div>
                                   {activeSupervisorId === selectedMatch.supervisor.id && (
                                     <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                   )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                   {selectedMatch.supervisor.researchInterests.slice(0, 3).map((interest, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-[9px] py-0 px-2 h-5 bg-white text-blue-600 border-none">
                                         {interest}
                                      </Badge>
                                   ))}
                                </div>
                             </button>

                             {/* Alternative Matches */}
                             {findOtherSupervisors(
                               (topicsData as any[]).find(t => t.id === selectedMatch.topic.id)?.fieldIds || [],
                               selectedMatch.supervisor.id,
                               supervisorsData
                             ).map((sup: any) => (
                                <button 
                                  key={sup.id} 
                                  onClick={() => setActiveSupervisorId(sup.id)}
                                  className={cn(
                                    "w-full p-4 rounded-2xl border transition-all duration-300 text-left space-y-3",
                                    activeSupervisorId === sup.id 
                                      ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20" 
                                      : "bg-muted/30 border-border hover:border-primary/20"
                                  )}
                                >
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                         <div className="p-2 rounded-xl bg-muted text-muted-foreground font-bold text-xs uppercase tracking-tighter">
                                            {sup.firstName[0]}{sup.lastName[0]}
                                         </div>
                                         <div>
                                            <p className="text-sm font-medium">{sup.title} {sup.firstName} {sup.lastName}</p>
                                            <p className="text-[10px] text-muted-foreground">Alternative Suggestion</p>
                                         </div>
                                      </div>
                                      {activeSupervisorId === sup.id && (
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                      )}
                                   </div>
                                </button>
                             ))}
                          </div>
                        </div>

                        {/* Match Status & Contact Action */}
                        <div className="pt-6 border-t border-border mt-auto space-y-4">
                          <div className={cn(
                             "w-full py-3 rounded-xl text-center font-bold text-sm",
                             qaResult.match_tier === 'Perfect Fit' ? "bg-emerald-500 text-white" :
                             qaResult.match_tier === 'Strong Candidate' ? "bg-blue-600 text-white" :
                             qaResult.match_tier === 'Stretch Goal' ? "bg-amber-100 text-amber-700" :
                             "bg-rose-100 text-rose-700"
                          )}>
                            Match Status: {qaResult.match_tier}
                          </div>
                          
                          {hasSent[`${selectedMatch.topic.id}-${activeSupervisorId}`] ? (
                            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="text-sm font-bold">Proposal Sent!</span>
                              <p className="text-[10px] text-center opacity-80 uppercase tracking-tighter">The supervisor will be notified of your specific interest in this topic.</p>
                            </div>
                          ) : (
                            <Button 
                              onClick={handleContactSupervisor}
                              className="w-full h-12 rounded-xl text-lg font-bold gap-2 shadow-lg shadow-primary/20"
                            >
                              <Mail className="w-5 h-5" /> Contact {activeSupervisorId === selectedMatch.supervisor.id ? selectedMatch.supervisor.name.split(' ').pop() : supervisorsData.find(s => s.id === activeSupervisorId)?.lastName}
                            </Button>
                          )}
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

      {/* ── Contact Modal ── */}
      <AnimatePresence>
        {isContactModalOpen && selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsContactModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-3xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold italic tracking-tight">Request Supervision</h2>
                    <p className="text-sm text-muted-foreground tracking-tighter">
                      To: {activeSupervisorId === selectedMatch.supervisor.id 
                        ? selectedMatch.supervisor.name 
                        : (() => {
                            const s = supervisorsData.find(s => s.id === activeSupervisorId);
                            return s ? `${s.title} ${s.firstName} ${s.lastName}` : 'Supervisor';
                          })()}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                       <Sparkles className="w-3 h-3 text-primary" /> AI Suggestion
                    </p>
                    <textarea 
                      className="w-full bg-transparent text-sm leading-relaxed focus:outline-none min-h-[180px] resize-none"
                      defaultValue={`Dear ${
                        activeSupervisorId === selectedMatch.supervisor.id 
                        ? selectedMatch.supervisor.name.split(' ').pop() 
                        : (supervisorsData.find(s => s.id === activeSupervisorId)?.lastName || 'Professor')
                      },\n\nI am very interested in the thesis topic "${selectedMatch.topic.title}". My background in ${studentProfile?.skills.slice(0, 3).join(', ')} aligns well with your research area.\n\nI would love to discuss a potential supervision for my ${studentProfile?.degree.toUpperCase()} thesis.\n\nBest regards,\n${studentProfile?.firstName} ${studentProfile?.lastName}`}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-primary/[0.03] border border-primary/10">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                           <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-medium leading-tight text-muted-foreground max-w-[180px]">Your verified StudyonD profile and GitHub stats will be attached.</span>
                     </div>
                     <Button 
                       onClick={handleSendMessage}
                       disabled={isSending}
                       className="gap-2 font-bold px-6"
                     >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Request
                     </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
