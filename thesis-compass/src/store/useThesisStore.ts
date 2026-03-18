/**
 * Thesis Store — Central state for the student's thesis journey.
 *
 * This is the Zustand equivalent of the ThesisContext from the PRD (Section 8).
 * It holds the accumulated understanding of the student's journey and
 * persists to localStorage so it survives page refreshes.
 *
 * Why Zustand over Context API?
 * - No provider nesting needed
 * - Built-in persist middleware
 * - Selective re-renders (components only re-render for the slices they use)
 * - Much simpler API for a data model this complex
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThesisContext, ThesisStage, MethodologyType } from '@/types';

interface ThesisState {
  // The core thesis context object
  context: ThesisContext | null;

  // Whether the student has completed onboarding
  isOnboarded: boolean;

  // Actions — these are the only way to modify state
  setContext: (context: ThesisContext) => void;
  updateStage: (stage: ThesisStage) => void;
  addTopicInterest: (interest: string) => void;
  setMethodologyPreference: (methodology: MethodologyType) => void;
  addViewedTopic: (topicId: string) => void;
  addBookmarkedTopic: (topicId: string) => void;
  setOnboarded: (value: boolean) => void;
  resetContext: () => void;
}

export const useThesisStore = create<ThesisState>()(
  persist(
    (set) => ({
      context: null,
      isOnboarded: false,

      setContext: (context) => set({ context }),

      updateStage: (stage) =>
        set((state) => ({
          context: state.context
            ? {
                ...state.context,
                currentStage: stage,
                stageEnteredAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      addTopicInterest: (interest) =>
        set((state) => ({
          context: state.context
            ? {
                ...state.context,
                topicInterests: [...new Set([...state.context.topicInterests, interest])],
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      setMethodologyPreference: (methodology) =>
        set((state) => ({
          context: state.context
            ? {
                ...state.context,
                methodologyPreference: methodology,
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      addViewedTopic: (topicId) =>
        set((state) => ({
          context: state.context
            ? {
                ...state.context,
                viewedTopicIds: [...new Set([...state.context.viewedTopicIds, topicId])],
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      addBookmarkedTopic: (topicId) =>
        set((state) => ({
          context: state.context
            ? {
                ...state.context,
                bookmarkedTopicIds: [...new Set([...state.context.bookmarkedTopicIds, topicId])],
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      setOnboarded: (value) => set({ isOnboarded: value }),

      resetContext: () => set({ context: null, isOnboarded: false }),
    }),
    {
      name: 'thesis-compass-context', // localStorage key
    }
  )
);
