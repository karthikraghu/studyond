import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, Github } from "lucide-react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { GithubStatsModal } from "../GitHubStatsModal";

// The schemas & types
import { 
  StudentSchema, 
  CompanySchema, 
  SupervisorSchema 
} from "../../types/onboarding";
import type { StudentProfile } from "../../types/profile";

// Shadcn UI primitives (assuming installed)
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription 
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

// ----------------------------------------------------------------------
// 1. The Student Form
// ----------------------------------------------------------------------
function StudentForm() {
  const { 
    formData, 
    updateData, 
    nextStep, 
    prevStep, 
    setStudentProfile, 
    githubStats, 
    mergeGithubIntoProfile,
    syncProfileFromForm 
  } = useOnboardingStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Initialize strictly with StudentSchema
  const form = useForm<z.infer<typeof StudentSchema>>({
    resolver: zodResolver(StudentSchema),
    // Ensure the default fits
    defaultValues: {
      role: "student" as const,
      fullName: formData.fullName || "",
      email: ("email" in formData ? formData.email : "") || "",
      university: ("university" in formData ? formData.university : "") || "",
      degreeProgram: ("degreeProgram" in formData ? formData.degreeProgram : "") || "",
      techStack: ("techStack" in formData ? formData.techStack : "") || "",
      githubUsername: ("githubUsername" in formData ? formData.githubUsername : "") || "",
    },
  });

  const onSubmit = (data: z.infer<typeof StudentSchema>) => {
    updateData(data);
    // Merge any fetched GitHub stats into the student profile before proceeding
    if (githubStats) {
      mergeGithubIntoProfile();
    }
    // Ensure we have a StudentProfile object (critical for the Match section)
    syncProfileFromForm();
    nextStep();
  };

  // ----------------------------------------------------------------------
  // CV Upload Handler — Calls /api/process-cv endpoint
  // ----------------------------------------------------------------------
  const handleActualCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create FormData and send to backend
      const formDataPayload = new FormData();
      formDataPayload.append("file", file);

      const response = await fetch("http://localhost:3001/api/process-cv", {
        method: "POST",
        body: formDataPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process CV");
      }

      const result = await response.json() as { profile: StudentProfile; meta: { fileName: string; textLength: number } };
      const profile = result.profile;

      // Store the full profile for later matching
      setStudentProfile(profile);

      // Map the extracted profile to form fields
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      const techStack = profile.skills.join(", ");
      
      // Use universityName (extracted from CV) - works for any university worldwide
      // Falls back to empty string if no university was detected
      const university = profile.universityName || "";
      
      // Map degree to degree program
      const degreeMap: Record<string, string> = {
        bsc: "Bachelor's",
        msc: "Master's",
        phd: "PhD",
      };
      const degreeProgram = degreeMap[profile.degree] || profile.degree;

      // Update form fields with extracted data
      form.setValue("fullName", fullName);
      form.setValue("email", profile.email || "");
      form.setValue("university", university);
      form.setValue("degreeProgram", degreeProgram);
      form.setValue("techStack", techStack);
      
      // Trigger RHF to revalidate after setting values programmatically
      form.trigger();
    } catch (error) {
      console.error("CV Upload failed:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to process CV");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Resume Feature - Live File Input */}
      <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl relative overflow-hidden flex flex-col items-center text-center space-y-4">
        <Upload className="w-8 h-8 text-primary/80" />
        <div>
          <h3 className="font-semibold text-lg">AI Resume Extraction</h3>
          <p className="text-sm text-muted-foreground mt-1 px-4">
            Upload your CV (PDF or TXT) and let our AI pre-fill everything in seconds.
          </p>
        </div>
        
        {/* Error message */}
        {uploadError && (
          <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">
            {uploadError}
          </div>
        )}
        
        {/* Hidden File Input activated via a styled Label wrapper acting as a Button */}
        <div className="relative">
          <input
            type="file"
            id="cv-upload"
            className="hidden"
            accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
            onChange={handleActualCVUpload}
            disabled={isUploading}
          />
          <Button 
            asChild
            variant="secondary" 
            disabled={isUploading}
          >
            <label htmlFor="cv-upload" className="cursor-pointer">
              {isUploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting Concepts...</>
              ) : (
                "Upload Resume"
              )}
            </label>
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="university" render={({ field }) => (
              <FormItem>
                <FormLabel>University</FormLabel>
                <FormControl><Input placeholder="TUM Munich" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="degreeProgram" render={({ field }) => (
              <FormItem>
                <FormLabel>Degree Program</FormLabel>
                <FormControl><Input placeholder="B.Sc. Informatics" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField
            control={form.control}
            name="techStack"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tech Stack</FormLabel>
                <FormControl><Input placeholder="React, Node.js, Python..." {...field} /></FormControl>
                <FormDescription>Comma-separated skills</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* GitHub Username field with stats modal trigger */}
          <FormField
            control={form.control}
            name="githubUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Username
                  {/* The info icon — renders the modal if a username is provided */}
                  <GithubStatsModal username={field.value} />
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                    <Input placeholder="your-github-handle" className="pl-7" {...field} />
                  </div>
                </FormControl>
                <FormDescription>Optional · Used to analyze your dev skills for better matches.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-6 border-t mt-8">
            <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>
            <Button type="submit">Verify & Continue</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. The Company Form
// ----------------------------------------------------------------------
function CompanyForm() {
  const { formData, updateData, nextStep, prevStep } = useOnboardingStore();

  const form = useForm<z.infer<typeof CompanySchema>>({
    resolver: zodResolver(CompanySchema),
    defaultValues: {
      role: "company" as const,
      fullName: formData.fullName || "",
      // Important to use the right key based on schema
      workEmail: ("workEmail" in formData ? formData.workEmail : "") || "",
      companyName: ("companyName" in formData ? formData.companyName : "") || "",
      department: ("department" in formData ? formData.department : "") || "",
    },
  });

  const onSubmit = (data: z.infer<typeof CompanySchema>) => {
    updateData(data);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl><Input placeholder="Acme Corp" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl><Input placeholder="Engineering, HR, etc..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem><FormLabel>Your Full Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="workEmail" render={({ field }) => (
            <FormItem><FormLabel>Work Email</FormLabel><FormControl><Input type="email" placeholder="jane.doe@acme.inc" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="flex justify-between pt-6 mt-8">
          <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>
          <Button type="submit">Verify & Continue</Button>
        </div>
      </form>
    </Form>
  );
}

// ----------------------------------------------------------------------
// 3. The Supervisor Form
// ----------------------------------------------------------------------
function SupervisorForm() {
  const { formData, updateData, nextStep, prevStep } = useOnboardingStore();

  const form = useForm<z.infer<typeof SupervisorSchema>>({
    resolver: zodResolver(SupervisorSchema),
    defaultValues: {
      role: "supervisor" as const,
      fullName: formData.fullName || "",
      workEmail: ("workEmail" in formData ? formData.workEmail : "") || "",
      affiliationType: ("affiliationType" in formData ? formData.affiliationType : undefined) as "university" | "company" | undefined,
      affiliationName: ("affiliationName" in formData ? formData.affiliationName : "") as string,
      capacity: ("capacity" in formData ? formData.capacity : 5) as number,
    },
  });

  const onSubmit = (data: z.infer<typeof SupervisorSchema>) => {
    updateData(data);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="affiliationType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>I am affiliated with a...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-6"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="university" /></FormControl>
                    <FormLabel className="font-normal cursor-pointer">University</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="company" /></FormControl>
                    <FormLabel className="font-normal cursor-pointer">Company</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name="affiliationName" render={({ field }) => (
          <FormItem><FormLabel>Affiliation Name</FormLabel><FormControl><Input placeholder="MIT, Google, etc..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="capacity" render={({ field }) => (
          <FormItem>
            <FormLabel>Capacity</FormLabel>
            <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 5" 
                    {...field} 
                    onChange={(e) => {
                      const val = e.target.valueAsNumber;
                      field.onChange(isNaN(val) ? "" : val);
                    }}
                  />
                </FormControl>
            <FormDescription>Max students you can supervise.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem><FormLabel>Your Full Name</FormLabel><FormControl><Input placeholder="Dr. Smith" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="workEmail" render={({ field }) => (
            <FormItem><FormLabel>Work Email</FormLabel><FormControl><Input type="email" placeholder="smith@university.edu" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="flex justify-between pt-6 mt-8">
          <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>
          <Button type="submit">Verify & Continue</Button>
        </div>
      </form>
    </Form>
  );
}

// ----------------------------------------------------------------------
// Main Orchestrating Wrapper
// ----------------------------------------------------------------------
export function StepRoleForms() {
  const role = useOnboardingStore((state) => state.formData.role);

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Just a few details...</h2>
        <p className="text-muted-foreground mt-1">
          Tell us more about yourself to personalize your experience.
        </p>
      </div>

      {role === "student" && <StudentForm />}
      {role === "company" && <CompanyForm />}
      {role === "supervisor" && <SupervisorForm />}
      
      {!role && (
        <div className="text-destructive font-semibold">
           Error: Role not selected! Please restart.
        </div>
      )}
    </div>
  );
}
