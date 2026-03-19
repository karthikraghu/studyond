/**
 * Matching Engine — Multi-signal topic/supervisor/expert scoring.
 *
 * This is the "Scout Agent" brain. It scores matches between a student's
 * profile/context and the available entities in the Studyond database.
 *
 * Scoring dimensions:
 * - Field Alignment (0-100): Do the topic's fields match the student's?
 * - Skill Fit (0-100): Are the student's skills relevant to the topic?
 * - Degree Match (0-100): Does the topic accept the student's degree?
 * - Career Alignment (0-100): Does the employment type match goals?
 * - Industry Demand (0-100): Based on company and topic type
 */

import type { Topic, Student, Supervisor, Expert, Field, Company } from '@/types';

export interface MatchScore {
  overall: number;
  fieldAlignment: number;
  skillFit: number;
  degreeMatch: number;
  careerAlignment: number;
  industryDemand: number;
}

export interface TopicMatch {
  topic: Topic;
  company: Company | null;
  score: MatchScore;
  reasons: string[];
}

export interface SupervisorMatch {
  supervisor: Supervisor;
  score: number;
  reasons: string[];
}

export interface ExpertMatch {
  expert: Expert;
  company: Company | null;
  score: number;
  reasons: string[];
  availableForInterviews: boolean;
}

// ── Scoring Functions ──

/**
 * Score how well a topic matches a student profile.
 */
export function scoreTopicMatch(
  student: Partial<Student>,
  topic: Topic,
  fields: Field[],
  companies: Company[]
): MatchScore {
  const fieldAlignment = scoreFieldAlignment(student.fieldIds || [], topic.fieldIds, fields);
  const skillFit = scoreSkillFit(student.skills || [], topic.title, topic.description);
  const degreeMatch = scoreDegreeMatch(student.degree || 'msc', topic.degrees);
  const careerAlignment = scoreCareerAlignment(student.objectives || [], topic);
  const industryDemand = scoreIndustryDemand(topic, companies);

  const overall = Math.round(
    fieldAlignment * 0.30 +
    skillFit * 0.25 +
    degreeMatch * 0.15 +
    careerAlignment * 0.15 +
    industryDemand * 0.15
  );

  return { overall, fieldAlignment, skillFit, degreeMatch, careerAlignment, industryDemand };
}

function scoreFieldAlignment(studentFieldIds: string[], topicFieldIds: string[], _fields: Field[]): number {
  if (studentFieldIds.length === 0 || topicFieldIds.length === 0) return 50; // neutral
  const overlap = studentFieldIds.filter(f => topicFieldIds.includes(f)).length;
  const maxPossible = Math.min(studentFieldIds.length, topicFieldIds.length);
  return Math.round((overlap / maxPossible) * 100);
}

function scoreSkillFit(studentSkills: string[], topicTitle: string, topicDescription: string): number {
  if (studentSkills.length === 0) return 50;
  const topicText = `${topicTitle} ${topicDescription}`.toLowerCase();
  const matchingSkills = studentSkills.filter(skill =>
    topicText.includes(skill.toLowerCase())
  );
  // Base score + bonus for each matching skill
  const score = 30 + Math.min(70, (matchingSkills.length / Math.max(1, studentSkills.length)) * 100);
  return Math.round(score);
}

function scoreDegreeMatch(studentDegree: string, topicDegrees: string[]): number {
  if (topicDegrees.length === 0) return 70; // no restriction = good
  return topicDegrees.includes(studentDegree) ? 100 : 20;
}

function scoreCareerAlignment(objectives: string[], topic: Topic): number {
  let score = 50; // neutral base

  if (objectives.includes('topic') && topic.type === 'topic') score += 20;
  if (objectives.includes('career_start') && topic.employment === 'yes') score += 30;
  if (objectives.includes('industry_access') && topic.companyId) score += 20;

  return Math.min(100, score);
}

