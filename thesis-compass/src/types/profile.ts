/**
 * Profile Types — StudentProfile and related types for CV processing and matching
 */

import type {
  Topic,
  Supervisor,
  Company,
} from './matching';

/**
 * GitHubStats — Data fetched from GitHub API for a user
 */
export interface GitHubStats {
  username: string;
  /** Language usage distribution (bytes of code per language) */
  languageStats: Record<string, number>;
  /** Repository topics/tags (e.g., "machine-learning", "react") */
  topics: string[];
  /** Estimated annual commit count */
  totalCommitsYear: number;
}

/**
 * StudentProfile — Extracted from CV/bio text
 * Compatible with the Student interface but includes additional semantic analysis
 */
export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  degree: 'bsc' | 'msc' | 'phd';
  studyProgramId: string | null;
  /** ID of a known Swiss university (e.g., "uni-01" for ETH Zurich), or null if not in database */
  universityId: string | null;
  /** Raw university name extracted from CV (works for any university worldwide) */
  universityName: string | null;
  skills: string[];
  about: string | null;
  objectives: ('topic' | 'supervision' | 'career_start' | 'industry_access' | 'project_guidance')[];
  fieldIds: string[];
  /** Inferred domain expertise tags (e.g., "ml-sustainability", "nlp-specialist") */
  semanticTags: string[];
  /** GitHub profile data (optional, fetched separately from CV) */
  github?: GitHubStats;
  /** Ordered list of preference IDs (from the Preferences page) */
  priorities?: string[];
}

/**
 * GoldenTriangleMatch — A matched (Topic, Supervisor, Company) triple
 */
export interface GoldenTriangleMatch {
  topic: {
    id: string;
    title: string;
    description: string;
    company: string;
    employment: 'yes' | 'no' | 'open';
    employmentType: string | null;
    fields: string[];
    score: number;
  };
  supervisor: {
    id: string;
    name: string;
    university: string;
    researchInterests: string[];
    score: number;
  };
  company: {
    id: string;
    name: string;
    description: string;
    size: string;
  } | null;
  triangleScore: number;
  explanation?: string;
}

/**
 * MatchResult — Response from the match-profile endpoint
 */
export interface MatchResult {
  matches: GoldenTriangleMatch[];
  meta: {
    profileId: string;
    matchCount: number;
    timestamp: string;
  };
}

/**
 * ProcessCVResult — Response from the process-cv endpoint
 */
export interface ProcessCVResult {
  profile: StudentProfile;
  meta: {
    fileName: string;
    textLength: number;
  };
}
