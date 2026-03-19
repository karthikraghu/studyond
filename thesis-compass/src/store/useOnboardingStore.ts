import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type PartialOnboardingData } from "../types/onboarding";
import { type StudentProfile, type GitHubStats } from "../types/profile";

// ----------------------------------------------------------------------
// 1. Defininig the Shape of our Store 
// ----------------------------------------------------------------------

export interface ThesisApplication {
  id: string;
  topicId: string;
  topicTitle: string;
  supervisorId: string;
  supervisorName: string;
  companyName?: string;
  status: 'contacted' | 'reviewing' | 'accepted' | 'rejected';
  contactedAt: string;
}

interface OnboardingStore {
  // --- Data state ---
  currentStep: number;
  formData: PartialOnboardingData; 
  isOnboarded: boolean; 
  
  // --- CV Profile state ---
  studentProfile: StudentProfile | null; 

  // --- GitHub state ---
  githubStats: GitHubStats | null;
  isFetchingGithub: boolean;

  // --- Application state ---
  applications: ThesisApplication[];

  // --- Actions ---
  trackApplication: (app: Omit<ThesisApplication, 'id' | 'contactedAt' | 'status'>) => void;
  updateApplicationStatus: (id: string, status: ThesisApplication['status']) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void; 
  updateData: (newData: Partial<PartialOnboardingData>) => void;
  
  // Store the full StudentProfile from CV extraction
  setStudentProfile: (profile: StudentProfile) => void;
  
  // Merge GitHub stats into the student profile
  mergeGithubIntoProfile: () => void;

  // Persist ranked preferences from the Preferences page
  setPriorities: (priorities: string[]) => void;
  
  // Sync form data into a StudentProfile (fallback if CV upload is skipped)
  syncProfileFromForm: () => void;
  
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
      applications: [],

      trackApplication: (appData: Omit<ThesisApplication, 'id' | 'contactedAt' | 'status'>) => set((state) => ({
        applications: [
          ...state.applications,
          {
            ...appData,
            id: `app-${Math.random().toString(36).substr(2, 9)}`,
            status: 'contacted',
            contactedAt: new Date().toISOString()
          }
        ]
      })),

      updateApplicationStatus: (id: string, status: ThesisApplication['status']) => set((state) => ({
        applications: state.applications.map(app => 
          app.id === id ? { ...app, status } : app
        )
      })),
      
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
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

      setPriorities: (priorities) => set((state) => ({
        formData: {
          ...(state.formData as Record<string, unknown>),
          priorities,
        } as PartialOnboardingData,
        studentProfile: state.studentProfile
          ? {
              ...state.studentProfile,
              priorities,
            }
          : state.studentProfile,
      })),

      syncProfileFromForm: () => set((state) => {
        if (state.formData.role !== 'student') return state;
        
        const existing = state.studentProfile;
        const data = state.formData;

        // Build a profile shell from form data
        const newProfile: StudentProfile = {
          id: existing?.id || `student-${Math.random().toString(36).substr(2, 9)}`,
          firstName: existing?.firstName || data.fullName?.split(' ')[0] || 'Student',
          lastName: existing?.lastName || data.fullName?.split(' ').slice(1).join(' ') || '',
          email: existing?.email || data.email || null,
          degree: existing?.degree || (data.degreeProgram?.toLowerCase().includes('master') ? 'msc' : 'bsc'),
          studyProgramId: existing?.studyProgramId || null,
          universityId: existing?.universityId || null,
          universityName: existing?.universityName || data.university || null,
          skills: (existing?.skills && existing.skills.length > 0) ? existing.skills : (data.techStack?.split(',').map(s => s.trim()) || []),
          about: existing?.about || null,
          objectives: existing?.objectives || ['topic'],
          fieldIds: existing?.fieldIds || [],
          semanticTags: existing?.semanticTags || [],
          otherInformation: existing?.otherInformation || null,
          github: state.githubStats || undefined,
          priorities: data.priorities || []
        };

        return { studentProfile: newProfile };
      }),

      completeOnboarding: () => set({ isOnboarded: true }),

      reset: () => set({ 
        currentStep: 1, 
        formData: {}, 
        isOnboarded: false, 
        studentProfile: null, 
        githubStats: null, 
        isFetchingGithub: false 
      }),

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
