import { useNavigate } from "react-router-dom";
import { BookOpen, Search, ArrowRight } from "lucide-react";
import { useOnboardingStore } from "../../store/useOnboardingStore";

/**
 * Step 4: Thesis Topic Inquiry
 * This tells us if they are starting from scratch or if they have something.
 */
export function StepTopicInquiry() {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboardingStore();

  const handleChoice = (hasTopic: boolean) => {
    if (!hasTopic) {
      // If no topic, straight to the dashboard which will likely suggest finding one
      completeOnboarding();
      navigate("/home");
    } else {
      // User has a topic - for now nothing happens as requested
      console.log("User already has a topic!");
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold italic">The Core Question...</h2>
        <p className="text-muted-foreground mt-1 text-base">
          Our Matching engine works best when we know your starting point.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-10">
        <h3 className="text-xl font-medium">Do you already have a thesis topic in mind?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Choice: No Topic (Most common starting point) */}
          <button
            onClick={() => handleChoice(false)}
            className="flex flex-col items-center text-center p-8 bg-muted/20 border-2 border-transparent hover:border-primary/40 hover:bg-primary/5 rounded-2xl transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-8 h-8" />
            </div>
            <div className="font-bold text-lg mb-2">No, I'm Exploring</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I want to discover topics from companies or research areas that match my skills.
            </p>
            <div className="mt-6 flex items-center gap-2 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Start Discovery <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Choice: Has Topic (Already defined) */}
          <button
            onClick={() => handleChoice(true)}
            className="flex flex-col items-center text-center p-8 bg-muted/20 border-2 border-transparent hover:border-primary/40 hover:bg-primary/5 rounded-2xl transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="font-bold text-lg mb-2">Yes, I have one</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I have a title or an area defined and I'm looking for a supervisor or expert.
            </p>
            <div className="mt-6 flex items-center gap-2 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Refine Topic <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      <div className="pt-6 mt-8">
        <p className="text-center text-xs text-muted-foreground">
          You can change your status later in the Chat with Thesis Compass.
        </p>
      </div>
    </div>
  );
}
