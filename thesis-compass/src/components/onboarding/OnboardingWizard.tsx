import { AnimatePresence, motion } from "framer-motion";
import { useOnboardingStore } from "../../store/useOnboardingStore";

// The child steps 
import { StepRoleSelection } from "./StepRoleSelection";
import { StepRoleForms } from "./StepRoleForms";
import { StepSubmission } from "./StepSubmission";
import { StepTopicInquiry } from "./StepTopicInquiry";

export function OnboardingWizard() {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const formData = useOnboardingStore((state) => state.formData);
  const isStudent = formData.role === "student";

  // We use Framer Motion's AnimatePresence to animate components entering 
  // and leaving the DOM. It requires the child to have a unique `key`.
  return (
    <div className="flex w-full min-h-screen items-center justify-center p-6 bg-muted/40">
      <div className="w-full max-w-3xl border rounded-xl bg-background shadow-lg overflow-hidden flex flex-col min-h-[500px]">
        {/* Simple Progress Indicator */}
        <div className="border-b p-4 bg-muted/20">
          <div className={`flex items-center justify-between text-sm font-medium text-muted-foreground ${isStudent ? "w-2/3 max-w-sm" : "w-1/2 max-w-xs"} mx-auto`}>
            <span className={currentStep >= 1 ? "text-primary font-bold" : ""}>1. Role</span>
            <div className={`h-[2px] ${isStudent ? "w-6" : "w-8"} ${currentStep >= 2 ? "bg-primary" : "bg-border"} transition-colors`} />
            <span className={currentStep >= 2 ? "text-primary font-bold" : ""}>2. Details</span>
            <div className={`h-[2px] ${isStudent ? "w-6" : "w-8"} ${currentStep >= 3 ? "bg-primary" : "bg-border"} transition-colors`} />
            <span className={currentStep >= 3 ? "text-primary font-bold" : ""}>3. Review</span>
            {isStudent && (
              <>
                <div className={`h-[2px] w-6 ${currentStep >= 4 ? "bg-primary" : "bg-border"} transition-colors`} />
                <span className={currentStep >= 4 ? "text-primary font-bold" : ""}>4. Status</span>
              </>
            )}
          </div>
        </div>

        <div className="relative flex-1 p-6 sm:p-12 overflow-x-hidden">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <StepRoleSelection />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <StepRoleForms />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <StepSubmission />
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <StepTopicInquiry />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
