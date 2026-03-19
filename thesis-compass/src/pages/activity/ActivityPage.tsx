import { motion } from 'framer-motion';
import { Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActivityTracker } from '@/components/dashboard/ActivityTracker';

/**
 * ActivityPage — Dedicated view for tracking thesis applications and milestones.
 * Shows recent activity in a clean, focused layout.
 */
export default function ActivityPage() {
  const navigate = useNavigate();

  return (
    <div className="px-6 lg:px-10 py-8 w-full max-w-6xl mx-auto">
      <div className="space-y-8">
        
        {/* ── Header ── */}
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
              <Clock className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                My Activity
              </h1>
              <p className="text-muted-foreground font-medium">Track your thesis applications and upcoming milestones.</p>
            </div>
          </div>
        </motion.div>

        {/* ── Activity Content ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-card/40 backdrop-blur-sm border border-border rounded-[2rem] p-8 min-h-[400px]"
        >
          <ActivityTracker />
        </motion.div>

      </div>
    </div>
  );
}
