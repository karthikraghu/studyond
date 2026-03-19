import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ChevronRight, BookOpen, Activity, Zap, Flag, Navigation, FileSearch, HelpCircle } from 'lucide-react';

export interface DefenseCritique {
  utilityScore: number;
  majorRisks: string[];
  outOfScope: string;
  finalVerdict: "APPROVED" | "NEEDS_REVISION" | "REJECTED";
  actionableFeedback: string;
}

export interface AcademicRoadmap {
  refinedTopic: string;
  researchQuestions: string[];
  methodology: string;
  timeline: string;
}

export interface LiteratureContext {
  saturationLevel: "Low" | "Medium" | "High";
  recentKeyPapers: Array<{ title: string; year: number | string }>;
  researchGapStatus: string;
}

interface Props {
  data: DefenseCritique;
  rawFindings?: {
    academicRoadmap: AcademicRoadmap;
    literatureContext: LiteratureContext;
  };
}

export function ThesisHealthCard({ data, rawFindings }: Props) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED': return { color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, ring: 'ring-emerald-500/30', cardBg: 'bg-gradient-to-br from-emerald-500/5 to-transparent' };
      case 'NEEDS_REVISION': return { color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertCircle, ring: 'ring-amber-500/30', cardBg: 'bg-gradient-to-br from-amber-500/5 to-transparent' };
      case 'REJECTED': return { color: 'text-rose-600', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: Flag, ring: 'ring-rose-500/30', cardBg: 'bg-gradient-to-br from-rose-500/5 to-transparent' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Activity, ring: 'ring-slate-500/30', cardBg: 'bg-gradient-to-br from-slate-500/5 to-transparent' };
    }
  };

  const statusConfig = getStatusConfig(data.finalVerdict);
  const StatusIcon = statusConfig.icon;

  const rMap = rawFindings?.academicRoadmap;
  const lCtx = rawFindings?.literatureContext;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5"
    >
      {/* 1. TL;DR & Status Box */}
      <div className={`xl:col-span-8 md:col-span-2 col-span-1 p-6 sm:p-8 rounded-[2rem] border ${statusConfig.border} ${statusConfig.cardBg} flex flex-col justify-center space-y-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 -m-10 opacity-5 pointer-events-none">
          <StatusIcon className="w-64 h-64" />
        </div>
        
        <div className="flex items-center justify-between relative z-10 w-full">
           <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-background shadow-sm ring-1 ${statusConfig.ring}`}>
              <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Committee Verdict</h2>
              <div className={`text-3xl font-black ${statusConfig.color}`}>{data.finalVerdict.replace('_', ' ')}</div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
             <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Utility Score</div>
             <div className="text-3xl font-black text-foreground">{data.utilityScore}<span className="text-muted-foreground text-lg">/10</span></div>
          </div>
        </div>
        
        <div className="relative z-10">
          <h3 className="font-semibold text-foreground mb-3 text-lg">Refined Topic</h3>
          <p className="text-foreground leading-relaxed text-[17px] font-medium border-l-4 border-primary pl-4 py-1">
            {rMap ? rMap.refinedTopic : "Generating topic..."}
          </p>
        </div>
      </div>

      {/* 2. Recommended Action Box */}
      <div className="xl:col-span-4 md:col-span-2 col-span-1 p-6 sm:p-8 rounded-[2rem] border border-primary/20 bg-primary text-primary-foreground flex flex-col justify-center relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none">
          <Zap className="w-48 h-48" />
        </div>
        <div className="relative z-10 space-y-4">
          <h4 className="font-bold text-lg flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/10 rounded-xl">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            Chair's Directive
          </h4>
          <p className="text-[15px] leading-relaxed font-medium opacity-95">
            {data.actionableFeedback}
          </p>
        </div>
      </div>

      {/* 3. Research Questions & Methodology */}
      <div className="xl:col-span-8 md:col-span-2 col-span-1 p-6 sm:p-8 bg-card rounded-[2rem] border border-border">
        <h4 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-500" /> Academic Roadmap
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5"/> Questions</div>
             <ul className="space-y-3">
               {rMap?.researchQuestions?.map((rq, i) => (
                 <li key={i} className="flex items-start gap-3 text-[14px] leading-snug">
                   <span className="w-4 h-4 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[10px] mt-0.5 shrink-0 font-bold">{i+1}</span>
                   <span className="text-foreground/80">{rq}</span>
                 </li>
               ))}
               {!rMap && <li className="text-sm text-muted-foreground italic">No research questions established.</li>}
             </ul>
           </div>
           <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><Activity className="w-3.5 h-3.5"/> Methodology</div>
                <p className="text-sm text-foreground/80">{rMap?.methodology || "Not established"}</p>
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><Activity className="w-3.5 h-3.5"/> Timeline</div>
                <p className="text-sm text-foreground/80">{rMap?.timeline || "Not established"}</p>
              </div>
           </div>
        </div>
      </div>

      {/* 4. Literature Context */}
      <div className="xl:col-span-4 md:col-span-2 col-span-1 p-6 sm:p-8 bg-card rounded-[2rem] border border-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-base text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" /> Literature
          </h4>
          {lCtx && (
            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${lCtx.saturationLevel === 'High' ? 'bg-rose-500/10 text-rose-600' : lCtx.saturationLevel === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              {lCtx.saturationLevel} Saturation
            </span>
          )}
        </div>
        <p className="text-sm text-foreground/80 mb-4 whitespace-pre-wrap">{lCtx?.researchGapStatus || "No literature search performed."}</p>
        {lCtx?.recentKeyPapers && lCtx.recentKeyPapers.length > 0 && (
          <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
            <div className="text-[11px] font-bold text-muted-foreground uppercase mb-2">Key References</div>
            {lCtx.recentKeyPapers.map((paper, i) => (
              <div key={i} className="text-xs flex gap-2">
                <FileSearch className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5"/>
                <span className="text-foreground/90 font-medium">{paper.title} <span className="text-muted-foreground font-normal">({paper.year})</span></span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Defense Critique */}
      <div className="xl:col-span-12 md:col-span-2 col-span-1 p-6 sm:p-8 bg-amber-500/5 rounded-[2rem] border border-amber-500/20">
        <h4 className="font-bold text-base text-amber-900 dark:text-amber-400 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> Risks & Out of Scope Focus
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-3">Major Risks</div>
            <ul className="space-y-2">
              {data.majorRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-amber-900/80 dark:text-amber-200/80">
                  <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
             <div className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-3">Strictly Out of Scope</div>
             <div className="p-4 bg-background/50 border border-amber-500/10 rounded-xl text-sm text-amber-900/80 dark:text-amber-200/80">
               {data.outOfScope}
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
