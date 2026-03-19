import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Building2, 
  UserCheck, 
  ArrowRight,
  Target,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Mock data imports for data resolution
import topicsData from '@/mock-data/topics.json';
import supervisorsData from '@/mock-data/supervisors.json';
import companiesData from '@/mock-data/companies.json';
import fieldsData from '@/mock-data/fields.json';

/**
 * TopicsPage — Managing student's chosen/interested thesis topics.
 * Connects active proposals with rich metadata.
 */
export default function TopicsPage() {
  const navigate = useNavigate();
  const { applications } = useOnboardingStore();

  // Resolve applications with full metadata
  const enrichedApplications = useMemo(() => {
    return applications.map((app: any) => {
      const topic = (topicsData as any[]).find(t => t.id === app.topicId);
      const supervisor = (supervisorsData as any[]).find(s => s.id === app.supervisorId);
      const company = topic?.companyId ? (companiesData as any[]).find(c => c.id === topic.companyId) : null;
      
      const fields = topic?.fieldIds 
        ? (fieldsData as any[]).filter(f => topic.fieldIds.includes(f.id)).map(f => f.name)
        : [];

      return {
        ...app,
        details: topic,
        supervisorDetails: supervisor,
        companyDetails: company,
        fields
      };
    });
  }, [applications]);

  const acceptedTopic = enrichedApplications.find((app: any) => app.status === 'accepted');
  const otherApplications = enrichedApplications.filter((app: any) => app.status !== 'accepted');

  if (enrichedApplications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 animate-pulse">
          <Sparkles className="w-10 h-10 text-primary/40" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">No Active Topics Yet</h1>
        <p className="text-muted-foreground max-w-sm mb-8">
          Explore customized matches and contact supervisors to start building your thesis path.
        </p>
        <Button 
          onClick={() => navigate('/matches')}
          className="rounded-full px-8 h-12 font-bold gap-2 shadow-lg shadow-primary/20"
        >
          Explore Matches <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 w-full">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-3">
            <Target className="w-4 h-4" /> Portfolio
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
            My Thesis Journey
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium mt-3">
            Track your confirmed thesis and manage active proposals.
          </p>
        </div>
      </div>

      {/* ── Final Accepted Thesis (Highlight) ── */}
      {acceptedTopic && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-[3rem] blur opacity-20" />
          <div className="relative rounded-[2.5rem] border-2 border-emerald-500/20 bg-card p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
              <div className="space-y-4">
                <Badge className="bg-emerald-500 text-white border-none rounded-lg px-4 py-1.5 font-black text-[10px] tracking-tighter uppercase shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5 mr-2 inline" /> Official Final Thesis Topic
                </Badge>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                  {acceptedTopic.topicTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 font-bold text-foreground bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                    {acceptedTopic.supervisorName}
                    <span className="text-[10px] opacity-40 uppercase ml-2">Official Supervisor</span>
                  </div>
                  {acceptedTopic.companyName && (
                    <div className="flex items-center gap-2 font-bold text-foreground bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                      <Building2 className="w-5 h-5 text-indigo-500" />
                      {acceptedTopic.companyName}
                      <span className="text-[10px] opacity-40 uppercase ml-2">Industry Partner</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center w-full">Accepted</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-muted/30 rounded-3xl p-8 border border-emerald-500/10">
               <div>
                  <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-4">Milestone Progress</h4>
                  <div className="space-y-4">
                     {[
                        { label: 'Topic Confirmed', done: true },
                        { label: 'Expose / Proposal Draft', done: false },
                        { label: 'Registration at University', done: false },
                        { label: 'Research Phase', done: false },
                     ].map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                           <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shadow-sm", step.done ? "bg-emerald-500 text-white" : "bg-white border text-center")}>
                              {step.done ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[8px] font-black">{idx + 1}</span>}
                           </div>
                           <span className={cn("text-xs font-bold", step.done ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="space-y-6">
                  <p className="text-sm font-medium leading-relaxed italic text-muted-foreground border-l-4 border-emerald-200 pl-4">
                     Congratulations! Your thesis project is officially registered on Studyond Orbit. You are now in the planning phase.
                  </p>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-black shadow-xl shadow-emerald-600/20" onClick={() => navigate('/chat')}>
                     <MessageSquare className="w-5 h-5 mr-3" /> Go to Project Workspace
                  </Button>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Active Proposals ── */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Active Proposals</h3>
           <Badge variant="outline" className="rounded-full border-muted-foreground/20 text-[10px]">{otherApplications.length} Positions</Badge>
        </div>

        {otherApplications.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <div className={cn(
              "rounded-[2.5rem] border bg-card/40 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/20",
              app.status === 'rejected' ? "opacity-60 grayscale" : "hover:shadow-xl"
            )}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                 <div className="flex-1 space-y-2">
                    <h4 className="text-xl font-bold tracking-tight">{app.topicTitle}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                       <UserCheck className="w-3 h-3" /> {app.supervisorName} &bull; {app.companyName || 'University'}
                    </p>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="capitalize text-[10px] font-black tracking-widest">
                       {app.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground opacity-60">Applied {new Date(app.contactedAt).toLocaleDateString()}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground font-medium italic">
                  {app.status === 'rejected' ? 'This application was closed.' : 'Status: ' + (app.status === 'contacted' ? 'Awaiting response' : app.status)}
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="rounded-xl h-9 text-[10px] font-black uppercase tracking-tight">Details</Button>
                  <Button size="sm" className="rounded-xl h-9 text-[10px] font-black uppercase tracking-tight" onClick={() => navigate('/chat')}>Discussion</Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {otherApplications.length === 0 && !acceptedTopic && (
          <div className="text-center py-10 text-muted-foreground italic">
             No other active proposals.
          </div>
        )}
      </div>
    </div>
  );
}
