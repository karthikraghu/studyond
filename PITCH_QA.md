# Thesis Compass — StartHack Pitch Q&A

> **Source-accurate Q&A** derived directly from the implemented source code in `thesis-compass/`.  
> Covers the two key prototype features: the **Matching Engine** and the **AI Thesis Validator**.  
> Structured for both technical judges and management/logic questions.

---

## Table of Contents

1. [Matching Engine](#matching-engine)
   - [Overview & Architecture](#matching-engine-overview--architecture)
   - [Scoring Dimensions (Technical)](#scoring-dimensions-technical)
   - [Golden Triangle Algorithm (Technical)](#golden-triangle-algorithm-technical)
   - [Vector Store & Pinecone (Technical)](#vector-store--pinecone-technical)
   - [GitHub Bonus Signal (Technical)](#github-bonus-signal-technical)
   - [Management / Logic Questions](#matching-engine-management--logic-questions)
2. [AI Thesis Validator](#ai-thesis-validator)
   - [Overview & Architecture](#ai-thesis-validator-overview--architecture)
   - [Agent 1: The Professor (Technical)](#agent-1-the-professor-technical)
   - [Agent 2: The Assistant Researcher (Technical)](#agent-2-the-assistant-researcher-technical)
   - [Agent 3: The Defense Chair (Technical)](#agent-3-the-defense-chair-technical)
   - [QA Match Agent (Technical)](#qa-match-agent-technical)
   - [State Management & Memory (Technical)](#state-management--memory-technical)
   - [Management / Logic Questions](#ai-thesis-validator-management--logic-questions)
3. [Tech Stack & Dependencies](#tech-stack--dependencies)
4. [Cross-Feature Questions](#cross-feature-questions)

---

## Matching Engine

### Matching Engine Overview & Architecture

**Q: What is the Matching Engine at a high level?**

A: The Matching Engine is a multi-signal scoring system implemented in `src/lib/matching-engine.ts`. It connects students to thesis opportunities using the "Golden Triangle" concept — matching a student simultaneously to a **Topic**, a **Supervisor**, and a **Company**. The engine combines semantic vector search (Pinecone) with deterministic heuristic scoring across six dimensions to produce a final `triangleScore` (0–1 range, displayed as a percentage).

---

**Q: How does the system decide what to show a student on the Matches page?**

A: The main entry point is `matchGoldenTriangle()`. It:
1. Builds a text representation of the student's profile (skills + fields + bio + GitHub data).
2. Runs a semantic search on Pinecone to get the top 20 candidate topics and 15 candidate supervisors.
3. Falls back to the full topic/supervisor list if vector search is unavailable.
4. Scores each candidate with a weighted formula (see below).
5. Combines the best topic, best supervisor, and company into a `GoldenTriangleMatch` triple.
6. Deduplicates by topic ID (keeps the highest-scoring triple per topic).
7. Returns the top K results (default K = 5).

---

### Scoring Dimensions (Technical)

**Q: What are the six scoring dimensions and their weights?**

A: From `scoreTopicMatch()` in `matching-engine.ts`:

| Dimension | Weight | Formula |
|-----------|--------|---------|
| Field Alignment | 25% | `overlap(studentFieldIds, topicFieldIds) / min(|student|, |topic|) * 100` |
| Description Alignment | 25% | Keyword overlap: `40 + round((matches / sqrt(|studentWords| × |topicWords|)) * 120)`, capped at 100 |
| Skill Fit | 20% | `30 + min(70, (matchingSkills / totalSkills) * 100)` |
| Degree Match | 10% | 100 if `topicDegrees.includes(studentDegree)`, 20 if not, 70 if no restriction |
| Career Alignment | 10% | Base 50, +20 if topic type matches objective, +30 if employment=yes & career_start, +20 if company present & industry_access |
| Industry Demand | 10% | Base 50, +20 if employment=yes, +15 if direct_entry, +10 if graduate_program, +15 if large company |

```typescript
// From matching-engine.ts line 74
const overall = Math.round(
  fieldAlignment  * 0.25 +
  skillFit        * 0.20 +
  degreeMatch     * 0.10 +
  careerAlignment * 0.10 +
  industryDemand  * 0.10 +
  descriptionAlignment * 0.25
);
```

---

**Q: How does the Description Alignment work exactly? Is it real semantic similarity?**

A: It is **not** true semantic similarity — it is a "poor man's semantic search" (the comment in the source code). It uses a Jaccard-inspired keyword overlap formula:

1. Tokenise the student's `about` text and the topic title/description on word boundaries (`/[^a-z0-9]+/`), keeping only words longer than 3 characters.
2. Count how many of the student's words appear in the topic's word set.
3. Normalise: `overlap = matches / sqrt(|studentWords| × |topicWords|)`.
4. Scale: `min(100, 40 + round(overlap * 120))`.

The base of 40 prevents zero scores when there is no overlap but some topic content exists. True semantic similarity is handled by the Pinecone vector search layer.

---

**Q: How does Field Alignment scoring handle edge cases (empty fields, no overlap)?**

A: From `scoreFieldAlignment()`:
- If either the student or the topic has no field IDs, it returns a **neutral score of 50** (not 0).
- The denominator is `min(|studentFields|, |topicFields|)` so partial overlap on a niche student profile still scores high.
- Full overlap scores 100; zero overlap scores 0 (but the neutral-50 guard fires first for empty arrays).

---

**Q: How does Supervisor matching work independently of Golden Triangle?**

A: `findMatchingSupervisors()` scores each supervisor as:

```
score = (fieldOverlapCount / topicFieldIds.length) * 60
      + (researchInterestOverlap / supervisor.researchInterests.length) * 40
```

- Minimum threshold: score > 20 (supervisors below are filtered out).
- Research overlap is checked by splitting the topic title into words and testing whether each supervisor research interest string contains any of those words.
- Returns top N (default 5), sorted descending.

---

**Q: How does Expert matching work?**

A: `findMatchingExperts()` uses a simpler two-signal formula:

```
score = (fieldOverlap / topicFieldIds.length) * 70
      + (expert.offerInterviews ? 30 : 0)
```

- An expert who offers interviews gets a guaranteed 30 points regardless of field fit.
- Minimum threshold: score > 15.

---

### Golden Triangle Algorithm (Technical)

**Q: Walk me through the exact Golden Triangle scoring formula.**

A: From `matchGoldenTriangle()`:

**Topic score** (combinedScore):
```
baseScore = 0.45 × vectorScore
          + 0.25 × fieldScore
          + 0.15 × degreeMatch (1 or 0)
          + 0.15 × priorityScore
combinedScore = min(1, baseScore + githubBonus)
```

**Supervisor score** (combinedScore):
```
combinedScore = 0.4 × vectorScore
              + 0.4 × fieldScore
              + 0.2 × uniBonus (0.2 if same university as student, else 0)
```

**Topic–Supervisor fit** (supTopicScore):
```
supTopicScore = 0.4 × topicSupFieldOverlap (Jaccard between topic fields and supervisor fields)
              + 0.3 × supervisor.combinedScore
              + sameUniBonus (0.15 if topic.universityId === supervisor.universityId)
              + isLinkedBonus (0.30 if supervisor is in topic.supervisorIds)
```

**Final Triangle score**:
```
triangleScore = 0.4 × topic.combinedScore
              + 0.3 × supervisor.combinedScore
              + 0.3 × supTopicScore
```

---

**Q: What's the Jaccard similarity used for in field overlap?**

A: The `fieldOverlap()` helper computes true Jaccard similarity between two field ID arrays:

```typescript
// matching-engine.ts line 276
function fieldOverlap(fields1: string[], fields2: string[]): number {
  const set1 = new Set(fields1);
  const intersection = fields2.filter(f => set1.has(f));
  const union = new Set([...fields1, ...fields2]);
  return union.size === 0 ? 0 : intersection.length / union.size;
}
```

This is used in Golden Triangle scoring (not in the simpler `scoreFieldAlignment` for the basic matcher, which uses `overlap / min(|A|, |B|)` instead).

---

**Q: What is `priorityScore` and how is it computed?**

A: Each student can set up to 5 ranked preferences (e.g., "research_field", "compensation", "career_growth"). `scorePriorityFit()` computes a weighted average where the top-ranked preference has weight N, second has weight N−1, etc.:

```
totalWeight = N + (N−1) + ... + 1  (triangular number)
weightedScore = Σ (weight_i × scorePriorityById(priority_i, ...))
priorityScore = weightedScore / totalWeight
```

`scorePriorityById()` maps each preference ID to a score signal, for example:
- `research_field` → Jaccard field overlap
- `compensation` → 1.0 if employment=yes, 0.7 if open, 0.2 otherwise
- `workplace_flexibility` → 1.0 remote, 0.85 hybrid, 0.35 on-site
- Custom free-text preferences → tokenise and keyword-match against topic text, field names, and company description

---

### Vector Store & Pinecone (Technical)

**Q: How is Pinecone used exactly?**

A: Implemented in `src/lib/vector-store.ts`. Key details:
- **Index spec**: Pinecone Serverless on AWS `us-east-1`, cosine similarity metric, **1024 dimensions**.
- **Embedding model**: `multilingual-e5-large` via Pinecone's Inference API (not a separate embedding service).
- **Input type**: `passage` for indexing, same model used for queries.
- **Indexed content**: Topics (`title + description + companyName + fieldNames`) and Supervisors (`title + firstName + lastName + researchInterests + fieldNames`).
- **Query**: `vectorStore.search(profileText, topK)` embeds the query on the fly and returns cosine-ranked results with metadata.
- **Optimisation**: `indexTopicsAndSupervisors()` checks `currentCount >= expectedCount` before re-indexing to avoid redundant API calls.
- **Singleton pattern**: `getVectorStore()` returns a shared instance.

---

**Q: What happens if Pinecone is unavailable or the API key is missing?**

A: The code has a graceful fallback in `matchGoldenTriangle()`:

```typescript
// matching-engine.ts line 467
try {
  topicResults = (await vectorStore.search(profileText, 20))
    .filter(r => r.metadata.type === 'topic');
} catch (err) {
  console.warn('Vector search failed, falling back to field-based matching:', err);
}

if (topicResults.length === 0) {
  topicResults = topics.map(t => ({
    id: `topic-${t.id}`,
    score: 0.5,   // neutral vector score for all topics
    metadata: { ...t, type: 'topic' }
  }));
}
```

All topics get a neutral `vectorScore` of 0.5, so the field, degree, and priority signals still differentiate results.

---

### GitHub Bonus Signal (Technical)

**Q: How does GitHub data influence the match score?**

A: `calculateGitHubBonus()` returns a bonus in `[0, 0.30]` added on top of the base topic score:

| Signal | Bonus |
|--------|-------|
| Each of the student's top-5 GitHub languages found in topic text | +5% per language (max 25%) |
| Each GitHub repository topic tag found in topic text | +4% per tag, capped at 20% |
| `totalCommitsYear > 100` (active contributor) | +5% flat |
| **Total cap** | **30%** |

GitHub data is fetched separately from CV parsing and stored in `StudentProfile.github` as `GitHubStats` (languageStats, topics, totalCommitsYear).

---

**Q: Why is the GitHub bonus capped at 30%?**

A: To prevent GitHub activity from overwhelming the academic signals. The cap ensures that a student with a perfect GitHub match but wrong degree or research field still receives a balanced score, not an artificially inflated one. The vector and field components (70% combined in the base) remain the dominant signals.

---

### Matching Engine Management / Logic Questions

**Q: Why build a custom multi-signal engine instead of using a pure LLM?**

A: Three reasons: (1) **Determinism** — judges and students can see exactly why a match scored 78% (field overlap + employment type). An LLM explanation is a black box. (2) **Speed** — the full Golden Triangle runs in milliseconds for the mock data; an LLM call would add 2–5 seconds per match. (3) **Cost control** — at hackathon scale, calling Claude for every match of every student would be prohibitively expensive.

---

**Q: Why did you choose to weight Field Alignment and Description Alignment equally at 25% each?**

A: Field IDs represent the explicit, structured academic domain (e.g., "Information Systems", "AI/ML"). Description Alignment captures implicit keyword overlap from the student's free-text bio. Together they cover both the formal curriculum signal and the student's expressed interests. The 25%/25% split reflects that neither signal is more reliable than the other in a prototype — this is a tunable hyperparameter.

---

**Q: What is the "Golden Triangle" concept?**

A: In traditional thesis programs, a successful thesis needs three things to align: a compelling **topic**, a knowledgeable **supervisor** willing to guide the work, and a **company** providing real-world context and employment opportunity. Our engine finds the best simultaneous combination of all three rather than optimising for each in isolation, which is the industry standard gap we are addressing.

---

**Q: How does the Priority system work from a user's perspective?**

A: During onboarding, students rank up to 5 preferences (e.g., "I care most about research_field, then career_growth, then company_reputation"). The engine normalises these IDs and scores each topic against each preference with a weight proportional to its rank position, producing a `priorityScore` (0–1) that feeds into the Golden Triangle formula at 15% weight.

---

**Q: Is the matching purely client-side?**

A: The scoring logic (`matchGoldenTriangle`) runs on the **frontend** in the browser (TypeScript). The Pinecone vector search calls go through a browser-accessible environment variable. The backend (`server.ts`) exposes a `/api/match-profile` endpoint that replicates this for server-side use. The QA Match Agent call (`/api/match/qa`) is backend-only to keep the Anthropic API key server-side.

---

## AI Thesis Validator

### AI Thesis Validator Overview & Architecture

**Q: What is the AI Thesis Validator and what does it produce?**

A: A LangGraph-orchestrated multi-agent pipeline that takes a student's raw thesis pitch (plain text) and outputs a "Thesis Health Card" containing: a refined academic title, research questions, methodology, timeline, literature saturation level, key recent papers, research gap status, utility score, major risks, out-of-scope constraints, and a final verdict (APPROVED / NEEDS_REVISION / REJECTED).

---

**Q: What framework and LLM power the validator?**

A: 
- **Orchestration**: LangGraph (`@langchain/langgraph` v1.2.3) — specifically `StateGraph` with a linear `START → professor → assistant → chair → END` topology.
- **LLM**: Claude 3.5 Sonnet (`claude-3-5-sonnet-latest`) via `@langchain/anthropic`, with `temperature: 0` for deterministic structured output.
- **Structured output**: All agents use `llm.withStructuredOutput(zodSchema)` to force typed JSON responses.
- **Memory**: `MemorySaver` checkpointer enables a human-in-the-loop refinement loop — the same thread ID can be resubmitted with additional context.

---

**Q: How does the graph communicate state between agents?**

A: Through a typed `Annotation.Root` state object defined in `api/agents/state.ts`:

```typescript
ThesisState = {
  initialPitch: string          // reducer: latest-take (y overwrites x)
  academicRoadmap: any          // reducer: latest-take
  literatureContext: any        // reducer: latest-take
  defenseCritique: any          // reducer: latest-take
  messages: BaseMessage[]       // reducer: append (x.concat(y))
  healthStatus: "PENDING" | "APPROVED" | "NEEDS_REVISION" | "REJECTED"  // latest-take
}
```

Each agent node reads from state, does its work, and returns only the fields it updates. LangGraph merges the return value into the shared state using the declared reducers before passing to the next node.

---

### Agent 1: The Professor (Technical)

**Q: What exactly does the Professor agent do and how is it implemented?**

A: Implemented as `professorNode()` in `api/agents/graph.ts`.

**Input**: `state.initialPitch` (raw student text).

**Implementation**:
1. Instantiates Claude 3.5 Sonnet with `temperature: 0`.
2. Calls `llm.withStructuredOutput(zodSchema)` with a Zod schema that forces the response into:
   - `refinedTopic: string` — formal academic title
   - `researchQuestions: string[]` — 2–3 sharply defined RQs
   - `methodology: string` — academic approach (e.g., Design Science Research, empirical evaluation, A/B testing)
   - `timeline: string` — 4–6 month phase breakdown
3. Invokes with a `[SystemMessage(prompt), HumanMessage("Format...")]` pair.
4. Returns `{ academicRoadmap: roadmap }` which is merged into state.

**System prompt rule**: "Do not critique the idea yet; assume it has potential." For engineering-only ideas, it is instructed to attach a research methodology.

---

**Q: Why temperature: 0 for all agents?**

A: The validator must produce consistent, auditable results. At `temperature: 0`, Claude is deterministic (or as close as the API allows). For a pitch review tool, a student should get the same feedback on the same pitch — not a different answer each time. This also makes structured JSON output more reliable because the model doesn't "wander" creatively away from the schema.

---

### Agent 2: The Assistant Researcher (Technical)

**Q: How does the Assistant Researcher use external tools?**

A: It uses LangChain's tool binding pattern:

1. `llm.bindTools([searchAcademicLiteratureTool])` creates a model that can emit tool-call messages.
2. The model is invoked once; if it decides to call `search_academic_literature`, the response contains a `tool_calls` array.
3. Each tool call is executed manually: `searchAcademicLiteratureTool.invoke(toolCall.args)`.
4. A `ToolMessage` is created for each result and added to the message history.
5. A **fresh** `llm.withStructuredOutput(zodSchema)` instance is invoked with the full message history (system + human + assistant + tool results + synthesis prompt) to force the final structured output.

This two-phase pattern (tool-use phase → structured-output phase) is necessary because LangChain's `.withStructuredOutput()` conflicts with `.bindTools()` — you cannot use both on the same invocation.

---

**Q: What does `searchAcademicLiteratureTool` actually call?**

A: The tool is a `DynamicStructuredTool` defined in `api/tools/openalex.ts`. It calls the **OpenAlex REST API**:

```
GET https://api.openalex.org/works
    ?search=<encoded_query>
    &per-page=3
    &sort=publication_year:desc
```

It returns the top 3 most recent papers with title, publication year, and OpenAlex URL. OpenAlex is a free, open academic metadata database covering ~250 million scholarly works.

---

**Q: What structured output schema does the Assistant produce?**

A: A Zod-validated object:

```typescript
{
  saturationLevel: z.enum(['Low', 'Medium', 'High']),
  recentKeyPapers: z.array(z.object({
    title: z.string(),
    year: z.number().or(z.string())
  })),
  researchGapStatus: z.string()   // 2-sentence gap assessment
}
```

This becomes `state.literatureContext` for the Chair agent.

---

### Agent 3: The Defense Chair (Technical)

**Q: What does the Chair agent receive and how does it generate its verdict?**

A: The Chair (`chairNode()`) receives the **full accumulated state**: the original pitch, the Professor's roadmap (as JSON), and the Assistant's literature context (as JSON). These are embedded verbatim into the system prompt using `JSON.stringify(..., null, 2)`.

The Chair is prompted with three specific evaluation tasks:
1. **"So What?" Test** — utility evaluation.
2. **Scope Constraints** — explicit statement of what the student must NOT do.
3. **Risk Assessment** — single biggest methodological point of failure.

**Output schema** (Zod-validated):

```typescript
{
  utilityScore: z.number().min(1).max(10),
  majorRisks: z.array(z.string()),     // 1-2 critical risks
  outOfScope: z.string(),
  finalVerdict: z.enum(["APPROVED", "NEEDS_REVISION", "REJECTED"]),
  actionableFeedback: z.string()       // one sentence to guide next iteration
}
```

The `finalVerdict` is also written to `state.healthStatus` directly.

---

**Q: Is there a QA (Quality Assurance) agent in the validator pipeline?**

A: The QA Match Agent is a **separate agent** (`src/lib/agents/qa-agent.ts`) that runs outside the LangGraph validator pipeline. It is designed to evaluate **student–topic fit** (match quality), not thesis validity. It sends a structured JSON payload to `/api/match/qa` containing student profile + topic data + the retriever base score, and Claude evaluates feasibility using a strict system prompt. It returns a confidence score (0–100), a match tier (Perfect Fit / Strong Candidate / Stretch Goal / Misaligned), identified skill gaps, and a student-facing rationale.

---

### QA Match Agent (Technical)

**Q: What are the strict rules in the QA agent's system prompt?**

A: From `QA_SYSTEM_PROMPT` in `qa-agent.ts`, the rules are explicit constraints on Claude's behaviour:

- **DO**: Cross-reference prerequisites against the student's actual GitHub language distribution and degree.
- **DO**: Explicitly flag skill mismatches — "If the topic requires C++ and the student only has Python, explicitly flag it."
- **DO**: Be specific about GitHub metrics (commit counts, language percentages).
- **DO**: Use academic language ("strong candidate", "aligns well").
- **DO NOT**: Hallucinate skills.
- **DO NOT**: Be overly optimistic — "If it's 60% fit, label it a stretch goal."
- **DO NOT**: Give generic praise. Be specific.

---

**Q: What fallback does the QA agent use if the backend call fails?**

A: It returns a mock response using the `baseScore` from the retrieval engine:

```typescript
{
  final_confidence_score: baseScore,
  match_tier: baseScore > 80 ? 'Perfect Fit' : 'Strong Candidate',
  technical_reality_check: { is_feasible: true, identified_gaps: [], strongest_assets: ["Matching skill profile"] },
  student_facing_rationale: "We're experiencing high load..."
}
```

This ensures the UI never breaks even if the AI backend is unavailable.

---

### State Management & Memory (Technical)

**Q: How does the refinement loop work technically?**

A: The `compileThesisGraph()` function compiles the workflow with a `MemorySaver` checkpointer:

```typescript
export const compileThesisGraph = () => {
  return workflow.compile({ checkpointer: memorySaver });
};
```

`MemorySaver` persists state in-memory keyed by a `threadId`. When the student submits a refinement, the server invokes the graph with the **same `threadId`** and appends the new pitch text. Because the `messages` reducer uses `x.concat(y)` (append) and the other reducers use `y` (overwrite), the conversation history accumulates while the structured outputs are refreshed. This is the LangGraph "human-in-the-loop" pattern.

---

**Q: How does the frontend receive agent updates in real-time?**

A: The server (`server.ts`) uses **Server-Sent Events (SSE)**:
- The client opens an `EventSource` connection to `/api/validate`.
- As each agent node completes, the server writes: `event: node_update\ndata: {...}\n\n`.
- After all three agents complete, it writes: `event: complete\ndata: {healthCard}\n\n`.
- The `ExecutionLog.tsx` component renders each `node_update` as a log line (e.g., `[WORKER: professor] Agent professor completed its task.`).
- The `ThesisHealthCard.tsx` component renders on `event: complete`.

---

### AI Thesis Validator Management / Logic Questions

**Q: Why three agents instead of one big LLM call?**

A: Separation of concerns and staged enrichment: (1) The Professor's structured output becomes concrete input to the Assistant — the literature search needs a refined topic title and research questions, not a raw rambling pitch. (2) The Chair needs all previous context to make a defensible verdict. Chaining outputs forces each agent to specialise and produce higher-quality, more focused results. A single mega-prompt would produce less reliable structured output.

---

**Q: Why use LangGraph instead of a simple chain of API calls?**

A: LangGraph adds three capabilities beyond a simple chain: (1) **Typed state management** — the `Annotation.Root` schema with reducers ensures no partial state overwrites. (2) **Checkpointing** — `MemorySaver` enables the refinement loop without re-running earlier agents unnecessarily. (3) **Extensibility** — adding a new agent node (e.g., a "Methodology Expert") requires only `.addNode()` and `.addEdge()` changes; the rest of the graph is unaffected.

---

**Q: What happens if OpenAlex returns no papers?**

A: The Assistant tool returns the string `"No recent papers found for this topic."`. The structured output synthesis step (`messagesToProvide.push(new HumanMessage("No tool calls were made. Proceeding to synthesis."))`) is also triggered if no tool calls were emitted. The Chair still runs with whatever literature context was produced (potentially a low-confidence assessment), and the student sees a realistic saturation level based on the LLM's training knowledge as fallback.

---

**Q: What does APPROVED / NEEDS_REVISION / REJECTED mean in practice?**

A: These are the Chair's verdict values in `finalVerdict`:
- **APPROVED** — The proposal has acceptable scope, a clear research gap, and feasible methodology.
- **NEEDS_REVISION** — The idea has merit but scope creep, unclear RQs, or methodology issues need fixing before supervisor pitch.
- **REJECTED** — Fatal flaw: requires unavailable proprietary data, impossible compute scale, or has zero novel contribution.

The student's next action is driven by `actionableFeedback` — a single sentence telling them exactly what to change before the next iteration.

---

**Q: Why is the validator on the backend, not client-side like the matching engine?**

A: Two reasons: (1) **API key security** — the Anthropic key must not be exposed in browser-side code. (2) **Streaming** — SSE requires an open HTTP connection managed by a server; browsers cannot act as SSE servers.

---

## Tech Stack & Dependencies

**Q: What is the complete tech stack?**

A: 

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 19.2.4 |
| Frontend routing | React Router | 7.13.1 |
| State management | Zustand | 5.0.12 |
| Styling | Tailwind CSS | 4.2.2 |
| UI components | shadcn/ui + Radix UI | — |
| Animations | Framer Motion | 12.38.0 |
| Build tool | Vite | 8.0.0 |
| Language | TypeScript | 5.9.3 |
| Backend server | Express | 4.21.2 |
| AI agent framework | LangGraph | 1.2.3 |
| LLM | Claude 3.5 Sonnet (Anthropic) | via `@langchain/anthropic` 1.3.25 |
| LLM SDK (Vercel) | Vercel AI SDK | 6.0.116 |
| Vector database | Pinecone Serverless | 4.0.0 |
| Embedding model | multilingual-e5-large | via Pinecone Inference |
| Literature search | OpenAlex API | public, no key required |
| Schema validation | Zod | 4.3.6 |
| PDF parsing | pdfjs-dist | 4.0.0 |
| File uploads | multer | 1.4.5-lts |
| Runtime | Node.js + tsx | v18+ |

---

**Q: What API keys are required to run the full prototype?**

A: Two environment variables in `.env.local`:
- `ANTHROPIC_API_KEY` — required for CV extraction (`/api/process-cv`) and all AI agents.
- `PINECONE_API_KEY` — required for semantic vector search. The index name is configured via `PINECONE_INDEX_NAME` (defaults to `studyond-brain`). Without Pinecone, the matching engine falls back to field-based scoring.
- `ANTHROPIC_MODEL` — optional override (defaults to `claude-3-5-sonnet-latest`).

OpenAlex requires no API key.

---

**Q: Why Pinecone over alternatives like Weaviate or Chroma?**

A: Pinecone Serverless has a **built-in Inference API** that handles embedding generation alongside the vector index — no separate embedding service needed. For a 48-hour hackathon, this reduces infrastructure to a single API call. The `multilingual-e5-large` model is well-benchmarked for multilingual academic text, which matters for a Swiss university platform covering English and German topics.

---

**Q: Why use Zod for structured output instead of JSON parsing?**

A: `llm.withStructuredOutput(zodSchema)` makes LangChain/Anthropic use structured output mode (or function calling), which instructs the LLM to produce JSON matching the schema. Zod validates the parsed result at runtime, so if Claude produces an invalid shape, it throws immediately with a typed error rather than silently failing downstream. This is particularly important for the Chair's verdict where a missing `finalVerdict` would break the health card rendering.

---

## Cross-Feature Questions

**Q: How do the two features interact?**

A: They share the `StudentProfile` type. The Matching Engine produces `GoldenTriangleMatch[]` on the Matches page. When a student clicks "Validate" on a match, the `ValidateTopicPage` takes the topic title/description from the match and initialises the thesis validator with it as the initial pitch. The validator's `academicRoadmap` can be used to re-run matching with a refined topic title in future iterations.

---

**Q: What is the data flow from CV upload to matches?**

A:

```
1. Student uploads PDF/TXT CV
        ↓
2. server.ts /api/process-cv
   - pdfjs-dist extracts text
   - Claude parses text into StudentProfile (structured JSON)
   - Returns: { profile: StudentProfile }
        ↓
3. profile-extractor.ts (client or server)
   - Zod-validated extraction of skills, fieldIds, degree, about, semanticTags
        ↓
4. /api/match-profile (or client-side matchGoldenTriangle())
   - Vector search on Pinecone
   - 6-signal scoring + Golden Triangle
   - Returns: GoldenTriangleMatch[]
        ↓
5. MatchPage.tsx renders the results with triangleScore and explanation
```

---

**Q: What mock data is used when running locally?**

A: `mock-data/` at the workspace root contains:
- `topics.json` — thesis topics with fieldIds, degrees, employment, companyId
- `supervisors.json` — supervisors with researchInterests, universityId, fieldIds
- `experts.json` — industry experts with offerInterviews flag
- `companies.json` — companies with size, description
- `universities.json` — Swiss universities
- `students.json`, `fields.json`, `study-programs.json`

The frontend loads these directly from `src/mock-data/` (a copy kept for client-side use). The server also reads from the workspace-level mock data for the `/api/match-profile` endpoint.

---

**Q: Are there automated tests?**

A: No automated tests are currently implemented in the prototype. Validation was done through the browser UI during the hackathon. The most valuable unit tests to add would be: (1) scoring functions in `matching-engine.ts` with fixed inputs, (2) the `fieldOverlap` Jaccard calculation, and (3) the `scorePriorityFit` weighted average. These are pure functions with no external dependencies, making them ideal for fast unit testing with Vitest.

---

*Generated from direct source code analysis of `thesis-compass/src/lib/matching-engine.ts`, `thesis-compass/api/agents/graph.ts`, `thesis-compass/api/agents/state.ts`, `thesis-compass/api/tools/openalex.ts`, `thesis-compass/src/lib/agents/qa-agent.ts`, `thesis-compass/src/lib/vector-store.ts`, and `thesis-compass/src/types/profile.ts`.*
