/**
 * Navigation Configuration — Data-driven sidebar navigation.
 *
 * WHY this file exists:
 * Instead of hard-coding navigation items inside the layout component,
 * we define them here as plain data. This makes it trivial to:
 *
 * 1. Swap navigation for different user roles (student vs. company)
 * 2. Add/remove pages without touching the layout
 * 3. Reorder the sidebar by moving items in the array
 * 4. Show/hide items based on feature flags or user state
 *
 * Each navigation section groups related items under a heading.
 * The sidebar component reads this config and renders accordingly.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Home,
  MessageSquare,
  FolderOpen,
  Sparkles,
  Briefcase,
  Users,
  Building2,
  Settings,
  ChevronRight,
  Target,
  Clock,
} from 'lucide-react';

// -- Types --

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  /** If true, show a ">" chevron (for expandable sub-menus in the future) */
  expandable?: boolean;
  /** Badge type — drives dynamic badge rendering (e.g., unread count) */
  badge?: 'alerts' | 'messages';
}

export interface NavSection {
  /** Section heading shown above the group (e.g., "Personal", "Explore") */
  heading: string;
  items: NavItem[];
}

// -- Student Navigation --
// This matches the Studyond screenshot layout exactly:
//   Personal: Home, Messages, My Projects
//   Explore:  Topics, Jobs, People >, Organizations >

export const studentNavigation: NavSection[] = [
  {
    heading: 'Personal',
    items: [
      { icon: Home, label: 'Home', path: '/home' },
      { icon: MessageSquare, label: 'Messages', path: '/messages', badge: 'messages' },
      { icon: FolderOpen, label: 'My Projects', path: '/projects' },
      { icon: Clock, label: 'My Activity', path: '/activity' },
    ],
  },
  {
    heading: 'Explore',
    items: [
      { icon: Target, label: 'Matches', path: '/matches' },
      { icon: Sparkles, label: 'Topics', path: '/topics' },
      { icon: Briefcase, label: 'Jobs', path: '/jobs' },
      { icon: Users, label: 'People', path: '/people', expandable: true },
      { icon: Building2, label: 'Organizations', path: '/organizations', expandable: true },
    ],
  },
];

// -- Company Navigation (future) --
// When you're ready to build the company flow, define it here
// and swap it based on the user's role in the layout.

export const companyNavigation: NavSection[] = [
  {
    heading: 'Dashboard',
    items: [
      { icon: Home, label: 'Home', path: '/home' },
      { icon: MessageSquare, label: 'Messages', path: '/messages', badge: 'messages' },
    ],
  },
  {
    heading: 'Manage',
    items: [
      { icon: Sparkles, label: 'My Topics', path: '/topics' },
      { icon: Users, label: 'Applicants', path: '/applicants' },
      { icon: Building2, label: 'Company Profile', path: '/profile' },
    ],
  },
];

// -- Bottom Navigation (persistent across roles) --

export interface BottomNavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export const bottomNavItems: BottomNavItem[] = [
  { icon: Settings, label: 'My Settings', path: '/settings' },
];

// Placeholder chevron icon export for expandable items
export { ChevronRight };
