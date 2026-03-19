
import { User, Building2, GraduationCap } from "lucide-react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { RoleEnum, type OnboardingRole } from "../../types/onboarding";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

const ROLES = [
  {
    id: RoleEnum.enum.student,
    title: "Student",
    description: "I'm writing my thesis and looking for a topic.",
    icon: <User className="w-8 h-8 text-primary" />,
  },
  {
    id: RoleEnum.enum.company,
    title: "Company",
    description: "We are offering thesis topics to students.",
    icon: <Building2 className="w-8 h-8 text-primary" />,
  },
  {
    id: RoleEnum.enum.supervisor,
    title: "Supervisor",
    description: "I oversee students internally or externally.",
    icon: <GraduationCap className="w-8 h-8 text-primary" />,
  },
] as const;

export function StepRoleSelection() {
  const { formData, updateData, nextStep } = useOnboardingStore();
  
  // Notice we pull the role directly from Zustand
  // It guarantees the type matches our Zod inference `OnboardingRole`
  const selectedRole = formData.role;

  const handleSelectRole = (role: OnboardingRole) => {
    // We update the data in the store immediately on click
    updateData({ role });
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome! Who are you?
        </h1>
        <p className="text-muted-foreground">
          Select your role to help us customize your dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {ROLES.map((role) => (
          <Card
            key={role.id}
            onClick={() => handleSelectRole(role.id)}
            className={`
              relative cursor-pointer transition-all hover:shadow-md h-full flex flex-col items-center justify-center p-8 text-center space-y-4
              ${
                selectedRole === role.id 
                  ? "border-primary ring-2 ring-primary ring-offset-2 bg-primary/5 dark:bg-primary/10" 
                  : "border-border hover:border-primary/50"
              }
            `}
          >
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              {role.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{role.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {role.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-8 mt-auto">
        <Button 
          size="lg" 
          disabled={!selectedRole} 
          onClick={nextStep}
          className="w-full md:w-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
