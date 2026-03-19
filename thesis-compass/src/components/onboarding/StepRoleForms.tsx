import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload } from "lucide-react";
import { useOnboardingStore } from "../../store/useOnboardingStore";

// The schemas & types
import { 
  StudentSchema, 
  CompanySchema, 
  SupervisorSchema 
} from "../../types/onboarding";
import { mockExtractedCVData } from "../../mock-data/onboardingMockData";

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
  const { formData, updateData, nextStep, prevStep } = useOnboardingStore();
  const [isUploading, setIsUploading] = useState(false);

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
    },
  });

  const onSubmit = (data: z.infer<typeof StudentSchema>) => {
    updateData(data);
    nextStep();
  };

  // ----------------------------------------------------------------------
  // HANDOFF CONTEXT FOR TEAMMATE (Backend / AI parsing integration)
  // ----------------------------------------------------------------------
  // 1. You receive the `File` object from the standard HTML input below.
  // 2. You will likely create a FormData object:
  //    const formData = new FormData();
  //    formData.append("cv", file);
  // 3. Send to your endpoint (e.g. FastAPI / Python backend) using fetch/axios.
  // 4. Await the JSON response containing the extracted structured data.
  // 5. Use `form.setValue(key, response.value)` to auto-fill the React Hook Form.
  // 6. Call `form.trigger()` instantly so the UI removes validation error warnings.
  const handleActualCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // TODO (Teammate): Insert your actual fetch/axios call to the AI parser here:
      // const response = await uploadFileToPythonParser(file);
      // const aiExtractedData = response.data;

      // ----------------------------------------------------------------------
      // [TEMPORARY MOCK FOR HACKATHON DEMO UNTIL BACKEND IS READY] 
      // We simulate a 2-second backend delay, then auto-fill data using our mock.
      // ----------------------------------------------------------------------
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const aiExtractedData = mockExtractedCVData;

      // Updating the form fields with extracted data
      form.setValue("fullName", aiExtractedData.fullName);
      form.setValue("email", aiExtractedData.email);
      form.setValue("university", aiExtractedData.university);
      form.setValue("degreeProgram", aiExtractedData.degreeProgram);
      form.setValue("techStack", aiExtractedData.techStack);
      
      // Trigger RHF to revalidate after setting values programmatically
      form.trigger();
    } catch (error) {
      console.error("CV Upload failed:", error);
      // TODO: Add toast notification for failed uploads
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
            Upload your CV (PDF/Word) and let our AI pre-fill everything in seconds.
          </p>
        </div>
        
        {/* Hidden File Input activated via a styled Label wrapper acting as a Button */}
        <div className="relative">
          <input
            type="file"
            id="cv-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
