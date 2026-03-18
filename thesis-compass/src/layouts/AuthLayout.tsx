/**
 * AuthLayout — Full-screen layout for authentication pages.
 *
 * No sidebar, no top bar — just centered content.
 * Used for: sign-in, registration, onboarding flows.
 *
 * This is separate from AppLayout so auth pages can have
 * different visual treatments (e.g., gradient backgrounds,
 * split layouts) without affecting the main app shell.
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
