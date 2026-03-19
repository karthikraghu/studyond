/**
 * server.ts — Express dev server for API routes.
 *
 * This server handles the /api/* routes that the AI chat and matching
 * engine need. In production, these would be Vercel serverless functions.
 * For local development, Express serves them alongside Vite's dev server.
 *
 * Usage: npx tsx server.ts
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Import prompts (these are plain string exports, no type issues)
import { SYSTEM_PROMPT_BASE, STAGE_PROMPTS } from './src/lib/prompts.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Load mock data once at startup ──
const mockDataDir = path.join(import.meta.dirname, 'src', 'mock-data');

function loadJSON(filename: string) {
  return JSON.parse(fs.readFileSync(path.join(mockDataDir, filename), 'utf-8'));
}

const mockData = {
  topics: loadJSON('topics.json') as any[],
  supervisors: loadJSON('supervisors.json') as any[],
  experts: loadJSON('experts.json') as any[],
  companies: loadJSON('companies.json') as any[],
  universities: loadJSON('universities.json') as any[],
  fields: loadJSON('fields.json') as any[],
  students: loadJSON('students.json') as any[],
  studyPrograms: loadJSON('study-programs.json') as any[],
};

console.log(`📦 Loaded mock data: ${mockData.topics.length} topics, ${mockData.supervisors.length} supervisors, ${mockData.experts.length} experts`);

// ── Inline Matching Engine (simplified for server context) ──

function scoreTopicForQuery(topic: any, queryLower: string, studentFieldIds: string[], degree: string): any {
  const topicText = `${topic.title} ${topic.description}`.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w: string) => w.length > 2);
  
  // Text relevance
  const textMatches = queryWords.filter((w: string) => topicText.includes(w)).length;
  const textScore = Math.min(100, Math.round((textMatches / Math.max(1, queryWords.length)) * 100));
  
  // Field alignment
  const fieldOverlap = studentFieldIds.length > 0 
    ? topic.fieldIds.filter((f: string) => studentFieldIds.includes(f)).length 
    : 0;
  const fieldScore = studentFieldIds.length > 0 
    ? Math.round((fieldOverlap / studentFieldIds.length) * 100)
    : 50;
  
  // Degree match
  const degreeScore = topic.degrees.length === 0 || topic.degrees.includes(degree) ? 100 : 20;
  
  // Career/industry
  const industryScore = topic.employment === 'yes' ? 85 : topic.employment === 'open' ? 65 : 50;
  
  const overall = Math.round(textScore * 0.35 + fieldScore * 0.25 + degreeScore * 0.15 + industryScore * 0.25);
  
  return {
    overall,
    fieldAlignment: fieldScore,
    skillFit: textScore,
    degreeMatch: degreeScore,
    careerAlignment: industryScore,
    industryDemand: industryScore,
  };
}

// ── Define AI tools inline (avoids import/type issues) ──

const tools: Record<string, any> = {
  search_topics: {
    description: 'Search for thesis topics matching the student\'s interests. Returns ranked topics with match scores. Use this when the student asks about finding topics or wants suggestions.',
    parameters: z.object({
      query: z.string().describe('Search keywords for topics'),
      fieldNames: z.array(z.string()).optional().describe('Field names to filter, e.g. ["Data Science"]'),
      degree: z.enum(['bsc', 'msc', 'phd']).optional().describe('Degree level filter'),
    }),
    execute: async ({ query, fieldNames, degree }: { query: string; fieldNames?: string[]; degree?: string }) => {
      const queryLower = query.toLowerCase();
      
      // Resolve field IDs
      let fieldIds: string[] = [];
      if (fieldNames && fieldNames.length > 0) {
        fieldIds = mockData.fields
          .filter((f: any) => fieldNames.some(fn => f.name.toLowerCase().includes(fn.toLowerCase())))
          .map((f: any) => f.id);
      }

      // Filter and score topics
      const scored = mockData.topics
        .map((topic: any) => {
          const score = scoreTopicForQuery(topic, queryLower, fieldIds, degree || 'msc');
          const company = topic.companyId 
            ? mockData.companies.find((c: any) => c.id === topic.companyId) 
            : null;
          return { topic, score, company };
        })
        .sort((a: any, b: any) => b.score.overall - a.score.overall)
        .slice(0, 5);

      return scored.map((m: any) => ({
        title: m.topic.title,
        description: m.topic.description.substring(0, 200) + '...',
        company: m.company?.name || 'University topic',
        matchScore: m.score.overall,
        scores: m.score,
        employment: m.topic.employment,
        employmentType: m.topic.employmentType,
        degrees: m.topic.degrees,
      }));
    },
  },

  search_supervisors: {
    description: 'Find supervisors whose research interests align with a topic. Use when student needs supervisor recommendations.',
    parameters: z.object({
      topicTitle: z.string().describe('The thesis topic or research area'),
      fieldNames: z.array(z.string()).optional().describe('Field names to filter'),
    }),
    execute: async ({ topicTitle, fieldNames }: { topicTitle: string; fieldNames?: string[] }) => {
      let fieldIds: string[] = [];
      if (fieldNames && fieldNames.length > 0) {
        fieldIds = mockData.fields
          .filter((f: any) => fieldNames.some(fn => f.name.toLowerCase().includes(fn.toLowerCase())))
          .map((f: any) => f.id);
      }

      const titleWords = topicTitle.toLowerCase().split(/\s+/);

      const scored = mockData.supervisors
        .map((sup: any) => {
          const fieldOverlap = fieldIds.length > 0 
            ? sup.fieldIds.filter((f: string) => fieldIds.includes(f)).length 
            : 0;
          const researchOverlap = sup.researchInterests
            .filter((ri: string) => titleWords.some((w: string) => ri.toLowerCase().includes(w)))
            .length;
          const score = Math.min(100, Math.round(
            (fieldOverlap / Math.max(1, fieldIds.length || 1)) * 50 +
            (researchOverlap / Math.max(1, sup.researchInterests.length)) * 50
          ));
          const university = mockData.universities.find((u: any) => u.id === sup.universityId);
          return { supervisor: sup, score, university };
        })
        .filter((m: any) => m.score > 10)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5);

      return scored.map((m: any) => ({
        name: `${m.supervisor.title} ${m.supervisor.firstName} ${m.supervisor.lastName}`,
        email: m.supervisor.email,
        university: m.university?.name || 'Unknown',
        researchInterests: m.supervisor.researchInterests,
        matchScore: m.score,
      }));
    },
  },

  search_experts: {
    description: 'Find industry experts for thesis interviews and networking. Use when student needs interview partners.',
    parameters: z.object({
      topicTitle: z.string().describe('The thesis topic or research area'),
      fieldNames: z.array(z.string()).optional().describe('Field names to filter'),
      interviewsOnly: z.boolean().optional().describe('Only show experts available for interviews'),
    }),
    execute: async ({ topicTitle, fieldNames, interviewsOnly }: { topicTitle: string; fieldNames?: string[]; interviewsOnly?: boolean }) => {
      let fieldIds: string[] = [];
      if (fieldNames && fieldNames.length > 0) {
        fieldIds = mockData.fields
          .filter((f: any) => fieldNames.some(fn => f.name.toLowerCase().includes(fn.toLowerCase())))
          .map((f: any) => f.id);
      }

      let experts = mockData.experts;
      if (interviewsOnly) {
        experts = experts.filter((e: any) => e.offerInterviews);
      }

      const scored = experts
        .map((expert: any) => {
          const fieldOverlap = fieldIds.length > 0 
            ? expert.fieldIds.filter((f: string) => fieldIds.includes(f)).length 
            : 0;
          const score = Math.min(100, Math.round(
            (fieldOverlap / Math.max(1, fieldIds.length || 1)) * 70 +
            (expert.offerInterviews ? 30 : 0)
          ));
          const company = mockData.companies.find((c: any) => c.id === expert.companyId);
          return { expert, score, company };
        })
        .filter((m: any) => m.score > 10)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5);

      return scored.map((m: any) => ({
        name: `${m.expert.firstName} ${m.expert.lastName}`,
        title: m.expert.title,
        company: m.company?.name || 'Unknown',
        email: m.expert.email,
        availableForInterviews: m.expert.offerInterviews,
        matchScore: m.score,
      }));
    },
  },

  generate_outreach_email: {
    description: 'Generate a personalized outreach email draft. Use when the student wants to contact a supervisor or expert.',
    parameters: z.object({
      recipientName: z.string().describe('Name of the person'),
      recipientRole: z.enum(['supervisor', 'expert']).describe('Role type'),
      topicTitle: z.string().describe('Thesis topic'),
      studentContext: z.string().describe('Brief student background'),
      purpose: z.enum(['supervision_request', 'interview_request', 'collaboration']).describe('Email purpose'),
    }),
    execute: async ({ recipientName, recipientRole, topicTitle, studentContext, purpose }: any) => {
      const templates: Record<string, string> = {
        supervision_request: `Subject: Thesis Supervision Request — ${topicTitle}\n\nDear ${recipientName},\n\nI am writing to express my interest in pursuing my thesis under your supervision on the topic of "${topicTitle}."\n\n${studentContext}\n\nI would greatly appreciate the opportunity to discuss this further at your convenience.\n\nBest regards,\n[Student Name]`,
        interview_request: `Subject: Expert Interview Request — ${topicTitle}\n\nDear ${recipientName},\n\nI am working on my thesis on "${topicTitle}" and would love to interview you.\n\n${studentContext}\n\nThe interview would take ~30 minutes at your convenience.\n\nBest regards,\n[Student Name]`,
        collaboration: `Subject: Thesis Collaboration — ${topicTitle}\n\nDear ${recipientName},\n\nI am exploring thesis opportunities related to "${topicTitle}" and would love to discuss a potential collaboration.\n\n${studentContext}\n\nBest regards,\n[Student Name]`,
      };
      return {
        draft: templates[purpose] || templates.collaboration,
        note: 'Draft email — personalize before sending.',
      };
    },
  },
};

// ── Chat endpoint ──
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, thesisContext } = req.body;

    // Build dynamic system prompt
    const stage = thesisContext?.currentStage || 'orientation';
    const stagePrompt = STAGE_PROMPTS[stage] || STAGE_PROMPTS.orientation;
    const fieldList = mockData.fields.map((f: any) => f.name).join(', ');

    const systemPrompt = `${SYSTEM_PROMPT_BASE}

${stagePrompt}

--- STUDENT CONTEXT ---
${JSON.stringify(thesisContext || { currentStage: 'orientation' }, null, 2)}

--- AVAILABLE DATA ---
- ${mockData.topics.length} thesis topics from ${mockData.companies.length} companies
- ${mockData.supervisors.length} supervisors
- ${mockData.experts.length} industry experts
- Fields: ${fieldList}

IMPORTANT: Use search tools to find matches. Do not make up data — only reference real entities.
Respond in the same language the student uses.`;

    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages,
      tools,
    });

    // Stream response to Express using the data stream protocol
    // useChat() on the frontend expects this format
    const response = (result as any).toDataStreamResponse();

    res.status(response.status);
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      const reader = response.body.getReader();
      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) { res.end(); return; }
        res.write(value);
        return pump();
      };
      await pump();
    } else {
      res.end();
    }

  } catch (error: any) {
    console.error('Chat error:', error?.message || error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat request' });
    }
  }
});

// ── Match endpoint ──
app.post('/api/match', async (req, res) => {
  try {
    const { query, degree, fieldNames, topN = 5 } = req.body;
    const result = await tools.search_topics.execute({ query: query || '', fieldNames, degree });
    res.json({ matches: result.slice(0, topN) });
  } catch (error: any) {
    console.error('Match error:', error?.message || error);
    res.status(500).json({ error: 'Failed to process match request' });
  }
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n🚀 Thesis Compass API server running at http://localhost:${PORT}`);
  console.log(`   Chat: POST http://localhost:${PORT}/api/chat`);
  console.log(`   Match: POST http://localhost:${PORT}/api/match\n`);
  
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-api-key-here') {
    console.warn('⚠️  ANTHROPIC_API_KEY not set! Add it to .env.local');
    console.warn('   Get your key at: https://console.anthropic.com/\n');
  }
});
