import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Search, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExecutionLog } from './ExecutionLog';
import { ThesisHealthCard, type DefenseCritique } from './ThesisHealthCard';

type Phase = 'INPUT' | 'ANALYZING' | 'RESULT';


/**
 * ValidateTopicPage — UI for the Multi-Agent Thesis Validation System.
 * Focuses on premium UI and clean feedback loops.
 */
export default function ValidateTopicPage() {
  const [topic, setTopic] = useState('');
  const [phase, setPhase] = useState<Phase>('INPUT');
  const [logs, setLogs] = useState<string[]>([]);
  const [healthData, setHealthData] = useState<DefenseCritique | null>(null);
  const [rawFindings, setRawFindings] = useState<any>(null);
  
  // For the human-in-the-loop refinement
  const [refinementText, setRefinementText] = useState('');
  const [threadId] = useState(`thread_${Math.random().toString(36).substring(7)}`);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [topic, refinementText]);

  const handleValidate = async (isRefinement = false) => {
    const pitch = isRefinement ? refinementText : topic;
    if (!pitch.trim()) return;

    if (isRefinement) {
      setRefinementText('');
      // Keep old topic, append refinement
      setTopic(prev => `${prev}\n\n[Refinement]: ${pitch}`);
    }

    setPhase('ANALYZING');
    setLogs(prev => [...prev, `[SYSTEM] Pitch received. Starting validation for thread ${threadId}...`]);
    setHealthData(null);
    setRawFindings(null);

    try {
      const response = await fetch('http://localhost:3001/api/validate-thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialPitch: pitch, threadId })
      });

      if (!response.body) throw new Error("No readable stream available.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventName = line.split('\n')[0].replace('event: ', '');
            const dataStr = line.split('\n')[1].replace('data: ', '');
            const data = JSON.parse(dataStr);

            if (eventName === 'node_update') {
              setLogs(prev => [...prev, `[WORKER: ${data.node}] ${data.message}`]);
              // Keep capturing the latest state snapshot
              if (data.stateSnapshot) {
                setRawFindings((prev: any) => ({
                  ...prev,
                  ...data.stateSnapshot
                }));
              }
            } else if (eventName === 'complete') {
              setLogs(prev => [...prev, '[SYSTEM] Synthesizing final Health Card...']);
              setHealthData(JSON.parse(data.healthCardReport));
              setTimeout(() => setPhase('RESULT'), 1000); // Small delay to let user read the final log
            } else if (eventName === 'error') {
              setLogs(prev => [...prev, `[ERROR] ${data.message}`]);
              setPhase('INPUT');
            }
          }
        }
      }
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] Connection failed: ${err.message}`]);
      setPhase('INPUT');
    }
  };

  return (
    <div className={`px-6 lg:px-10 py-8 mx-auto h-full flex flex-col transition-all duration-500 ease-in-out ${phase === 'RESULT' ? 'max-w-7xl' : 'max-w-5xl'}`}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Topic Validator</h1>
        </div>
        <p className="text-muted-foreground">
          Enter your thesis idea or research question. Our multi-agent system will analyze feasibility, 
          academic rigor, and industry relevance.
        </p>
      </div>

      <div className={`grid grid-cols-1 ${phase === 'RESULT' ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-8 flex-1`}>
        {/* Main Content Area */}
        <div className={`${phase === 'RESULT' ? 'w-full' : 'lg:col-span-2'} space-y-6`}>
          <AnimatePresence mode="popLayout">
            
            {/* Phase 1: Input */}
            {phase === 'INPUT' && (
              <motion.div 
                key="input-phase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-foreground">Describe your topic</label>
                  <textarea
                    ref={textareaRef}
                    placeholder="e.g., Implementing a RAG pipeline for localized legal documents using open-source LLMs..."
                    className="w-full min-h-[150px] p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-[15px]"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    size="lg" 
                    onClick={() => handleValidate(false)} 
                    disabled={!topic.trim()}
                    className="gap-2 px-8"
                  >
                    <Search className="w-4 h-4" /> Start Validation
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Phase 2: Analyzing Log */}
            {phase === 'ANALYZING' && (
              <motion.div
                key="analyzing-phase"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
              >
                 <ExecutionLog logs={logs} />
              </motion.div>
            )}

            {/* Phase 3: Results & Refinement */}
            {phase === 'RESULT' && healthData && (
              <motion.div
                key="result-phase"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <ThesisHealthCard data={healthData} rawFindings={rawFindings} />
                
                {/* Refinement Loop */}
                <div className="w-full mt-6 bg-card border border-border shadow-sm rounded-3xl p-2 relative">
                  <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center w-full">
                    <div className="flex-1 w-full pl-4 pt-4 sm:pt-0">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                         <BrainCircuit className="w-4 h-4 text-primary" />
                         Refine Your Pitch
                      </label>
                      <textarea
                        placeholder="e.g., Let's pivot to data extraction from scanned PDFs..."
                        className="w-full h-[50px] min-h-[50px] bg-transparent outline-none resize-none text-[15px] pt-1"
                        value={refinementText}
                        onChange={(e) => setRefinementText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleValidate(true);
                          }
                        }}
                      />
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => handleValidate(true)} 
                      disabled={!refinementText.trim()}
                      className="rounded-2xl px-6 h-14 shrink-0 w-full sm:w-auto"
                    >
                      <Send className="w-4 h-4 mr-2" /> Refine
                    </Button>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Sidebar / Instructions */}
        {phase !== 'RESULT' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-border bg-muted/30 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" /> How it works
              </h3>
              <ul className="space-y-3">
                {[
                  { title: 'Extraction', desc: 'Identify core keywords and entities.' },
                  { title: 'Feasibility', desc: 'Check if data and methods are realistic.' },
                  { title: 'Literature', desc: 'Briefly scan for existing research gaps.' },
                  { title: 'Industry Connect', desc: 'Match with potential company sponsors.' }
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                      {i+1}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{step.title}</div>
                      <div className="text-[11px] text-muted-foreground">{step.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
