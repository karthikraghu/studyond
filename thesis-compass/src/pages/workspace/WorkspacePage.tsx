import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Send,
  AlertCircle,
  FileCheck2,
  Trophy,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type Milestone = {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
};

const milestones: Milestone[] = [
  { id: '1', title: 'Topic Registration', status: 'completed', date: 'Oct 15, 2026' },
  { id: '2', title: 'Research Proposal', status: 'completed', date: 'Nov 10, 2026' },
  { id: '3', title: 'Mid-term Presentation', status: 'completed', date: 'Jan 20, 2027' },
  { id: '4', title: 'First Draft Submission', status: 'current' },
  { id: '5', title: 'Final Hand-In', status: 'upcoming' },
];

export default function WorkspacePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'milestones' | 'drafts'>('drafts');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDraft, setUploadedDraft] = useState<boolean>(false);
  const [isHandedIn, setIsHandedIn] = useState<boolean>(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadedDraft(true);
    }, 2000);
  };

  const handleHandIn = () => {
    setIsHandedIn(true);
  };

  if (isHandedIn) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ type: 'spring' }}
           className="w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20 mb-8"
        >
          <Trophy className="w-16 h-16 text-emerald-500" />
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
          Thesis Successfully Submitted!
        </h1>
        <p className="text-xl text-muted-foreground font-medium mb-12">
          Congratulations on completing your journey from "I'm starting my thesis" to "I'm handing it in." Your supervisor has been notified.
        </p>

        <Button 
          onClick={() => navigate('/home')}
          className="rounded-[1.25rem] h-14 px-8 font-black gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
        >
          Return to Dashboard <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row bg-background">
      {/* ── Left Panel (Milestones & Drafts) ── */}
      <div className="w-full lg:w-[45%] xl:w-1/2 flex flex-col border-r border-border bg-muted/10 h-[50vh] lg:h-full overflow-y-auto">
        <div className="p-6 lg:p-10 border-b border-border bg-card">
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-3">
            <FileText className="w-4 h-4" /> Project Workspace
          </div>
          <h1 className="text-3xl font-black tracking-tighter leading-none mb-3">
            Optimization of Microgrids
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Supervised by Dr. Elena Rostova &bull; Due: April 15, 2027
          </p>
        </div>

        <div className="flex border-b border-border bg-card px-6">
          <button 
            onClick={() => setActiveTab('drafts')}
            className={cn(
              "px-4 py-4 text-sm font-bold border-b-2 transition-colors",
              activeTab === 'drafts' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Drafts & Feedback
          </button>
          <button 
            onClick={() => setActiveTab('milestones')}
            className={cn(
              "px-4 py-4 text-sm font-bold border-b-2 transition-colors",
              activeTab === 'milestones' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Roadmap
          </button>
        </div>

        <div className="p-6 lg:p-10 flex-1 overflow-y-auto">
          {activeTab === 'drafts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Draft Upload Area */}
              <div 
                className={cn(
                  "border-2 border-dashed rounded-[2.5rem] p-8 text-center transition-colors",
                  uploadedDraft ? "border-emerald-500/30 bg-emerald-500/5 group" : "border-border hover:border-primary/50 bg-card"
                )}
              >
                {!uploadedDraft ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                      {isUploading ? <Upload className="w-6 h-6 animate-bounce" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload First Draft</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-[200px] mx-auto">
                      PDF, DOCX up to 50MB. AI compass will review it instantly.
                    </p>
                    <Button 
                      onClick={handleUpload} 
                      disabled={isUploading}
                      className="rounded-xl h-12 px-6 font-bold shadow-sm"
                    >
                      {isUploading ? 'Analyzing Draft...' : 'Select File'}
                    </Button>
                  </>
                ) : (
                  <>
                     <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-600">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-700 mb-1">chapter_1_2_draft_v2.pdf</h3>
                    <p className="text-sm text-emerald-600/80 font-medium mb-6">Analyzed perfectly. No plagiarism detected.</p>
                    <div className="flex items-center justify-center gap-4">
                       <Button variant="outline" className="rounded-xl h-10 text-xs font-bold border-emerald-200 hover:bg-emerald-50">Upload New Revision</Button>
                    </div>
                  </>
                )}
              </div>

              {/* AI Feedback */}
              {uploadedDraft && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6">
                    <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest mb-4">
                       <Sparkles className="w-4 h-4" /> AI Co-Pilot Review
                    </div>
                    <ul className="space-y-4">
                       <li className="flex gap-3 text-sm font-medium text-slate-700">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          Excellent literature review structure! You seamlessly connected legacy systems with AI approaches.
                       </li>
                       <li className="flex gap-3 text-sm font-medium text-slate-700">
                          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                          Consider adding more recent citations (2025-2026) in section 2.4. I can fetch some for you in the chat.
                       </li>
                       <li className="flex gap-3 text-sm font-medium text-slate-700">
                          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                          Methodology chapter needs a clearer definition of the baseline model parameters used.
                       </li>
                    </ul>
                 </motion.div>
              )}

              {/* Hand In Button */}
              {uploadedDraft && (
                 <div className="pt-6 border-t border-border flex justify-end">
                    <Button 
                       onClick={handleHandIn}
                       className="rounded-[1.25rem] h-14 px-8 font-black gap-2 bg-foreground hover:bg-foreground/90 text-background shadow-xl hover:scale-105 transition-transform"
                    >
                       <Send className="w-4 h-4" /> Hand In Final Thesis
                    </Button>
                 </div>
              )}
            </motion.div>
          )}

          {activeTab === 'milestones' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
               {milestones.map((m, idx) => (
                  <div key={m.id} className="flex gap-6 relative pb-10">
                     {/* Timeline line */}
                     {idx !== milestones.length - 1 && (
                        <div className={cn(
                           "absolute left-[15px] top-8 bottom-0 w-0.5",
                           m.status === 'completed' ? "bg-emerald-500" : "bg-border"
                        )} />
                     )}
                     
                     <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 border-2",
                        m.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" : 
                        m.status === 'current' ? "bg-card border-primary text-primary" : "bg-muted border-border text-muted-foreground"
                     )}>
                        {m.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : 
                         m.status === 'current' ? <Clock className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                     </div>

                     <div className={cn("pt-1", m.status === 'upcoming' && "opacity-50")}>
                        <h4 className={cn("text-base font-bold", m.status === 'current' && "text-primary")}>{m.title}</h4>
                        {m.date && <p className="text-sm text-muted-foreground font-medium mt-1">{m.date}</p>}
                        
                        {m.status === 'current' && (
                           <Badge variant="outline" className="mt-3 bg-primary/5 text-primary border-primary/20">
                              In Progress
                           </Badge>
                        )}
                     </div>
                  </div>
               ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Right Panel (Chat Co-Pilot) ── */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col h-[50vh] lg:h-full">
         <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-black uppercase tracking-widest text-primary">Thesis Co-Pilot Active</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Connected to Draft Context</p>
         </div>
         <div className="flex-1 overflow-hidden relative">
           <ChatPanel />
         </div>
      </div>
    </div>
  );
}
