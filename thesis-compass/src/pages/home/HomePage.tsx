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

import { useState, useEffect } from 'react';
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
  ArrowRight,
  X,
  CheckCircle2,
  FileText,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import projectsData from '@/data/projects.json';
import studentsData from '@/data/students.json';

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
        description: 'Match your background with specific industry and research positions.',
        path: '/matches',
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
        path: '/experts',
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
        path: '/topics/new',
        className: 'md:col-span-3 p-8 border-primary/20 bg-primary/[0.03]',
        iconClassName: 'w-8 h-8 text-primary mb-2',
      },
      {
        icon: Users,
        title: 'Review Student Proposals',
        highlight: 'Review',
        description: 'Evaluate incoming pitches from eager undergraduates and postgrads.',
        path: '/proposals',
        className: 'md:col-span-3 p-8',
        iconClassName: 'w-8 h-8 text-blue-500 mb-2',
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
  const [showNotification, setShowNotification] = useState(false);
  const greeting = getGreeting();
  const formData = useOnboardingStore((state) => state.formData);

  useEffect(() => {
    // Simulate autonomous agent discovering a match
    if (formData.role === 'student') {
      const timer = setTimeout(() => setShowNotification(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [formData.role]);

  // We safely read the user's name if they have filled it out during onboarding.
  const userName = "fullName" in formData && formData.fullName 
    ? formData.fullName.split(" ")[0] 
    : 'Guest';
  
  // Dynamically load the layout depending on if they are a student, company, or supervisor.
  const actionCards = getActionCards(formData.role);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 w-full">
      <div className="space-y-12">
        
        {/* ── Greeting ── */}
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none">
            {greeting.text}, <span className="text-primary italic">{userName}</span>? {greeting.emoji}
          </h1>
          <p className="text-muted-foreground text-lg mt-3 font-medium max-w-2xl">Welcome back to your Thesis Compass.</p>
        </motion.div>

        {/* ── Autonomous Agent Notification ── */}
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 relative overflow-hidden shadow-lg shadow-primary/5"
          >
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setShowNotification(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Sparkles className="w-7 h-7 text-primary animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                    Agent Action Taken
                  </Badge>
                  <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 2 mins ago
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-foreground">
                  I found a new match & drafted an intro!
                </h3>
                <p className="text-base text-muted-foreground font-medium max-w-3xl leading-relaxed">
                  While you were away, <strong>Swiss AI Lab</strong> posted a new thesis topic matching your priority in "AI Innovation". I've proactively added them to your Matches and drafted a personalized introduction email based on your CV profile.
                </p>
                <div className="pt-2 flex gap-3">
                  <button onClick={() => navigate('/matches')} className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-md hover:bg-primary/90 transition-colors">
                    Review Draft
                  </button>
                  <button onClick={() => setShowNotification(false)} className="px-5 py-2.5 bg-background text-foreground text-sm font-bold rounded-xl border border-border hover:bg-muted transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Action Grid ── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-min"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          {actionCards.map((card, i) => (
            <motion.button
              key={i}
              onClick={() => navigate(card.path)}
              className={cn(
                "group relative flex flex-col items-start gap-3 p-6 rounded-[2rem] border border-border bg-card/40 backdrop-blur-sm text-left hover:shadow-2xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-500 overflow-hidden",
                card.className
              )}
              whileHover={{ y: -6, scale: 1.01 }}
            >
              {/* Soft background glow for the main card */}
              {card.highlight === 'relevant roles' && (
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
              )}

              {/* Icon */}
              <div className={cn(
                "p-2.5 rounded-2xl bg-background shadow-sm border border-border group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500",
                card.iconClassName ? "text-primary" : "text-muted-foreground/60"
              )}>
                <card.icon
                  className={cn(
                    "w-5 h-5",
                    card.iconClassName
                  )}
                  strokeWidth={2.5}
                />
              </div>

              {/* Title */}
              <p className={cn(
                "font-black text-foreground leading-tight tracking-tight mt-2",
                card.highlight === 'relevant roles' ? "text-2xl md:text-3xl" : "text-[15px]"
              )}>
                {card.highlight ? (
                  <>
                    {card.title.split(card.highlight).map((part, j) => (
                      <span key={j}>
                        {j > 0 && (
                          <span className="text-primary italic">{card.highlight}</span>
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
                "text-muted-foreground leading-relaxed font-medium",
                card.highlight === 'relevant roles' ? "text-sm md:text-lg opacity-80 max-w-[90%]" : "text-[12px] opacity-70"
              )}>
                {card.description}
              </p>
              
              {/* Action text for main card */}
              {card.highlight === 'relevant roles' && (
                <div className="mt-8 pt-6 border-t border-primary/5 w-full flex items-center justify-between text-primary font-black text-sm uppercase tracking-widest">
                  <span>Open Research Profiles</span>
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Company Specific Sections ── */}
        {formData.role === 'company' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  Recent Student Proposals
                </h2>
                <p className="text-muted-foreground mt-1">Students proactively seeking opportunities in your field.</p>
              </div>
              <button onClick={() => navigate('/proposals')} className="text-primary font-bold text-sm hover:underline flex flex-row items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsData.filter(p => p.state === 'proposed').slice(0, 3).map((project) => {
                const student = studentsData.find(s => s.id === project.studentId);
                return (
                  <div key={project.id} className="relative group p-6 rounded-3xl border border-border bg-card/60 backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col gap-4">
                    
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-wider text-[10px]">
                        New Proposal
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground font-medium gap-1">
                        <Clock className="w-3.5 h-3.5" /> {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <h3 className="text-lg font-black leading-tight tracking-tight text-foreground line-clamp-2">
                      {project.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      <span className="font-semibold text-foreground/80">Motivation:</span> {project.motivation || "Student is eager to explore this topic..."}
                    </p>

                    <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs uppercase text-foreground/60">
                          {student ? `${student.firstName[0]}${student.lastName[0]}` : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold leading-none">{student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}</span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">{student?.academicTitle || 'Masters Student'}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
