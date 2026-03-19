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
 *
 * Enhanced with:
 * - Golden Triangle matching (Topic × Supervisor × Company)
 * - Semantic vector search via Pinecone
 */

import type { Topic, Student, Supervisor, Expert, Field, Company, University } from '@/types';
import type { StudentProfile, GoldenTriangleMatch } from '@/types/profile';
import { getVectorStore, type VectorSearchResult } from './vector-store';
import { normalizePriorityId, parseCustomPreferenceLabel } from '@/config/preferences';

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
  
  // Description alignment for matching existing topics
  const descriptionAlignment = scoreDescriptionAlignment(student.about || "", topic.title, topic.description);

  const overall = Math.round(
    fieldAlignment * 0.25 +
    skillFit * 0.20 +
    degreeMatch * 0.10 +
    careerAlignment * 0.10 +
    industryDemand * 0.10 +
    descriptionAlignment * 0.25
  );

  return { overall, fieldAlignment, skillFit, degreeMatch, careerAlignment, industryDemand };
}

/**
 * Poor man's semantic search: check for keyword overlap between the student's topic 
 * and the platform topic.
 */
function scoreDescriptionAlignment(studentAbout: string, topicTitle: string, topicDescription: string): number {
  if (!studentAbout || studentAbout.length < 10) return 50;
  
  const studentWords = new Set(studentAbout.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3));
  const topicWords = new Set(`${topicTitle} ${topicDescription}`.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3));
  
  if (studentWords.size === 0) return 50;

  let matches = 0;
  studentWords.forEach(word => {
    if (topicWords.has(word)) matches++;
  });

  const overlap = (matches / Math.sqrt(studentWords.size * topicWords.size));
  return Math.min(100, 40 + Math.round(overlap * 120)); // Base 40 + boost
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
  _topicTitle: string,
  supervisors: Supervisor[],
  topN: number = 5
): SupervisorMatch[] {
  return supervisors
    .map(supervisor => {
      const fieldOverlapCount = supervisor.fieldIds.filter(f => topicFieldIds.includes(f)).length;
      const titleWords = topicTitle.toLowerCase().split(/\s+/);
      const researchOverlap = supervisor.researchInterests.filter(ri =>
        titleWords.some(w => ri.toLowerCase().includes(w))
      ).length;

      const score = Math.min(100, Math.round(
        (fieldOverlapCount / Math.max(1, topicFieldIds.length)) * 60 +
        (researchOverlap / Math.max(1, supervisor.researchInterests.length)) * 40
      ));

      const reasons: string[] = [];
      if (fieldOverlapCount > 0) reasons.push(`${fieldOverlapCount} overlapping field(s)`);
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
  _topicTitle: string,
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

// ── Golden Triangle Matching ──

/**
 * Calculate Jaccard similarity between two field ID arrays
 */
function fieldOverlap(fields1: string[], fields2: string[]): number {
  const set1 = new Set(fields1);
  const intersection = fields2.filter(f => set1.has(f));
  const union = new Set([...fields1, ...fields2]);
  return union.size === 0 ? 0 : intersection.length / union.size;
}

/**
 * Calculate GitHub-based bonus score for a topic.
 * Looks for overlap between GitHub languages/topics and topic description/title.
 */
function calculateGitHubBonus(profile: StudentProfile, topic: Topic): number {
  if (!profile.github) return 0;
  
  const topicText = `${topic.title} ${topic.description || ''}`.toLowerCase();
  let bonus = 0;
  
  // Check if any of the student's top GitHub languages appear in the topic
  const topLanguages = Object.entries(profile.github.languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang]) => lang.toLowerCase());
  
  const langMatches = topLanguages.filter(lang => topicText.includes(lang)).length;
  bonus += langMatches * 0.05; // 5% bonus per matching language (up to 25%)
  
  // Check if any GitHub topics overlap with the topic content
  const topicMatches = profile.github.topics.filter(ghTopic => {
    const normalized = ghTopic.toLowerCase().replace(/-/g, ' ');
    return topicText.includes(normalized) || topicText.includes(ghTopic.toLowerCase());
  }).length;
  bonus += Math.min(topicMatches * 0.04, 0.2); // 4% bonus per topic match (capped at 20%)
  
  // Small bonus for active GitHub presence (commit activity)
  if (profile.github.totalCommitsYear > 100) {
    bonus += 0.05; // 5% bonus for active contributor
  }
  
  return Math.min(bonus, 0.3); // Cap total GitHub bonus at 30%
}

function scorePriorityById(
  priorityId: string,
  profile: StudentProfile,
  topic: Topic,
  company: Company | null,
  fields: Field[]
): number {
  const normalizedId = normalizePriorityId(priorityId);
  const topicText = `${topic.title} ${topic.description || ''}`.toLowerCase();

  switch (normalizedId) {
    case 'research_field': {
      const overlap = fieldOverlap(profile.fieldIds || [], topic.fieldIds || []);
      return overlap;
    }
    case 'compensation':
      if (topic.employment === 'yes') return 1;
      if (topic.employment === 'open') return 0.7;
      return 0.2;
    case 'career_growth':
      if (topic.employmentType === 'direct_entry' || topic.employmentType === 'graduate_program') return 1;
      if (topic.employmentType === 'internship' || topic.employmentType === 'working_student') return 0.75;
      if (topic.employment === 'open') return 0.6;
      return 0.35;
    case 'workplace_flexibility':
      if (topic.workplaceType === 'remote') return 1;
      if (topic.workplaceType === 'hybrid') return 0.85;
      if (topic.workplaceType === 'on_site') return 0.35;
      return 0.5;
    case 'company_reputation':
      if (!company) return 0.45;
      if (company.size === 'large') return 1;
      if (company.size === 'medium') return 0.75;
      return 0.55;
    case 'sustainability_impact': {
      const sustainabilityKeywords = ['sustainability', 'climate', 'carbon', 'emission', 'circular', 'esg', 'green'];
      const matches = sustainabilityKeywords.filter((keyword) => topicText.includes(keyword)).length;
      return Math.min(1, matches / 2);
    }
    case 'ai_innovation': {
      const aiKeywords = ['ai', 'machine learning', 'deep learning', 'llm', 'predictive', 'computer vision', 'data'];
      const matches = aiKeywords.filter((keyword) => topicText.includes(keyword)).length;
      return Math.min(1, matches / 2);
    }
    case 'industry_exposure':
      return topic.companyId ? 1 : 0.35;
    default: {
      const customLabel = parseCustomPreferenceLabel(normalizedId);
      if (!customLabel) {
        return 0.5;
      }

      const tokens = customLabel
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 3)
        .map((token) => token.toLowerCase());

      if (tokens.length === 0) {
        return 0.5;
      }

      const fieldNames = (topic.fieldIds || [])
        .map((fid) => fields.find((field) => field.id === fid)?.name || '')
        .join(' ')
        .toLowerCase();
      const companyText = `${company?.name || ''} ${company?.description || ''}`.toLowerCase();
      const haystack = `${topicText} ${fieldNames} ${companyText}`;

      const matches = tokens.filter((token) => haystack.includes(token)).length;
      return matches > 0 ? Math.min(1, matches / tokens.length) : 0.35;
    }
  }
}

