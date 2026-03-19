/**
 * AppLayout — Main application shell matching the Studyond UI.
 *
 * Layout structure (from screenshot):
 * ┌─────────────────────────────────────────────────────────┐
 * │ [Sidebar]      │ [TopBar: icon ... bell, invite, chat] │
 * │                │                                        │
 * │ Personal       │ Main Content Area                      │
 * │  Home          │                                        │
 * │  Messages      │ Working late, Karthik? 🤓             │
 * │  My Projects   │                                        │
 * │                │ [Action Cards Row]                     │
 * │ Explore        │                                        │
 * │  Topics        │ My favorite topics                     │
 * │  Jobs          │ [Empty state]                          │
 * │  People     >  │                                        │
 * │  Organizations >│                                       │
 * │                │                                        │
 * │ ─── bottom ────│                                        │
 * │ My Settings    │                                        │
 * │ User + email   │                                        │
 * └─────────────────────────────────────────────────────────┘
 *
 * Key differences from old DashboardLayout:
 * - No right context sidebar (pages can add their own panels)
 * - Sidebar has sectioned navigation with headings
 * - Top bar is minimal with utility icons
 * - Navigation is data-driven from config/navigation.ts
 */

import { type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  UserPlus,
  MessageCircle,
  Settings,
  ChevronRight,
  PanelLeft,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { studentNavigation, type NavSection } from '@/config/navigation';
import studyondLogo from '@/assets/studyond.svg';
import { useOnboardingStore } from '@/store/useOnboardingStore';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const { formData, reset } = useOnboardingStore();

  // Dynamically resolve navigation based on role placeholder (expand later when we have more layouts)
  const navigation: NavSection[] = studentNavigation;

  const handleLogout = () => {
    reset(); // Deeply clears the persistent Zustand store
    navigate('/'); // Route Guard then allows the user back to the public wizard
  };

  const fullName = "fullName" in formData && formData.fullName ? formData.fullName : 'Guest User';
  const email = "email" in formData && formData.email 
    ? formData.email 
    : ("workEmail" in formData && formData.workEmail ? formData.workEmail : "guest@studyond.com");
  
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Left Sidebar ── */}
      <aside className="hidden md:flex w-52 flex-col border-r border-border bg-background">
        {/* Brand: "studyond" logo + sparkle */}
        <div className="flex h-14 items-center px-4">
          <img
            src={studyondLogo}
            alt="studyond"
            className="h-5"
          />
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 flex flex-col px-3 pt-1 overflow-y-auto">
          {navigation.map((section) => (
            <div key={section.heading} className="mb-4">
              {/* Section heading */}
              <p className="px-2 mb-1 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                {section.heading}
              </p>

              {/* Section items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-colors',
                        isActive
                          ? 'font-semibold text-foreground'
                          : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.5 : 1.75} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.expandable && (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: Settings + User */}
        <div className="px-3 pb-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
            <span>Log out</span>
          </button>

          <Separator className="my-2" />

          {/* User profile */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-muted text-foreground text-[10px] font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate leading-tight">
                {fullName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight">
                {email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              aria-label="Open profile settings"
              className="p-1 rounded-md hover:bg-muted/50 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Area (topbar + content) ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar — minimal utility bar */}
        <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-background">
          {/* Left: mobile menu toggle / page-level icon */}
          <div className="flex items-center">
            <button className="md:hidden p-1.5 rounded-md hover:bg-muted/50 transition-colors">
              <PanelLeft className="w-4 h-4 text-foreground" />
            </button>
            <div className="hidden md:block p-1.5">
              <PanelLeft className="w-4 h-4 text-muted-foreground/60" strokeWidth={1.75} />
            </div>
          </div>

          {/* Right: utility icons */}
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Bell className="w-4 h-4 text-foreground" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => navigate('/invite')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] text-foreground hover:bg-muted/50 transition-colors"
            >
              <UserPlus className="w-4 h-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Invite</span>
            </button>
            <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
              <MessageCircle className="w-4 h-4 text-foreground" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile bottom navigation */}
        <nav className="md:hidden flex items-center justify-around border-t border-border bg-background h-14 px-2">
          {navigation.flatMap((section) => section.items).slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
