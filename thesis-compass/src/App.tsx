/**
 * App.tsx — Root component with config-driven routing.
 *
 * HOW TO CHANGE THE FLOW:
 *
 * 1. To add a new page: Create a page in src/pages/, add a route in src/config/routes.ts
 * 2. To add sidebar items: Add an entry in src/config/navigation.ts
 * 3. To change the home page: Point the '/home' route to a different component
 * 4. To add a company flow: Create companyNavigation in navigation.ts
 *    and swap based on user role in AppLayout.tsx
 * 5. To add onboarding: Add a '/onboarding' route with layout: 'none',
 *    redirect there after sign-in
 *
 * The layout wrapping happens here — each route declares which layout it needs.
 */

import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { routes } from '@/config/routes';
import AppLayout from '@/layouts/AppLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import './App.css';

/**
 * Loading fallback — shown while lazy-loaded pages are downloading.
 * Kept minimal to avoid layout shift.
 */
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
    </div>
  );
}

/**
 * Wraps a page component in the appropriate layout based on the route config.
 */
function LayoutWrapper({ layout, children }: { layout: string; children: React.ReactNode }) {
  switch (layout) {
    case 'app':
      return <AppLayout>{children}</AppLayout>;
    case 'auth':
      return <AuthLayout>{children}</AuthLayout>;
    case 'none':
    default:
      return <>{children}</>;
  }
}

/**
 * Route Guard — Determines if the user is allowed to view the route.
 * 
 * 1. If it requires auth but the user has no role, kick them to Onboarding (/).
 * 2. If it is the Onboarding page (/) but the user is already authenticated, kick them to Dashboard (/home).
 */
function ProtectedRoute({ children, requiresAuth }: { children: React.ReactNode, requiresAuth?: boolean }) {
  const { isOnboarded } = useOnboardingStore();
  const location = useLocation();

  if (requiresAuth && !isOnboarded) {
    // Redirect unauthenticated users to the start of the onboarding flow
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!requiresAuth && isOnboarded && location.pathname === '/') {
    // Prevent already onboarded users from seeing the wizard again
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {routes.map((route) => {
              const PageComponent = route.component;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute requiresAuth={route.requiresAuth}>
                      <LayoutWrapper layout={route.layout}>
                        <PageComponent />
                      </LayoutWrapper>
                    </ProtectedRoute>
                  }
                />
              );
            })}

            {/* Catch-all — redirect to home */}
            <Route
              path="*"
              element={
                <AppLayout>
                  <PlaceholderPage />
                </AppLayout>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  );
}

/**
 * Placeholder for unbuilt pages — shows clean "coming soon" state.
 */
function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
        <span className="text-xl">🚧</span>
      </div>
      <h2 className="text-lg font-semibold text-foreground">Coming Soon</h2>
      <p className="text-[13px] text-muted-foreground mt-1.5 max-w-md">
        This page is being built. Check back shortly.
      </p>
    </div>
  );
}
