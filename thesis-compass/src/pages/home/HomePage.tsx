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
  Search,
  SquarePen,
  PlayCircle,
  Bookmark,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  /** Highlighted portion of the title (e.g., "AI" in "Let AI Find Your Perfect Topic") */
  highlight?: string;
  description: string;
  path: string;
}

function getActionCards(role: "student" | "company" | "supervisor" | undefined): ActionCard[] {
  // If the user is missing a role, or is a student, show standard student flow
  if (!role || role === "student") {
    return [
      {
        icon: Sparkles,
        title: 'Let AI Find Your Perfect Topic',
        highlight: 'AI',
        description: 'Get personalized topic suggestions based on your skills and interests.',
        path: '/chat',
      },
      {
        icon: Users,
        title: 'Find Experts for Interviews',
        description: 'Connect with industry professionals for expert interviews and insights.',
        path: '/people',
      },
      {
        icon: Search,
        title: 'Discover Topics for Your Thesis',
        description: 'Find thesis topics from university institutes and industry experts.',
        path: '/topics',
      },
      {
        icon: SquarePen,
        title: 'Propose Your Own Topic',
        description: 'Find industry partners open for your topic proposal.',
        path: '/topics',
      },
      {
        icon: PlayCircle,
        title: 'Videos: Thesis Writing 101',
        description: 'Learn how to write a thesis in the social sciences from experienced PhDs.',
        path: '/resources',
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

      {/* ── Action Cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        {actionCards.map((card, i) => (
          <motion.button
            key={i}
            onClick={() => navigate(card.path)}
            className="group flex flex-col items-start gap-3 p-4 rounded-xl border border-border bg-background text-left hover:shadow-md hover:border-border/80 transition-all duration-200 cursor-pointer"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
          >
            {/* Icon */}
            <card.icon
              className={`w-5 h-5 ${
                card.highlight === 'AI'
                  ? 'text-blue-500'
                  : 'text-muted-foreground'
              }`}
              strokeWidth={1.75}
            />

            {/* Title — with optional highlight */}
            <p className="text-[13px] font-semibold text-foreground leading-snug">
              {card.highlight ? (
                <>
                  {card.title.split(card.highlight).map((part, j) => (
                    <span key={j}>
                      {j > 0 && (
                        <span className="text-ai">{card.highlight}</span>
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
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {card.description}
            </p>
          </motion.button>
        ))}
      </motion.div>

      {/* ── My favorite topics ── */}
      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <h2 className="text-base font-semibold text-foreground tracking-tight">
          My favorite topics
        </h2>

        {/* Empty state */}
        <div className="mt-4 flex flex-col items-center justify-center py-10 border border-border rounded-xl bg-background">
          <Bookmark className="w-6 h-6 text-muted-foreground/40 mb-3" strokeWidth={1.75} />
          <p className="text-[13px] text-muted-foreground mb-4">No items</p>
          <Button
            onClick={() => navigate('/topics')}
            className="rounded-full px-5 h-9 text-[13px] font-medium bg-foreground text-background hover:bg-foreground/90"
          >
            Explore all topics
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
