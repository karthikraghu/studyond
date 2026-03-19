import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Database } from "lucide-react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { Button } from "../ui/button";

export function StepSubmission() {
  const navigate = useNavigate();
  const { formData, prevStep, reset } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    
    // 1. Simulating the API Call
    setTimeout(() => {
      // 2. Logging the final validated payload
      console.log("🚀 FINAL PAYLOAD SAVING TO mock-data/db.json:", JSON.stringify(formData, null, 2));
      
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center animate-in zoom-in duration-500">
        <div className="p-4 bg-green-500/10 rounded-full">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">You're All Set!</h2>
          <p className="text-muted-foreground w-3/4 mx-auto">
            Your profile has been created successfully. The console holds your mock JSON payload.
          </p>
        </div>
        <div className="pt-8">
          {/* Typically redirects user to Dashboard here */}
          <Button size="lg" onClick={() => {
            reset();
            navigate("/home");
          }}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Review & Complete</h2>
        <p className="text-muted-foreground mt-1">
          Everything looks great. Ready to dive in?
        </p>
      </div>

      <div className="flex-1 rounded-xl bg-muted/30 border border-muted-foreground/20 p-6 flex flex-col justify-center items-center text-center space-y-4">
        <Database className="w-12 h-12 text-muted-foreground/50" />
        <div>
          <h3 className="font-semibold text-lg">Data Ready for Sync</h3>
          <p className="text-sm text-muted-foreground px-4">
            Clicking finish will write this generated state to your localized <code className="bg-muted px-1 py-0.5 rounded text-primary">mock-data/db.json</code> architecture. Check your browser console!
          </p>
        </div>
        <pre className="text-xs text-left bg-muted p-4 rounded-md w-full max-w-sm mt-4 overflow-x-auto border">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>

      <div className="flex justify-between pt-6 mt-8 border-t">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={prevStep}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button 
          onClick={handleFinalSubmit} 
          disabled={isSubmitting}
          className="min-w-[140px]"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            "Finish Setup"
          )}
        </Button>
      </div>
    </div>
  );
}
