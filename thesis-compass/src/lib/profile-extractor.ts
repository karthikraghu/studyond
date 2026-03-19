/**
 * Profile Extractor — Extract structured StudentProfile from CV/bio text
 *
 * Uses LLM-based extraction (Claude) with heuristic fallback.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { StudentProfile } from '../types/profile';
import type { Field, University, StudyProgram } from '../types/matching';

// Import mock data for context
import fieldsData from '../mock-data/fields.json';
import universitiesData from '../mock-data/universities.json';
import studyProgramsData from '../mock-data/study-programs.json';

const fields = fieldsData as Field[];
const universities = universitiesData as University[];
const studyPrograms = studyProgramsData as StudyProgram[];

// ── Skill Keywords ──
const SKILL_KEYWORDS = [
  'python', 'java', 'javascript', 'typescript', 'c++', 'c/c++',
  'r', 'sql', 'matlab', 'stata', 'tableau', 'figma', 'excel',
  'machine learning', 'deep learning', 'nlp', 'data analysis',
  'data science', 'computer vision', 'pytorch', 'tensorflow',
  'scikit-learn', 'react', 'node.js', 'docker', 'kubernetes',
  'aws', 'gcp', 'azure', 'git', 'linux', 'agile', 'scrum',
  'statistical modeling', 'data visualization', 'web development',
  'financial modeling', 'risk modeling', 'project management',
  'design thinking', 'market research', 'qualitative research',
  'quantitative research', 'survey design', 'econometrics',
  'bioinformatics', 'genomics', 'crispr', 'lab techniques',
];

// ── Field Inference Mapping ──
const FIELD_INFERENCE: Record<string, string> = {
  'machine learning': 'field-03',
  'artificial intelligence': 'field-03',
  'deep learning': 'field-03',
  'nlp': 'field-03',
  'data science': 'field-02',
  'data analysis': 'field-02',
  'statistics': 'field-02',
  'software': 'field-01',
  'programming': 'field-01',
  'computer science': 'field-01',
  'sustainability': 'field-08',
  'climate': 'field-08',
  'environment': 'field-17',
  'finance': 'field-05',
  'banking': 'field-05',
  'insurance': 'field-05',
  'marketing': 'field-06',
  'supply chain': 'field-07',
  'logistics': 'field-07',
  'engineering': 'field-09',
  'manufacturing': 'field-09',
  'robotics': 'field-10',
  'biology': 'field-11',
  'biotech': 'field-11',
  'health': 'field-12',
  'medical': 'field-12',
  'pharma': 'field-12',
  'economics': 'field-13',
  'business': 'field-04',
  'management': 'field-04',
  'innovation': 'field-04',
};

/**
 * Extract profile using heuristics (fallback when no LLM available)
 */
