/**
 * HomePage — The student dashboard (Studyond home screen).
 *
 * This matches the Studyond screenshot exactly:
 *
 * 1. Time-aware greeting: "Working late, Karthik? 🤓"
 * 2. Five horizontal action cards with icons + descriptions
 * 3. "My favorite topics" section with empty state
 *
 * Each action card maps to a key feature of the platform.
 * The greeting adapts based on the time of day.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Users,
  PlayCircle,
  Briefcase,
  GraduationCap,
  BrainCircuit,
  Settings2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/store/useOnboardingStore';

// -- Time-aware greeting logic --

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { text: 'Good morning', emoji: '☀️' };
  }
  if (hour >= 12 && hour < 17) {
    return { text: 'Good afternoon', emoji: '👋' };
  }
  if (hour >= 17 && hour < 21) {
    return { text: 'Good evening', emoji: '🌆' };
  }
  // Late night / early morning
  return { text: 'Working late', emoji: '🤓' };
}

// -- Action cards data --

interface ActionCard {
  icon: typeof Sparkles;
  title: string;
  highlight?: string;
  description: string;
  path: string;
  className?: string;
  iconClassName?: string;
}

function getActionCards(role: "student" | "company" | "supervisor" | undefined): ActionCard[] {
  // If the user is missing a role, or is a student, show standard student flow
  if (!role || role === "student") {
    return [
      {
        icon: Sparkles,
        title: 'Find relevant roles for your profile',
        highlight: 'relevant roles',
        description: 'Match your background with specific industry and research positions. We utilize your GitHub and academic profile to find the best fit.',
        path: '/chat',
        className: 'md:col-span-4 md:row-span-2 p-8',
        iconClassName: 'w-8 h-8 text-blue-500 mb-2',
      },
      {
        icon: BrainCircuit,
        title: 'Validate Thesis Topic',
        highlight: 'Validate',
        description: 'AI-driven reasoning on your ideas.',
        path: '/validate-topic',
        className: 'md:col-span-2',
      },
      {
        icon: Settings2,
        title: 'Set Preferences',
        description: 'Rank your field of study priorities.',
        path: '/preferences',
        className: 'md:col-span-2',
      },
      {
        icon: Users,
        title: 'Find Experts',
        description: 'Connect with industry mentors.',
        path: '/people',
        className: 'md:col-span-2',
      },
      {
        icon: PlayCircle,
        title: 'ThesisWriting 101',
        description: 'Learn from PhDs.',
        path: '/resources',
        className: 'md:col-span-2',
      },
    ];
  }

  if (role === "company") {
    return [
      {
        icon: Briefcase,
        title: 'Post a Thesis Topic',
        highlight: 'Post',
        description: 'Advertise a research opportunity to our talented student pool.',
        path: '/topics',
      },
      {
        icon: Users,
        title: 'Review Student Proposals',
        description: 'Evaluate incoming pitches from eager undergraduates and postgrads.',
        path: '/topics',
      },
    ];
  }

  // Supervisor flow
  return [
    {
      icon: GraduationCap,
      title: 'Review Thesis Drafts',
      highlight: 'Review',
      description: 'Check in on your current supervisees and leave feedback.',
      path: '/topics',
    },
    {
      icon: Users,
      title: 'Find Top Students',
      description: 'Scout leading candidates looking for academic supervision.',
      path: '/people',
    },
  ];
}

// -- Component --

export default function HomePage() {
  const navigate = useNavigate();
  const greeting = getGreeting();
  const formData = useOnboardingStore((state) => state.formData);

  // We safely read the user's name if they have filled it out during onboarding.
  const userName = "fullName" in formData && formData.fullName 
    ? formData.fullName.split(" ")[0] 
    : 'Guest';
  
  // Dynamically load the layout depending on if they are a student, company, or supervisor.
  const actionCards = getActionCards(formData.role);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      {/* ── Greeting ── */}
      <motion.h1
        className="text-2xl font-semibold text-foreground tracking-tight"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {greeting.text}, {userName}? {greeting.emoji}
      </motion.h1>

      {/* ── Dashboard Action Grid ── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-8 auto-rows-min"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        {actionCards.map((card, i) => (
          <motion.button
            key={i}
            onClick={() => navigate(card.path)}
            className={cn(
              "group relative flex flex-col items-start gap-3 p-5 rounded-2xl border border-border bg-background text-left hover:shadow-xl hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-300 overflow-hidden",
              card.className
            )}
            whileHover={{ y: -4 }}
          >
            {/* Soft background glow for the main card */}
            {card.highlight === 'relevant roles' && (
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            )}

            {/* Icon */}
            <card.icon
              className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                card.iconClassName || "text-muted-foreground"
              )}
              strokeWidth={2}
            />

            {/* Title */}
            <p className={cn(
              "font-bold text-foreground leading-snug",
              card.highlight === 'relevant roles' ? "text-xl md:text-2xl" : "text-[14px]"
            )}>
              {card.highlight ? (
                <>
                  {card.title.split(card.highlight).map((part, j) => (
                    <span key={j}>
                      {j > 0 && (
                        <span className="text-primary">{card.highlight}</span>
                      )}
                      {part}
                    </span>
                  ))}
                </>
              ) : (
                card.title
              )}
            </p>

            {/* Description */}
            <p className={cn(
              "text-muted-foreground leading-relaxed",
              card.highlight === 'relevant roles' ? "text-sm md:text-base opacity-90" : "text-[12px] opacity-70"
            )}>
              {card.description}
            </p>
            
            {/* Action text for main card */}
            {card.highlight === 'relevant roles' && (
              <div className="mt-auto pt-6 flex items-center gap-2 text-primary font-bold text-sm">
                Open Profiles <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
