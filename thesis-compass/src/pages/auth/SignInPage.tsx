/**
 * SignInPage — The entry point to Thesis Compass.
 *
 * Design rationale (PRD 5.4 - Editorial Minimalism):
 * - Monochrome palette with AI gradient accent on CTA
 * - Generous whitespace
 * - Progressive disclosure — minimal fields, maximum clarity
 * - The AI gradient distinguishes this as an AI-powered product
 *
 * For the hackathon prototype, this simulates sign-in by selecting
 * a mock student. In production, this would use Auth0.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, Sparkles, GraduationCap, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useThesisStore } from '@/store/useThesisStore';
import type { ThesisContext } from '@/types';

// Import mock students for the hackathon sign-in flow
import studentsData from '@/mock-data/students.json';

// Pick a representative subset of students to show as quick-login options
const demoStudents = studentsData.slice(0, 4);

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setContext = useThesisStore((s) => s.setContext);
  const setOnboarded = useThesisStore((s) => s.setOnboarded);

  /**
   * For the hackathon, "sign in" creates a fresh ThesisContext
   * for the selected student. In production, this context would
   * be loaded from the database after Auth0 authentication.
   */
  const handleSignIn = (studentId: string) => {
    setIsLoading(true);

    const freshContext: ThesisContext = {
      id: `ctx-${studentId}`,
      studentId,
      currentStage: 'orientation',
      stageEnteredAt: new Date().toISOString(),
      topicInterests: [],
      methodologyPreference: null,
      careerAspirations: [],
      viewedTopicIds: [],
      bookmarkedTopicIds: [],
      appliedTopicIds: [],
      contactedSupervisorIds: [],
      contactedExpertIds: [],
      readinessScore: 0,
      urgencyLevel: 'low',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setContext(freshContext);
    setOnboarded(false);

    // Navigate to the home dashboard (not /dashboard anymore)
    setTimeout(() => {
      navigate('/home');
    }, 600);
  };

  const handleEmailSignIn = () => {
    const student = studentsData.find((s) => s.email === email) || studentsData[0];
    handleSignIn(student.id);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left Panel: Brand + Value Prop ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-blue-950 to-slate-950" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white text-lg font-semibold tracking-tight">Thesis Compass</span>
              <span className="text-white/50 text-sm ml-2">by Studyond</span>
            </div>
          </motion.div>

          <motion.div
            className="space-y-6 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl xl:text-5xl font-semibold text-white tracking-tight leading-tight">
              From first idea to final submission.
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Your AI-powered thesis companion that anticipates what you need 
              before you ask. Manage your journey, connect with experts, and 
              stay on track — all in one place.
            </p>

            <div className="space-y-4 pt-4">
              {[
                { icon: Sparkles, text: 'AI-powered topic matching with 7,500+ companies' },
                { icon: Users, text: 'Proactive expert & supervisor suggestions' },
                { icon: GraduationCap, text: 'End-to-end thesis journey management' },
                { icon: Building2, text: '185+ company partnerships' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-white/80" />
                  </div>
                  <span className="text-white/70 text-sm">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.p
            className="text-white/30 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            START Hack 2026 • Studyond AG
          </motion.p>
        </div>
      </div>

      {/* ── Right Panel: Sign-in Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          className="w-full max-w-sm space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-ai">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-ai">Thesis Compass</span>
          </div>

          <div className="space-y-2">
            <h2 className="ds-title-lg text-foreground">Welcome back</h2>
            <p className="ds-body text-muted-foreground">
              Sign in to continue your thesis journey.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="ds-label text-foreground">
                University Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-full px-4"
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSignIn()}
              />
            </div>

            <Button
              className="w-full h-11 rounded-full bg-ai hover:opacity-90 transition-opacity"
              onClick={handleEmailSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 ds-caption text-muted-foreground">
                or try a demo account
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {demoStudents.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
              >
                <Card
                  className="cursor-pointer border border-border hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
                  onClick={() => handleSignIn(student.id)}
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground flex-shrink-0 group-hover:bg-ai group-hover:text-white transition-colors duration-300">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="ds-small font-medium text-foreground truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="ds-caption text-muted-foreground truncate">
                        {student.email}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="ds-caption text-center text-muted-foreground">
            Free for students. Always.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