export function extractProfileHeuristic(rawText: string): StudentProfile {
  const text = rawText.toLowerCase();
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Name: first non-empty line that looks like a name
  let firstName = 'Unknown';
  let lastName = '';
  for (const line of lines) {
    if (/^[A-ZÀ-Ý][a-zà-ÿ]+\s+[A-ZÀ-Ý][a-zà-ÿ]+/.test(line) && line.length < 50) {
      const parts = line.split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
      break;
    }
  }

  // Email
  const emailMatch = rawText.match(/[\w.+-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : null;

  // Degree
  let degree: 'bsc' | 'msc' | 'phd' = 'msc';
  if (text.includes('phd') || text.includes('doctoral')) degree = 'phd';
  else if (text.includes('bsc') || text.includes('bachelor')) degree = 'bsc';

  // University matching
  let universityId: string | null = null;
  let universityName: string | null = null;
  
  for (const uni of universities) {
    if (text.includes(uni.name.toLowerCase()) ||
        uni.domains.some(d => text.includes(d.toLowerCase()))) {
      universityId = uni.id;
      universityName = uni.name;
      break;
    }
  }
  
  // If no match found, try to extract university name heuristically
  if (!universityName) {
    // Look for common university patterns in the original text (not lowercased)
    const uniPatterns = [
      /(?:University of|Université de|Universität|Universidad de)\s+([A-ZÀ-Ý][A-Za-zÀ-ÿ\s]+)/,
      /([A-ZÀ-Ý][A-Za-zÀ-ÿ]+)\s+(?:University|Institut|Institute|School|College)/,
      /(?:ETH|MIT|EPFL|HSG|TU|KU|LMU|UCL|LSE|INSEAD)\s*[A-Za-zÀ-ÿ]*/,
    ];
    
    for (const pattern of uniPatterns) {
      const match = rawText.match(pattern);
      if (match) {
        universityName = match[0].trim();
        break;
      }
    }
  }

  // Study program matching
  let studyProgramId: string | null = null;
  for (const prog of studyPrograms) {
    if (text.includes(prog.name.toLowerCase())) {
      studyProgramId = prog.id;
      break;
    }
  }

  // Skills extraction
  const skills = SKILL_KEYWORDS.filter(s => text.includes(s));

  // Field matching
  const matchedFieldIds: string[] = [];
  for (const field of fields) {
    const fieldName = field.name.toLowerCase();
    if (text.includes(fieldName)) {
      matchedFieldIds.push(field.id);
    }
  }
  
  // Keyword-based field inference
  for (const [keyword, fieldId] of Object.entries(FIELD_INFERENCE)) {
    if (text.includes(keyword) && !matchedFieldIds.includes(fieldId)) {
      matchedFieldIds.push(fieldId);
    }
  }

  // Objectives inference
  const objectives: StudentProfile['objectives'] = [];
  if (text.includes('thesis') || text.includes('topic')) objectives.push('topic');
  if (text.includes('supervisor') || text.includes('professor')) objectives.push('supervision');
  if (text.includes('career') || text.includes('job') || text.includes('position')) objectives.push('career_start');
  if (text.includes('industry') || text.includes('company') || text.includes('partner')) objectives.push('industry_access');
  if (text.includes('guidance') || text.includes('mentor')) objectives.push('project_guidance');
  if (objectives.length === 0) objectives.push('topic');

  // Semantic tags
  const semanticTags: string[] = [];
  if (text.includes('machine learning') && text.includes('sustainability')) semanticTags.push('ml-sustainability');
  if (text.includes('data') && text.includes('finance')) semanticTags.push('fintech-analytics');
  if (text.includes('nlp') || text.includes('natural language')) semanticTags.push('nlp-specialist');
  if (text.includes('startup') || text.includes('venture')) semanticTags.push('entrepreneurial');
  if (text.includes('intern') || text.includes('experience')) semanticTags.push('industry-experienced');
  if (text.includes('research') || text.includes('publication')) semanticTags.push('research-oriented');
  if (text.includes('design') || text.includes('ux')) semanticTags.push('design-oriented');
  if (text.includes('consulting')) semanticTags.push('consulting-background');

  // About
  const fieldNames = matchedFieldIds
    .map(fid => fields.find(f => f.id === fid)?.name || fid)
    .join(', ');
  const about = `${firstName} ${lastName} — ${degree.toUpperCase()} student. Skills: ${skills.slice(0, 5).join(', ')}. Interests: ${fieldNames}.`;

  return {
    id: `student-${firstName.toLowerCase()}-${lastName.toLowerCase().replace(/\s+/g, '')}`,
    firstName,
    lastName,
    email,
    degree,
    studyProgramId,
    universityId,
    universityName,
    skills: [...new Set(skills)],
    about,
    objectives,
    fieldIds: [...new Set(matchedFieldIds)].slice(0, 5),
    semanticTags,
  };
}

/**
 * Extract profile using Claude LLM
 */
export async function extractProfileWithLLM(rawText: string): Promise<StudentProfile | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const anthropic = new Anthropic({ apiKey });

  const fieldsContext = JSON.stringify(fields, null, 2);
  const universitiesContext = JSON.stringify(universities, null, 2);
  const studyProgramsContext = JSON.stringify(studyPrograms, null, 2);

  const systemPrompt = `You are the Studyond AI Profile Builder. Parse CV/bio text into a structured student profile.

Type definitions for Student:
{
  id: string;                    // Format: "student-firstname-lastname" (lowercase)
  firstName: string;
  lastName: string;
  email: string | null;
  degree: "bsc" | "msc" | "phd";
  studyProgramId: string | null;
  universityId: string | null;   // ID from available list, or null if not a listed Swiss university
  universityName: string | null; // ALWAYS extract the full university name from the CV
  skills: string[];              // e.g., ["Python", "machine learning", "data analysis"]
  about: string | null;          // Short bio/summary
  objectives: ("topic" | "supervision" | "career_start" | "industry_access" | "project_guidance")[];
  fieldIds: string[];            // Use exact IDs from the fields list
  semanticTags: string[];        // Inferred tags like "ml-sustainability", "nlp-specialist"
}

Available fields:
${fieldsContext}

Available universities (Swiss partner universities):
${universitiesContext}

Available study programs:
${studyProgramsContext}

RULES:
1. Extract all relevant info from the CV text
2. Return a JSON object matching the structure exactly
3. Match fieldIds from the available fields list (use exact IDs like "field-01")

4. **UNIVERSITY EXTRACTION (IMPORTANT)**:
   - universityName: ALWAYS extract the full university name as written in the CV. This works for ANY university worldwide (e.g., "Massachusetts Institute of Technology", "TU Munich", "University of Oxford").
   - universityId: Only set this if the university matches one of our Swiss partner universities:
     * "ETH Zurich" / "ETH" / "Swiss Federal Institute of Technology" / @ethz.ch → "uni-01"
     * "EPFL" / "École polytechnique fédérale de Lausanne" / @epfl.ch → "uni-02"  
     * "University of St. Gallen" / "HSG" / @unisg.ch → "uni-03"
     * "University of Zurich" / "UZH" / @uzh.ch → "uni-04"
     * "University of Bern" / @unibe.ch → "uni-05"
     * "University of Basel" / @unibas.ch → "uni-06"
     * "ZHAW" / @zhaw.ch → "uni-07"
     * "FHNW" / @fhnw.ch → "uni-08"
     * "OST" / @ost.ch → "uni-09"
     * "USI" / "Università della Svizzera italiana" / @usi.ch → "uni-10"
   - If the university is NOT in our Swiss partner list (e.g., MIT, Stanford, TU Munich), set universityId to null but STILL extract universityName.

5. Match studyProgramId from available lists if the program name is mentioned
6. Infer student objectives from context (career goals, interests, what they're looking for)
7. Generate semantic tags based on domain expertise combinations
8. For fields you truly cannot determine, use null. But ALWAYS try to extract universityName!
9. Return ONLY the JSON object, no markdown code blocks, no explanation`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Parse this CV/bio into a Studyond Student profile JSON:\n\n${rawText}`,
      }],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const profile = JSON.parse(jsonStr) as StudentProfile;
    
    // Log the extracted profile for debugging
    console.log('LLM extracted profile:', {
      name: `${profile.firstName} ${profile.lastName}`,
      universityId: profile.universityId,
      universityName: profile.universityName,
      degree: profile.degree,
      skills: profile.skills?.length || 0,
      fields: profile.fieldIds?.length || 0,
    });

    // Ensure required fields have defaults
    profile.id = profile.id || `student-${(profile.firstName || 'unknown').toLowerCase()}-${(profile.lastName || '').toLowerCase().replace(/\s+/g, '')}`;
    profile.skills = profile.skills || [];
    profile.objectives = profile.objectives || ['topic'];
    profile.fieldIds = profile.fieldIds || [];
    profile.semanticTags = profile.semanticTags || [];
    profile.universityName = profile.universityName || null;

    return profile;
  } catch (err) {
    console.error('LLM extraction failed:', err);
    return null;
  }
}

/**
 * Extract profile from CV text — tries LLM first, falls back to heuristics
 */
export async function extractProfile(rawText: string): Promise<StudentProfile> {
  // Try LLM extraction first
  const llmProfile = await extractProfileWithLLM(rawText);
  if (llmProfile) {
    return llmProfile;
  }

  // Fall back to heuristic extraction
  console.log('Using heuristic profile extraction (LLM unavailable)');
  return extractProfileHeuristic(rawText);
}
