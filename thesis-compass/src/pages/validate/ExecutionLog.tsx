import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, 
  BookOpen, 
  CheckCircle2, 
  Loader2,
  ServerCog,
  ShieldCheck,
  Network,
  Users
} from 'lucide-react';

interface ExecutionLogProps {
  logs: string[];
}

type NodeId = 'system' | 'professor' | 'assistant' | 'chair';

interface NodeData {
  status: 'idle' | 'active' | 'completed';
  message: string;
}

export function ExecutionLog({ logs }: ExecutionLogProps) {
  const nodeStates = useMemo(() => {
    const states: Record<NodeId, NodeData> = {
      system: { status: 'idle', message: 'Waiting for input...' },
      professor: { status: 'idle', message: 'Ready to refine pitch' },
      assistant: { status: 'idle', message: 'Pending' },
      chair: { status: 'idle', message: 'Waiting for reviews' },
    };

    const touches: Record<NodeId, boolean> = {
      system: false, professor: false, assistant: false, chair: false
    };

    let lastActive: NodeId | null = null;

    logs.forEach(log => {
      let id: NodeId | null = null;
      let msg = log;

      if (log.includes('[SYSTEM] Pitch received')) id = 'system';
      else if (log.includes('[WORKER: professor]')) id = 'professor';
      else if (log.includes('[WORKER: assistant]')) id = 'assistant';
      else if (log.includes('[WORKER: chair]')) id = 'chair';
      else if (log.includes('[SYSTEM] Synthesizing')) id = 'chair'; // fallback map
      else if (log.includes('[ERROR]')) id = 'system'; // Assign errors to system root

      if (id) {
        msg = log.replace(/\[.*?\]/, '').trim();
        
        if (lastActive && lastActive !== id) {
          states[lastActive].status = 'completed';
        }
        
        states[id] = { status: 'active', message: msg };
        touches[id] = true;
        lastActive = id;
      } else if (lastActive) {
        // Fallback for multi-line logs applying to the last active node
        states[lastActive].message = log.replace(/\[.*?\]/, '').trim();
      }
    });

    // Mark previously touched nodes as completed if they aren't currently active
    (Object.keys(touches) as NodeId[]).forEach(k => {
      if (touches[k] && k !== lastActive) {
        states[k].status = 'completed';
      }
    });

    return states;
  }, [logs]);

  const configs: Record<NodeId, any> = {
    system: { icon: BrainCircuit, title: 'System Handler', color: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500/10', ping: 'bg-blue-400' },
    professor: { icon: Users, title: 'The Professor', color: 'text-indigo-500', border: 'border-indigo-500', bg: 'bg-indigo-500/10', ping: 'bg-indigo-400' },
    assistant: { icon: BookOpen, title: 'Assistant Researcher', color: 'text-purple-500', border: 'border-purple-500', bg: 'bg-purple-500/10', ping: 'bg-purple-400' },
    chair: { icon: ShieldCheck, title: 'Defense Chair', color: 'text-emerald-500', border: 'border-emerald-500', bg: 'bg-emerald-500/10', ping: 'bg-emerald-400' },
  };

  const AgentNode = ({ id }: { id: NodeId }) => {
    const state = nodeStates[id];
    const config = configs[id];
    const Icon = config.icon;
    
    const isActive = state.status === 'active';
    const isCompleted = state.status === 'completed';

    let borderClass = 'border-border/60';
    let bgClass = 'bg-card/50';
    let opacityClass = 'opacity-40';

    if (isActive) {
      borderClass = `${config.border} shadow-sm shadow-primary/5`;
      bgClass = config.bg;
      opacityClass = 'opacity-100';
    } else if (isCompleted) {
      borderClass = `border-emerald-500/30`;
      bgClass = `bg-emerald-500/5`;
      opacityClass = 'opacity-90';
    }

    return (
      <motion.div 
        animate={{ scale: isActive ? 1.02 : 1 }}
        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${borderClass} ${bgClass} ${opacityClass} flex flex-col gap-2 w-full text-left`}
      >
         {isActive && (
            <div className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.ping} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${config.ping.replace('/60', '')}`}></span>
            </div>
         )}
         {isCompleted && (
            <div className="absolute -top-2 -right-2 bg-background rounded-full">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
         )}
         
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isActive ? 'bg-background/80 shadow-sm' : 'bg-muted'} shrink-0`}>
            {isActive ? <Loader2 className={`w-4 h-4 animate-spin ${config.color}`} /> : <Icon className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : 'text-muted-foreground'}`} />}
          </div>
          <h3 className={`font-bold text-sm leading-tight ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{config.title}</h3>
        </div>
        
        <div className={`text-[13px] mt-1 transition-all w-full line-clamp-2 min-h-[38px] ${isActive ? 'text-foreground/90 font-medium' : 'text-muted-foreground italic'}`}>
          {state.message}
        </div>
      </motion.div>
    );
  };

  const VLine = ({ active }: { active: boolean }) => (
    <div className="w-0.5 h-6 bg-border/50 mx-auto relative overflow-hidden">
      {active && (
        <motion.div 
          initial={{ y: '-100%' }}
          animate={{ y: '100%' }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-full h-full bg-primary"
        />
      )}
    </div>
  );

  return (
    <div className="w-full bg-card/30 rounded-[2rem] border border-border/80 shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center">
       <div className="mb-8 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
         <div>
           <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
             <Network className="w-4 h-4 text-primary" />
             Mentorship Committee Flow
           </h2>
           <p className="text-[13px] text-muted-foreground mt-1">Real-time linear agent orchestration</p>
         </div>
         {logs.length > 0 && nodeStates.chair.status !== 'completed' && (
           <div className="flex items-center gap-2 text-[13px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full whitespace-nowrap">
             <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing
           </div>
         )}
       </div>

       <div className="flex flex-col items-center w-full max-w-sm mx-auto">
         
         <div className="w-full">
           <AgentNode id="system" />
         </div>
         <VLine active={nodeStates.system.status === 'active' || nodeStates.professor.status === 'active' || nodeStates.system.status === 'completed'} />

         <div className="w-full">
           <AgentNode id="professor" />
         </div>
         <VLine active={nodeStates.professor.status === 'completed' && !nodeStates.chair.status.includes('active')} />
         
         <div className="w-full">
           <AgentNode id="assistant" />
         </div>
         <VLine active={nodeStates.assistant.status === 'completed'} />

         <div className="w-full">
           <AgentNode id="chair" />
         </div>

       </div>
    </div>
  );
}
