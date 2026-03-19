import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Database, User, Building2, Code2, Github, GraduationCap, Mail } from "lucide-react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function StepSubmission() {
  const navigate = useNavigate();
  const { formData, prevStep, nextStep, completeOnboarding } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log("🚀 PAYLOAD SAVED:", JSON.stringify(formData, null, 2));
      setIsSubmitting(false);
      
      // Only students go to the topic inquiry step
      if (formData.role === "student") {
        nextStep();
      } else {
        // Companies and Supervisors are finished after the review
        completeOnboarding();
        navigate("/home");
      }
    }, 800);
  };
  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Review & Complete</h2>
        <p className="text-muted-foreground mt-1">
          Everything looks great. Ready to dive in?
        </p>
      </div>

      <div className="flex-1 rounded-2xl bg-muted/20 border border-border p-8 space-y-8 overflow-y-auto max-h-[500px]">
        {/* Profile Summary Card */}
        <div className="space-y-6 text-left">
          
          {/* Header section with Role Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{formData.fullName || "New User"}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {"email" in formData ? formData.email : ("workEmail" in formData ? formData.workEmail : "")}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="capitalize px-3 py-1 bg-background">
              {formData.role}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            
            {/* Context-specific details (Student / Company / Supervisor) */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Affiliation</h4>
              
              {formData.role === "student" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">{"university" in formData ? formData.university : "N/A"}</div>
                      <div className="text-xs text-muted-foreground">University</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <GraduationCap className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">{"degreeProgram" in formData ? formData.degreeProgram : "N/A"}</div>
                      <div className="text-xs text-muted-foreground">Degree Program</div>
                    </div>
                  </div>
                </div>
              )}

              {formData.role === "company" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">{"companyName" in formData ? formData.companyName : "N/A"}</div>
                      <div className="text-xs text-muted-foreground">Organization</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Database className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">{"department" in formData ? formData.department : "N/A"}</div>
                      <div className="text-xs text-muted-foreground">Department</div>
                    </div>
                  </div>
                </div>
              )}

              {formData.role === "supervisor" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">{"affiliationName" in formData ? formData.affiliationName : "N/A"}</div>
                      <div className="text-xs text-muted-foreground capitalize">{"affiliationType" in formData ? formData.affiliationType : "Institution"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Up to {"capacity" in formData ? formData.capacity : 0} Students</div>
                      <div className="text-xs text-muted-foreground">Supervision Capacity</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tech Stack & Online Presence */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Expertise & Profile</h4>
              
              <div className="space-y-3">
                {"techStack" in formData && (
                  <div className="flex items-start gap-2.5">
                    <Code2 className="w-4 h-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {formData.techStack?.split(',').map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-primary/5 border border-primary/10 rounded text-[11px] font-medium text-primary">
                            {s.trim()}
                          </span>
                        )) || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Tech Stack</div>
                    </div>
                  </div>
                )}

                {"githubUsername" in formData && formData.githubUsername && (
                  <div className="flex items-start gap-2.5">
                    <Github className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">@{formData.githubUsername}</div>
                      <div className="text-xs text-muted-foreground">GitHub Profile</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
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
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}
