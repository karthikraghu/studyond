# Thesis Compass: AI Context Prompt

*Copy and paste the text below into any new AI chat to instantly provide full context about the current project state.*

***

## Project Overview
**Name:** Thesis Compass
**Nature:** Hackathon Project
**Purpose:** An AI-powered thesis companion system that guides students through their entire thesis journey (topic discovery, networking, matching) via an AI-first conversational interface. It maintains an organizational focus (no writing assistance) and respects academic governance.

## Core Business Logic & Roles
The application heavily relies on multi-role routing and state. The three distinct roles are:
1. **Student:** Seeks thesis topics, supervision, and career opportunities. Uploads CV for AI parsing.
2. **Company:** Offers thesis topics and seeks students for their departments.
3. **Supervisor:** Can be affiliated with a university or a company, and has a specific "capacity" for the number of students they can mentor.

*Note:* Because this is a hackathon prototype, all backend/database interactions (like Supabase) have been explicitly removed. The app relies completely on **local JSON mock data** ([mock-data/students.json](file:///c:/Users/karth/summa%20projects/studyond/thesis-compass/src/mock-data/students.json), etc.) and client-side state.

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Framer Motion
- **UI Components:** Shadcn UI (Radix UI) + Lucide React
- **State Management:** Zustand (with `persist` middleware using `localStorage`)
- **Routing:** React Router DOM (v7)
- **Forms & Validation:** React Hook Form + Zod
- **AI Integration:** Vercel AI SDK (`ai`, `@ai-sdk/anthropic`)

## Architecture & Foundational Design
1. **Centralized Routing ([src/config/routes.ts](file:///c:/Users/karth/summa%20projects/studyond/thesis-compass/src/config/routes.ts)):** 
   - Routes are defined in an array and injected dynamically into [App.tsx](file:///c:/Users/karth/summa%20projects/studyond/thesis-compass/src/App.tsx).
   - Each route specifies a layout (`'app'` | `'auth'` | `'none'`). 
   - A [ProtectedRoute](file:///c:/Users/karth/summa%20projects/studyond/thesis-compass/src/App.tsx#53-75) wrapper kicks unauthenticated users to `/` (Onboarding) and already-onboarded users to `/home`.

2. **Global State ([src/store/useOnboardingStore.ts](file:///c:/Users/karth/summa%20projects/studyond/thesis-compass/src/store/useOnboardingStore.ts)):**
   - This is the **single source of truth** for user identity.
   - It stores the `currentStep`, `isOnboarded` boolean, and a `formData` object (typed as [PartialOnboardingData](file:///c:/Users/karth/summa%20projects/studyond/thesis-compass/src/types/onboarding.ts#68-69)).
   - The state is persisted to `localStorage`. All UI elements (Greetings in `HomePage`, `ChatPage`, `SettingsPage`) read from here. 

3. **Role-based Forms ([src/types/onboarding.ts](file:///c:/Users/karth/summa%20projects/studyond/thesis-compass/src/types/onboarding.ts)):**
   - We use a **Zod Discriminated Union** on the `role` field (`StudentSchema`, `CompanySchema`, `SupervisorSchema`). 
   - This ensures absolute type safety: you cannot have a company form with a `university` field.

## Current Application State
- The Onboarding Flow (`/`) acts as the entry point and includes a mock AI-CV parsing feature.
- The `ChatPanel` and `SettingsPage` have recently been refactored to *exclusively* use `useOnboardingStore` for user data (name, email, role).
- All remnants of older stores (like `useThesisStore`) and hardcoded fallback user data have been removed. User data is dynamically pulled from the onboarding context everywhere.

## Instructions for AI (System Prompt Addition)
When modifying this codebase:
- **Do not introduce a backend database.** Rely strictly on mock JSON data or client-side storage unless specifically requested.
- **UI/UX is critical:** Always use Shadcn UI components and Tailwind. Ensure smooth animations with Framer Motion and maintain the high-quality, modern, dynamic aesthetic.
- **State Changes:** If user data needs to change, it must be updated or read via `useOnboardingStore`.
- **Routing:** If a new page is added, add it to [src/config/routes.ts](file:///c:/Users/karth/summa%20projects/studyond/thesis-compass/src/config/routes.ts). Do not clutter [App.tsx](file:///c:/Users/karth/summa%20projects/studyond/thesis-compass/src/App.tsx) with `<Route>` definitions.
