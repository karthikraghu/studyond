import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data imports for lookup
import supervisorsData from '@/mock-data/supervisors.json';
import universitiesData from '@/mock-data/universities.json';

export function ActivityTracker() {
  const { applications } = useOnboardingStore();

  const getSupervisorInfo = (supervisorId: string) => {
    const supervisor = supervisorsData.find(s => s.id === supervisorId);
    if (!supervisor) return { name: 'Unknown Supervisor', university: 'Unknown University' };

    const university = universitiesData.find(u => u.id === supervisor.universityId);
    return {
      name: `${supervisor.title || ''} ${supervisor.firstName} ${supervisor.lastName}`.trim(),
      universityName: university ? university.name : 'Unknown University'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contacted': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'reviewing': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'accepted': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'rejected': return 'bg-rose-500/10 text-rose-600 border-rose-200';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-border rounded-xl bg-muted/[0.02]">
            <p className="text-[11px] text-muted-foreground font-medium italic">No active milestones recorded.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {applications.slice().reverse().map((app, i) => {
              const { universityName } = getSupervisorInfo(app.supervisorId);
              
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full relative p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                >
                  <div className="space-y-1.5">
                    {/* Topic Row */}
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-lg">✈️</span>
                       <h4 className="text-[14px] font-bold text-foreground leading-snug">
                         {app.topicTitle}
                       </h4>
                    </div>

                    {/* Metadata Column */}
                    <div className="pl-7 space-y-1">
                      <p className="text-[12px] font-medium text-muted-foreground leading-none">
                        {app.supervisorName}
                      </p>
                      <p className="text-[12px] font-medium text-muted-foreground/60 leading-none">
                        {universityName}
                      </p>
                    </div>

                    {/* Footer Row: Date + Status */}
                    <div className="pl-7 pt-4 flex items-center justify-between">
                       <span className="text-[11px] font-bold text-muted-foreground/40 tabular-nums">
                         {new Date(app.contactedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                       <Badge 
                         variant="outline" 
                         className={cn(
                           "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border",
                           getStatusColor(app.status)
                         )}
                       >
                         {app.status}
                       </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
