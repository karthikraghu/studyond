# Thesis Compass Session Context README

Use this file to bootstrap any new AI session fast.

## 1) Quick Start For New Sessions

Copy the prompt block below into a new chat before asking for implementation work.

```text
Project: Thesis Compass (Studyond)

You are working on Thesis Compass, an AI-first thesis journey platform.

Core purpose:
- Guide students through thesis discovery and execution support.
- Match Student + Topic + Supervisor (Golden Triangle).
- Keep an organizational focus (planning, matching, outreach, milestones), not thesis writing.

Current stack:
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS + vanilla CSS + Framer Motion
- UI/icons: shadcn primitives + lucide-react
- State: Zustand with localStorage persistence
- Backend (local dev): Express server in server.ts
- Data: local JSON mock data (no database)
- AI: Anthropic via Vercel AI SDK; QA critic agent for feasibility checks

Critical constraints:
- Do not introduce a database unless explicitly requested.
- Prefer mock JSON + existing Zustand stores.
- Keep routing config-driven via src/config/routes.ts.
- Keep user identity/state in useOnboardingStore.
- Preserve premium Studyond visual style (clean, high-end dashboard UI, smooth motion).

Primary flows:
- Onboarding wizard (role selection -> details -> review -> student topic inquiry)
- Student matching (match-profile API + AI Reality Check)
- Contact supervisor from match card and track in My Activity

When making changes:
- Read existing related files first.
- Keep modifications minimal and aligned with current architecture.
- If adding a page, register it in src/config/routes.ts.
- If adding nav entry, update src/config/navigation.ts.
```

## 2) Repository Snapshot (March 19, 2026)

- Workspace root contains PRD, references, context knowledge graph, and the app in thesis-compass.
- Main app lives in thesis-compass.
- The current thesis-compass/README.md is still the default Vite template and not project-specific.

## 3) Product Definition (Current)

- Product: Thesis Compass for Studyond.
- Positioning: AI companion for thesis journey management.
- Differentiator: Golden Triangle matching plus AI Reality Check before outreach.
- Governance: AI suggests, humans decide. No autonomous academic approval.

## 4) Implemented Architecture

### Frontend

- React app with route config in src/config/routes.ts.
- App shell in src/layouts/AppLayout.tsx.
- Role-aware onboarding via src/components/onboarding/*.
- Dashboard and feature pages under src/pages/*.

### State

- src/store/useOnboardingStore.ts is the central persisted store.
- Holds onboarding data, student profile, GitHub stats, and application activity tracking.
- Application tracking API:
  - trackApplication(...)
  - updateApplicationStatus(id, status)

### Backend

- thesis-compass/server.ts provides local API endpoints for development.
- Loads mock data from thesis-compass/src/mock-data/*.json.
- Supports CV parsing, matching, GitHub lookup, and AI chat/match helpers.

### Data Strategy

- Prototype mode: JSON mock data only.
- No Supabase or persistent backend DB in current flow.

## 5) Key User Flows In Code

### Onboarding

- Entry route: /
- Wizard component: src/components/onboarding/OnboardingWizard.tsx
- Student form supports CV upload to /api/process-cv and optional GitHub username.

### Matching + Reality Check

- Match page: src/pages/matches/MatchPage.tsx
- Uses /api/match-profile for ranked opportunities.
- Uses QA agent helper in src/lib/agents/qa-agent.ts for AI feasibility critique.

### Activity Tracking

- Left nav includes My Activity.
- Activity page: src/pages/activity/ActivityPage.tsx
- Visual tracker: src/components/dashboard/ActivityTracker.tsx
- Data source: applications array in useOnboardingStore.

### Topic Validation

- Page exists at src/pages/validate/ValidateTopicPage.tsx.
- Current behavior is mocked UI simulation, not full agent orchestration yet.

## 6) Important Files To Read First In Any Task

- PRD.md
- thesis-compass/server.ts
- thesis-compass/src/config/routes.ts
- thesis-compass/src/config/navigation.ts
- thesis-compass/src/store/useOnboardingStore.ts
- thesis-compass/src/pages/home/HomePage.tsx
- thesis-compass/src/pages/matches/MatchPage.tsx
- thesis-compass/src/components/dashboard/ActivityTracker.tsx

## 7) Runbook

From thesis-compass:

1. Install dependencies
   - npm install
2. Start backend API
   - npx tsx server.ts
3. Start frontend
   - npm run dev

Frontend default: http://localhost:5173
Backend default: http://localhost:3001

## 8) Environment Variables

Supported files:

- .env
- .env.local (takes priority)

Expected keys:

- ANTHROPIC_API_KEY (or VITE_ANTHROPIC_API_KEY fallback)
- PINECONE_API_KEY (or VITE_PINECONE_API_KEY fallback)
- PINECONE_INDEX_NAME

Graceful degradation exists when keys are missing, but capability is reduced.

## 9) Known Gaps / Active Prototype Constraints

- thesis-compass/README.md should be replaced with a project-specific README.
- Validate Topic flow is still mostly simulated.
- Some navigation targets are placeholders (for example /messages, /projects).
- Role-specific dashboards are partially implemented; student flow is most complete.

## 10) Session Kickoff Checklist

When opening a new AI session:

1. Paste the prompt from section 1.
2. State the exact goal (feature, fix, refactor, or review).
3. Ask the assistant to read the key files from section 6 before editing.
4. Ask for minimal, architecture-aligned changes.
