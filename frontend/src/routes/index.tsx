import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PageLoader } from "@/components/common/PageLoader";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@/routes/ProtectedRoute";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const EntriesPage = lazy(() => import("@/pages/EntriesPage"));
const AskPage = lazy(() => import("@/pages/AskPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Lazy>
        <LandingPage />
      </Lazy>
    ),
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Lazy><LoginPage /></Lazy> },
          { path: "/signup", element: <Lazy><SignupPage /></Lazy> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Lazy><DashboardPage /></Lazy> },
          { path: "/entries", element: <Lazy><EntriesPage /></Lazy> },
          { path: "/ask", element: <Lazy><AskPage /></Lazy> },
          { path: "/analytics", element: <Lazy><AnalyticsPage /></Lazy> },
          { path: "/settings", element: <Lazy><SettingsPage /></Lazy> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