function scorePriorityFit(
  profile: StudentProfile,
  topic: Topic,
  company: Company | null,
  fields: Field[]
): number {
  const priorities = (profile.priorities || [])
    .map((priority) => normalizePriorityId(priority))
    .filter(Boolean)
    .slice(0, 5);

  if (priorities.length === 0) {
    return 0.5;
  }

  const totalWeight = priorities.reduce((sum, _priority, index) => sum + (priorities.length - index), 0);
  let weightedScore = 0;

  priorities.forEach((priority, index) => {
    const weight = priorities.length - index;
    const score = scorePriorityById(priority, profile, topic, company, fields);
    weightedScore += score * weight;
  });

  return weightedScore / Math.max(1, totalWeight);
}

/**
 * Golden Triangle Matching — Find best (Topic, Supervisor, Company) combinations
 * 
 * Uses semantic vector search combined with field overlap and degree matching.
 * Enhanced with GitHub profile data when available.
 */
export async function matchGoldenTriangle(
  profile: StudentProfile,
  topics: Topic[],
  supervisors: Supervisor[],
  companies: Company[],
  fields: Field[],
  universities: University[],
  topK: number = 5
): Promise<GoldenTriangleMatch[]> {
  console.log('matchGoldenTriangle called with:', {
    topicsCount: topics.length,
    supervisorsCount: supervisors.length,
    profileSkills: profile.skills,
    profileFields: profile.fieldIds,
    profilePriorities: profile.priorities || []
  });
  const vectorStore = getVectorStore();
  const companiesById = new Map(companies.map((company) => [company.id, company]));
  
  // Build profile text for semantic search (enhanced with GitHub data)
  const profileParts = [
    profile.skills.join(' '),
    profile.fieldIds.map(fid => fields.find(f => f.id === fid)?.name || '').join(' '),
    profile.about || '',
    profile.semanticTags?.join(' ') || ''
  ];
  
  // Add GitHub-derived data if available
  if (profile.github) {
    // Add top programming languages
    const topLanguages = Object.entries(profile.github.languageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang]) => lang);
    profileParts.push(topLanguages.join(' '));
    
    // Add GitHub topics (e.g., "machine-learning", "react", "data-science")
    profileParts.push(profile.github.topics.join(' '));
  }
  
  const profileText = profileParts.join(' ');

  // Search for similar topics
  let topicResults: VectorSearchResult[] = [];
  try {
    topicResults = (await vectorStore.search(profileText, 20))
      .filter(r => r.metadata.type === 'topic');
  } catch (err) {
    console.warn('Vector search failed, falling back to field-based matching:', err);
  }

  // If vector search didn't work or returned nothing, use all topics
  if (topicResults.length === 0) {
    topicResults = topics.map(t => ({
      id: `topic-${t.id}`,
      score: 0.5,
      metadata: { ...t, type: 'topic' }
    }));
  }

  // Score each topic (enhanced with GitHub bonus)
  const scoredTopics = topicResults.map(r => {
    const topic = (r.metadata as unknown) as Topic;
    const vectorScore = r.score;
    const fieldScore = profile.fieldIds.length === 0 
      ? 0.5 
      : fieldOverlap(profile.fieldIds, topic.fieldIds || []);
    const degreeMatch = topic.degrees?.includes(profile.degree) ? 1 : 0;
    const company = topic.companyId ? companiesById.get(topic.companyId) || null : null;
    const priorityScore = scorePriorityFit(profile, topic, company, fields);
    const githubBonus = calculateGitHubBonus(profile, topic);
    
    // Base combined score + GitHub bonus
    const baseScore =
      0.45 * vectorScore +
      0.25 * fieldScore +
      0.15 * degreeMatch +
      0.15 * priorityScore;
    const combinedScore = Math.min(1, baseScore + githubBonus);
    
    return { topic, vectorScore, fieldScore, degreeMatch, priorityScore, githubBonus, combinedScore };
  });
  scoredTopics.sort((a, b) => b.combinedScore - a.combinedScore);

  // Search for similar supervisors
  let supervisorResults: VectorSearchResult[] = [];
  try {
    supervisorResults = (await vectorStore.search(profileText, 15))
      .filter(r => r.metadata.type === 'supervisor');
  } catch {
    // Fall back to all supervisors
  }

  if (supervisorResults.length === 0) {
    supervisorResults = supervisors.map(s => ({
      id: `supervisor-${s.id}`,
      score: 0.5,
      metadata: { ...s, type: 'supervisor' }
    }));
  }

  // Score supervisors
  const scoredSupervisors = supervisorResults.map(r => {
    const sup = (r.metadata as unknown) as Supervisor;
    const vectorScore = r.score;
    const supFieldIds = sup.fieldIds || [];
    const fieldScore = profile.fieldIds.length === 0 
      ? 0.5 
      : fieldOverlap(profile.fieldIds, supFieldIds);
    const uniBonus = sup.universityId === profile.universityId ? 0.2 : 0;
    const combinedScore = 0.4 * vectorScore + 0.4 * fieldScore + 0.2 * uniBonus;
    return { supervisor: sup, vectorScore, fieldScore, uniBonus, combinedScore };
  });
  scoredSupervisors.sort((a, b) => b.combinedScore - a.combinedScore);

  // Build Golden Triangles
  const triangles: GoldenTriangleMatch[] = [];

  for (const topicResult of scoredTopics.slice(0, 10)) {
    const topic = topicResult.topic;

    // Find best supervisor for this topic
    let bestSupervisor: (typeof scoredSupervisors[0] & { topicScore: number }) | null = null;
    let bestSupScore = -1; // Start with -1 to ensure even 0-score matches are picked up

    for (const supResult of scoredSupervisors.slice(0, 10)) {
      const sup = supResult.supervisor;
      const topicFieldIds = topic.fieldIds || [];
      const supFieldIds = sup.fieldIds || [];
      const topicSupFieldOverlap = fieldOverlap(topicFieldIds, supFieldIds);
      const sameUniBonus = topic.universityId === sup.universityId ? 0.15 : 0;

      // Prioritize supervisors linked to the topic
      const isLinkedSupervisor = topic.supervisorIds?.includes(sup.id) ? 0.3 : 0;

      const supTopicScore = 0.4 * topicSupFieldOverlap + 0.3 * supResult.combinedScore + sameUniBonus + isLinkedSupervisor;

      if (supTopicScore > bestSupScore) {
        bestSupScore = supTopicScore;
        bestSupervisor = { ...supResult, topicScore: supTopicScore };
      }
    }

    if (!bestSupervisor) continue;

    // Get company info
    const company = topic.companyId
      ? companies.find(c => c.id === topic.companyId) || null
      : null;

    // Triangle score
    const triangleScore =
      0.4 * topicResult.combinedScore +
      0.3 * bestSupervisor.combinedScore +
      0.3 * bestSupScore;

    // Generate explanation
    const explanation = generateMatchExplanation(
      profile,
      topic,
      bestSupervisor.supervisor,
      company,
      fields,
      universities,
      triangleScore
    );

    triangles.push({
      topic: {
        id: topic.id,
        title: topic.title,
        description: (topic.description || '').substring(0, 150) + '...',
        company: company?.name || 'University topic',
        employment: topic.employment,
        employmentType: topic.employmentType,
        fields: (topic.fieldIds || []).map(fid => fields.find(f => f.id === fid)?.name || fid),
        score: Math.round(topicResult.combinedScore * 100) / 100,
      },
      supervisor: {
        id: bestSupervisor.supervisor.id,
        name: `${bestSupervisor.supervisor.title} ${bestSupervisor.supervisor.firstName} ${bestSupervisor.supervisor.lastName}`,
        university: universities.find(u => u.id === bestSupervisor.supervisor.universityId)?.name || '',
        researchInterests: bestSupervisor.supervisor.researchInterests || [],
        score: Math.round(bestSupervisor.combinedScore * 100) / 100,
      },
      company: company ? {
        id: company.id,
        name: company.name,
        description: company.description,
        size: company.size,
      } : null,
      triangleScore: Math.round(triangleScore * 100) / 100,
      explanation,
    });
  }

  // Deduplicate by topic (keep highest triangle score)
  const seen = new Set<string>();
  const unique: GoldenTriangleMatch[] = [];
  for (const tri of triangles.sort((a, b) => b.triangleScore - a.triangleScore)) {
    if (!seen.has(tri.topic.id)) {
      seen.add(tri.topic.id);
      unique.push(tri);
    }
  }

  return unique.slice(0, topK);
}

