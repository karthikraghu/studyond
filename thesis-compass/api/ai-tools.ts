/**
 * AI Tools — Server-side tool definitions for the Companion Agent.
 *
 * These tools are invoked by the AI model during conversation:
 * - search_topics: Search and filter thesis topics
 * - search_supervisors: Find matching supervisors
 * - search_experts: Find experts for interviews
 * - update_stage: Transition the student to a new thesis stage
 * - generate_milestones: Create a milestone timeline
 *
 * In Phase 1, these are stubs. In Phase 2, they'll query
 * the actual Studyond API or read from the database.
 *
 * See Vercel AI SDK docs: https://sdk.vercel.ai/docs/ai-sdk-core/tools
 */

// Example tool definition (Phase 2):
//
// import { tool } from 'ai';
// import { z } from 'zod';
//
// export const searchTopics = tool({
//   description: 'Search for thesis topics matching the student\'s context',
//   parameters: z.object({
//     query: z.string().describe('Search query'),
//     fieldIds: z.array(z.string()).optional().describe('Filter by field IDs'),
//     degree: z.enum(['bsc', 'msc', 'phd']).optional(),
//   }),
//   execute: async ({ query, fieldIds, degree }) => {
//     // Search mock data or real API
//     return topics.filter(/* ... */);
//   },
// });

export {};
