import { z } from 'zod';

// ----------------------------------------------------------------------
// 1. Defining the Base and Role-Specific Schemas
// ----------------------------------------------------------------------

// First, let's define the roles explicitly so we have absolute type safety.
// We use z.enum so we can extract a union type ('student' | 'company' | 'supervisor')
export const RoleEnum = z.enum(["student", "company", "supervisor"]);

// Some steps or fields might be shared, but since the prompt dictates 
// very distinct fields per role, we build them separately.

export const StudentSchema = z.object({
  role: z.literal(RoleEnum.enum.student), // The discriminator key
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  university: z.string().min(2, "University is required"),
  degreeProgram: z.string().min(2, "Degree program is required"),
  // We expect a comma-separated string, but we can refine it if we wanted. 
  // For now, simple string validation suffices.
  techStack: z.string().min(1, "Please list at least one technology"),
});

export const CompanySchema = z.object({
  role: z.literal(RoleEnum.enum.company),
  fullName: z.string().min(2, "Full name is required"),
  workEmail: z.string().email("Invalid email address"),
  companyName: z.string().min(2, "Company name is required"),
  department: z.string().min(2, "Department is required"),
});

export const SupervisorSchema = z.object({
  role: z.literal(RoleEnum.enum.supervisor),
  fullName: z.string().min(2, "Full name is required"),
  workEmail: z.string().email("Invalid email address"),
  affiliationType: z.enum(["university", "company"], {
    message: "Please select an affiliation type",
  }),
  affiliationName: z.string().min(2, "Affiliation name is required"),
  capacity: z.number({ message: "Capacity must be a valid number" })
    .min(1, "Capacity must be at least 1")
    .max(50, "Capacity seems too high"),
});

// ----------------------------------------------------------------------
// 2. The Discriminated Union
// ----------------------------------------------------------------------
// This is the magic. Zod will look at the `role` property in the incoming data. 
// If role === 'student', it applies StudentSchema. If it's 'company', CompanySchema, etc.
// This prevents impossible states (like a Company having a 'university' field).
export const OnboardingFormSchema = z.discriminatedUnion("role", [
  StudentSchema,
  CompanySchema,
  SupervisorSchema,
]);

// ----------------------------------------------------------------------
// 3. TypeScript Inferences
// ----------------------------------------------------------------------

// These are exported so our React components can use exact typings
export type OnboardingRole = z.infer<typeof RoleEnum>;
export type OnboardingData = z.infer<typeof OnboardingFormSchema>;

// Because our multi-step form starts empty, we need a "Partial" version of the data 
// that we can gradually accumulate in the Zustand store step-by-step.
export type PartialOnboardingData = Partial<OnboardingData>;