/**
 * Generate human-readable match explanation
 */
function generateMatchExplanation(
  profile: StudentProfile,
  topic: Topic,
  supervisor: Supervisor,
  company: Company | null,
  fields: Field[],
  universities: University[],
  triangleScore: number
): string {
  const studentName = `${profile.firstName} ${profile.lastName}`;
  const studentSkills = profile.skills.slice(0, 4).join(', ');
  const studentFields = profile.fieldIds
    .map(fid => fields.find(f => f.id === fid)?.name || fid)
    .join(', ');
  const topicFields = (topic.fieldIds || [])
    .map(fid => fields.find(f => f.id === fid)?.name || fid)
    .join(', ');

  let explanation = `**Why this match works for ${studentName}:**\n\n`;

  // Topic match reasoning
  explanation += `📋 **Topic:** "${topic.title}"\n`;
  if (company) {
    explanation += `This opportunity from **${company.name}** aligns with your background in ${studentFields}. `;
  }
  explanation += `Your skills in ${studentSkills} are relevant to this topic's focus on ${topicFields}.\n\n`;

  // Supervisor match reasoning
  const supName = `${supervisor.title} ${supervisor.firstName} ${supervisor.lastName}`;
  const supUni = universities.find(u => u.id === supervisor.universityId)?.name || '';
  explanation += `👩‍🏫 **Supervisor:** ${supName} (${supUni})\n`;
  explanation += `Their research in ${(supervisor.researchInterests || []).slice(0, 3).join(', ')} `;
  explanation += `intersects with the topic's domain. `;
  
  const studentUni = universities.find(u => u.id === profile.universityId);
  if (studentUni && supUni === studentUni.name) {
    explanation += `Bonus: they're at your university, making supervision logistics easy. `;
  }
  explanation += '\n\n';

  // Employment opportunity
  if (topic.employment === 'yes' || topic.employment === 'open') {
    const empType = topic.employmentType || 'position';
    explanation += `💼 **Career opportunity:** This topic ${topic.employment === 'yes' ? 'includes' : 'may lead to'} a ${empType} role.\n\n`;
  }

  // GitHub insights (if available)
  if (profile.github) {
    const topicText = `${topic.title} ${topic.description || ''}`.toLowerCase();
    const topLanguages = Object.entries(profile.github.languageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([lang]) => lang);
    
    const matchingLangs = topLanguages.filter(lang => topicText.includes(lang.toLowerCase()));
    const matchingTopics = profile.github.topics
      .filter(t => topicText.includes(t.toLowerCase().replace(/-/g, ' ')))
      .slice(0, 3);
    
    if (matchingLangs.length > 0 || matchingTopics.length > 0) {
      explanation += `🐙 **GitHub profile boost:** `;
      if (matchingLangs.length > 0) {
        explanation += `Your ${matchingLangs.join(', ')} experience is relevant. `;
      }
      if (matchingTopics.length > 0) {
        explanation += `Your work on ${matchingTopics.join(', ')} aligns with this topic.`;
      }
      explanation += '\n\n';
    }
  }

  const priorities = profile.priorities || [];
  if (priorities.length > 0) {
    const topPriorities = priorities
      .slice(0, 3)
      .map((priorityId) => {
        const normalized = normalizePriorityId(priorityId);
        const customLabel = parseCustomPreferenceLabel(normalized);
        if (customLabel) {
          return customLabel;
        }
        return normalized.replace(/_/g, ' ');
      })
      .join(', ');

    explanation += `🧭 **Priority alignment:** Ranked against your top preferences (${topPriorities}).\n\n`;
  }

  // Triangle score
  explanation += `🎯 **Match confidence:** ${Math.round(triangleScore * 100)}%`;

  return explanation;
}
