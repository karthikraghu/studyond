import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight, Wand2 } from "lucide-react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { Button } from "../ui/button";

/**
 * Step 5: Thesis Topic Details
 * Allows the student to describe their existing topic.
 */
export function StepTopicDetails() {
  const navigate = useNavigate();
  const { formData, updateData, completeOnboarding, syncProfileFromForm } = useOnboardingStore();
  const [description, setDescription] = useState((formData as any).thesisTopicDescription || "");

  const handleComplete = () => {
    if (description.trim().length < 10) return;
    
    updateData({ thesisTopicDescription: description });
    // Important: sync the form data into the profile so the matching engine can use it
    syncProfileFromForm();
    completeOnboarding();
    navigate("/matches", { state: { fromMatches: true }, replace: true });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold italic">Tell us about your topic</h2>
        <p className="text-muted-foreground mt-1 text-base">
          Describe the area, problem, or title you're working on. Our AI will find the best supervisors and industry experts to help you connect.
        </p>
      </div>

      <div className="flex-1 space-y-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., I'm researching how Decentralized Identifiers (DIDs) can be used to improve privacy in electronic health records using Zero-Knowledge Proofs..."
            className="relative w-full min-h-[200px] p-6 bg-background border-2 border-muted rounded-2xl focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all resize-none text-lg leading-relaxed outline-none"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-muted-foreground text-xs font-medium bg-muted/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <Wand2 className="w-3.5 h-3.5 text-primary" />
            AI will analyze this for matching
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-4 items-start">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Next: Connection Discovery</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Based on your description, we'll search for research areas, supervisors, and companies that align with your work.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8 flex justify-end">
        <Button 
          onClick={handleComplete}
          disabled={description.trim().length < 10}
          className="h-12 px-8 rounded-xl font-bold text-lg flex gap-2 group shadow-lg shadow-primary/20"
        >
          Complete Onboarding
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
