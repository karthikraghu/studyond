/**
 * Route Configuration — Central routing definitions.
 *
 * WHY centralized routes?
 * When you eventually define different flows for:
 * - Student registration & onboarding
 * - Company onboarding
 * - Guest/unauthenticated browsing
 *
 * You can add/remove/reorder routes in this single file
 * without touching any layout or page components.
 *
 * The App.tsx file reads this config and generates <Route> elements.
 *
 * PATTERN: Each route specifies its own layout, so you can mix
 * AppLayout pages with AuthLayout pages freely.
 */

import { lazy } from 'react';

// Lazy-load pages for code splitting
// (Only loaded when the user navigates to that route)
const OnboardingPage = lazy(() => import('@/pages/onboarding/OnboardingPage'));
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const WorkspacePage = lazy(() => import('@/pages/workspace/WorkspacePage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const ValidateTopicPage = lazy(() => import('@/pages/validate/ValidateTopicPage'));
const PreferencesPage = lazy(() => import('@/pages/preferences/PreferencesPage'));
const MatchPage = lazy(() => import('@/pages/matches/MatchPage'));
const ActivityPage = lazy(() => import('@/pages/activity/ActivityPage'));
const ExpertsPage = lazy(() => import('@/pages/experts/ExpertsPage'));
const TopicsPage = lazy(() => import('@/pages/topics/TopicsPage'));
const PostTopicPage = lazy(() => import('@/pages/topics/PostTopicPage'));
const ProposalsPage = lazy(() => import('@/pages/proposals/ProposalsPage'));
const OrganizationsPage = lazy(() => import('@/pages/organizations/OrganizationsPage'));


export interface RouteConfig {
  path: string;
  /** Which layout to wrap the page in */
  layout: 'app' | 'auth' | 'none';
  /** The lazy-loaded page component */
  component: React.LazyExoticComponent<React.ComponentType>;
  /** Optional: guard this route (e.g., require auth) */
  requiresAuth?: boolean;
}

/**
 * All application routes.
 *
 * To change the flow:
 * 1. Add a new page component in src/pages/
 * 2. Add a route entry here
 * 3. Optionally add a navigation item in navigation.ts
 *
 * That's it — the layout and App.tsx will handle the rest automatically.
 */
export const routes: RouteConfig[] = [
  // -- Auth routes (no sidebar, full-screen) --
  {
    path: '/',
    layout: 'none',
    component: OnboardingPage,
  },

  // -- App routes (sidebar + topbar) --
  {
    path: '/home',
    layout: 'app',
    component: HomePage,
    requiresAuth: true,
  },
  {
    path: '/chat',
    layout: 'app',
    component: WorkspacePage,
    requiresAuth: true,
  },
  {
    path: '/settings',
    layout: 'app',
    component: SettingsPage,
    requiresAuth: true,
  },
  {
    path: '/validate-topic',
    layout: 'app',
    component: ValidateTopicPage,
    requiresAuth: true,
  },
  {
    path: '/preferences',
    layout: 'app',
    component: PreferencesPage,
    requiresAuth: true,
  },
  {
    path: '/matches',
    layout: 'app',
    component: MatchPage,
    requiresAuth: true,
  },
  {
    path: '/activity',
    layout: 'app',
    component: ActivityPage,
    requiresAuth: true,
  },

  // Future routes — just add entries here:
  {
    path: '/experts',
    layout: 'app',
    component: ExpertsPage,
    requiresAuth: true,
  },
  {
    path: '/topics',
    layout: 'app',
    component: TopicsPage,
    requiresAuth: true,
  },
  {
    path: '/topics/new',
    layout: 'app',
    component: PostTopicPage,
    requiresAuth: true,
  },
  {
    path: '/proposals',
    layout: 'app',
    component: ProposalsPage,
    requiresAuth: true,
  },
  {
    path: '/organizations',
    layout: 'app',
    component: OrganizationsPage,
    requiresAuth: true,
  },
  // { path: '/messages', layout: 'app', component: MessagesPage, requiresAuth: true },
  // { path: '/projects', layout: 'app', component: ProjectsPage, requiresAuth: true },
  // { path: '/onboarding', layout: 'none', component: OnboardingPage, requiresAuth: true },
];
