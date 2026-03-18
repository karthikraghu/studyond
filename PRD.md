# Product Requirements Document (PRD)
# Thesis Compass — AI-Powered Thesis Journey System

> **Product**: Thesis Compass  
> **Platform**: Studyond AG  
> **Version**: 1.0 (START Hack 2026 Prototype)  
> **Date**: March 18, 2026  
> **Status**: Draft  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision](#3-product-vision)
4. [Target Users](#4-target-users)
5. [Design Principles](#5-design-principles)
6. [Feature Specifications](#6-feature-specifications)
7. [System Architecture](#7-system-architecture)
8. [Data Model Extensions](#8-data-model-extensions)
9. [User Flows](#9-user-flows)
10. [AI Agent Specifications](#10-ai-agent-specifications)
11. [UI/UX Requirements](#11-uiux-requirements)
12. [Constraints & Non-Goals](#12-constraints--non-goals)
13. [Success Metrics](#13-success-metrics)
14. [Tech Stack](#14-tech-stack)
15. [Phased Rollout](#15-phased-rollout)
16. [Open Questions](#16-open-questions)

---

## 1. Executive Summary

**Thesis Compass** is an AI-first thesis companion system that extends Studyond's platform from topic discovery into full thesis lifecycle support. It proactively walks students through their entire 24-week thesis journey — from orientation to submission — using context-aware AI agents, intelligent matching, and conversational interfaces.

### The Gap

Studyond currently excels at **Stage 1-2** (topic discovery and supervisor search) with 7,500+ topics, 185+ companies, and a working Matching Engine. However, once a student finds a topic, they're on their own for the remaining **4-6 months** of planning, execution, and finalization. This is where 80% of thesis friction lives.

### What We're Building

An integrated system of 5 core subsystems:

| # | Subsystem | What It Does |
|---|-----------|-------------|
| 1 | **Thesis Companion** | End-to-end proactive guide through all 5 thesis stages |
| 2 | **Context-Aware Matching** | AI agents that understand student context to find ideal topics, supervisors, and partners |
| 3 | **Continuous Discovery** | Background agent that alerts students when relevant opportunities appear |
| 4 | **Proactive Networking** | Stage-aware suggestions for interview partners, mentors, and industry experts |
| 5 | **AI-First Interface** | Conversational UI replacing traditional forms and menus |

### Key Constraint

**Organizational ONLY.** Thesis Compass helps students manage, plan, network, and organize their thesis. It does NOT help write the thesis. The focus is on project management, networking, and organization — never on content generation.

---

## 2. Problem Statement

### The Student's Reality

Every thesis student goes through roughly the same 24-week process, but everyone is at a different point with different needs:

- Some have a **topic but no supervisor**
- Some have a **supervisor but no topic**  
- Some have both but need a **company partner**
- Some are writing but need **interview partners** or **data access**
- Some are **just beginning** and don't know where to start

Today, students manage this alone — Googling, emailing professors, asking friends, piecing it together manually. The emotional arc moves from **anxiety** ("What if I pick the wrong topic?") through **isolation** ("Am I even on track?") to **panic** ("My deadline is in 3 weeks and I'm behind").

### What Exists vs. What's Missing

| Area | Today (Exists) | Missing |
|------|---------------|---------|
| Topic Discovery | Student AI Agent, Matching Engine, 7,500+ topics | ✅ Covered |
| Topic Creation | Expert AI Agent for companies | ✅ Covered |
| Supervisor Search | Browsable supervisors, field matching | Partial — no context-aware matching |
| Planning Support | — | ❌ No milestone planning, timeline generation, or methodology guidance |
| Execution Support | — | ❌ No interview partner matching, progress tracking, or nudges |
| Context Memory | Chat stored locally | ❌ No cross-session context accumulation |
| Autonomous Agents | — | ❌ No proactive background search |
| Adaptive Onboarding | — | ❌ Same linear flow for every student, regardless of stage |
| Cross-Entity Intelligence | — | ❌ No recommendations spanning supervisors ↔ topics ↔ companies ↔ experts |

### Quantified Impact

- **50 million** students write a thesis annually worldwide
- **3,300+** students already on Studyond
- **99.7%** of European companies lack a central system for academic collaboration
- Average thesis: **24 weeks** — only weeks 1-4 are currently platform-supported

---

## 3. Product Vision

> **"From 'I'm starting my thesis' to 'I'm handing it in' — one intelligent, adaptive companion that anticipates what you need before you ask."**

Thesis Compass transforms Studyond from a **discovery tool** into a **journey companion**. Just as GitHub became the default for development workflows and LinkedIn for professional identity, Thesis Compass positions Studyond as the central hub where the entire thesis lifecycle is managed.

### Vision Principles

1. **Anticipate, Don't Wait** — The system proactively identifies what the student needs next, rather than waiting to be asked.
2. **Meet Students Where They Are** — Every student enters at a different stage. Thesis Compass adapts the experience to their current situation.
3. **Get Smarter Over Time** — Every interaction builds a richer profile, enabling increasingly personalized and useful assistance.
4. **Suggest, Never Decide** — AI recommends and supports. Academic decisions stay with the professor. Always.

---

## 4. Target Users

### Primary: Students

| Segment | Description | Key Need |
|---------|-------------|----------|
| **Final-Year Students** | Beginning thesis, overwhelmed, need curated topics | Full journey guidance from day 1 |
| **Mid-Stage Students** | Thesis in progress, need interview partners and structure | Execution support, networking |
| **Early-Stage Students** | 1-2 semesters before thesis, exploring options | Low-pressure orientation |
| **PhD Candidates** | Longer timelines, research focus, industry partner needs | Deep research collaboration |
| **International Students** | Language barriers, limited local networks | Expanded network access, cultural context |
| **Career-Transitioning Students** | Finishing studies, entering job market | Thesis-to-hire pathway |

### Secondary: Companies & Universities

| Audience | Benefit from Thesis Compass |
|----------|----------------------------|
| **HR & Talent Acquisition** | Better-matched candidates through richer thesis context data |
| **Innovation Managers** | Students whose thesis projects are better-managed produce higher-quality outputs |
| **Program Directors** | Scalable thesis module integration, aggregate analytics on student progress |
| **Supervisors** | Reduced administrative overhead, structured student updates |

---

## 5. Design Principles

Three foundational principles govern every feature in Thesis Compass. These come directly from Studyond's design philosophy:

### 5.1 Modular Entry
> *"Meet students where they are, not where a predetermined flow assumes they should be."*

- **What it means**: The system detects where a student is in their thesis journey and adapts the experience accordingly.
- **Implementation**: An intelligent onboarding conversation classifies the student into one of the 5 thesis stages and presents the relevant tools, suggestions, and interfaces for that stage.
- **Anti-pattern**: A one-size-fits-all linear wizard that forces every student through the same steps.

### 5.2 Context Accumulation
> *"Every interaction builds a richer understanding."*

- **What it means**: The system remembers what the student has explored — interests, academic stage, field preferences, supervisor interactions, and topic explorations. Over time, it becomes a persistent, intelligent companion that grows more useful.
- **Implementation**: A `ThesisContext` object persists across sessions, progressively filling in topic direction, methodology preferences, timeline constraints, skill gaps, and networking needs.
- **Anti-pattern**: A stateless chatbot that starts fresh every session.

### 5.3 Academic Governance
> *"AI suggests and supports; the professor approves, guides, and grades."*

- **What it means**: The professor-student supervisory relationship remains sacrosanct. Companies participate as expert partners, not academic authorities. AI never overrides or bypasses academic judgment.
- **Implementation**: AI recommendations are always framed as suggestions. Supervisor approval gates exist at critical milestones (topic approval, methodology review, etc.).
- **Anti-pattern**: An AI system that assigns supervisors, approves topics, or makes academic decisions.

### 5.4 Editorial Minimalism (Brand)
> *"Authority through restraint."*

- **Visual**: Monochrome palette, generous whitespace, magazine-like typography. Color is functional (never decorative). AI features use the signature purple-blue gradient accent.
- **Interaction**: Progressive disclosure. Hover reveals. Nothing screams for attention.
- **Tone**: Warm, supportive, peer-like. Acknowledge stress. Active verbs. Never condescending.

---

## 6. Feature Specifications

### Feature 1: Thesis Companion System — "The Journey Engine"

**Goal**: An integrated, end-to-end guide that proactively walks students through the entire organizational lifecycle of their thesis project, anticipating what they need before they even ask.

#### 6.1.1 Intelligent Stage Detection

The system determines where the student is in their thesis journey via a **conversational onboarding flow** (not a form):

| Stage | Weeks | Detection Signals | System Response |
|-------|-------|-------------------|-----------------|
| **Orientation** | 1-4 | No topic, no supervisor, exploring | Surface field exploration, interest mapping, topic browsing |
| **Topic & Supervisor Search** | 2-8 | Has direction but no locked topic/supervisor | Activate matching agents, supervisor recommendations |
| **Planning** | 4-10 | Has topic + supervisor, needs structure | Generate timeline, methodology suggestions, gap analysis |
| **Execution** | 6-20 | Actively researching | Progress tracking, interview partner matching, nudges |
| **Finalization** | 16-24 | Writing/submitting | Deadline tracking, feedback cycle management, submission checklist |

**Conversation Example (Stage Detection)**:
```
Compass: "Hey! Let's figure out where you are in your thesis journey. 
          Have you already found a topic you want to work on?"
          
Student: "Sort of — I'm interested in sustainability in supply chains 
          but haven't found a specific topic yet."
          
Compass: "Got it! Sounds like you're in the exploration phase. 
          I found 23 company topics in supply chain sustainability 
          that match your MSc in Business Innovation at HSG. 
          Want me to walk you through the top 5?"
```

#### 6.1.2 Proactive Next-Step Engine

Based on the student's current stage and context, the system generates **proactive nudges**:

| Student State | Proactive Suggestion |
|--------------|---------------------|
| Has topic, no supervisor | "Based on your topic in NLP applications, Prof. Dr. Müller at ETH has published 3 related papers. Should I draft an introduction message?" |
| Has supervisor, no timeline | "You've been in the planning stage for 2 weeks. Shall I generate a milestone timeline based on your June 15 deadline?" |
| Execution week 8, no interviews scheduled | "Your methodology mentions expert interviews, but you haven't connected with any interview partners yet. I found 5 experts in your field on Studyond." |
| 3 weeks before deadline, feedback pending | "Your supervisor hasn't responded to your last check-in 10 days ago. Want me to send a gentle reminder?" |

#### 6.1.3 Milestone & Timeline Generator

**Input**: Thesis deadline, topic complexity, chosen methodology, degree level.

**Output**: A personalized milestone plan with realistic timeframes.

**Example Generated Timeline** (for a 24-week MSc thesis, qualitative research):

| Week | Milestone | Status | AI Actions |
|------|-----------|--------|------------|
| 1-3 | Topic finalization | ✅ Complete | — |
| 3-5 | Literature review plan | 🔄 In Progress | Suggest relevant papers based on topic |
| 5-7 | Methodology design | ⬜ Upcoming | Suggest approach based on research question |
| 7-9 | Interview guide creation | ⬜ Upcoming | Surface interview partners from Experts network |
| 9-16 | Data collection (interviews) | ⬜ Upcoming | Track scheduled interviews, suggest additional partners |
| 14-18 | Analysis & interpretation | ⬜ Upcoming | — |
| 18-22 | Writing first draft | ⬜ Upcoming | Track supervisor feedback cycles |
| 22-24 | Review & submission | ⬜ Upcoming | Submission checklist, deadline countdown |

> **Note**: This is organizational milestone tracking only — not writing assistance.

---

### Feature 2: Context-Aware Matching Agents

**Goal**: Instead of students manually searching and sending cold emails, AI agents understand the student's full context to automatically pinpoint the best thesis topics and ideal supervisors.

#### 6.2.1 Multi-Signal Context Profile

The system builds a rich `ThesisContext` from multiple sources:

```
ThesisContext {
  // From student profile
  studyProgram: "MSc Business Innovation"
  university: "University of St. Gallen"
  degree: "msc"
  skills: ["Python", "qualitative research", "data analysis"]
  fields: ["Supply Chain Management", "Sustainability"]
  
  // From conversations (accumulated over time)
  topicInterests: ["circular economy", "supplier ESG scoring"]
  methodologyPreference: "mixed-methods"
  careerAspirations: ["strategy consulting", "sustainability roles"]
  
  // From platform interactions
  viewedTopics: [topic-12, topic-45, topic-78]
  bookmarkedTopics: [topic-45]
  appliedTopics: []
  contactedSupervisors: [supervisor-03]
  
  // Inferred
  currentStage: "topic_search"
  readinessScore: 0.65  // How close to locking in a topic
  urgencyLevel: "moderate"  // Based on program timeline
}
```

#### 6.2.2 Cross-Entity Matching

The matching agent surfaces **connections across entity types** that no human search could easily find:

**Example**: *"This supervisor (Prof. Müller) has published research on ESG scoring in supply chains. Company XYZ has posted a topic on 'Sustainable Supplier Evaluation Framework.' Expert Dr. Schmidt at XYZ specializes in procurement analytics. All three align with your interest in supplier ESG scoring."*

This cross-entity intelligence connects:
- **Supervisor** ↔ research interests
- **Topic** ↔ field + description
- **Expert** ↔ domain expertise
- **Student** ↔ accumulated context

#### 6.2.3 Matching Score Transparency

Every match comes with an explanation:

```
Topic: "Sustainable Supplier Evaluation Framework" 
Company: Nestlé AG
Match Score: 92%

Why this matches you:
✓ Field alignment: Supply Chain Management (your primary field)
✓ Skill fit: Your Python + data analysis skills match the quantitative requirements  
✓ Career alignment: Strategy consulting firms value ESG expertise
✓ Supervisor available: Prof. Dr. Müller (ETH) has supervised 3 similar theses
✓ Employment potential: Open to hiring after thesis completion
```

---

### Feature 3: Continuous Discovery Agent

**Goal**: An automated background agent that continuously scans the platform and alerts the student the moment a highly relevant supervisor or new company topic becomes available.

#### 6.3.1 Alert Types

| Alert | Trigger | Example |
|-------|---------|---------|
| **New Topic Match** | A company publishes a topic matching >80% of the student's context | "Deloitte just posted a topic on 'AI-Driven ESG Reporting' — 88% match with your profile" |
| **Supervisor Availability** | A supervisor in the student's field opens new thesis slots | "Prof. Weber at HSG now has 2 open thesis slots for Spring 2026 in your field" |
| **Expert Joins** | A new expert registers with matching domain expertise | "Dr. Laura Chen (SAP, Supply Chain Analytics) just joined and is available for interviews" |
| **Peer Activity** | A student with a similar thesis topic reaches a milestone | "3 other students are working on related ESG topics — want to connect?" |
| **Deadline Reminder** | University deadline approaching | "Registration deadline for Spring thesis at HSG is in 14 days" |

#### 6.3.2 Alert Intelligence

Alerts are not dumb notifications. They are **contextually ranked**:

- **Relevance score**: Based on ThesisContext match quality
- **Timing score**: How relevant this is to the student's current stage
- **Uniqueness score**: How rare this type of opportunity is
- **Combined ranking**: Only surface alerts above a threshold to avoid noise

**Alert cadence**: Maximum 3 alerts per week to prevent notification fatigue. Students can adjust sensitivity.

#### 6.3.3 Background Scan Architecture

```
┌─────────────────────────────┐
│  Continuous Discovery Agent │
├─────────────────────────────┤
│                             │
│  1. New Entity Listener     │ ← Watches for new topics, supervisors, experts
│  2. Context Matcher         │ ← Compares against all active ThesisContexts
│  3. Relevance Scorer        │ ← Ranks matches by multi-signal score
│  4. Alert Queue             │ ← Batches and deduplicates alerts
│  5. Delivery Engine         │ ← In-app + email digest (configurable)
│                             │
└─────────────────────────────┘
```

---

### Feature 4: Proactive Networking & Validation

**Goal**: A system that recognizes where a student is in their timeline and automatically suggests relevant industry experts or interview partners from the platform.

#### 6.4.1 Stage-Aware Networking Suggestions

| Student Stage | Networking Need | System Action |
|--------------|----------------|---------------|
| **Orientation** | Inspiration & direction | Suggest 3 experts who have mentored similar thesis topics |
| **Topic Search** | Topic validation | Suggest 5 industry experts who can validate the research direction |
| **Planning** | Methodology input | Suggest researchers or practitioners with relevant methodology experience |
| **Execution** | Interview partners | Surface 5-10 experts matching the student's qualitative research needs |
| **Finalization** | Final review | Suggest alumni or experts for practice presentations |

#### 6.4.2 Smart Expert Matching

For each suggestion, the system provides:

```
Suggested Expert: Dr. Anna Keller
Company: McKinsey & Company
Title: Senior Associate, Sustainability Practice
Match Reason: "Her expertise in ESG strategy directly relates 
              to your thesis on supplier evaluation frameworks. 
              She has participated in 4 student interviews this year."
              
Available for: ✅ Interviews  ✅ Informal mentoring
Fields: Supply Chain Management, Sustainability, Strategy

[Connect via Studyond Message] [Add to Interview List]
```

#### 6.4.3 Networking Readiness Signals

The system nudges students to network at the right time:

- *"You're 2 weeks into your execution phase and your methodology involves 8-10 expert interviews. You've scheduled 2 so far. Here are 5 more experts who match your research questions."*
- *"Based on similar theses in your field, students typically secure 70% of interview partners by week 10. You're at 40% — want me to help expand your search?"*

---

### Feature 5: AI-First Interface — "Conversational Thesis Dashboard"

**Goal**: Rethink the user journey. Instead of traditional forms and drop-down menus, use conversational interfaces and dynamic workflows.

#### 6.5.1 Conversational Hub

The primary interface is a **persistent chat panel** that serves as the central command center:

```
┌──────────────────────────────────────────────────────┐
│  Thesis Compass                              Stage 3 │
│  ─────────────────────────────────────────────────── │
│                                                      │
│  [Chat Panel]              │  [Context Sidebar]      │
│                            │                         │
│  Compass: Your planning    │  📊 Progress: 35%      │
│  phase is going well!      │  📅 Deadline: Jun 15    │
│  I notice you haven't      │  📝 Topic: Locked ✅    │
│  set up your literature    │  👤 Supervisor: ✅      │
│  review plan yet.          │  🏢 Company: Nestlé     │
│                            │  📋 Milestones: 3/12    │
│  Should I suggest a        │                         │
│  structure based on your   │  ── Recent Matches ──   │
│  methodology?              │  🔔 2 new topics        │
│                            │  👥 3 expert suggestions │
│  [Yes, help me plan]       │                         │
│  [I'll handle this myself] │                         │
│  [Show me examples]        │                         │
│                            │                         │
└──────────────────────────────────────────────────────┘
```

#### 6.5.2 Dynamic Action Cards

Instead of static pages, information surfaces as **action cards** within the conversation:

- **Topic Card**: Shows a matched topic with match score, company info, and one-click apply
- **Supervisor Card**: Shows research alignment, availability, and draft introduction message
- **Expert Card**: Shows domain relevance, interview availability, and connect button
- **Milestone Card**: Shows progress, upcoming deadlines, and suggested actions
- **Alert Card**: Shows new opportunities with relevance explanation

#### 6.5.3 Quick Actions via Natural Language

Students can accomplish platform actions through conversation instead of navigating:

| Student Says | System Does |
|-------------|------------|
| "Show me topics about AI in healthcare" | Surfaces matched topics with context scoring |
| "I want prof. Müller to supervise me" | Adds to supervisor list, offers to draft intro message |
| "I need 5 interview partners in fintech" | Searches experts, presents matches with availability |
| "Move my literature review to done" | Updates milestone status, suggests next milestone |
| "What should I focus on this week?" | Analyzes timeline, suggests prioritized actions |

#### 6.5.4 Mode Switching

Inspired by Studyond's existing "Fast" vs "Thinking" modes:

| Mode | Behavior | Use Case |
|------|----------|----------|
| **Quick** | Short, actionable responses. Minimal explanation. | Student knows what they want |
| **Guide** | Detailed explanations, alternatives, reasoning. | Student needs direction |
| **Focus** | Minimized chat, dashboard-only view. | Deep work, no distractions |

---

## 7. System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19 + Vite)              │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │ Chat UI  │  │ Dashboard    │  │ Action Cards        │    │
│  │ (AI SDK) │  │ (Progress)   │  │ (Topic/Expert/etc.) │    │
│  └────┬─────┘  └──────┬───────┘  └──────────┬──────────┘    │
│       │               │                     │                │
│  ┌────▼───────────────▼─────────────────────▼────────────┐   │
│  │              State Layer (Zustand)                     │   │
│  │  ThesisContext │ Milestones │ Alerts │ Matches         │   │
│  └────────────────────────┬──────────────────────────────┘   │
└───────────────────────────┼──────────────────────────────────┘
                            │ API Calls (REST + Streaming)
┌───────────────────────────▼──────────────────────────────────┐
│                      BACKEND / API LAYER                      │
│                                                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐   │
│  │ Companion Agent │  │ Matching Agent   │  │ Discovery  │   │
│  │ (Orchestrator)  │  │ (Cross-Entity)   │  │ Agent      │   │
│  └────────┬────────┘  └────────┬─────────┘  └─────┬──────┘   │
│           │                    │                   │           │
│  ┌────────▼────────────────────▼───────────────────▼───────┐  │
│  │              AI Layer (Vercel AI SDK + Anthropic)        │  │
│  │  Tool Use │ Streaming │ Context Window │ Reasoning      │  │
│  └────────────────────────┬────────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │              Data Layer                                  │  │
│  │  ThesisContext Store │ Mock Data │ Alert Queue           │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Agent Communication

```
Student Input
     │
     ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Companion  │────▶│   Matching   │────▶│  Discovery   │
│   Agent     │     │   Agent      │     │  Agent       │
│  (Router)   │◀────│ (Retriever)  │◀────│ (Scanner)    │
└─────────────┘     └──────────────┘     └──────────────┘
     │                     │                    │
     ▼                     ▼                    ▼
┌─────────────────────────────────────────────────────┐
│              Shared ThesisContext Store              │
└─────────────────────────────────────────────────────┘
```

---

## 8. Data Model Extensions

### New Entities (extending existing mock-data types)

```typescript
// Thesis Context — the accumulated understanding of each student's journey
interface ThesisContext {
  id: string;
  studentId: string;
  
  // Journey state
  currentStage: ThesisStage;
  stageEnteredAt: string;  // ISO timestamp
  
  // Accumulated interests
  topicInterests: string[];        // Keywords from conversations
  methodologyPreference: MethodologyType | null;
  careerAspirations: string[];
  
  // Interaction history
  viewedTopicIds: string[];
  bookmarkedTopicIds: string[];
  appliedTopicIds: string[];
  contactedSupervisorIds: string[];
  contactedExpertIds: string[];
  
  // Inferred scores
  readinessScore: number;   // 0-1, how ready to proceed to next stage
  urgencyLevel: 'low' | 'moderate' | 'high' | 'critical';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

type ThesisStage = 
  | 'orientation'
  | 'topic_search'
  | 'planning'
  | 'execution'
  | 'finalization';

type MethodologyType = 
  | 'qualitative'
  | 'quantitative'
  | 'mixed_methods'
  | 'design_based'
  | 'experimental';

// Milestone — progress tracking within the thesis journey
interface Milestone {
  id: string;
  projectId: string;  // Links to ThesisProject
  title: string;
  description: string;
  targetWeek: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
  category: MilestoneCategory;
  completedAt: string | null;
  createdAt: string;
}

type MilestoneCategory = 
  | 'topic'
  | 'supervisor'
  | 'literature'
  | 'methodology'
  | 'data_collection'
  | 'analysis'
  | 'writing'
  | 'review'
  | 'submission';

// Alert — notifications from the Continuous Discovery Agent
interface Alert {
  id: string;
  studentId: string;
  type: AlertType;
  title: string;
  body: string;
  relevanceScore: number;  // 0-1
  entityType: 'topic' | 'supervisor' | 'expert' | 'peer' | 'deadline';
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

type AlertType = 
  | 'new_topic_match'
  | 'supervisor_availability'
  | 'expert_joined'
  | 'peer_activity'
  | 'deadline_reminder'
  | 'milestone_nudge';

// Networking Suggestion — proactive expert recommendations
interface NetworkingSuggestion {
  id: string;
  studentId: string;
  expertId: string;
  reason: string;          // Human-readable explanation
  relevanceScore: number;  // 0-1
  stage: ThesisStage;      // Which stage triggered this suggestion
  status: 'suggested' | 'viewed' | 'connected' | 'dismissed';
  createdAt: string;
}
```

### Relationship to Existing Entities

```
Student ──── 1:1 ──── ThesisContext
Student ──── 1:N ──── ThesisProject (existing)
ThesisProject ── 1:N ── Milestone (new)
Student ──── 1:N ──── Alert (new)
Student ──── 1:N ──── NetworkingSuggestion (new)
NetworkingSuggestion ── N:1 ── Expert (existing)
```

---

## 9. User Flows

### Flow 1: First-Time Student Onboarding (Modular Entry)

```
Student opens Thesis Compass for the first time
         │
         ▼
┌─────────────────────────────────┐
│  Conversational Stage Detection │
│  "Where are you in your        │
│   thesis journey?"             │
│                                │
│  [Just exploring]              │
│  [I have a topic idea]         │
│  [I have a topic + supervisor] │
│  [I'm already writing]         │
└──────────┬──────────────────────┘
           │
     ┌─────┼─────┬─────┬─────┐
     ▼     ▼     ▼     ▼     ▼
   Stage  Stage Stage Stage Stage
    1      2     3     4     5
           │
           ▼
┌──────────────────────────────┐
│  Context-Building Questions  │
│  (3-5 max, conversational)   │
│                              │
│  • What field interests you? │
│  • When is your deadline?    │
│  • Do you want an industry   │
│    partner for your thesis?  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Personalized Dashboard      │
│  (Stage-appropriate view     │
│   with first recommendations)│
└──────────────────────────────┘
```

### Flow 2: Topic Discovery → Supervisor Matching → Planning

```
Student explores topics via conversation
         │
         ▼
Matching Agent surfaces 5 topics with context scoring
         │
         ▼
Student bookmarks 2, applies to 1
         │
         ▼
Context updates: topicInterests, appliedTopicIds
         │
         ▼
Agent proactively suggests: "For this topic, 
Prof. Weber's research in X aligns well. 
She supervised 2 similar theses last year."
         │
         ▼
Student connects with supervisor
         │
         ▼
Stage transitions: topic_search → planning
         │
         ▼
System generates milestone timeline
         │
         ▼
"Your thesis deadline is June 15. Based on 
a mixed-methods approach, here's a suggested 
24-week plan. Should I adjust anything?"
```

### Flow 3: Execution Phase — Interview Partner Discovery

```
Student is in Execution Stage, week 10
         │
         ▼
Proactive Networking Agent detects:
  - Methodology = qualitative (8-10 interviews)
  - Interviews scheduled = 3
  - Target = 8-10
         │
         ▼
Alert: "You're halfway through execution 
with 3 of 8+ interviews scheduled. 
Here are 5 experts in your field:"
         │
         ▼
┌────────────────────────────────┐
│  Expert Card: Dr. Anna Keller  │
│  McKinsey • ESG Strategy       │
│  Match: 94% • Available ✅     │
│  [Connect] [Dismiss] [Later]   │
├────────────────────────────────┤
│  Expert Card: Thomas Berger    │
│  Nestlé • Supply Chain         │
│  Match: 87% • Available ✅     │
│  [Connect] [Dismiss] [Later]   │
└────────────────────────────────┘
         │
         ▼
Student connects with 2 experts
         │
         ▼
Context updates: contactedExpertIds
Next nudge scheduled for week 12 if < 6 interviews
```

---

## 10. AI Agent Specifications

### Agent 1: Companion Agent (Orchestrator)

| Property | Value |
|----------|-------|
| **Role** | Central coordinator. Routes student queries, manages stage transitions, generates proactive nudges. |
| **Model** | Anthropic Claude (via Vercel AI SDK) |
| **Context Window** | Full ThesisContext + recent conversation history |
| **Tools** | `get_thesis_context`, `update_stage`, `generate_milestones`, `search_topics`, `search_supervisors`, `search_experts`, `create_alert`, `get_milestones` |
| **Personality** | Warm, supportive, peer-like. Uses "you" language. Acknowledges stress. Never condescending. |
| **Streaming** | Yes — responses stream in real-time with visible reasoning in "Guide" mode |

### Agent 2: Matching Agent (Retriever)

| Property | Value |
|----------|-------|
| **Role** | Finds and ranks topics, supervisors, experts, and company partners based on ThesisContext. |
| **Input** | ThesisContext + query parameters |
| **Output** | Ranked list of entities with match scores and explanations |
| **Matching Signals** | Field alignment, skill fit, career alignment, supervisor availability, employment potential, research interest overlap |
| **Cross-Entity** | Can connect supervisor research ↔ topic description ↔ expert domain ↔ student interests in a single recommendation |

### Agent 3: Discovery Agent (Background Scanner)

| Property | Value |
|----------|-------|
| **Role** | Monitors platform for new entities or changes relevant to each student's context. |
| **Trigger** | New topic published, new expert registered, supervisor updates slots, deadline approaching |
| **Frequency** | Runs on entity change events (event-driven, not polling) |
| **Output** | Alert objects ranked by relevance, added to student's alert queue |
| **Throttle** | Max 3 alerts per student per week |

### Agent 4: Networking Agent (Relationship Mapper)

| Property | Value |
|----------|-------|
| **Role** | Maps student needs to expert/supervisor/mentor availability at each stage. |
| **Input** | ThesisContext.currentStage + methodology + research topic |
| **Output** | 5 ranked NetworkingSuggestion objects with human-readable reasons |
| **Timing** | Triggered by stage transitions and periodic progress checks |

---

## 11. UI/UX Requirements

### Design System Alignment

Thesis Compass uses Studyond's existing design system:

| Element | Specification |
|---------|--------------|
| **Framework** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 + shadcn/ui (new-york style) + Radix UI |
| **Icons** | Tabler Icons |
| **Animation** | Framer Motion |
| **Typography** | Two-font system per brand guidelines. Serif display headlines, sans-serif body. |
| **Color** | Monochrome base + functional color badges + AI purple-blue gradient for AI features |
| **Buttons** | Fully rounded (core brand element) |
| **Cards** | Shadow-on-hover only |
| **Grid** | 3+9 editorial grid |
| **Dark Mode** | Supported via CSS variable system |
| **i18n** | English + German via i18next |

### AI Visual Language

All AI-powered features use the signature gradient:

- `.text-ai` — Gradient text (purple-to-blue) for AI badges and labels
- `.bg-ai` — Gradient background for AI feature cards and buttons
- `.border-ai` — Gradient border for AI-powered containers
- `.text-ai-solid` — Solid purple for simpler AI indicators

### Key Screens

| Screen | Purpose | Key Elements |
|--------|---------|-------------|
| **Onboarding Chat** | Stage detection + context building | Full-screen conversational UI with quick-reply buttons |
| **Thesis Dashboard** | Central hub for the thesis journey | Chat panel + context sidebar + milestone progress |
| **Topic Matches** | Cross-entity topic recommendations | Action cards with match scores, inline within chat |
| **Expert Network** | Networking suggestions | Expert cards with relevance explanation and connect CTA |
| **Alerts Feed** | Continuous discovery notifications | Ranked alert cards with entity links |
| **Timeline View** | Milestone tracking | Visual timeline with stage indicators and status |

### Interaction Patterns

- **Progressive Disclosure**: Information reveals on hover/expand, never all at once
- **Conversational First**: Every primary action can be triggered via chat
- **Quick Reply Chips**: Pre-composed response options for common interactions
- **Inline Actions**: Topic/expert cards embed within the chat flow, not on separate pages
- **Skeleton Loading**: Shimmer states for all async content
- **Streaming Responses**: AI messages stream word-by-word with typing indicator

---

## 12. Constraints & Non-Goals

### Hard Constraints

| Constraint | Rationale |
|-----------|-----------|
| **No writing assistance** | Studyond explicitly prohibits tools that help write the thesis. 100% organizational focus. |
| **Academic Governance** | AI suggests; professors decide. No automated supervisor assignment, topic approval, or grading. |
| **Free for students** | Revenue comes from companies. Student experience must be fully free. |
| **GDPR/Swiss data protection** | Student data stays aggregated for universities. No individual data shared without consent. |
| **No IT integration required** | Universities adopt without procurement cycles or infrastructure changes. |

### Non-Goals (Explicitly Out of Scope)

| Non-Goal | Why |
|----------|-----|
| Thesis writing assistant | Explicit constraint from Studyond |
| Citation management | This is a writing tool, not an organization tool |
| Plagiarism detection | Writing-adjacent, not organizational |
| Grade prediction | Violates academic governance principle |
| Automated professor communication | Would bypass academic governance; AI can suggest, student sends |
| Calendar integration | Nice-to-have for v2, not core for prototype |
| Mobile native app | Web-first for the prototype |

---

## 13. Success Metrics

### North Star Metric

**Thesis Journey Completion Rate**: Percentage of students who progress through all 5 stages on the platform (vs. dropping off after topic discovery).

### Leading Indicators

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Stage Detection Accuracy** | >85% correct on first attempt | Modular Entry depends on accurate detection |
| **Context Richness Score** | >60% of ThesisContext fields filled within 3 sessions | Context Accumulation effectiveness |
| **Proactive Nudge CTR** | >25% engagement with AI suggestions | Are proactive suggestions useful? |
| **Alert Relevance Rating** | >4.0/5.0 user rating | Continuous Discovery quality |
| **Networking Connection Rate** | >30% of suggested experts contacted | Proactive Networking value |
| **Time-to-First-Match** | <5 minutes from signup | Immediate value delivery |
| **Cross-Stage Retention** | >50% of Stage 2 users reach Stage 3 | Are we retaining beyond discovery? |

### Company-Side Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Application Quality Score** | +20% improvement | Better-matched students from richer context |
| **Thesis-to-Hire Conversion** | +15% improvement | Better-managed projects = better work samples |
| **Topic Engagement Rate** | +30% increase | More students discover and engage with company topics |

---

## 14. Tech Stack

### Core Stack (aligned with Studyond)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19 + TypeScript + Vite | Studyond's existing stack |
| **Styling** | Tailwind CSS v4 + shadcn/ui + Radix UI | Studyond's component system |
| **State** | Zustand | Lightweight, perfect for ThesisContext persistence |
| **Animation** | Framer Motion | Brand-consistent micro-interactions |
| **AI SDK** | Vercel AI SDK (streaming + tool use) | Already in production at Studyond |
| **AI Model** | Anthropic Claude | Already Studyond's model provider |
| **Forms** | React Hook Form + Zod | Type-safe validation |
| **Icons** | Tabler Icons | Brand consistency |
| **i18n** | i18next | English + German support |
| **Auth** | Auth0 | Existing auth infrastructure |

### Prototype-Specific

| Tool | Purpose |
|------|---------|
| **Mock Data** | Use existing JSON datasets (students, topics, supervisors, experts, companies, projects) |
| **Local Storage** | Persist ThesisContext locally for prototype; production would use a database |
| **Vercel** | Deployment target for demo |

---

## 15. Phased Rollout

### Phase 1: Hackathon Prototype (48 hours)

**Focus**: Demonstrate the core experience end-to-end with mock data.

| Priority | Feature | Status |
|----------|---------|--------|
| P0 | Conversational onboarding with stage detection | 🎯 Must ship |
| P0 | Context-aware topic matching (with mock data) | 🎯 Must ship |
| P0 | AI-first chat interface with action cards | 🎯 Must ship |
| P1 | Proactive expert/interview partner suggestions | Should ship |
| P1 | Milestone timeline generation | Should ship |
| P2 | Continuous discovery alerts | Nice to have |
| P2 | Cross-entity intelligence | Nice to have |

### Phase 2: Post-Hackathon MVP (4-8 weeks)

- Connect to real Studyond API (replace mock data)
- Implement persistent ThesisContext in database
- Build event-driven Continuous Discovery Agent
- Add email digest for alerts
- User testing with 50 students

### Phase 3: Full Integration (3-6 months)

- Full cross-entity matching with production data
- Structured mentor feedback loops
- Peer connections between students on similar topics
- University-level analytics dashboard
- Company-side visibility into thesis project health

---

## 16. Open Questions

| # | Question | Impact | Who Decides |
|---|----------|--------|-------------|
| 1 | Should ThesisContext persist server-side or client-side for the prototype? | Architecture complexity | Engineering |
| 2 | How much reasoning should the AI show? Full chain-of-thought or just results? | UX clarity | Design + User testing |
| 3 | Should alerts be push (email) or pull (in-app only) for the prototype? | Scope | Product |
| 4 | Can we access real Studyond API endpoints, or are we limited to mock data? | Data fidelity | Studyond team |
| 5 | What's the right alert frequency? 3/week max? Student-configurable? | User experience | User testing |
| 6 | Should we support supervisor-side views (e.g., "your students' progress")? | Scope expansion | Product |
| 7 | How do we handle the "writing assistance" boundary? E.g., is "suggest a thesis outline structure" organizational or writing? | Constraint clarity | Studyond team |
| 8 | Should the AI use Anthropic Claude exclusively, or can we use other models for specific agents? | Cost, performance | Engineering |

---

> **Next Steps**: Review this PRD with the team, resolve open questions, and begin implementation with Phase 1 priorities.