function scoreIndustryDemand(topic: Topic, companies: Company[]): number {
  let score = 50;

  if (topic.employment === 'yes') score += 20;
  if (topic.employmentType === 'direct_entry') score += 15;
  if (topic.employmentType === 'graduate_program') score += 10;
  if (topic.companyId) {
    const company = companies.find(c => c.id === topic.companyId);
    if (company && company.size === 'large') score += 15;
  }

  return Math.min(100, score);
}

// ── Match Finders ──

/**
 * Find top N matching topics for a student.
 */
export function findTopMatches(
  student: Partial<Student>,
  topics: Topic[],
  fields: Field[],
  companies: Company[],
  topN: number = 5
): TopicMatch[] {
  return topics
    .map(topic => {
      const score = scoreTopicMatch(student, topic, fields, companies);
      const company = topic.companyId
        ? companies.find(c => c.id === topic.companyId) || null
        : null;
      const reasons = generateMatchReasons(score, topic, company, fields);
      return { topic, company, score, reasons };
    })
    .sort((a, b) => b.score.overall - a.score.overall)
    .slice(0, topN);
}

/**
 * Find supervisors whose research interests match a topic or field set.
 */
export function findMatchingSupervisors(
  topicFieldIds: string[],
  topicTitle: string,
  supervisors: Supervisor[],
  topN: number = 5
): SupervisorMatch[] {
  return supervisors
    .map(supervisor => {
      const fieldOverlap = supervisor.fieldIds.filter(f => topicFieldIds.includes(f)).length;
      const titleWords = topicTitle.toLowerCase().split(/\s+/);
      const researchOverlap = supervisor.researchInterests.filter(ri =>
        titleWords.some(w => ri.toLowerCase().includes(w))
      ).length;

      const score = Math.min(100, Math.round(
        (fieldOverlap / Math.max(1, topicFieldIds.length)) * 60 +
        (researchOverlap / Math.max(1, supervisor.researchInterests.length)) * 40
      ));

      const reasons: string[] = [];
      if (fieldOverlap > 0) reasons.push(`${fieldOverlap} overlapping field(s)`);
      if (researchOverlap > 0) reasons.push(`Research interests align: ${supervisor.researchInterests.slice(0, 2).join(', ')}`);

      return { supervisor, score, reasons };
    })
    .filter(m => m.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/**
 * Find experts available for interviews matching a topic or field.
 */
export function findMatchingExperts(
  topicFieldIds: string[],
  topicTitle: string,
  experts: Expert[],
  companies: Company[],
  topN: number = 5
): ExpertMatch[] {
  return experts
    .map(expert => {
      const fieldOverlap = expert.fieldIds.filter(f => topicFieldIds.includes(f)).length;
      const score = Math.min(100, Math.round(
        (fieldOverlap / Math.max(1, topicFieldIds.length)) * 70 +
        (expert.offerInterviews ? 30 : 0)
      ));

      const company = companies.find(c => c.id === expert.companyId) || null;
      const reasons: string[] = [];
      if (fieldOverlap > 0) reasons.push(`${fieldOverlap} overlapping field(s)`);
      if (expert.offerInterviews) reasons.push('Available for interviews');
      if (company) reasons.push(`Works at ${company.name}`);

      return { expert, company, score, reasons, availableForInterviews: expert.offerInterviews };
    })
    .filter(m => m.score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// ── Helpers ──

function generateMatchReasons(
  score: MatchScore,
  topic: Topic,
  company: Company | null,
  fields: Field[]
): string[] {
  const reasons: string[] = [];

  if (score.fieldAlignment >= 70) {
    const fieldNames = topic.fieldIds
      .map(fid => fields.find(f => f.id === fid)?.name)
      .filter(Boolean);
    reasons.push(`Strong field alignment: ${fieldNames.join(', ')}`);
  }
  if (score.skillFit >= 70) reasons.push('Your skills match the topic requirements');
  if (score.degreeMatch === 100) reasons.push('Degree level matches');
  if (score.careerAlignment >= 70) reasons.push('Aligns with your career objectives');
  if (topic.employment === 'yes') reasons.push('Employment opportunity after thesis');
  if (company) reasons.push(`Company: ${company.name}`);

  if (reasons.length === 0) reasons.push('General topic relevance');

  return reasons;
}
