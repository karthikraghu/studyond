import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ValidateTopicPage — UI for the Multi-Agent Thesis Validation System.
 * Focuses on premium UI and clean feedback loops.
 */
export default function ValidateTopicPage() {
  const [topic, setTopic] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<null | 'success'>(null);

  const handleValidate = () => {
    if (!topic.trim()) return;
    setIsValidating(true);
    setResult(null);
    
    // Simulating Multi-Agent Reasoning
    setTimeout(() => {
      setIsValidating(false);
      setResult('success');
    }, 2500);
  };

  return (
    <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto h-full flex flex-col">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-foreground">Describe your topic</label>
            <textarea
              placeholder="e.g., Implementing a RAG pipeline for localized legal documents using open-source LLMs..."
              className="w-full min-h-[200px] p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-[15px]"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              size="lg" 
              onClick={handleValidate} 
              disabled={isValidating || !topic}
              className="gap-2 px-8"
            >
              {isValidating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Search className="w-4 h-4" /> Start Validation</>
              )}
            </Button>
          </div>

          {/* Result Placeholder */}
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20 space-y-4"
            >
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                Validation Complete
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-xl border border-border/50">
                  <h4 className="text-sm font-semibold mb-2">Expert Agent Analysis</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "This topic shows strong potential. The integration of localized documents addresses a specific market gap. 
                    I recommend narrowing the scope to specific jurisdiction laws to ensure data quality..."
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar / Instructions */}
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
      </div>
    </div>
  );
}
