/**
 * Timeline & Milestone Types
 *
 * These types support the Milestone & Timeline Generator (PRD 6.1.3)
 * and the Continuous Discovery Agent alerts (PRD 6.3).
 */

export type MilestoneCategory =
  | 'topic'
  | 'supervisor'
  | 'literature'
  | 'methodology'
  | 'data_collection'
  | 'analysis'
  | 'writing'
  | 'review'
  | 'submission';

export type MilestoneStatus = 'upcoming' | 'in_progress' | 'completed' | 'overdue';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  targetWeek: number;
  status: MilestoneStatus;
  category: MilestoneCategory;
  completedAt: string | null;
  createdAt: string;
}

// -- Alert Types (Continuous Discovery Agent) --

export type AlertType =
  | 'new_topic_match'
  | 'supervisor_availability'
  | 'expert_joined'
  | 'peer_activity'
  | 'deadline_reminder'
  | 'milestone_nudge';

export interface Alert {
  id: string;
  studentId: string;
  type: AlertType;
  title: string;
  body: string;
  relevanceScore: number;  // 0-1
  entityType: 'topic' | 'supervisor' | 'expert' | 'peer' | 'deadline';
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

// -- Networking Suggestion Types (Proactive Networking Agent) --

export interface NetworkingSuggestion {
  id: string;
  studentId: string;
  expertId: string;
  reason: string;
  relevanceScore: number;
  stage: import('./thesis').ThesisStage;
  status: 'suggested' | 'viewed' | 'connected' | 'dismissed';
  createdAt: string;
}
