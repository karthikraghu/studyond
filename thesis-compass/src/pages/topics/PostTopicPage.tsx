import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  Sparkles,
  Users,
  Building2,
  ListPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function PostTopicPage() {
  const navigate = useNavigate();
  const formData = useOnboardingStore((state) => state.formData);
  const companyName = "schoolOrCompany" in formData ? formData.schoolOrCompany : "Your Company";

  const [step, setStep] = useState(1);
  const [topicData, setTopicData] = useState({
    title: '',
    description: '',
    requirements: '',
    type: 'master', // bachelor, master, phd
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Wait a bit, then redirect home
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    }, 1500);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-card/50 backdrop-blur-sm border border-border p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight">Topic Posted!</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Your thesis topic <span className="font-semibold text-foreground">"{topicData.title}"</span> is now live. We'll start matching it with top students.
          </p>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-none px-6 lg:px-12 py-5 border-b border-border bg-card/30 backdrop-blur-sm flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Create Thesis Topic
            </h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span className={cn(step >= 1 && "text-primary font-bold")}>1. Details</span>
          <span className="w-4 h-px bg-border"></span>
          <span className={cn(step >= 2 && "text-primary font-bold")}>2. Requirements</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-3xl mx-auto px-6 py-10 pb-24">
          
          <motion.div
             key={step}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {step === 1 && (
                <>
                  <div className="space-y-2 mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-foreground">What's the research challenge?</h2>
                    <p className="text-lg text-muted-foreground">Define the core problem you want students to solve at {companyName}.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground flex items-center gap-2">
                        Topic Title <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={topicData.title}
                        onChange={(e) => setTopicData({...topicData, title: e.target.value})}
                        placeholder="e.g. Applying Federated Learning to Network Optimization"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm text-lg font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground flex items-center gap-2">
                        Challenge Description <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={topicData.description}
                        onChange={(e) => setTopicData({...topicData, description: e.target.value})}
                        placeholder="Describe the context, the core problem, and what a successful outcome looks like..."
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2 mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-foreground">Who are you looking for?</h2>
                    <p className="text-lg text-muted-foreground">Specify the required background and academic level.</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground">Academic Level</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { id: 'bachelor', label: 'Bachelor' },
                          { id: 'master', label: 'Master' },
                          { id: 'phd', label: 'PhD' }
                        ].map((lvl) => (
                          <button
                            type="button"
                            key={lvl.id}
                            onClick={() => setTopicData({...topicData, type: lvl.id})}
                            className={cn(
                              "px-4 py-4 rounded-xl border text-center font-bold text-sm transition-all",
                              topicData.type === lvl.id 
                                ? "bg-primary/10 border-primary text-primary shadow-sm" 
                                : "bg-card border-border text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            {lvl.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Required Skills & Background</label>
                      <textarea
                        rows={5}
                        value={topicData.requirements}
                        onChange={(e) => setTopicData({...topicData, requirements: e.target.value})}
                        placeholder="e.g. Python, PyTorch, Background in Telecommunications..."
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-8 border-t border-border flex justify-end gap-3 fixed bottom-0 w-full left-0 right-0 p-6 bg-card/80 backdrop-blur-md md:relative md:bg-transparent md:backdrop-blur-none md:p-0 md:border-none">
                <button
                  type="submit"
                  disabled={isSubmitting || !topicData.title}
                  className="px-8 py-3.5 bg-primary text-white font-black rounded-xl shadow-lg hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing...
                    </span>
                  ) : (
                    <>
                      {step === 1 ? 'Continue' : 'Publish Topic'} 
                      {step === 1 && <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
