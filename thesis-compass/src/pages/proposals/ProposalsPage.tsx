import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, CheckCircle2, XCircle, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import projectsData from '@/data/projects.json';
import studentsData from '@/data/students.json';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function ProposalsPage() {
  const navigate = useNavigate();
  const formData = useOnboardingStore((state) => state.formData);

  // We only care about proposed projects
  const proposals = projectsData.filter((p) => p.state === 'proposed');

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">
      <header className="flex-none px-6 py-5 border-b border-border bg-card/30 backdrop-blur-sm flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Student Proposals</h1>
            <p className="text-sm text-muted-foreground">Applications and incoming pitches for your open topics.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto p-6 md:p-10 hide-scrollbar">
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Review Inbox ({proposals.length})
            </h2>
            <div className="flex gap-2">
              <span className="text-sm font-medium px-3 py-1.5 bg-muted rounded-md text-foreground">Newest First</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {proposals.map((project, i) => {
              const student = studentsData.find(s => s.id === project.studentId);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={project.id}
                  className="group relative flex flex-col md:flex-row gap-5 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all shadow-sm"
                >
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        {student && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <span className="font-bold text-sm">{student.firstName} {student.lastName}</span>
                            <span className="text-xs text-muted-foreground">&bull; {student.universityName || 'University Student'}</span>
                          </div>
                        )}
                        <h3 className="text-lg md:text-xl font-black leading-tight group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                      </div>
                      <Badge variant="outline" className="shrink-0 ml-4 bg-primary/5 text-primary border-primary/20 uppercase text-[10px] tracking-widest font-black py-1">
                        New pitch
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3">
                      <span className="font-semibold text-foreground/80">Motivation:</span> {project.motivation || "This student didn't write a specific motivation but expressed general interest in your organization and topic area. Usually these are quick applications."}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                      {student?.degree && (
                         <div className="flex items-center gap-1.5 capitalize">
                           <Building2 className="w-3.5 h-3.5" />
                           {student.degree} Program
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0 md:justify-center border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm">
                      <CheckCircle2 className="w-4 h-4" /> Message
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg font-bold text-sm hover:bg-muted/80 transition-colors">
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                    <button className="hidden md:flex w-10 h-10 items-center justify-center text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-colors self-end">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {proposals.length === 0 && (
            <div className="text-center py-24 bg-card/30 rounded-3xl border border-dashed border-border mt-8">
              <h3 className="text-xl font-bold text-foreground mb-2">No active proposals right now</h3>
              <p className="text-muted-foreground">When students pitch you thesis ideas or apply to your topics, they'll appear here.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
