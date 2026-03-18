/**
 * Thesis Context & Stage Types
 *
 * These types model the core domain of Thesis Compass — the accumulated
 * understanding of each student's thesis journey. The ThesisContext is
 * the single most important data structure in the entire system.
 *
 * Key concept: Context Accumulation (PRD 5.2)
 * Every interaction builds a richer ThesisContext, making the system
 * progressively more useful over time.
 */

// The 5 thesis stages represent the student's journey from start to finish.
// Each stage unlocks different features and AI behaviors.
export type ThesisStage =
  | 'orientation'    // Exploring fields, no topic yet
  | 'topic_search'   // Has direction, looking for specific topic + supervisor
  | 'planning'       // Has topic + supervisor, needs structure
  | 'execution'      // Actively researching, needs interviews + tracking
  | 'finalization';  // Writing/submitting, needs deadlines + checklists

export type MethodologyType =
  | 'qualitative'
  | 'quantitative'
  | 'mixed_methods'
  | 'design_based'
  | 'experimental';

/**
 * ThesisContext — the accumulated understanding of each student's journey.
 *
 * This grows richer over time as the student interacts with the platform.
 * In Phase 1 (hackathon), this is persisted in localStorage.
 * In production, this would live in a database.
 */
export interface ThesisContext {
  id: string;
  studentId: string;

  // Journey state — where the student is right now
  currentStage: ThesisStage;
  stageEnteredAt: string;  // ISO timestamp

  // Accumulated interests — built from conversations over time
  topicInterests: string[];
  methodologyPreference: MethodologyType | null;
  careerAspirations: string[];

  // Interaction history — tracks engagement with platform entities
  viewedTopicIds: string[];
  bookmarkedTopicIds: string[];
  appliedTopicIds: string[];
  contactedSupervisorIds: string[];
  contactedExpertIds: string[];

  // Inferred scores — calculated by AI agents
  readinessScore: number;   // 0-1, how ready to proceed to next stage
  urgencyLevel: 'low' | 'moderate' | 'high' | 'critical';

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
