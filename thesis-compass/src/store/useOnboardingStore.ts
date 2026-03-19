import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type PartialOnboardingData } from "../types/onboarding";

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
  
  // Confirms the wizard is entirely finished
  completeOnboarding: () => void;
  
  // Let's us easily start over, wiping the slate clean.
  reset: () => void;
}

// ----------------------------------------------------------------------
// 2. Initializing our Store Instance
// ----------------------------------------------------------------------

// We use `create` from Zustand. It provides a `set` hook to mutate state.
// Why Zustand? Because it lets multiple isolated step components read/write to 
// this form without wrapping the whole app in a large React Context provider.
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 1, 
      formData: {},
      isOnboarded: false,
      
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })), // Limit steps
      setStep: (step) => set({ currentStep: step }),

      updateData: (newData) =>
        set((state) => ({
          formData: { ...state.formData, ...newData },
        })),

      completeOnboarding: () => set({ isOnboarded: true }),

      reset: () => set({ currentStep: 1, formData: {}, isOnboarded: false }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => localStorage), 
    }
  )
);
