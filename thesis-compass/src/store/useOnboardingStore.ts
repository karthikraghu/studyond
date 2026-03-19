import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type PartialOnboardingData } from "../types/onboarding";
import { type StudentProfile, type GitHubStats } from "../types/profile";

// ----------------------------------------------------------------------
// 1. Defininig the Shape of our Store 
//    What data do we hold? What functions change that data?
// ----------------------------------------------------------------------

// By defining a clear interface, we ensure that anywhere in the app we 
// interact with the store, TypeScript gives us autocomplete and catches bugs.
interface OnboardingStore {
  // --- Data state ---
  currentStep: number;
  formData: PartialOnboardingData; 
  isOnboarded: boolean; // Tracks if they fully finished the wizard
  
  // --- CV Profile state ---
  studentProfile: StudentProfile | null; // Full profile from CV extraction

  // --- GitHub state ---
  githubStats: GitHubStats | null;
  isFetchingGithub: boolean;

  // --- Actions ---
  // Advance or retreat in the wizard flow.
  nextStep: () => void;
  prevStep: () => void;
  
  // Set a specific step (e.g., if they click "Edit Role" later, we jump back to 1).
  setStep: (step: number) => void; 
  
  // As a user types in their form, we merge their input into the accumulated data.
  // We use Partial<PartialOnboardingData> so that we only update the specific 
  // fields they changed (like `{ role: 'student' }`) without erasing the rest.
  updateData: (newData: Partial<PartialOnboardingData>) => void;
  
  // Store the full StudentProfile from CV extraction
  setStudentProfile: (profile: StudentProfile) => void;
  
  // Merge GitHub stats into the student profile
  mergeGithubIntoProfile: () => void;
  
  // Confirms the wizard is entirely finished
  completeOnboarding: () => void;
  
  // Let's us easily start over, wiping the slate clean.
  reset: () => void;

  // Fetches GitHub stats
  fetchGithubStats: (username: string) => Promise<void>;
}

// ----------------------------------------------------------------------
// 2. Initializing our Store Instance
// ----------------------------------------------------------------------

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 1, 
      formData: {},
      isOnboarded: false,
      studentProfile: null,
      githubStats: null,
      isFetchingGithub: false,
      
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })), // Limit steps
      setStep: (step) => set({ currentStep: step }),

      updateData: (newData) =>
        set((state) => ({
          formData: { ...state.formData, ...newData },
        })),
      
      setStudentProfile: (profile) => set({ studentProfile: profile }),
      
      mergeGithubIntoProfile: () => set((state) => {
        if (!state.studentProfile || !state.githubStats) return state;
        return {
          studentProfile: {
            ...state.studentProfile,
            github: state.githubStats,
          },
        };
      }),

      completeOnboarding: () => set({ isOnboarded: true }),

      reset: () => set({ currentStep: 1, formData: {}, isOnboarded: false, studentProfile: null, githubStats: null, isFetchingGithub: false }),

      fetchGithubStats: async (username: string) => {
        set({ isFetchingGithub: true });
        try {
          const res = await fetch(`http://localhost:3001/api/github/${username}`);
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          set({ githubStats: data, isFetchingGithub: false });
        } catch (error) {
          console.error("Error fetching GitHub stats", error);
          set({ isFetchingGithub: false, githubStats: null });
        }
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => localStorage), 
    }
  )
);
