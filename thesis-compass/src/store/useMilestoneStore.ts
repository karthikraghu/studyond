/**
 * Milestone Store — Tracks thesis timeline and progress.
 *
 * Supports the Milestone & Timeline Generator (PRD 6.1.3).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Milestone, MilestoneStatus } from '@/types';

interface MilestoneState {
  milestones: Milestone[];
  completionPercentage: number;

  setMilestones: (milestones: Milestone[]) => void;
  updateMilestoneStatus: (milestoneId: string, status: MilestoneStatus) => void;
  addMilestone: (milestone: Milestone) => void;
}

/**
 * Helper to calculate completion percentage from milestones.
 * This drives the progress indicator on the dashboard.
 */
function calcCompletion(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter((m) => m.status === 'completed').length;
  return Math.round((completed / milestones.length) * 100);
}

export const useMilestoneStore = create<MilestoneState>()(
  persist(
    (set) => ({
      milestones: [],
      completionPercentage: 0,

      setMilestones: (milestones) =>
        set({
          milestones,
          completionPercentage: calcCompletion(milestones),
        }),

      updateMilestoneStatus: (milestoneId, status) =>
        set((state) => {
          const updated = state.milestones.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  status,
                  completedAt: status === 'completed' ? new Date().toISOString() : m.completedAt,
                }
              : m
          );
          return {
            milestones: updated,
            completionPercentage: calcCompletion(updated),
          };
        }),

      addMilestone: (milestone) =>
        set((state) => {
          const updated = [...state.milestones, milestone];
          return {
            milestones: updated,
            completionPercentage: calcCompletion(updated),
          };
        }),
    }),
    {
      name: 'thesis-compass-milestones',
    }
  )
);
