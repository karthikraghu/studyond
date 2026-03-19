/**
 * server.ts — Express dev server for API routes.
 *
 * This server handles the /api/* routes that the AI chat and matching
 * engine need. In production, these would be Vercel serverless functions.
 * For local development, Express serves them alongside Vite's dev server.
 *
 * Usage: npx tsx server.ts
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { streamText, generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local first (takes priority), then .env
const envLocalResult = dotenv.config({ path: '.env.local' });
const envResult = dotenv.config(); 

// Consolidate API Keys (some users use VITE_ prefix for both frontend/backend)
const unifyKey = (standard: string, vite: string) => {
  if (!process.env[standard] && process.env[vite]) {
    process.env[standard] = process.env[vite];
  }
};

unifyKey('ANTHROPIC_API_KEY', 'VITE_ANTHROPIC_API_KEY');
unifyKey('PINECONE_API_KEY', 'VITE_PINECONE_API_KEY');
unifyKey('OPENAI_API_KEY', 'VITE_OPENAI_API_KEY');
unifyKey('GEMINI_API_KEY', 'VITE_GEMINI_API_KEY');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Debug log for API keys (masked)
console.log('🔑 API Key Status:', {
  anthropic: ANTHROPIC_API_KEY ? `set (${ANTHROPIC_API_KEY.substring(0, 10)}...)` : 'missing',
  pinecone: process.env.PINECONE_API_KEY ? 'set' : 'missing',
  vite_anthropic: process.env.VITE_ANTHROPIC_API_KEY ? 'present' : 'absent'
});

// Log which env variables are detected (without showing keys)
if (envLocalResult.parsed) {
  console.log('✅ Loaded environment from .env.local');
} else if (envResult.parsed) {
  console.log('✅ Loaded environment from .env');
} else {
  console.warn('⚠️  No .env or .env.local file found!');
}

// Import prompts (these are plain string exports, no type issues)
import { SYSTEM_PROMPT_BASE, STAGE_PROMPTS } from './src/lib/prompts.js';
import { extractText, truncateText, MAX_FILE_SIZE, MAX_TEXT_LENGTH } from './src/lib/pdf-extractor.js';
import { extractProfile } from './src/lib/profile-extractor.js';
import { matchGoldenTriangle } from './src/lib/matching-engine.js';
import { initVectorStore, getVectorStore } from './src/lib/vector-store.js';
import type { StudentProfile } from './src/types/profile.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.txt', '.md'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Accepted: .pdf, .txt, .md`));
    }
  },
});

// ── Load mock data once at startup ──
const mockDataDir = path.resolve(process.cwd(), 'src', 'mock-data');

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

// ── Process CV endpoint ──
app.post('/api/process-cv', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded. Send a PDF, TXT, or MD file.' });
    }

    // Extract text from file
    const ext = path.extname(file.originalname).toLowerCase();
    let cvText = await extractText(file.buffer, ext);

    if (!cvText || cvText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the uploaded file.' });
    }

    // Truncate if too long
    cvText = truncateText(cvText);

    // Extract profile using LLM (with heuristic fallback)
    const profile = await extractProfile(cvText);

    res.json({
      profile,
      meta: {
        fileName: file.originalname,
        textLength: cvText.length,
      },
    });
  } catch (err: any) {
    console.error('Process CV error:', err);
    res.status(500).json({ error: err.message || 'Failed to process CV' });
  }
});

// ── GitHub Profile Extraction Endpoint ──
// Fetches GitHub stats "at the back" to avoid CORS & hide complexity from frontend
app.get('/api/github/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Fetch public repos
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`);
    if (!reposRes.ok) throw new Error('Failed to fetch GitHub repos');
    const repos: any = await reposRes.json();

    // Fetch recent events to calculate commit activity
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public`);
    const events: any = eventsRes.ok ? await eventsRes.json() : [];

    // 1. Calculate Language Statistics (Approximate bytes across top 100 repos)
    const languageStats: Record<string, number> = {};
    let languagePromises = repos.slice(0, 15).map(async (repo: any) => {
      if (repo.language) {
        // Fallback fast approx
        languageStats[repo.language] = (languageStats[repo.language] || 0) + (repo.size * 1024);
      }
    });
    
    // 2. Extract Topics (Tags)
    const topicsSet = new Set<string>();
    repos.forEach((repo: any) => {
      repo.topics?.forEach((topic: string) => topicsSet.add(topic));
    });
    
    // 4. Commit History (Last 90 days from public events approx)
    let totalCommitsYear = 0;
    events.forEach((ev: any) => {
      if (ev.type === 'PushEvent') {
        totalCommitsYear += ev.payload.commits?.length || 0;
      }
    });

    res.json({
      username,
      languageStats,
      topics: Array.from(topicsSet).slice(0, 15),
      totalCommitsYear: totalCommitsYear * 4, // extrapolating sample to annual estimate
    });

  } catch (err: any) {
    console.error('GitHub fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch GitHub data' });
  }
});

// ── Match Profile endpoint ──
app.post('/api/match-profile', async (req, res) => {
  try {
    const { profile, topK = 5 } = req.body as { profile: StudentProfile; topK?: number };
    
    if (!profile) {
      return res.status(400).json({ error: 'Missing "profile" in request body.' });
    }

    // Run Golden Triangle matching
    const matches = await matchGoldenTriangle(
      profile,
      mockData.topics,
      mockData.supervisors,
      mockData.companies,
      mockData.fields,
      mockData.universities,
      topK
    );

    res.json({
      matches,
      meta: {
        profileId: profile.id,
        matchCount: matches.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Match profile error:', err);
    res.status(500).json({ error: err.message || 'Failed to match profile' });
  }
});

// ── QA Match Agent endpoint ──
app.post('/api/match/qa', async (req, res) => {
  try {
    const { system, prompt } = req.body;
    
    // Check if API key is present
    const apiKey = ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes('your-api-key')) {
      return res.status(401).json({ 
        error: 'Anthropic API key not configured',
        match_tier: 'Strong Candidate',
        final_confidence_score: 85,
        technical_reality_check: {
          is_feasible: true,
          identified_gaps: ["Technical gaps couldn't be deeply verified due to offline mode."],
          strongest_assets: ["Matching skill profiles"]
        },
        student_facing_rationale: "Matches your background based on our vector search. We recommend reaching out to the supervisor to discuss the specific technical details."
      });
    }

    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),
      system,
      prompt,
    });

    // Extract JSON from the response (in case Claude wrapped it in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    res.json(result);
  } catch (err: any) {
    console.error('QA Agent error:', err);
    res.status(500).json({ error: err.message || 'Failed to process QA request' });
  }
});

// ── Multer error handler ──
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB.` });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.message?.includes('Unsupported file type')) {
    return res.status(400).json({ error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──
async function main() {
  // Initialize vector store and index data
  if (process.env.PINECONE_API_KEY) {
    try {
      console.log('📊 Initializing Pinecone vector store...');
      const vectorStore = await initVectorStore();
      
      // Index mock data
      await vectorStore.indexTopicsAndSupervisors(
        mockData.topics,
        mockData.supervisors,
        mockData.companies,
        mockData.fields
      );
    } catch (err) {
      console.warn('⚠️  Pinecone initialization failed:', (err as Error).message);
      console.warn('   Semantic matching will fall back to field-based matching.\n');
    }
  } else {
    console.warn('⚠️  PINECONE_API_KEY not set! Semantic matching will be limited.\n');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Thesis Compass API server running at http://localhost:${PORT}`);
    console.log(`   Chat:          POST http://localhost:${PORT}/api/chat`);
    console.log(`   Match:         POST http://localhost:${PORT}/api/match`);
    console.log(`   Process CV:    POST http://localhost:${PORT}/api/process-cv`);
    console.log(`   Match Profile: POST http://localhost:${PORT}/api/match-profile\n`);
    
    // Check API keys and show status
    const hasAnthropicKey = ANTHROPIC_API_KEY && 
                           ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here' &&
                           ANTHROPIC_API_KEY !== 'your-api-key-here';
    
    if (hasAnthropicKey) {
      console.log('✅ ANTHROPIC_API_KEY configured - AI CV extraction enabled');
    } else {
      console.warn('⚠️  ANTHROPIC_API_KEY not set! Add it to .env or .env.local');
      console.warn('   Get your key at: https://console.anthropic.com/');
      console.warn('   Falling back to heuristic CV extraction (less accurate)\n');
    }
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
